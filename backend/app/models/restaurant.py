from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, time
from enum import Enum


class CuisineType(str, Enum):
    INDIAN = "indian"
    CHINESE = "chinese"
    ITALIAN = "italian"
    MEXICAN = "mexican"
    JAPANESE = "japanese"
    THAI = "thai"
    CONTINENTAL = "continental"
    FAST_FOOD = "fast_food"
    CAFE = "cafe"
    MULTI_CUISINE = "multi_cuisine"


class ServiceType(str, Enum):
    DINE_IN = "dine_in"
    TAKEAWAY = "takeaway"
    DELIVERY = "delivery"


class RestaurantStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"


class WorkingHours(BaseModel):
    day: str  # monday, tuesday, etc.
    open_time: str = "09:00"  # HH:MM format
    close_time: str = "23:00"
    is_closed: bool = False


class Location(BaseModel):
    address: str
    city: str
    state: str
    pincode: str
    country: str = "India"
    latitude: float
    longitude: float


class Restaurant(Document):
    name: Indexed(str)
    slug: Indexed(str, unique=True)
    description: str
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    gallery_images: List[str] = []
    
    # Owner info
    owner_id: str
    owner_name: str
    owner_email: str
    owner_phone: str
    
    # Restaurant details
    cuisines: List[CuisineType] = []
    service_types: List[ServiceType] = [ServiceType.DINE_IN]
    avg_price_for_two: float = 500.0
    
    # Rating
    avg_rating: float = 0.0
    total_reviews: int = 0
    
    # Status
    status: RestaurantStatus = RestaurantStatus.PENDING
    is_featured: bool = False
    
    # Commission (for SaaS)
    commission_percentage: float = 10.0
    subscription_plan: str = "basic"
    
    # Tags
    tags: List[str] = []  # e.g., ["veg-friendly", "family", "romantic"]
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "restaurants"
        indexes = [
            "slug",
            "owner_id",
            "status",
            "cuisines"
        ]


class Branch(Document):
    restaurant_id: Indexed(str)
    name: str  # e.g., "Main Branch", "Connaught Place"
    
    # Location
    location: Location
    
    # Contact
    phone: str
    email: Optional[str] = None
    
    # Working hours
    working_hours: List[WorkingHours] = []
    
    # Capacity
    total_tables: int = 0
    total_seating_capacity: int = 0
    
    # Status
    is_active: bool = True
    is_accepting_orders: bool = True
    is_accepting_reservations: bool = True
    
    # Average service time (for smart table allocation)
    avg_dining_duration_minutes: int = 60  # Average time customers spend
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "branches"
        indexes = [
            "restaurant_id",
            "location.city",
            "is_active"
        ]


# Pydantic Schemas
class RestaurantCreate(BaseModel):
    name: str
    description: str
    cuisines: List[CuisineType]
    service_types: List[ServiceType] = [ServiceType.DINE_IN]
    avg_price_for_two: float = 500.0
    tags: List[str] = []


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    cuisines: Optional[List[CuisineType]] = None
    service_types: Optional[List[ServiceType]] = None
    avg_price_for_two: Optional[float] = None
    tags: Optional[List[str]] = None


class BranchCreate(BaseModel):
    name: str
    location: Location
    phone: str
    email: Optional[str] = None
    working_hours: List[WorkingHours] = []
    avg_dining_duration_minutes: int = 60


class BranchUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[Location] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    working_hours: Optional[List[WorkingHours]] = None
    is_active: Optional[bool] = None
    is_accepting_orders: Optional[bool] = None
    is_accepting_reservations: Optional[bool] = None
    avg_dining_duration_minutes: Optional[int] = None


class RestaurantResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    logo_url: Optional[str]
    cover_image_url: Optional[str]
    gallery_images: List[str]
    cuisines: List[CuisineType]
    service_types: List[ServiceType]
    avg_price_for_two: float
    avg_rating: float
    total_reviews: int
    status: RestaurantStatus
    is_featured: bool
    tags: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class BranchResponse(BaseModel):
    id: str
    restaurant_id: str
    name: str
    location: Location
    phone: str
    email: Optional[str]
    working_hours: List[WorkingHours]
    total_tables: int
    total_seating_capacity: int
    is_active: bool
    is_accepting_orders: bool
    is_accepting_reservations: bool
    avg_dining_duration_minutes: int
    
    class Config:
        from_attributes = True
