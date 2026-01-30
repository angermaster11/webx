from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId


class UserRole(str, Enum):
    CUSTOMER = "customer"
    RESTAURANT_ADMIN = "restaurant_admin"
    SUPER_ADMIN = "super_admin"


class Address(BaseModel):
    street: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""
    country: str = "India"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class User(Document):
    email: Indexed(EmailStr, unique=True)
    phone: Indexed(str, unique=True)
    password_hash: str
    full_name: str
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    
    # For Restaurant Admin
    restaurant_id: Optional[str] = None
    branch_ids: List[str] = []
    
    # Status
    is_active: bool = True
    is_verified: bool = False
    
    # OTP
    otp: Optional[str] = None
    otp_expires_at: Optional[datetime] = None
    
    # Address
    addresses: List[Address] = []
    default_address_index: int = 0
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "phone",
            "role",
            "restaurant_id"
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "phone": "+919876543210",
                "full_name": "John Doe",
                "role": "customer"
            }
        }


class UserCreate(BaseModel):
    email: EmailStr
    phone: str
    password: str
    full_name: str
    role: UserRole = UserRole.CUSTOMER


class UserLogin(BaseModel):
    email_or_phone: str
    password: str


class UserOTPLogin(BaseModel):
    phone: str
    otp: str


class UserOTPRequest(BaseModel):
    phone: str


class UserResponse(BaseModel):
    id: str
    email: str
    phone: str
    full_name: str
    avatar_url: Optional[str]
    role: UserRole
    is_active: bool
    is_verified: bool
    restaurant_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    addresses: Optional[List[Address]] = None
    default_address_index: Optional[int] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
