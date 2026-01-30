from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
import re
from app.models.restaurant import (
    Restaurant, Branch, RestaurantCreate, RestaurantUpdate,
    BranchCreate, BranchUpdate, RestaurantResponse, BranchResponse,
    RestaurantStatus, CuisineType, ServiceType
)
from app.models.user import User, UserRole
from app.core.security import get_current_user, require_super_admin, require_restaurant_admin


router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from restaurant name"""
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug


# ============================================
# PUBLIC ENDPOINTS (Customer Discovery)
# ============================================

@router.get("/", response_model=List[RestaurantResponse])
async def list_restaurants(
    search: Optional[str] = None,
    cuisines: Optional[List[CuisineType]] = Query(None),
    service_types: Optional[List[ServiceType]] = Query(None),
    min_rating: Optional[float] = None,
    max_price: Optional[float] = None,
    min_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    city: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    skip: int = 0,
    limit: int = 20
):
    """
    List/search restaurants with filters
    
    Public endpoint for customer discovery
    """
    
    # Build query
    query = {"status": RestaurantStatus.ACTIVE}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    if cuisines:
        query["cuisines"] = {"$in": cuisines}
    
    if service_types:
        query["service_types"] = {"$in": service_types}
    
    if min_rating:
        query["avg_rating"] = {"$gte": min_rating}
    
    if min_price:
        query["avg_price_for_two"] = {"$gte": min_price}
    
    if max_price:
        if "avg_price_for_two" in query:
            query["avg_price_for_two"]["$lte"] = max_price
        else:
            query["avg_price_for_two"] = {"$lte": max_price}
    
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    if tags:
        query["tags"] = {"$in": tags}
    
    restaurants = await Restaurant.find(query).skip(skip).limit(limit).to_list()
    
    return [
        RestaurantResponse(
            id=str(r.id),
            name=r.name,
            slug=r.slug,
            description=r.description,
            logo_url=r.logo_url,
            cover_image_url=r.cover_image_url,
            gallery_images=r.gallery_images,
            cuisines=r.cuisines,
            service_types=r.service_types,
            avg_price_for_two=r.avg_price_for_two,
            avg_rating=r.avg_rating,
            total_reviews=r.total_reviews,
            status=r.status,
            is_featured=r.is_featured,
            tags=r.tags,
            created_at=r.created_at
        )
        for r in restaurants
    ]


@router.get("/featured", response_model=List[RestaurantResponse])
async def get_featured_restaurants(limit: int = 10):
    """Get featured restaurants for homepage"""
    restaurants = await Restaurant.find(
        Restaurant.status == RestaurantStatus.ACTIVE,
        Restaurant.is_featured == True
    ).limit(limit).to_list()
    
    return [
        RestaurantResponse(
            id=str(r.id),
            name=r.name,
            slug=r.slug,
            description=r.description,
            logo_url=r.logo_url,
            cover_image_url=r.cover_image_url,
            gallery_images=r.gallery_images,
            cuisines=r.cuisines,
            service_types=r.service_types,
            avg_price_for_two=r.avg_price_for_two,
            avg_rating=r.avg_rating,
            total_reviews=r.total_reviews,
            status=r.status,
            is_featured=r.is_featured,
            tags=r.tags,
            created_at=r.created_at
        )
        for r in restaurants
    ]


@router.get("/{slug}", response_model=RestaurantResponse)
async def get_restaurant_by_slug(slug: str):
    """Get restaurant details by slug"""
    restaurant = await Restaurant.find_one(Restaurant.slug == slug)
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    return RestaurantResponse(
        id=str(restaurant.id),
        name=restaurant.name,
        slug=restaurant.slug,
        description=restaurant.description,
        logo_url=restaurant.logo_url,
        cover_image_url=restaurant.cover_image_url,
        gallery_images=restaurant.gallery_images,
        cuisines=restaurant.cuisines,
        service_types=restaurant.service_types,
        avg_price_for_two=restaurant.avg_price_for_two,
        avg_rating=restaurant.avg_rating,
        total_reviews=restaurant.total_reviews,
        status=restaurant.status,
        is_featured=restaurant.is_featured,
        tags=restaurant.tags,
        created_at=restaurant.created_at
    )


@router.get("/{restaurant_id}/branches", response_model=List[BranchResponse])
async def get_restaurant_branches(restaurant_id: str):
    """Get all branches of a restaurant"""
    branches = await Branch.find(
        Branch.restaurant_id == restaurant_id,
        Branch.is_active == True
    ).to_list()
    
    return [
        BranchResponse(
            id=str(b.id),
            restaurant_id=b.restaurant_id,
            name=b.name,
            location=b.location,
            phone=b.phone,
            email=b.email,
            working_hours=b.working_hours,
            total_tables=b.total_tables,
            total_seating_capacity=b.total_seating_capacity,
            is_active=b.is_active,
            is_accepting_orders=b.is_accepting_orders,
            is_accepting_reservations=b.is_accepting_reservations,
            avg_dining_duration_minutes=b.avg_dining_duration_minutes
        )
        for b in branches
    ]


# ============================================
# SUPER ADMIN ENDPOINTS
# ============================================

@router.post("/", response_model=RestaurantResponse)
async def create_restaurant(
    restaurant_data: RestaurantCreate,
    current_user: User = Depends(require_super_admin)
):
    """Create a new restaurant (Super Admin only)"""
    
    # Generate unique slug
    base_slug = generate_slug(restaurant_data.name)
    slug = base_slug
    counter = 1
    
    while await Restaurant.find_one(Restaurant.slug == slug):
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    restaurant = Restaurant(
        name=restaurant_data.name,
        slug=slug,
        description=restaurant_data.description,
        owner_id=str(current_user.id),
        owner_name=current_user.full_name,
        owner_email=current_user.email,
        owner_phone=current_user.phone,
        cuisines=restaurant_data.cuisines,
        service_types=restaurant_data.service_types,
        avg_price_for_two=restaurant_data.avg_price_for_two,
        tags=restaurant_data.tags,
        status=RestaurantStatus.PENDING
    )
    
    await restaurant.insert()
    
    return RestaurantResponse(
        id=str(restaurant.id),
        name=restaurant.name,
        slug=restaurant.slug,
        description=restaurant.description,
        logo_url=restaurant.logo_url,
        cover_image_url=restaurant.cover_image_url,
        gallery_images=restaurant.gallery_images,
        cuisines=restaurant.cuisines,
        service_types=restaurant.service_types,
        avg_price_for_two=restaurant.avg_price_for_two,
        avg_rating=restaurant.avg_rating,
        total_reviews=restaurant.total_reviews,
        status=restaurant.status,
        is_featured=restaurant.is_featured,
        tags=restaurant.tags,
        created_at=restaurant.created_at
    )


@router.put("/{restaurant_id}/status")
async def update_restaurant_status(
    restaurant_id: str,
    new_status: RestaurantStatus,
    current_user: User = Depends(require_super_admin)
):
    """Update restaurant status (activate/deactivate)"""
    
    restaurant = await Restaurant.get(restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    restaurant.status = new_status
    restaurant.updated_at = datetime.utcnow()
    await restaurant.save()
    
    return {"message": f"Restaurant status updated to {new_status.value}"}


@router.post("/{restaurant_id}/branches", response_model=BranchResponse)
async def create_branch(
    restaurant_id: str,
    branch_data: BranchCreate,
    current_user: User = Depends(require_super_admin)
):
    """Add a new branch to a restaurant"""
    
    restaurant = await Restaurant.get(restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    branch = Branch(
        restaurant_id=restaurant_id,
        name=branch_data.name,
        location=branch_data.location,
        phone=branch_data.phone,
        email=branch_data.email,
        working_hours=branch_data.working_hours,
        avg_dining_duration_minutes=branch_data.avg_dining_duration_minutes
    )
    
    await branch.insert()
    
    return BranchResponse(
        id=str(branch.id),
        restaurant_id=branch.restaurant_id,
        name=branch.name,
        location=branch.location,
        phone=branch.phone,
        email=branch.email,
        working_hours=branch.working_hours,
        total_tables=branch.total_tables,
        total_seating_capacity=branch.total_seating_capacity,
        is_active=branch.is_active,
        is_accepting_orders=branch.is_accepting_orders,
        is_accepting_reservations=branch.is_accepting_reservations,
        avg_dining_duration_minutes=branch.avg_dining_duration_minutes
    )


# ============================================
# RESTAURANT ADMIN ENDPOINTS
# ============================================

@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: str,
    update_data: RestaurantUpdate,
    current_user: User = Depends(require_restaurant_admin)
):
    """Update restaurant details"""
    
    restaurant = await Restaurant.get(restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    # Check permission (Super Admin or assigned Restaurant Admin)
    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.restaurant_id != restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this restaurant"
            )
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(restaurant, field, value)
    
    restaurant.updated_at = datetime.utcnow()
    await restaurant.save()
    
    return RestaurantResponse(
        id=str(restaurant.id),
        name=restaurant.name,
        slug=restaurant.slug,
        description=restaurant.description,
        logo_url=restaurant.logo_url,
        cover_image_url=restaurant.cover_image_url,
        gallery_images=restaurant.gallery_images,
        cuisines=restaurant.cuisines,
        service_types=restaurant.service_types,
        avg_price_for_two=restaurant.avg_price_for_two,
        avg_rating=restaurant.avg_rating,
        total_reviews=restaurant.total_reviews,
        status=restaurant.status,
        is_featured=restaurant.is_featured,
        tags=restaurant.tags,
        created_at=restaurant.created_at
    )


@router.put("/branches/{branch_id}", response_model=BranchResponse)
async def update_branch(
    branch_id: str,
    update_data: BranchUpdate,
    current_user: User = Depends(require_restaurant_admin)
):
    """Update branch details"""
    
    branch = await Branch.get(branch_id)
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    
    # Check permission
    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.restaurant_id != branch.restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this branch"
            )
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(branch, field, value)
    
    branch.updated_at = datetime.utcnow()
    await branch.save()
    
    return BranchResponse(
        id=str(branch.id),
        restaurant_id=branch.restaurant_id,
        name=branch.name,
        location=branch.location,
        phone=branch.phone,
        email=branch.email,
        working_hours=branch.working_hours,
        total_tables=branch.total_tables,
        total_seating_capacity=branch.total_seating_capacity,
        is_active=branch.is_active,
        is_accepting_orders=branch.is_accepting_orders,
        is_accepting_reservations=branch.is_accepting_reservations,
        avg_dining_duration_minutes=branch.avg_dining_duration_minutes
    )
