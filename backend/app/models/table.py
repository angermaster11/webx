from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum


class TableType(str, Enum):
    TWO_SEATER = "2_seater"
    FOUR_SEATER = "4_seater"
    SIX_SEATER = "6_seater"
    EIGHT_SEATER = "8_seater"
    TEN_SEATER = "10_seater"
    PRIVATE_ROOM = "private_room"
    OUTDOOR = "outdoor"
    BAR = "bar"


class TableStatus(str, Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    OCCUPIED = "occupied"
    CLEANING = "cleaning"
    BLOCKED = "blocked"


class ReservationStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SEATED = "seated"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class TableLocation(str, Enum):
    INDOOR = "indoor"
    OUTDOOR = "outdoor"
    TERRACE = "terrace"
    PRIVATE = "private"
    BAR_AREA = "bar_area"
    WINDOW = "window"


class Table(Document):
    restaurant_id: Indexed(str)
    branch_id: Indexed(str)
    
    table_number: str  # e.g., "T1", "A1", "VIP1"
    table_type: TableType
    capacity: int  # Number of seats
    min_capacity: int = 1  # Minimum guests allowed (for optimization)
    
    # Location in restaurant
    location: TableLocation = TableLocation.INDOOR
    floor: int = 0  # Ground floor = 0
    position_x: Optional[float] = None  # For floor plan visualization
    position_y: Optional[float] = None
    
    # Current status
    status: TableStatus = TableStatus.AVAILABLE
    current_reservation_id: Optional[str] = None
    current_order_id: Optional[str] = None
    
    # For occupied tables
    occupied_at: Optional[datetime] = None
    expected_free_at: Optional[datetime] = None
    
    # Features
    has_power_outlet: bool = False
    has_window_view: bool = False
    is_wheelchair_accessible: bool = False
    is_smoking_allowed: bool = False
    is_combinable: bool = True  # Can be combined with adjacent tables
    adjacent_tables: List[str] = []  # IDs of tables that can be combined
    
    # Pricing (if premium seating)
    extra_charge: float = 0.0
    
    # Status
    is_active: bool = True
    
    # Stats for optimization
    avg_turnover_time_minutes: int = 60  # Historical average
    total_reservations: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "tables"
        indexes = [
            "restaurant_id",
            "branch_id",
            "table_number",
            "status",
            "capacity"
        ]


class TableReservation(Document):
    restaurant_id: Indexed(str)
    branch_id: Indexed(str)
    table_id: Optional[str] = None  # Assigned after smart allocation
    customer_id: Indexed(str)
    
    # Reservation details
    reservation_date: Indexed(date)
    reservation_time: str  # HH:MM format
    end_time: str  # Expected end time HH:MM
    
    # Guest details
    guest_count: int
    guest_name: str
    guest_phone: str
    guest_email: Optional[str] = None
    special_requests: Optional[str] = None
    
    # Occasion
    occasion: Optional[str] = None  # Birthday, Anniversary, Business, etc.
    
    # Status
    status: ReservationStatus = ReservationStatus.PENDING
    
    # Pre-order (optional)
    pre_order_id: Optional[str] = None
    
    # Smart allocation metadata
    allocated_capacity: Optional[int] = None  # Table capacity allocated
    allocation_efficiency: Optional[float] = None  # guests/capacity ratio
    
    # Timestamps
    confirmed_at: Optional[datetime] = None
    seated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    
    # Cancellation
    cancellation_reason: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "table_reservations"
        indexes = [
            "restaurant_id",
            "branch_id",
            "table_id",
            "customer_id",
            "reservation_date",
            "status"
        ]


# ============================================
# SMART TABLE ALLOCATION SCHEMAS
# ============================================

class SmartAllocationRequest(BaseModel):
    """Request for smart table allocation"""
    branch_id: str
    guest_count: int
    reservation_date: date
    reservation_time: str  # HH:MM
    duration_minutes: int = 90  # Expected dining duration
    preferences: Optional[List[TableLocation]] = None
    special_requirements: Optional[List[str]] = None  # e.g., ["wheelchair", "window"]


class SmartAllocationResult(BaseModel):
    """Result of smart table allocation"""
    recommended_table_id: str
    table_number: str
    capacity: int
    efficiency_score: float  # 0-100, higher is better
    location: TableLocation
    alternative_tables: List[dict]  # Other options
    reasoning: str  # Why this table was chosen


class TableAvailabilitySlot(BaseModel):
    """Time slot availability"""
    time: str  # HH:MM
    is_available: bool
    available_tables: List[str]


# ============================================
# PYDANTIC SCHEMAS
# ============================================

class TableCreate(BaseModel):
    table_number: str
    table_type: TableType
    capacity: int
    min_capacity: int = 1
    location: TableLocation = TableLocation.INDOOR
    floor: int = 0
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    has_power_outlet: bool = False
    has_window_view: bool = False
    is_wheelchair_accessible: bool = False
    is_smoking_allowed: bool = False
    is_combinable: bool = True
    adjacent_tables: List[str] = []
    extra_charge: float = 0.0


class TableUpdate(BaseModel):
    table_number: Optional[str] = None
    table_type: Optional[TableType] = None
    capacity: Optional[int] = None
    min_capacity: Optional[int] = None
    location: Optional[TableLocation] = None
    floor: Optional[int] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    status: Optional[TableStatus] = None
    has_power_outlet: Optional[bool] = None
    has_window_view: Optional[bool] = None
    is_wheelchair_accessible: Optional[bool] = None
    is_smoking_allowed: Optional[bool] = None
    is_combinable: Optional[bool] = None
    adjacent_tables: Optional[List[str]] = None
    extra_charge: Optional[float] = None
    is_active: Optional[bool] = None


class TableStatusUpdate(BaseModel):
    """Quick status update for tables"""
    status: TableStatus
    current_order_id: Optional[str] = None


class ReservationCreate(BaseModel):
    restaurant_id: Optional[str] = None
    branch_id: Optional[str] = None
    reservation_date: date
    reservation_time: str
    duration_minutes: int = 90
    guest_count: int
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_email: Optional[str] = None
    special_requests: Optional[str] = None
    occasion: Optional[str] = None
    preferences: Optional[List[TableLocation]] = None
    pre_order_items: Optional[List[str]] = None  # Menu item IDs


class ReservationUpdate(BaseModel):
    reservation_date: Optional[date] = None
    reservation_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    guest_count: Optional[int] = None
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_email: Optional[str] = None
    special_requests: Optional[str] = None
    occasion: Optional[str] = None
    status: Optional[ReservationStatus] = None


class TableResponse(BaseModel):
    id: str
    restaurant_id: str
    branch_id: str
    table_number: str
    table_type: TableType
    capacity: int
    min_capacity: int
    location: TableLocation
    floor: int
    status: TableStatus
    current_reservation_id: Optional[str]
    current_order_id: Optional[str]
    occupied_at: Optional[datetime]
    expected_free_at: Optional[datetime]
    has_power_outlet: bool
    has_window_view: bool
    is_wheelchair_accessible: bool
    is_active: bool
    extra_charge: float
    
    class Config:
        from_attributes = True


class ReservationResponse(BaseModel):
    id: str
    restaurant_id: str
    branch_id: str
    table_id: Optional[str]
    customer_id: str
    reservation_date: date
    reservation_time: str
    end_time: str
    guest_count: int
    guest_name: str
    guest_phone: str
    guest_email: Optional[str]
    special_requests: Optional[str]
    occasion: Optional[str]
    status: ReservationStatus
    allocated_capacity: Optional[int]
    allocation_efficiency: Optional[float]
    confirmed_at: Optional[datetime]
    seated_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True
