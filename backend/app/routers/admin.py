from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from app.models.user import User, UserRole, UserResponse
from app.models.restaurant import Restaurant, RestaurantStatus
from app.models.order import Order, PaymentStatus
from app.core.security import require_super_admin


router = APIRouter(prefix="/admin", tags=["Super Admin"])


# ============================================
# DASHBOARD ANALYTICS
# ============================================

@router.get("/dashboard")
async def get_admin_dashboard(
    current_user: User = Depends(require_super_admin)
):
    """Get Super Admin dashboard analytics"""
    
    # Total restaurants
    total_restaurants = await Restaurant.count()
    active_restaurants = await Restaurant.find(Restaurant.status == RestaurantStatus.ACTIVE).count()
    pending_restaurants = await Restaurant.find(Restaurant.status == RestaurantStatus.PENDING).count()
    
    # Total users
    total_users = await User.count()
    total_customers = await User.find(User.role == UserRole.CUSTOMER).count()
    total_admins = await User.find(User.role == UserRole.RESTAURANT_ADMIN).count()
    
    # Orders today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    todays_orders = await Order.find(Order.placed_at >= today).count()
    
    # Total revenue (all time)
    all_orders = await Order.find(Order.payment_status == PaymentStatus.PAID).to_list()
    total_revenue = sum(o.total_amount for o in all_orders)
    
    # Today's revenue
    todays_paid_orders = await Order.find(
        Order.placed_at >= today,
        Order.payment_status == PaymentStatus.PAID
    ).to_list()
    todays_revenue = sum(o.total_amount for o in todays_paid_orders)
    
    return {
        "restaurants": {
            "total": total_restaurants,
            "active": active_restaurants,
            "pending": pending_restaurants
        },
        "users": {
            "total": total_users,
            "customers": total_customers,
            "restaurant_admins": total_admins
        },
        "orders": {
            "today": todays_orders
        },
        "revenue": {
            "total": total_revenue,
            "today": todays_revenue
        }
    }


# ============================================
# USER MANAGEMENT
# ============================================

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_super_admin)
):
    """List all users (Super Admin)"""
    
    query = {}
    if role:
        query["role"] = role
    if is_active is not None:
        query["is_active"] = is_active
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    
    users = await User.find(query).skip(skip).limit(limit).to_list()
    
    return [
        UserResponse(
            id=str(u.id),
            email=u.email,
            phone=u.phone,
            full_name=u.full_name,
            avatar_url=u.avatar_url,
            role=u.role,
            is_active=u.is_active,
            is_verified=u.is_verified,
            restaurant_id=u.restaurant_id,
            created_at=u.created_at
        )
        for u in users
    ]


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: UserRole,
    restaurant_id: Optional[str] = None,
    current_user: User = Depends(require_super_admin)
):
    """Update user role (Super Admin)"""
    
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = new_role
    
    if new_role == UserRole.RESTAURANT_ADMIN:
        if not restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Restaurant ID required for restaurant admin role"
            )
        user.restaurant_id = restaurant_id
    elif new_role == UserRole.CUSTOMER:
        user.restaurant_id = None
        user.branch_ids = []
    
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return {"message": f"User role updated to {new_role.value}"}


@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    is_active: bool,
    current_user: User = Depends(require_super_admin)
):
    """Activate/deactivate a user (Super Admin)"""
    
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if str(user.id) == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user.is_active = is_active
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return {"message": f"User {'activated' if is_active else 'deactivated'}"}


# ============================================
# RESTAURANT MANAGEMENT
# ============================================

@router.get("/restaurants")
async def list_all_restaurants(
    status: Optional[RestaurantStatus] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_super_admin)
):
    """List all restaurants with admin details"""
    
    query = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"owner_name": {"$regex": search, "$options": "i"}}
        ]
    
    restaurants = await Restaurant.find(query).skip(skip).limit(limit).to_list()
    
    result = []
    for r in restaurants:
        # Get admin count
        admin_count = await User.find(User.restaurant_id == str(r.id)).count()
        
        # Get order stats
        total_orders = await Order.find(Order.restaurant_id == str(r.id)).count()
        
        result.append({
            "id": str(r.id),
            "name": r.name,
            "slug": r.slug,
            "status": r.status.value,
            "owner_name": r.owner_name,
            "owner_email": r.owner_email,
            "cuisines": [c.value for c in r.cuisines],
            "avg_rating": r.avg_rating,
            "total_reviews": r.total_reviews,
            "commission_percentage": r.commission_percentage,
            "subscription_plan": r.subscription_plan,
            "admin_count": admin_count,
            "total_orders": total_orders,
            "created_at": r.created_at.isoformat()
        })
    
    return result


@router.patch("/restaurants/{restaurant_id}/commission")
async def update_commission(
    restaurant_id: str,
    commission_percentage: float,
    current_user: User = Depends(require_super_admin)
):
    """Update restaurant commission percentage"""
    
    restaurant = await Restaurant.get(restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    if commission_percentage < 0 or commission_percentage > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Commission must be between 0 and 50 percent"
        )
    
    restaurant.commission_percentage = commission_percentage
    restaurant.updated_at = datetime.utcnow()
    await restaurant.save()
    
    return {"message": f"Commission updated to {commission_percentage}%"}


@router.patch("/restaurants/{restaurant_id}/featured")
async def toggle_featured(
    restaurant_id: str,
    is_featured: bool,
    current_user: User = Depends(require_super_admin)
):
    """Toggle restaurant featured status"""
    
    restaurant = await Restaurant.get(restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    restaurant.is_featured = is_featured
    restaurant.updated_at = datetime.utcnow()
    await restaurant.save()
    
    return {"message": f"Restaurant featured status: {is_featured}"}


# ============================================
# ANALYTICS
# ============================================

@router.get("/analytics/orders")
async def get_order_analytics(
    days: int = 30,
    current_user: User = Depends(require_super_admin)
):
    """Get order analytics for the platform"""
    
    from datetime import timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    orders = await Order.find(Order.placed_at >= start_date).to_list()
    
    # Daily breakdown
    daily_stats = {}
    for order in orders:
        date_key = order.placed_at.strftime("%Y-%m-%d")
        if date_key not in daily_stats:
            daily_stats[date_key] = {"orders": 0, "revenue": 0}
        daily_stats[date_key]["orders"] += 1
        if order.payment_status == PaymentStatus.PAID:
            daily_stats[date_key]["revenue"] += order.total_amount
    
    # Top restaurants
    restaurant_orders = {}
    for order in orders:
        if order.restaurant_id not in restaurant_orders:
            restaurant_orders[order.restaurant_id] = {"orders": 0, "revenue": 0}
        restaurant_orders[order.restaurant_id]["orders"] += 1
        if order.payment_status == PaymentStatus.PAID:
            restaurant_orders[order.restaurant_id]["revenue"] += order.total_amount
    
    # Get restaurant names
    top_restaurants = []
    for r_id, stats in sorted(restaurant_orders.items(), key=lambda x: x[1]["orders"], reverse=True)[:10]:
        restaurant = await Restaurant.get(r_id)
        if restaurant:
            top_restaurants.append({
                "restaurant_id": r_id,
                "name": restaurant.name,
                "orders": stats["orders"],
                "revenue": stats["revenue"]
            })
    
    return {
        "period_days": days,
        "total_orders": len(orders),
        "total_revenue": sum(o.total_amount for o in orders if o.payment_status == PaymentStatus.PAID),
        "daily_stats": daily_stats,
        "top_restaurants": top_restaurants
    }


@router.get("/analytics/peak-hours")
async def get_peak_hours(
    days: int = 7,
    current_user: User = Depends(require_super_admin)
):
    """Get peak ordering hours analysis"""
    
    from datetime import timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    orders = await Order.find(Order.placed_at >= start_date).to_list()
    
    # Hourly breakdown
    hourly_stats = {str(h).zfill(2): 0 for h in range(24)}
    for order in orders:
        hour = order.placed_at.strftime("%H")
        hourly_stats[hour] += 1
    
    # Find peak hours
    sorted_hours = sorted(hourly_stats.items(), key=lambda x: x[1], reverse=True)
    peak_hours = sorted_hours[:3]
    
    return {
        "period_days": days,
        "hourly_distribution": hourly_stats,
        "peak_hours": [{"hour": h, "orders": c} for h, c in peak_hours]
    }
