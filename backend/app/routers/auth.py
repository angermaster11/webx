from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
from app.models.user import (
    User, UserRole, UserCreate, UserLogin, UserOTPLogin, UserOTPRequest,
    UserResponse, UserUpdate, TokenResponse
)
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    generate_otp, get_current_user
)
from app.core.config import settings


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    
    # Check if email exists
    existing_email = await User.find_one(User.email == user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if phone exists
    existing_phone = await User.find_one(User.phone == user_data.phone)
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Create user
    user = User(
        email=user_data.email,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )
    
    await user.insert()
    
    # Generate token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            phone=user.phone,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            restaurant_id=user.restaurant_id,
            created_at=user.created_at
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    """Login with email/phone and password"""
    
    # Find user by email or phone
    user = await User.find_one(
        {"$or": [
            {"email": login_data.email_or_phone},
            {"phone": login_data.email_or_phone}
        ]}
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await user.save()
    
    # Generate token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            phone=user.phone,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            restaurant_id=user.restaurant_id,
            created_at=user.created_at
        )
    )


@router.post("/request-otp")
async def request_otp(otp_request: UserOTPRequest):
    """Request OTP for login"""
    
    user = await User.find_one(User.phone == otp_request.phone)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phone number not registered"
        )
    
    # Generate OTP
    otp = generate_otp()
    user.otp = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    await user.save()
    
    # In production, send OTP via SMS
    # For now, return it in response (development only)
    return {
        "message": "OTP sent successfully",
        "otp": otp if settings.DEBUG else None,  # Remove in production
        "expires_in_minutes": settings.OTP_EXPIRE_MINUTES
    }


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(otp_data: UserOTPLogin):
    """Login with OTP"""
    
    user = await User.find_one(User.phone == otp_data.phone)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phone number not registered"
        )
    
    if not user.otp or user.otp != otp_data.otp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP"
        )
    
    if user.otp_expires_at and user.otp_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OTP expired"
        )
    
    # Clear OTP
    user.otp = None
    user.otp_expires_at = None
    user.is_verified = True
    user.last_login = datetime.utcnow()
    await user.save()
    
    # Generate token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            phone=user.phone,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            restaurant_id=user.restaurant_id,
            created_at=user.created_at
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        phone=current_user.phone,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        restaurant_id=current_user.restaurant_id,
        created_at=current_user.created_at
    )


@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    
    if update_data.full_name:
        current_user.full_name = update_data.full_name
    if update_data.avatar_url:
        current_user.avatar_url = update_data.avatar_url
    if update_data.addresses is not None:
        current_user.addresses = update_data.addresses
    if update_data.default_address_index is not None:
        current_user.default_address_index = update_data.default_address_index
    
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        phone=current_user.phone,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        restaurant_id=current_user.restaurant_id,
        created_at=current_user.created_at
    )
