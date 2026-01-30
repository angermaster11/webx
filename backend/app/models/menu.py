from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class FoodType(str, Enum):
    VEG = "veg"
    NON_VEG = "non_veg"
    EGG = "egg"
    VEGAN = "vegan"


class SpiceLevel(str, Enum):
    MILD = "mild"
    MEDIUM = "medium"
    SPICY = "spicy"
    EXTRA_SPICY = "extra_spicy"


class Addon(BaseModel):
    name: str
    price: float
    is_available: bool = True


class Variant(BaseModel):
    name: str  # e.g., "Half", "Full", "Small", "Medium", "Large"
    price: float
    is_available: bool = True


class NutritionInfo(BaseModel):
    calories: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None


class MenuCategory(Document):
    restaurant_id: Indexed(str)
    branch_id: Optional[str] = None  # If None, applies to all branches
    name: str  # e.g., "Starters", "Main Course", "Desserts"
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True
    
    # Time-based availability
    available_from: Optional[str] = None  # HH:MM format
    available_until: Optional[str] = None
    available_days: List[str] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "menu_categories"
        indexes = [
            "restaurant_id",
            "branch_id",
            "display_order"
        ]


class MenuItem(Document):
    restaurant_id: Indexed(str)
    branch_id: Optional[str] = None  # If None, applies to all branches
    category_id: Indexed(str)
    
    name: Indexed(str)
    description: str
    image_url: Optional[str] = None
    
    # Pricing
    base_price: float
    discount_percentage: float = 0.0
    final_price: float = 0.0  # Calculated field
    
    # Type
    food_type: FoodType = FoodType.VEG
    spice_level: Optional[SpiceLevel] = None
    
    # Variants & Addons
    variants: List[Variant] = []
    addons: List[Addon] = []
    
    # Customization options
    customization_options: List[str] = []  # e.g., ["Extra cheese", "No onion"]
    
    # Availability
    is_available: bool = True
    is_bestseller: bool = False
    is_new: bool = False
    is_recommended: bool = False
    is_daily_special: bool = False
    
    # Preparation
    preparation_time_minutes: int = 15
    
    # Nutrition
    nutrition_info: Optional[NutritionInfo] = None
    allergens: List[str] = []
    
    # Tags
    tags: List[str] = []  # e.g., ["chef-special", "must-try"]
    
    # Stats
    order_count: int = 0
    avg_rating: float = 0.0
    
    # Display
    display_order: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "menu_items"
        indexes = [
            "restaurant_id",
            "branch_id",
            "category_id",
            "food_type",
            "is_available",
            "is_bestseller"
        ]
    
    def calculate_final_price(self):
        """Calculate final price after discount"""
        if self.discount_percentage > 0:
            self.final_price = self.base_price * (1 - self.discount_percentage / 100)
        else:
            self.final_price = self.base_price
        return self.final_price


# Pydantic Schemas
class MenuCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: int = 0
    branch_id: Optional[str] = None
    available_from: Optional[str] = None
    available_until: Optional[str] = None
    available_days: List[str] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
    available_from: Optional[str] = None
    available_until: Optional[str] = None
    available_days: Optional[List[str]] = None


class MenuItemCreate(BaseModel):
    category_id: str
    name: str
    description: str
    image_url: Optional[str] = None
    base_price: float
    discount_percentage: float = 0.0
    food_type: FoodType = FoodType.VEG
    spice_level: Optional[SpiceLevel] = None
    variants: List[Variant] = []
    addons: List[Addon] = []
    customization_options: List[str] = []
    preparation_time_minutes: int = 15
    nutrition_info: Optional[NutritionInfo] = None
    allergens: List[str] = []
    tags: List[str] = []
    branch_id: Optional[str] = None
    display_order: int = 0


class MenuItemUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    base_price: Optional[float] = None
    discount_percentage: Optional[float] = None
    food_type: Optional[FoodType] = None
    spice_level: Optional[SpiceLevel] = None
    variants: Optional[List[Variant]] = None
    addons: Optional[List[Addon]] = None
    customization_options: Optional[List[str]] = None
    is_available: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    is_new: Optional[bool] = None
    is_recommended: Optional[bool] = None
    is_daily_special: Optional[bool] = None
    preparation_time_minutes: Optional[int] = None
    nutrition_info: Optional[NutritionInfo] = None
    allergens: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    display_order: Optional[int] = None


class MenuCategoryResponse(BaseModel):
    id: str
    restaurant_id: str
    branch_id: Optional[str]
    name: str
    description: Optional[str]
    image_url: Optional[str]
    display_order: int
    is_active: bool
    available_from: Optional[str]
    available_until: Optional[str]
    available_days: List[str]
    
    class Config:
        from_attributes = True


class MenuItemResponse(BaseModel):
    id: str
    restaurant_id: str
    branch_id: Optional[str]
    category_id: str
    name: str
    description: str
    image_url: Optional[str]
    base_price: float
    discount_percentage: float
    final_price: float
    food_type: FoodType
    spice_level: Optional[SpiceLevel]
    variants: List[Variant]
    addons: List[Addon]
    customization_options: List[str]
    is_available: bool
    is_bestseller: bool
    is_new: bool
    is_recommended: bool
    is_daily_special: bool
    preparation_time_minutes: int
    nutrition_info: Optional[NutritionInfo]
    allergens: List[str]
    tags: List[str]
    avg_rating: float
    display_order: int
    
    class Config:
        from_attributes = True
