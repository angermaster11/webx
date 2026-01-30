from fastapi import APIRouter, HTTPException, status as http_status, Depends, Query
from typing import List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel
from app.models.table import (
    Table, TableReservation, TableCreate, TableUpdate,
    ReservationCreate, ReservationUpdate, TableResponse,
    ReservationResponse, TableStatus, ReservationStatus,
    SmartAllocationRequest, SmartAllocationResult, TableAvailabilitySlot,
    TableStatusUpdate
)
from app.models.restaurant import Branch, Restaurant
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationType, NotificationChannel
from app.core.security import get_current_user, require_restaurant_admin
from app.services.table_allocator import SmartTableAllocator


router = APIRouter(prefix="/tables", tags=["Tables & Reservations"])


# Schema for smart allocation check request
class SmartAllocationCheckRequest(BaseModel):
    date: str
    time: str
    guests: int
    duration_hours: Optional[float] = 2


# ============================================
# PUBLIC ENDPOINTS (Customer Booking)
# ============================================

@router.post("/smart-allocation/{restaurant_id}")
async def check_smart_allocation(
    restaurant_id: str,
    request: SmartAllocationCheckRequest
):
    """
    Check table availability using smart allocation
    
    Used by customers to see available tables for a specific time
    """
    from bson import ObjectId
    
    branch = None
    
    # First try to find restaurant by slug and get its branch
    restaurant = await Restaurant.find_one(Restaurant.slug == restaurant_id)
    if restaurant:
        branch = await Branch.find_one(Branch.restaurant_id == str(restaurant.id))
    
    if not branch:
        # Try to find branch by restaurant_id field
        branch = await Branch.find_one(Branch.restaurant_id == restaurant_id)
    
    if not branch:
        # Try to find branch directly by ID if it's a valid ObjectId
        try:
            if ObjectId.is_valid(restaurant_id):
                branch = await Branch.get(restaurant_id)
        except Exception:
            pass
    
    if not branch:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Restaurant/Branch not found"
        )
    
    # Parse date
    try:
        reservation_date = datetime.strptime(request.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    duration_minutes = int(request.duration_hours * 60)
    
    # Get available tables
    try:
        allocation_request = SmartAllocationRequest(
            branch_id=str(branch.id),
            guest_count=request.guests,
            reservation_date=reservation_date,
            reservation_time=request.time,
            duration_minutes=duration_minutes,
            preferences=None
        )
        
        result = await SmartTableAllocator.allocate_table(allocation_request)
        
        # Get full table info
        table = await Table.get(result.recommended_table_id)
        
        available_tables = [{
            "id": result.recommended_table_id,
            "table_number": result.table_number,
            "capacity": result.capacity,
            "location": result.location.value if result.location else "indoor",
            "efficiency_score": result.efficiency_score
        }]
        
        # Add alternative tables
        for alt in result.alternative_tables:
            available_tables.append(alt)
        
        return {
            "available": True,
            "available_tables": available_tables,
            "recommended_table": {
                "id": result.recommended_table_id,
                "table_number": result.table_number,
                "capacity": result.capacity,
                "reasoning": result.reasoning
            }
        }
        
    except ValueError as e:
        return {
            "available": False,
            "available_tables": [],
            "message": str(e)
        }


@router.get("/availability/{branch_id}")
async def get_table_availability(
    branch_id: str,
    date: date,
    guest_count: int,
    duration_minutes: int = 90
):
    """
    Get available time slots for a branch
    
    Used by customers to see when they can book
    """
    
    branch = await Branch.get(branch_id)
    if not branch:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    
    if not branch.is_accepting_reservations:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="This branch is not accepting reservations"
        )
    
    slots = await SmartTableAllocator.get_availability_slots(
        branch_id=branch_id,
        target_date=date,
        guest_count=guest_count,
        slot_duration_minutes=duration_minutes
    )
    
    return {
        "branch_id": branch_id,
        "date": date.isoformat(),
        "guest_count": guest_count,
        "duration_minutes": duration_minutes,
        "slots": slots
    }


@router.post("/reserve", response_model=ReservationResponse)
async def create_reservation(
    reservation_data: ReservationCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a table reservation with SMART ALLOCATION
    
    The system automatically selects the optimal table based on:
    - Guest count (no 6-seater for 4 guests if 4-seater is available)
    - Time slot availability
    - Customer preferences
    - Table turnover optimization
    """
    print("\n" + "="*50)
    print("🍽️ CREATE RESERVATION REQUEST")
    print("="*50)
    print(f"User: {current_user.email} (ID: {current_user.id})")
    print(f"Reservation Data: {reservation_data.model_dump()}")
    print(f"Restaurant ID: {reservation_data.restaurant_id}")
    print(f"Branch ID: {reservation_data.branch_id}")
    print(f"Date: {reservation_data.reservation_date}")
    print(f"Time: {reservation_data.reservation_time}")
    print(f"Guests: {reservation_data.guest_count}")
    
    from bson import ObjectId
    
    # Support both branch_id and restaurant_id (can be ID or slug)
    branch = None
    restaurant_id_or_slug = reservation_data.restaurant_id or reservation_data.branch_id
    
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
                        branch = await Branch.find_one(Branch.restaurant_id == restaurant_id_or_slug)
            except Exception:
                pass
    
    if not branch:
        print("❌ ERROR: Branch not found for reservation!")
        print(f"   Searched for: {restaurant_id_or_slug}")
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    
    print(f"✅ Branch found: {branch.name} (ID: {branch.id})")
    print(f"   Accepting Reservations: {branch.is_accepting_reservations}")
    
    if not branch.is_accepting_reservations:
        print("❌ Branch is NOT accepting reservations!")
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="This branch is not accepting reservations"
        )
    
    # Use resolved branch_id
    resolved_branch_id = str(branch.id)
    print(f"   Resolved Branch ID: {resolved_branch_id}")
    
    # 🧠 SMART TABLE ALLOCATION
    print("🧠 Running Smart Table Allocation...")
    try:
        allocation_request = SmartAllocationRequest(
            branch_id=resolved_branch_id,
            guest_count=reservation_data.guest_count,
            reservation_date=reservation_data.reservation_date,
            reservation_time=reservation_data.reservation_time,
            duration_minutes=reservation_data.duration_minutes,
            preferences=reservation_data.preferences
        )
        
        allocation_result = await SmartTableAllocator.allocate_table(allocation_request)
    except ValueError as e:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Calculate end time
    start_time = datetime.strptime(reservation_data.reservation_time, "%H:%M")
    end_time = start_time + timedelta(minutes=reservation_data.duration_minutes)
    
    # Create reservation
    reservation = TableReservation(
        restaurant_id=branch.restaurant_id,
        branch_id=resolved_branch_id,
        table_id=allocation_result.recommended_table_id,
        customer_id=str(current_user.id),
        reservation_date=reservation_data.reservation_date,
        reservation_time=reservation_data.reservation_time,
        end_time=end_time.strftime("%H:%M"),
        guest_count=reservation_data.guest_count,
        guest_name=reservation_data.guest_name or current_user.full_name,
        guest_phone=reservation_data.guest_phone or current_user.phone,
        guest_email=reservation_data.guest_email or current_user.email,
        special_requests=reservation_data.special_requests,
        occasion=reservation_data.occasion,
        status=ReservationStatus.PENDING,
        allocated_capacity=allocation_result.capacity,
        allocation_efficiency=allocation_result.efficiency_score
    )
    
    await reservation.insert()
    
    # Update table status
    table = await Table.get(allocation_result.recommended_table_id)
    if table:
        table.status = TableStatus.RESERVED
        table.current_reservation_id = str(reservation.id)
        await table.save()
    
    # Create notification
    notification = Notification(
        user_id=str(current_user.id),
        notification_type=NotificationType.RESERVATION_CONFIRMED,
        title="Reservation Confirmed!",
        message=f"Your table for {reservation_data.guest_count} guests on {reservation_data.reservation_date} at {reservation_data.reservation_time} has been reserved.",
        restaurant_id=branch.restaurant_id,
        reservation_id=str(reservation.id),
        channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL]
    )
    await notification.insert()
    
    return ReservationResponse(
        id=str(reservation.id),
        restaurant_id=reservation.restaurant_id,
        branch_id=reservation.branch_id,
        table_id=reservation.table_id,
        customer_id=reservation.customer_id,
        reservation_date=reservation.reservation_date,
        reservation_time=reservation.reservation_time,
        end_time=reservation.end_time,
        guest_count=reservation.guest_count,
        guest_name=reservation.guest_name,
        guest_phone=reservation.guest_phone,
        guest_email=reservation.guest_email,
        special_requests=reservation.special_requests,
        occasion=reservation.occasion,
        status=reservation.status,
        allocated_capacity=reservation.allocated_capacity,
        allocation_efficiency=reservation.allocation_efficiency,
        confirmed_at=reservation.confirmed_at,
        seated_at=reservation.seated_at,
        created_at=reservation.created_at
    )


@router.get("/my-reservations", response_model=List[ReservationResponse])
async def get_my_reservations(
    status: Optional[ReservationStatus] = None,
    current_user: User = Depends(get_current_user)
):
    """Get current user's reservations"""
    
    query = {"customer_id": str(current_user.id)}
    if status:
        query["status"] = status
    
    reservations = await TableReservation.find(query).sort("-reservation_date").to_list()
    
    return [
        ReservationResponse(
            id=str(r.id),
            restaurant_id=r.restaurant_id,
            branch_id=r.branch_id,
            table_id=r.table_id,
            customer_id=r.customer_id,
            reservation_date=r.reservation_date,
            reservation_time=r.reservation_time,
            end_time=r.end_time,
            guest_count=r.guest_count,
            guest_name=r.guest_name,
            guest_phone=r.guest_phone,
            guest_email=r.guest_email,
            special_requests=r.special_requests,
            occasion=r.occasion,
            status=r.status,
            allocated_capacity=r.allocated_capacity,
            allocation_efficiency=r.allocation_efficiency,
            confirmed_at=r.confirmed_at,
            seated_at=r.seated_at,
            created_at=r.created_at
        )
        for r in reservations
    ]


@router.delete("/reservations/{reservation_id}")
async def cancel_reservation(
    reservation_id: str,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Cancel a reservation"""
    
    reservation = await TableReservation.get(reservation_id)
    if not reservation:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    # Check permission
    if str(current_user.id) != reservation.customer_id:
        if current_user.role not in [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(
                status_code=http_status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    if reservation.status in [ReservationStatus.COMPLETED, ReservationStatus.CANCELLED]:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel {reservation.status.value} reservation"
        )
    
    # Update reservation
    reservation.status = ReservationStatus.CANCELLED
    reservation.cancelled_at = datetime.utcnow()
    reservation.cancellation_reason = reason
    await reservation.save()
    
    # Free up the table
    if reservation.table_id:
        table = await Table.get(reservation.table_id)
        if table:
            table.status = TableStatus.AVAILABLE
            table.current_reservation_id = None
            await table.save()
    
    return {"message": "Reservation cancelled successfully"}


# ============================================
# RESTAURANT ADMIN ENDPOINTS
# ============================================

@router.get("/branch/{branch_id}", response_model=List[TableResponse])
async def get_branch_tables(
    branch_id: str,
    current_user: User = Depends(require_restaurant_admin)
):
    """Get all tables for a branch"""
    
    tables = await Table.find(Table.branch_id == branch_id).to_list()
    
    return [
        TableResponse(
            id=str(t.id),
            restaurant_id=t.restaurant_id,
            branch_id=t.branch_id,
            table_number=t.table_number,
            table_type=t.table_type,
            capacity=t.capacity,
            min_capacity=t.min_capacity,
            location=t.location,
            floor=t.floor,
            status=t.status,
            current_reservation_id=t.current_reservation_id,
            current_order_id=t.current_order_id,
            occupied_at=t.occupied_at,
            expected_free_at=t.expected_free_at,
            has_power_outlet=t.has_power_outlet,
            has_window_view=t.has_window_view,
            is_wheelchair_accessible=t.is_wheelchair_accessible,
            is_active=t.is_active,
            extra_charge=t.extra_charge
        )
        for t in tables
    ]


@router.post("/", response_model=TableResponse)
async def create_table(
    table_data: TableCreate,
    restaurant_id: str,
    branch_id: str,
    current_user: User = Depends(require_restaurant_admin)
):
    """Create a new table"""
    
    # Check if table number already exists
    existing = await Table.find_one({
        "branch_id": branch_id,
        "table_number": table_data.table_number
    })
    
    if existing:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Table {table_data.table_number} already exists"
        )
    
    table = Table(
        restaurant_id=restaurant_id,
        branch_id=branch_id,
        table_number=table_data.table_number,
        table_type=table_data.table_type,
        capacity=table_data.capacity,
        min_capacity=table_data.min_capacity,
        location=table_data.location,
        floor=table_data.floor,
        position_x=table_data.position_x,
        position_y=table_data.position_y,
        has_power_outlet=table_data.has_power_outlet,
        has_window_view=table_data.has_window_view,
        is_wheelchair_accessible=table_data.is_wheelchair_accessible,
        is_smoking_allowed=table_data.is_smoking_allowed,
        is_combinable=table_data.is_combinable,
        adjacent_tables=table_data.adjacent_tables,
        extra_charge=table_data.extra_charge
    )
    
    await table.insert()
    
    # Update branch capacity
    branch = await Branch.get(branch_id)
    if branch:
        branch.total_tables += 1
        branch.total_seating_capacity += table.capacity
        await branch.save()
    
    return TableResponse(
        id=str(table.id),
        restaurant_id=table.restaurant_id,
        branch_id=table.branch_id,
        table_number=table.table_number,
        table_type=table.table_type,
        capacity=table.capacity,
        min_capacity=table.min_capacity,
        location=table.location,
        floor=table.floor,
        status=table.status,
        current_reservation_id=table.current_reservation_id,
        current_order_id=table.current_order_id,
        occupied_at=table.occupied_at,
        expected_free_at=table.expected_free_at,
        has_power_outlet=table.has_power_outlet,
        has_window_view=table.has_window_view,
        is_wheelchair_accessible=table.is_wheelchair_accessible,
        is_active=table.is_active,
        extra_charge=table.extra_charge
    )


@router.put("/{table_id}", response_model=TableResponse)
async def update_table(
    table_id: str,
    update_data: TableUpdate,
    current_user: User = Depends(require_restaurant_admin)
):
    """Update table details"""
    
    table = await Table.get(table_id)
    if not table:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Table not found"
        )
    
    old_capacity = table.capacity
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(table, field, value)
    
    table.updated_at = datetime.utcnow()
    await table.save()
    
    # Update branch capacity if changed
    if "capacity" in update_dict:
        branch = await Branch.get(table.branch_id)
        if branch:
            branch.total_seating_capacity += (table.capacity - old_capacity)
            await branch.save()
    
    return TableResponse(
        id=str(table.id),
        restaurant_id=table.restaurant_id,
        branch_id=table.branch_id,
        table_number=table.table_number,
        table_type=table.table_type,
        capacity=table.capacity,
        min_capacity=table.min_capacity,
        location=table.location,
        floor=table.floor,
        status=table.status,
        current_reservation_id=table.current_reservation_id,
        current_order_id=table.current_order_id,
        occupied_at=table.occupied_at,
        expected_free_at=table.expected_free_at,
        has_power_outlet=table.has_power_outlet,
        has_window_view=table.has_window_view,
        is_wheelchair_accessible=table.is_wheelchair_accessible,
        is_active=table.is_active,
        extra_charge=table.extra_charge
    )


@router.patch("/{table_id}/status")
async def update_table_status(
    table_id: str,
    status_data: TableStatusUpdate,
    current_user: User = Depends(require_restaurant_admin)
):
    """
    Quick status update for a table
    
    Used for real-time floor management
    """
    
    table = await Table.get(table_id)
    if not table:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Table not found"
        )
    
    table.status = status_data.status
    
    if status_data.status == TableStatus.OCCUPIED:
        table.occupied_at = datetime.utcnow()
        # Get branch avg dining duration for ETA
        branch = await Branch.get(table.branch_id)
        if branch:
            table.expected_free_at = datetime.utcnow() + timedelta(
                minutes=branch.avg_dining_duration_minutes
            )
    elif status_data.status == TableStatus.AVAILABLE:
        table.occupied_at = None
        table.expected_free_at = None
        table.current_reservation_id = None
        table.current_order_id = None
    
    if status_data.current_order_id:
        table.current_order_id = status_data.current_order_id
    
    table.updated_at = datetime.utcnow()
    await table.save()
    
    return {"message": f"Table status updated to {status_data.status.value}"}


@router.get("/reservations", response_model=List[ReservationResponse])
async def get_all_reservations(
    date: Optional[date] = None,
    status: Optional[ReservationStatus] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_restaurant_admin)
):
    """Get all reservations for admin's restaurant"""
    print("\n" + "="*50)
    print("🍽️ GET ALL RESERVATIONS REQUEST")
    print("="*50)
    print(f"User: {current_user.email} (Role: {current_user.role})")
    print(f"Restaurant ID: {current_user.restaurant_id}")
    print(f"Filters - Date: {date}, Status: {status}")
    
    query = {}
    
    # Filter by restaurant for restaurant admins
    if current_user.role == UserRole.RESTAURANT_ADMIN and current_user.restaurant_id:
        query["restaurant_id"] = current_user.restaurant_id
        print(f"   Filtering by restaurant_id: {current_user.restaurant_id}")
    else:
        print("   No restaurant filter (showing all reservations)")
    
    if date:
        query["reservation_date"] = date
    if status:
        query["status"] = status
    
    print(f"   Query: {query}")
    
    reservations = await TableReservation.find(query).sort("-reservation_date").skip(skip).limit(limit).to_list()
    
    print(f"✅ Found {len(reservations)} reservations")
    
    return [
        ReservationResponse(
            id=str(r.id),
            restaurant_id=r.restaurant_id,
            branch_id=r.branch_id,
            table_id=r.table_id,
            customer_id=r.customer_id,
            reservation_date=r.reservation_date,
            reservation_time=r.reservation_time,
            end_time=r.end_time,
            guest_count=r.guest_count,
            guest_name=r.guest_name,
            guest_phone=r.guest_phone,
            guest_email=r.guest_email,
            special_requests=r.special_requests,
            occasion=r.occasion,
            status=r.status,
            allocated_capacity=r.allocated_capacity,
            allocation_efficiency=r.allocation_efficiency,
            confirmed_at=r.confirmed_at,
            seated_at=r.seated_at,
            created_at=r.created_at
        )
        for r in reservations
    ]


@router.get("/branch/{branch_id}/reservations", response_model=List[ReservationResponse])
async def get_branch_reservations(
    branch_id: str,
    date: Optional[date] = None,
    status: Optional[ReservationStatus] = None,
    current_user: User = Depends(require_restaurant_admin)
):
    """Get reservations for a branch"""
    
    query = {"branch_id": branch_id}
    if date:
        query["reservation_date"] = date
    if status:
        query["status"] = status
    
    reservations = await TableReservation.find(query).sort("reservation_time").to_list()
    
    return [
        ReservationResponse(
            id=str(r.id),
            restaurant_id=r.restaurant_id,
            branch_id=r.branch_id,
            table_id=r.table_id,
            customer_id=r.customer_id,
            reservation_date=r.reservation_date,
            reservation_time=r.reservation_time,
            end_time=r.end_time,
            guest_count=r.guest_count,
            guest_name=r.guest_name,
            guest_phone=r.guest_phone,
            guest_email=r.guest_email,
            special_requests=r.special_requests,
            occasion=r.occasion,
            status=r.status,
            allocated_capacity=r.allocated_capacity,
            allocation_efficiency=r.allocation_efficiency,
            confirmed_at=r.confirmed_at,
            seated_at=r.seated_at,
            created_at=r.created_at
        )
        for r in reservations
    ]


@router.patch("/reservations/{reservation_id}/status")
async def update_reservation_status(
    reservation_id: str,
    new_status: ReservationStatus,
    current_user: User = Depends(require_restaurant_admin)
):
    """Update reservation status"""
    
    reservation = await TableReservation.get(reservation_id)
    if not reservation:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    old_status = reservation.status
    reservation.status = new_status
    
    # Handle status-specific updates
    if new_status == ReservationStatus.CONFIRMED:
        reservation.confirmed_at = datetime.utcnow()
    elif new_status == ReservationStatus.SEATED:
        reservation.seated_at = datetime.utcnow()
        # Update table to occupied
        if reservation.table_id:
            table = await Table.get(reservation.table_id)
            if table:
                table.status = TableStatus.OCCUPIED
                table.occupied_at = datetime.utcnow()
                await table.save()
    elif new_status == ReservationStatus.COMPLETED:
        reservation.completed_at = datetime.utcnow()
        # Free up the table
        if reservation.table_id:
            table = await Table.get(reservation.table_id)
            if table:
                table.status = TableStatus.CLEANING
                table.current_reservation_id = None
                await table.save()
    
    reservation.updated_at = datetime.utcnow()
    await reservation.save()
    
    return {"message": f"Reservation status updated from {old_status.value} to {new_status.value}"}


@router.get("/branch/{branch_id}/occupancy")
async def get_branch_occupancy(
    branch_id: str,
    current_user: User = Depends(require_restaurant_admin)
):
    """Get real-time occupancy statistics for a branch"""
    
    stats = await SmartTableAllocator.get_branch_occupancy_stats(branch_id)
    return stats
