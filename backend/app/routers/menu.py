from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from app.models.menu import (
    MenuItem, MenuCategory, MenuItemCreate, MenuItemUpdate,
    MenuCategoryCreate, MenuCategoryUpdate, MenuItemResponse,
    MenuCategoryResponse, FoodType
)
from app.models.user import User, UserRole
from app.core.security import get_current_user, require_restaurant_admin


router = APIRouter(prefix="/menu", tags=["Menu"])


# ============================================
# PUBLIC ENDPOINTS (Customer View)
# ============================================

@router.get("/restaurant/{restaurant_id_or_slug}/categories", response_model=List[MenuCategoryResponse])
async def get_menu_categories(
    restaurant_id_or_slug: str,
    branch_id: Optional[str] = None
):
    """Get all menu categories for a restaurant - accepts restaurant ID or slug"""
    from app.models.restaurant import Restaurant
    
    # Check if it's a slug
    restaurant_id = restaurant_id_or_slug
    if not restaurant_id_or_slug.replace('-', '').isalnum() or len(restaurant_id_or_slug) != 24:
        restaurant = await Restaurant.find_one(Restaurant.slug == restaurant_id_or_slug)
        if restaurant:
            restaurant_id = str(restaurant.id)
    
    query = {
        "restaurant_id": restaurant_id,
        "is_active": True
    }
    
    if branch_id:
        query["$or"] = [
            {"branch_id": None},  # Global categories
            {"branch_id": branch_id}
        ]
    
    categories = await MenuCategory.find(query).sort("+display_order").to_list()
    
    return [
        MenuCategoryResponse(
            id=str(c.id),
            restaurant_id=c.restaurant_id,
            branch_id=c.branch_id,
            name=c.name,
            description=c.description,
            image_url=c.image_url,
            display_order=c.display_order,
            is_active=c.is_active,
            available_from=c.available_from,
            available_until=c.available_until,
            available_days=c.available_days
        )
        for c in categories
    ]


@router.get("/restaurant/{restaurant_id_or_slug}/items", response_model=List[MenuItemResponse])
async def get_menu_items(
    restaurant_id_or_slug: str,
    branch_id: Optional[str] = None,
    category_id: Optional[str] = None,
    food_type: Optional[FoodType] = None,
    is_available: bool = True,
    is_bestseller: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get menu items with filters - accepts restaurant ID or slug"""
    from app.models.restaurant import Restaurant
    
    # Check if it's a slug (contains letters and no ObjectId format)
    restaurant_id = restaurant_id_or_slug
    if not restaurant_id_or_slug.replace('-', '').isalnum() or len(restaurant_id_or_slug) != 24:
        # It's likely a slug, look up the restaurant
        restaurant = await Restaurant.find_one(Restaurant.slug == restaurant_id_or_slug)
        if restaurant:
            restaurant_id = str(restaurant.id)
        else:
            # Try to find by ID anyway
            restaurant_id = restaurant_id_or_slug
    
    query = {"restaurant_id": restaurant_id}
    
    if is_available:
        query["is_available"] = True
    
    if branch_id:
        query["$or"] = [
            {"branch_id": None},
            {"branch_id": branch_id}
        ]
    
    if category_id:
        query["category_id"] = category_id
    
    if food_type:
        query["food_type"] = food_type
    
    if is_bestseller is not None:
        query["is_bestseller"] = is_bestseller
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    items = await MenuItem.find(query).sort("+display_order").skip(skip).limit(limit).to_list()
    
    return [
        MenuItemResponse(
            id=str(item.id),
            restaurant_id=item.restaurant_id,
            branch_id=item.branch_id,
            category_id=item.category_id,
            name=item.name,
            description=item.description,
            image_url=item.image_url,
            base_price=item.base_price,
            discount_percentage=item.discount_percentage,
            final_price=item.calculate_final_price(),
            food_type=item.food_type,
            spice_level=item.spice_level,
            variants=item.variants,
            addons=item.addons,
            customization_options=item.customization_options,
            is_available=item.is_available,
            is_bestseller=item.is_bestseller,
            is_new=item.is_new,
            is_recommended=item.is_recommended,
            is_daily_special=item.is_daily_special,
            preparation_time_minutes=item.preparation_time_minutes,
            nutrition_info=item.nutrition_info,
            allergens=item.allergens,
            tags=item.tags,
            avg_rating=item.avg_rating,
            display_order=item.display_order
        )
        for item in items
    ]


@router.get("/items/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(item_id: str):
    """Get single menu item details"""
    
    item = await MenuItem.get(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    return MenuItemResponse(
        id=str(item.id),
        restaurant_id=item.restaurant_id,
        branch_id=item.branch_id,
        category_id=item.category_id,
        name=item.name,
        description=item.description,
        image_url=item.image_url,
        base_price=item.base_price,
        discount_percentage=item.discount_percentage,
        final_price=item.calculate_final_price(),
        food_type=item.food_type,
        spice_level=item.spice_level,
        variants=item.variants,
        addons=item.addons,
        customization_options=item.customization_options,
        is_available=item.is_available,
        is_bestseller=item.is_bestseller,
        is_new=item.is_new,
        is_recommended=item.is_recommended,
        is_daily_special=item.is_daily_special,
        preparation_time_minutes=item.preparation_time_minutes,
        nutrition_info=item.nutrition_info,
        allergens=item.allergens,
        tags=item.tags,
        avg_rating=item.avg_rating,
        display_order=item.display_order
    )


# ============================================
# RESTAURANT ADMIN ENDPOINTS
# ============================================

@router.post("/categories", response_model=MenuCategoryResponse)
async def create_category(
    category_data: MenuCategoryCreate,
    restaurant_id: str,
    current_user: User = Depends(require_restaurant_admin)
):
    """Create a new menu category"""
    
    # Check permission
    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.restaurant_id != restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    category = MenuCategory(
        restaurant_id=restaurant_id,
        branch_id=category_data.branch_id,
        name=category_data.name,
        description=category_data.description,
        image_url=category_data.image_url,
        display_order=category_data.display_order,
        available_from=category_data.available_from,
        available_until=category_data.available_until,
        available_days=category_data.available_days
    )
    
    await category.insert()
    
    return MenuCategoryResponse(
        id=str(category.id),
        restaurant_id=category.restaurant_id,
        branch_id=category.branch_id,
        name=category.name,
        description=category.description,
        image_url=category.image_url,
        display_order=category.display_order,
        is_active=category.is_active,
        available_from=category.available_from,
        available_until=category.available_until,
        available_days=category.available_days
    )


@router.put("/categories/{category_id}", response_model=MenuCategoryResponse)
async def update_category(
    category_id: str,
    update_data: MenuCategoryUpdate,
    current_user: User = Depends(require_restaurant_admin)
):
    """Update a menu category"""
    
    category = await MenuCategory.get(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check permission
    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.restaurant_id != category.restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(category, field, value)
    
    category.updated_at = datetime.utcnow()
    await category.save()
    
    return MenuCategoryResponse(
        id=str(category.id),
        restaurant_id=category.restaurant_id,
        branch_id=category.branch_id,
        name=category.name,
        description=category.description,
        image_url=category.image_url,
        display_order=category.display_order,
        is_active=category.is_active,
        available_from=category.available_from,
        available_until=category.available_until,
        available_days=category.available_days
    )


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str,
    current_user: User = Depends(require_restaurant_admin)
):
    """Delete a menu category"""
    
    category = await MenuCategory.get(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check permission
    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.restaurant_id != category.restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    # Check if category has items
    items_count = await MenuItem.find(MenuItem.category_id == category_id).count()
    if items_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category with {items_count} items. Move or delete items first."
        )
    
    await category.delete()
    return {"message": "Category deleted successfully"}


@router.post("/items", response_model=MenuItemResponse)
async def create_menu_item(
    item_data: MenuItemCreate,
    restaurant_id: str,
    current_user: User = Depends(require_restaurant_admin)
):
    """Create a new menu item"""
    
    # Check permission
    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.restaurant_id != restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    # Verify category exists
    category = await MenuCategory.get(item_data.category_id)
    if not category or category.restaurant_id != restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category"
        )
    
    item = MenuItem(
        restaurant_id=restaurant_id,
        branch_id=item_data.branch_id,
        category_id=item_data.category_id,
        name=item_data.name,
        description=item_data.description,
        image_url=item_data.image_url,
        base_price=item_data.base_price,
        discount_percentage=item_data.discount_percentage,
        food_type=item_data.food_type,
        spice_level=item_data.spice_level,
        variants=item_data.variants,
        addons=item_data.addons,
        customization_options=item_data.customization_options,
        preparation_time_minutes=item_data.preparation_time_minutes,
        nutrition_info=item_data.nutrition_info,
        allergens=item_data.allergens,
        tags=item_data.tags,
        display_order=item_data.display_order
    )
    
    item.calculate_final_price()
    await item.insert()
    
    return MenuItemResponse(
        id=str(item.id),
        restaurant_id=item.restaurant_id,
        branch_id=item.branch_id,
        category_id=item.category_id,
        name=item.name,
        description=item.description,
        image_url=item.image_url,
        base_price=item.base_price,
        discount_percentage=item.discount_percentage,
        final_price=item.final_price,
        food_type=item.food_type,
        spice_level=item.spice_level,
        variants=item.variants,
        addons=item.addons,
        customization_options=item.customization_options,
        is_available=item.is_available,
        is_bestseller=item.is_bestseller,
        is_new=item.is_new,
        is_recommended=item.is_recommended,
        is_daily_special=item.is_daily_special,
        preparation_time_minutes=item.preparation_time_minutes,
        nutrition_info=item.nutrition_info,
        allergens=item.allergens,
        tags=item.tags,
        avg_rating=item.avg_rating,
        display_order=item.display_order
    )


@router.put("/items/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: str,
    update_data: MenuItemUpdate,
    current_user: User = Depends(require_restaurant_admin)
):
    """Update a menu item"""
    
    item = await MenuItem.get(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Check permission
    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.restaurant_id != item.restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(item, field, value)
    
    item.calculate_final_price()
    item.updated_at = datetime.utcnow()
    await item.save()
    
    return MenuItemResponse(
        id=str(item.id),
        restaurant_id=item.restaurant_id,
        branch_id=item.branch_id,
        category_id=item.category_id,
        name=item.name,
        description=item.description,
        image_url=item.image_url,
        base_price=item.base_price,
        discount_percentage=item.discount_percentage,
        final_price=item.final_price,
        food_type=item.food_type,
        spice_level=item.spice_level,
        variants=item.variants,
        addons=item.addons,
        customization_options=item.customization_options,
        is_available=item.is_available,
        is_bestseller=item.is_bestseller,
        is_new=item.is_new,
        is_recommended=item.is_recommended,
        is_daily_special=item.is_daily_special,
        preparation_time_minutes=item.preparation_time_minutes,
        nutrition_info=item.nutrition_info,
        allergens=item.allergens,
        tags=item.tags,
        avg_rating=item.avg_rating,
        display_order=item.display_order
    )


@router.patch("/items/{item_id}/availability")
async def toggle_item_availability(
    item_id: str,
    is_available: bool,
    current_user: User = Depends(require_restaurant_admin)
):
    """Quick toggle for item availability"""
    
    item = await MenuItem.get(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Check permission
    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.restaurant_id != item.restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    item.is_available = is_available
    item.updated_at = datetime.utcnow()
    await item.save()
    
    return {"message": f"Item availability set to {is_available}"}


@router.delete("/items/{item_id}")
async def delete_menu_item(
    item_id: str,
    current_user: User = Depends(require_restaurant_admin)
):
    """Delete a menu item"""
    
    item = await MenuItem.get(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Check permission
    if current_user.role != UserRole.SUPER_ADMIN:
        if current_user.restaurant_id != item.restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    await item.delete()
    return {"message": "Item deleted successfully"}
