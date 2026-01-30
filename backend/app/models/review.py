from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ReviewType(str, Enum):
    RESTAURANT = "restaurant"
    ORDER = "order"
    MENU_ITEM = "menu_item"


class RatingCategory(BaseModel):
    """Individual rating category"""
    category: str  # food, service, ambience, value
    rating: float  # 1-5


class Review(Document):
    restaurant_id: Indexed(str)
    branch_id: Optional[str] = None
    customer_id: Indexed(str)
    
    # Review target
    review_type: ReviewType
    order_id: Optional[str] = None
    menu_item_id: Optional[str] = None
    
    # Ratings
    overall_rating: float  # 1-5
    category_ratings: List[RatingCategory] = []
    
    # Review content
    title: Optional[str] = None
    review_text: Optional[str] = None
    images: List[str] = []
    
    # Customer info (denormalized)
    customer_name: str
    customer_avatar: Optional[str] = None
    
    # Moderation
    is_verified_purchase: bool = False
    is_approved: bool = True
    is_featured: bool = False
    
    # Response from restaurant
    restaurant_response: Optional[str] = None
    response_at: Optional[datetime] = None
    
    # Engagement
    helpful_count: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "reviews"
        indexes = [
            "restaurant_id",
            "branch_id",
            "customer_id",
            "order_id",
            "overall_rating",
            "created_at"
        ]


# Pydantic Schemas
class ReviewCreate(BaseModel):
    restaurant_id: str
    branch_id: Optional[str] = None
    review_type: ReviewType = ReviewType.RESTAURANT
    order_id: Optional[str] = None
    menu_item_id: Optional[str] = None
    overall_rating: float
    category_ratings: List[RatingCategory] = []
    title: Optional[str] = None
    review_text: Optional[str] = None
    images: List[str] = []


class ReviewUpdate(BaseModel):
    overall_rating: Optional[float] = None
    category_ratings: Optional[List[RatingCategory]] = None
    title: Optional[str] = None
    review_text: Optional[str] = None
    images: Optional[List[str]] = None


class ReviewResponse(BaseModel):
    id: str
    restaurant_id: str
    branch_id: Optional[str]
    customer_id: str
    review_type: ReviewType
    order_id: Optional[str]
    overall_rating: float
    category_ratings: List[RatingCategory]
    title: Optional[str]
    review_text: Optional[str]
    images: List[str]
    customer_name: str
    customer_avatar: Optional[str]
    is_verified_purchase: bool
    restaurant_response: Optional[str]
    response_at: Optional[datetime]
    helpful_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class RestaurantRatingSummary(BaseModel):
    """Aggregated rating summary for a restaurant"""
    restaurant_id: str
    overall_rating: float
    total_reviews: int
    rating_distribution: dict  # {"5": 100, "4": 50, ...}
    category_averages: dict  # {"food": 4.5, "service": 4.2, ...}
