from fastapi import APIRouter, HTTPException, status as http_status, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
import random
import string
from bson import ObjectId
from app.models.order import (
    Order, OrderItem, OrderCreate, OrderItemCreate, OrderStatusUpdate,
    OrderPaymentUpdate, OrderResponse, OrderItemResponse, OrderStatus,
    PaymentStatus, OrderType, KitchenOrderView
)
from app.models.menu import MenuItem
from app.models.table import Table, TableStatus, TableReservation
from app.models.restaurant import Branch, Restaurant
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationType, NotificationChannel
from app.core.security import get_current_user, require_restaurant_admin


router = APIRouter(prefix="/orders", tags=["Orders"])


def generate_order_number() -> str:
    """Generate unique order number"""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M")
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"ORD-{timestamp}-{random_suffix}"


# ============================================
# CUSTOMER ENDPOINTS
# ============================================

@router.get("/", response_model=List[OrderResponse])
async def get_all_orders(
    status: Optional[OrderStatus] = None,
    order_type: Optional[OrderType] = None,
    date: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """
    Get all orders (Admin only)
    
    For restaurant admins: returns orders for their restaurant
    For super admins: returns all orders
    """
    print("\n" + "="*50)
    print("📦 GET ALL ORDERS REQUEST")
    print("="*50)
    print(f"User: {current_user.email} (Role: {current_user.role})")
    print(f"Restaurant ID: {current_user.restaurant_id}")
    print(f"Filters - Status: {status}, Order Type: {order_type}")
    
    if current_user.role not in [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN]:
        print("❌ Access denied - not admin")
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    query = {}
    
    # Filter by restaurant for restaurant admins
    if current_user.role == UserRole.RESTAURANT_ADMIN and current_user.restaurant_id:
        query["restaurant_id"] = current_user.restaurant_id
        print(f"   Filtering by restaurant_id: {current_user.restaurant_id}")
    else:
        print("   No restaurant filter (showing all orders)")
    
    if status:
        query["status"] = status
    
    if order_type:
        query["order_type"] = order_type
    
    print(f"   Query: {query}")
    
    orders = await Order.find(query).sort("-placed_at").skip(skip).limit(limit).to_list()
    
    print(f"✅ Found {len(orders)} orders")
    
    return [
        OrderResponse(
            id=str(o.id),
            restaurant_id=o.restaurant_id,
            branch_id=o.branch_id,
            customer_id=o.customer_id,
            order_number=o.order_number,
            order_type=o.order_type,
            table_id=o.table_id,
            reservation_id=o.reservation_id,
            delivery_address=o.delivery_address,
            status=o.status,
            placed_at=o.placed_at,
            confirmed_at=o.confirmed_at,
            ready_at=o.ready_at,
            estimated_preparation_time=o.estimated_preparation_time,
            subtotal=o.subtotal,
            discount_amount=o.discount_amount,
            tax_amount=o.tax_amount,
            delivery_charge=o.delivery_charge,
            total_amount=o.total_amount,
            payment_status=o.payment_status,
            payment_method=o.payment_method,
            customer_name=o.customer_name,
            customer_phone=o.customer_phone,
            special_instructions=o.special_instructions,
            rating=o.rating,
            feedback=o.feedback,
            created_at=o.created_at
        )
        for o in orders
    ]


@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new order
    
    Supports:
    - Dine-in (with table assignment)
    - Takeaway
    - Delivery
    """
    print("\n" + "="*50)
    print("🛒 CREATE ORDER REQUEST")
    print("="*50)
    print(f"User: {current_user.email} (ID: {current_user.id})")
    print(f"Order Data: {order_data.model_dump()}")
    print(f"Restaurant ID: {order_data.restaurant_id}")
    print(f"Branch ID: {order_data.branch_id}")
    print(f"Order Type: {order_data.order_type}")
    print(f"Items Count: {len(order_data.items)}")
    
    # Support both branch_id and restaurant_id (can be ID or slug)
    branch = None
    restaurant_id_or_slug = order_data.restaurant_id or order_data.branch_id
    
    if restaurant_id_or_slug:
        # First try to find restaurant by slug
        restaurant = await Restaurant.find_one(Restaurant.slug == restaurant_id_or_slug)
        if restaurant:
            branch = await Branch.find_one(Branch.restaurant_id == str(restaurant.id))
        
        if not branch:
            # Try to find branch by restaurant_id field
            branch = await Branch.find_one(Branch.restaurant_id == restaurant_id_or_slug)
        
        if not branch:
            # Try as ObjectId if valid
            try:
                if ObjectId.is_valid(restaurant_id_or_slug):
                    branch = await Branch.get(restaurant_id_or_slug)
                    if not branch:
                        # Maybe it's a restaurant ID
                        branch = await Branch.find_one(Branch.restaurant_id == restaurant_id_or_slug)
            except Exception:
                pass
    
    if not branch:
        print("❌ ERROR: Branch not found!")
        print(f"   Searched for: {restaurant_id_or_slug}")
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    
    print(f"✅ Branch found: {branch.name} (ID: {branch.id})")
    
    # Skip order acceptance check for now (allow all orders)
    # if not branch.is_accepting_orders:
    #     raise HTTPException(
    #         status_code=http_status.HTTP_400_BAD_REQUEST,
    #         detail="This branch is not accepting orders right now"
    #     )
    
    # Validate table for dine-in
    if order_data.order_type == OrderType.DINE_IN:
        if not order_data.table_id:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Table ID required for dine-in orders"
            )
        
        table = await Table.get(order_data.table_id)
        if not table:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Table not found"
            )
    
    # Validate delivery address
    if order_data.order_type == OrderType.DELIVERY:
        if not order_data.delivery_address:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Delivery address required for delivery orders"
            )
    
    # Calculate order totals
    subtotal = 0.0
    max_prep_time = 0
    order_items = []
    
    for item_data in order_data.items:
        menu_item = await MenuItem.get(item_data.menu_item_id)
        if not menu_item:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item not found: {item_data.menu_item_id}"
            )
        
        if not menu_item.is_available:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Item not available: {menu_item.name}"
            )
        
        # Calculate item price
        base_price = menu_item.calculate_final_price()
        variant_price = 0.0
        
        if item_data.variant_name:
            variant = next(
                (v for v in menu_item.variants if v.name == item_data.variant_name),
                None
            )
            if variant:
                variant_price = variant.price
        
        # Calculate addons
        addon_total = sum(a.price * a.quantity for a in item_data.addons)
        
        # Calculate customizations
        customization_total = sum(c.price_modifier for c in item_data.customizations)
        
        unit_price = base_price + variant_price + addon_total + customization_total
        total_price = unit_price * item_data.quantity
        
        order_item = OrderItem(
            order_id="",  # Will be updated after order creation
            menu_item_id=item_data.menu_item_id,
            item_name=menu_item.name,
            item_image_url=menu_item.image_url,
            base_price=base_price,
            variant_name=item_data.variant_name,
            variant_price=variant_price,
            quantity=item_data.quantity,
            customizations=item_data.customizations,
            addons=item_data.addons,
            special_instructions=item_data.special_instructions,
            unit_price=unit_price,
            total_price=total_price
        )
        
        order_items.append(order_item)
        subtotal += total_price
        max_prep_time = max(max_prep_time, menu_item.preparation_time_minutes)
    
    # Calculate taxes and charges
    tax_percentage = 5.0
    tax_amount = order_data.taxes if order_data.taxes else subtotal * (tax_percentage / 100)
    
    delivery_charge = order_data.delivery_fee if order_data.delivery_fee else 0.0
    if not delivery_charge and order_data.order_type == OrderType.DELIVERY:
        delivery_charge = 40.0  # Default delivery charge
    
    packing_charge = 0.0
    if order_data.order_type in [OrderType.TAKEAWAY, OrderType.DELIVERY]:
        packing_charge = 20.0
    
    total_amount = order_data.total_amount if order_data.total_amount else (subtotal + tax_amount + delivery_charge + packing_charge)
    
    # Handle delivery address - can be string or object
    delivery_address_obj = order_data.delivery_address
    if isinstance(order_data.delivery_address, str):
        delivery_address_obj = None  # Will store as string in delivery_instructions
    
    # Create order
    order = Order(
        restaurant_id=branch.restaurant_id,
        branch_id=str(branch.id),
        customer_id=str(current_user.id),
        order_number=generate_order_number(),
        order_type=order_data.order_type,
        table_id=order_data.table_id,
        reservation_id=order_data.reservation_id,
        delivery_address=delivery_address_obj,
        delivery_instructions=order_data.delivery_instructions or (order_data.delivery_address if isinstance(order_data.delivery_address, str) else None),
        status=OrderStatus.PLACED,
        estimated_preparation_time=max_prep_time + 10,  # Add buffer
        subtotal=order_data.subtotal if order_data.subtotal else subtotal,
        tax_amount=tax_amount,
        tax_percentage=tax_percentage,
        delivery_charge=delivery_charge,
        packing_charge=packing_charge,
        total_amount=total_amount,
        payment_method=order_data.payment_method,
        customer_name=current_user.full_name,
        customer_phone=current_user.phone,
        customer_email=current_user.email,
        special_instructions=order_data.special_instructions
    )
    
    await order.insert()
    
    # Update order items with order_id and save
    for order_item in order_items:
        order_item.order_id = str(order.id)
        await order_item.insert()
    
    # Update table status if dine-in
    if order_data.order_type == OrderType.DINE_IN and order_data.table_id:
        table = await Table.get(order_data.table_id)
        if table:
            table.status = TableStatus.OCCUPIED
            table.current_order_id = str(order.id)
            table.occupied_at = datetime.utcnow()
            await table.save()
    
    # Update menu item order count
    for item_data in order_data.items:
        menu_item = await MenuItem.get(item_data.menu_item_id)
        if menu_item:
            menu_item.order_count += item_data.quantity
            await menu_item.save()
    
    # Create notification
    notification = Notification(
        user_id=str(current_user.id),
        notification_type=NotificationType.ORDER_PLACED,
        title="Order Placed!",
        message=f"Your order #{order.order_number} has been placed. Total: ₹{total_amount:.2f}",
        restaurant_id=branch.restaurant_id,
        order_id=str(order.id),
        channels=[NotificationChannel.IN_APP]
    )
    await notification.insert()
    
    return OrderResponse(
        id=str(order.id),
        restaurant_id=order.restaurant_id,
        branch_id=order.branch_id,
        customer_id=order.customer_id,
        order_number=order.order_number,
        order_type=order.order_type,
        table_id=order.table_id,
        reservation_id=order.reservation_id,
        delivery_address=order.delivery_address,
        status=order.status,
        placed_at=order.placed_at,
        confirmed_at=order.confirmed_at,
        ready_at=order.ready_at,
        estimated_preparation_time=order.estimated_preparation_time,
        subtotal=order.subtotal,
        discount_amount=order.discount_amount,
        tax_amount=order.tax_amount,
        delivery_charge=order.delivery_charge,
        total_amount=order.total_amount,
        payment_status=order.payment_status,
        payment_method=order.payment_method,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        special_instructions=order.special_instructions,
        rating=order.rating,
        feedback=order.feedback,
        created_at=order.created_at
    )


@router.get("/my-orders", response_model=List[OrderResponse])
async def get_my_orders(
    status: Optional[OrderStatus] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Get current user's orders"""
    
    query = {"customer_id": str(current_user.id)}
    if status:
        query["status"] = status
    
    orders = await Order.find(query).sort("-placed_at").skip(skip).limit(limit).to_list()
    
    return [
        OrderResponse(
            id=str(o.id),
            restaurant_id=o.restaurant_id,
            branch_id=o.branch_id,
            customer_id=o.customer_id,
            order_number=o.order_number,
            order_type=o.order_type,
            table_id=o.table_id,
            reservation_id=o.reservation_id,
            delivery_address=o.delivery_address,
            status=o.status,
            placed_at=o.placed_at,
            confirmed_at=o.confirmed_at,
            ready_at=o.ready_at,
            estimated_preparation_time=o.estimated_preparation_time,
            subtotal=o.subtotal,
            discount_amount=o.discount_amount,
            tax_amount=o.tax_amount,
            delivery_charge=o.delivery_charge,
            total_amount=o.total_amount,
            payment_status=o.payment_status,
            payment_method=o.payment_method,
            customer_name=o.customer_name,
            customer_phone=o.customer_phone,
            special_instructions=o.special_instructions,
            rating=o.rating,
            feedback=o.feedback,
            created_at=o.created_at
        )
        for o in orders
    ]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get order details"""
    
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check permission
    if str(current_user.id) != order.customer_id:
        if current_user.role not in [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(
                status_code=http_status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    return OrderResponse(
        id=str(order.id),
        restaurant_id=order.restaurant_id,
        branch_id=order.branch_id,
        customer_id=order.customer_id,
        order_number=order.order_number,
        order_type=order.order_type,
        table_id=order.table_id,
        reservation_id=order.reservation_id,
        delivery_address=order.delivery_address,
        status=order.status,
        placed_at=order.placed_at,
        confirmed_at=order.confirmed_at,
        ready_at=order.ready_at,
        estimated_preparation_time=order.estimated_preparation_time,
        subtotal=order.subtotal,
        discount_amount=order.discount_amount,
        tax_amount=order.tax_amount,
        delivery_charge=order.delivery_charge,
        total_amount=order.total_amount,
        payment_status=order.payment_status,
        payment_method=order.payment_method,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        special_instructions=order.special_instructions,
        rating=order.rating,
        feedback=order.feedback,
        created_at=order.created_at
    )


@router.get("/{order_id}/items", response_model=List[OrderItemResponse])
async def get_order_items(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get items for an order"""
    
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check permission
    if str(current_user.id) != order.customer_id:
        if current_user.role not in [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(
                status_code=http_status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    items = await OrderItem.find(OrderItem.order_id == order_id).to_list()
    
    return [
        OrderItemResponse(
            id=str(item.id),
            order_id=item.order_id,
            menu_item_id=item.menu_item_id,
            item_name=item.item_name,
            item_image_url=item.item_image_url,
            base_price=item.base_price,
            variant_name=item.variant_name,
            variant_price=item.variant_price,
            quantity=item.quantity,
            customizations=item.customizations,
            addons=item.addons,
            special_instructions=item.special_instructions,
            unit_price=item.unit_price,
            total_price=item.total_price,
            kitchen_status=item.kitchen_status
        )
        for item in items
    ]


@router.get("/{order_id}/track")
async def track_order(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """Track order status with timeline"""
    
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Build timeline
    timeline = []
    
    timeline.append({
        "status": "placed",
        "label": "Order Placed",
        "time": order.placed_at.isoformat() if order.placed_at else None,
        "completed": True
    })
    
    timeline.append({
        "status": "confirmed",
        "label": "Order Confirmed",
        "time": order.confirmed_at.isoformat() if order.confirmed_at else None,
        "completed": order.status.value in ["confirmed", "preparing", "ready", "served", "delivered", "completed"]
    })
    
    timeline.append({
        "status": "preparing",
        "label": "Preparing",
        "time": order.preparing_started_at.isoformat() if order.preparing_started_at else None,
        "completed": order.status.value in ["preparing", "ready", "served", "delivered", "completed"]
    })
    
    timeline.append({
        "status": "ready",
        "label": "Ready",
        "time": order.ready_at.isoformat() if order.ready_at else None,
        "completed": order.status.value in ["ready", "served", "delivered", "completed"]
    })
    
    if order.order_type == OrderType.DINE_IN:
        timeline.append({
            "status": "served",
            "label": "Served",
            "time": order.served_at.isoformat() if order.served_at else None,
            "completed": order.status.value in ["served", "completed"]
        })
    elif order.order_type == OrderType.DELIVERY:
        timeline.append({
            "status": "out_for_delivery",
            "label": "Out for Delivery",
            "time": None,
            "completed": order.status.value in ["out_for_delivery", "delivered", "completed"]
        })
        timeline.append({
            "status": "delivered",
            "label": "Delivered",
            "time": order.delivered_at.isoformat() if order.delivered_at else None,
            "completed": order.status.value in ["delivered", "completed"]
        })
    else:  # Takeaway
        timeline.append({
            "status": "picked_up",
            "label": "Ready for Pickup",
            "time": order.ready_at.isoformat() if order.ready_at else None,
            "completed": order.status.value in ["completed"]
        })
    
    # Calculate ETA
    eta_minutes = None
    if order.status in [OrderStatus.PLACED, OrderStatus.CONFIRMED]:
        eta_minutes = order.estimated_preparation_time
    elif order.status == OrderStatus.PREPARING:
        if order.preparing_started_at:
            elapsed = (datetime.utcnow() - order.preparing_started_at).seconds // 60
            eta_minutes = max(0, order.estimated_preparation_time - elapsed)
    
    return {
        "order_id": order_id,
        "order_number": order.order_number,
        "current_status": order.status.value,
        "timeline": timeline,
        "eta_minutes": eta_minutes
    }


# ============================================
# RESTAURANT ADMIN ENDPOINTS
# ============================================

@router.get("/branch/{branch_id}/orders", response_model=List[OrderResponse])
async def get_branch_orders(
    branch_id: str,
    status: Optional[OrderStatus] = None,
    order_type: Optional[OrderType] = None,
    date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_restaurant_admin)
):
    """Get orders for a branch (Restaurant Admin)"""
    
    query = {"branch_id": branch_id}
    if status:
        query["status"] = status
    if order_type:
        query["order_type"] = order_type
    if date:
        start = date.replace(hour=0, minute=0, second=0)
        end = date.replace(hour=23, minute=59, second=59)
        query["placed_at"] = {"$gte": start, "$lte": end}
    
    orders = await Order.find(query).sort("-placed_at").skip(skip).limit(limit).to_list()
    
    return [
        OrderResponse(
            id=str(o.id),
            restaurant_id=o.restaurant_id,
            branch_id=o.branch_id,
            customer_id=o.customer_id,
            order_number=o.order_number,
            order_type=o.order_type,
            table_id=o.table_id,
            reservation_id=o.reservation_id,
            delivery_address=o.delivery_address,
            status=o.status,
            placed_at=o.placed_at,
            confirmed_at=o.confirmed_at,
            ready_at=o.ready_at,
            estimated_preparation_time=o.estimated_preparation_time,
            subtotal=o.subtotal,
            discount_amount=o.discount_amount,
            tax_amount=o.tax_amount,
            delivery_charge=o.delivery_charge,
            total_amount=o.total_amount,
            payment_status=o.payment_status,
            payment_method=o.payment_method,
            customer_name=o.customer_name,
            customer_phone=o.customer_phone,
            special_instructions=o.special_instructions,
            rating=o.rating,
            feedback=o.feedback,
            created_at=o.created_at
        )
        for o in orders
    ]


@router.get("/branch/{branch_id}/kitchen", response_model=List[KitchenOrderView])
async def get_kitchen_orders(
    branch_id: str,
    current_user: User = Depends(require_restaurant_admin)
):
    """
    Get orders for Kitchen Display System (KDS)
    
    Returns active orders sorted by priority
    """
    
    # Get active orders (not completed/cancelled)
    orders = await Order.find(
        Order.branch_id == branch_id,
        Order.status.in_([
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING
        ])
    ).sort("+placed_at").to_list()
    
    kitchen_orders = []
    
    for order in orders:
        # Get items
        items = await OrderItem.find(OrderItem.order_id == str(order.id)).to_list()
        
        # Get table number if dine-in
        table_number = None
        if order.table_id:
            table = await Table.get(order.table_id)
            if table:
                table_number = table.table_number
        
        # Calculate elapsed time
        elapsed = int((datetime.utcnow() - order.placed_at).total_seconds() / 60)
        
        # Calculate priority (higher elapsed = higher priority)
        priority = 3  # Normal
        if elapsed > order.estimated_preparation_time:
            priority = 1  # Urgent
        elif elapsed > order.estimated_preparation_time * 0.7:
            priority = 2  # High
        
        kitchen_orders.append(KitchenOrderView(
            order_id=str(order.id),
            order_number=order.order_number,
            order_type=order.order_type,
            table_number=table_number,
            customer_name=order.customer_name,
            items=[
                {
                    "name": item.item_name,
                    "quantity": item.quantity,
                    "variant": item.variant_name,
                    "customizations": [c.name for c in item.customizations],
                    "special_instructions": item.special_instructions,
                    "status": item.kitchen_status
                }
                for item in items
            ],
            status=order.status,
            placed_at=order.placed_at,
            elapsed_minutes=elapsed,
            priority=priority,
            special_instructions=order.special_instructions
        ))
    
    # Sort by priority (1 = highest)
    kitchen_orders.sort(key=lambda x: (x.priority, x.elapsed_minutes), reverse=True)
    
    return kitchen_orders


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(require_restaurant_admin)
):
    """Update order status"""
    
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    old_status = order.status
    new_status = status_update.status
    
    # Validate status transition
    valid_transitions = {
        OrderStatus.PLACED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        OrderStatus.CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
        OrderStatus.PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
        OrderStatus.READY: [OrderStatus.SERVED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.COMPLETED],
        OrderStatus.OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
        OrderStatus.SERVED: [OrderStatus.COMPLETED],
        OrderStatus.DELIVERED: [OrderStatus.COMPLETED]
    }
    
    if new_status not in valid_transitions.get(old_status, []):
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from {old_status.value} to {new_status.value}"
        )
    
    # Update status with timestamps
    order.status = new_status
    
    if new_status == OrderStatus.CONFIRMED:
        order.confirmed_at = datetime.utcnow()
    elif new_status == OrderStatus.PREPARING:
        order.preparing_started_at = datetime.utcnow()
    elif new_status == OrderStatus.READY:
        order.ready_at = datetime.utcnow()
    elif new_status == OrderStatus.SERVED:
        order.served_at = datetime.utcnow()
    elif new_status == OrderStatus.DELIVERED:
        order.delivered_at = datetime.utcnow()
    elif new_status == OrderStatus.COMPLETED:
        order.completed_at = datetime.utcnow()
        # Free up table
        if order.table_id:
            table = await Table.get(order.table_id)
            if table:
                table.status = TableStatus.CLEANING
                table.current_order_id = None
                await table.save()
    elif new_status == OrderStatus.CANCELLED:
        order.cancelled_at = datetime.utcnow()
        order.cancelled_by = "restaurant"
        order.cancellation_reason = status_update.notes
        # Free up table
        if order.table_id:
            table = await Table.get(order.table_id)
            if table:
                table.status = TableStatus.AVAILABLE
                table.current_order_id = None
                await table.save()
    
    order.updated_at = datetime.utcnow()
    await order.save()
    
    # Create notification for customer
    notification_messages = {
        OrderStatus.CONFIRMED: ("Order Confirmed!", f"Your order #{order.order_number} has been confirmed."),
        OrderStatus.PREPARING: ("Preparing Your Order", f"Order #{order.order_number} is being prepared."),
        OrderStatus.READY: ("Order Ready!", f"Order #{order.order_number} is ready!"),
        OrderStatus.CANCELLED: ("Order Cancelled", f"Order #{order.order_number} has been cancelled.")
    }
    
    if new_status in notification_messages:
        title, message = notification_messages[new_status]
        notification = Notification(
            user_id=order.customer_id,
            notification_type=NotificationType[f"ORDER_{new_status.value.upper()}"] if hasattr(NotificationType, f"ORDER_{new_status.value.upper()}") else NotificationType.SYSTEM,
            title=title,
            message=message,
            restaurant_id=order.restaurant_id,
            order_id=str(order.id),
            channels=[NotificationChannel.IN_APP]
        )
        await notification.insert()
    
    return {"message": f"Order status updated from {old_status.value} to {new_status.value}"}


@router.patch("/{order_id}/payment")
async def update_payment_status(
    order_id: str,
    payment_update: OrderPaymentUpdate,
    current_user: User = Depends(require_restaurant_admin)
):
    """Update order payment status"""
    
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order.payment_status = payment_update.payment_status
    order.payment_method = payment_update.payment_method
    
    if payment_update.payment_id:
        order.payment_id = payment_update.payment_id
    
    if payment_update.payment_status == PaymentStatus.PAID:
        order.paid_at = datetime.utcnow()
    
    order.updated_at = datetime.utcnow()
    await order.save()
    
    return {"message": f"Payment status updated to {payment_update.payment_status.value}"}


@router.get("/branch/{branch_id}/stats")
async def get_branch_order_stats(
    branch_id: str,
    current_user: User = Depends(require_restaurant_admin)
):
    """Get order statistics for a branch"""
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Today's orders
    todays_orders = await Order.find(
        Order.branch_id == branch_id,
        Order.placed_at >= today
    ).to_list()
    
    total_orders = len(todays_orders)
    total_revenue = sum(o.total_amount for o in todays_orders if o.payment_status == PaymentStatus.PAID)
    
    # Status breakdown
    status_counts = {}
    for order in todays_orders:
        status_counts[order.status.value] = status_counts.get(order.status.value, 0) + 1
    
    # Order type breakdown
    type_counts = {}
    for order in todays_orders:
        type_counts[order.order_type.value] = type_counts.get(order.order_type.value, 0) + 1
    
    # Pending orders
    pending_count = await Order.find(
        Order.branch_id == branch_id,
        Order.status.in_([OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING])
    ).count()
    
    return {
        "today": {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "status_breakdown": status_counts,
            "type_breakdown": type_counts
        },
        "pending_orders": pending_count
    }
