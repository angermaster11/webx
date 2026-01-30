#!/usr/bin/env python3
"""
Database Seeder for DineFlow Restaurant SaaS
Run this script to populate the database with sample data.

Usage: python seed_database.py
"""

import asyncio
from datetime import datetime, timedelta
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import random

# Models
from app.models.user import User, UserRole
from app.models.restaurant import Restaurant, Branch, CuisineType, ServiceType, RestaurantStatus, WorkingHours, Location
from app.models.menu import MenuItem, MenuCategory, FoodType, SpiceLevel, Variant, Addon
from app.models.table import Table, TableType, TableStatus, TableLocation
from app.models.order import Order, OrderItem, OrderStatus
from app.models.review import Review, ReviewType

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# ============== USER DATA ==============
USERS_DATA = [
    # Super Admin
    {
        "email": "superadmin@dineflow.com",
        "phone": "+919999000001",
        "password": "admin123",
        "full_name": "Super Admin",
        "role": UserRole.SUPER_ADMIN,
        "is_verified": True
    },
    # Restaurant Admins
    {
        "email": "admin@goldenspice.com",
        "phone": "+919999000002",
        "password": "admin123",
        "full_name": "Rajesh Kumar",
        "role": UserRole.RESTAURANT_ADMIN,
        "is_verified": True
    },
    {
        "email": "admin@sakura.com",
        "phone": "+919999000003",
        "password": "admin123",
        "full_name": "Yuki Tanaka",
        "role": UserRole.RESTAURANT_ADMIN,
        "is_verified": True
    },
    {
        "email": "admin@labella.com",
        "phone": "+919999000004",
        "password": "admin123",
        "full_name": "Marco Rossi",
        "role": UserRole.RESTAURANT_ADMIN,
        "is_verified": True
    },
    {
        "email": "admin@spicegarden.com",
        "phone": "+919999000005",
        "password": "admin123",
        "full_name": "Priya Sharma",
        "role": UserRole.RESTAURANT_ADMIN,
        "is_verified": True
    },
    {
        "email": "admin@dragonpalace.com",
        "phone": "+919999000006",
        "password": "admin123",
        "full_name": "Wei Chen",
        "role": UserRole.RESTAURANT_ADMIN,
        "is_verified": True
    },
    # Customers
    {
        "email": "customer@gmail.com",
        "phone": "+919876543210",
        "password": "customer123",
        "full_name": "Arjun Patel",
        "role": UserRole.CUSTOMER,
        "is_verified": True
    },
    {
        "email": "john@gmail.com",
        "phone": "+919876543211",
        "password": "customer123",
        "full_name": "John Smith",
        "role": UserRole.CUSTOMER,
        "is_verified": True
    },
    {
        "email": "priya@gmail.com",
        "phone": "+919876543212",
        "password": "customer123",
        "full_name": "Priya Verma",
        "role": UserRole.CUSTOMER,
        "is_verified": True
    },
]

# ============== RESTAURANT DATA ==============
RESTAURANTS_DATA = [
    {
        "name": "The Golden Spice",
        "slug": "the-golden-spice",
        "description": "Experience the finest North Indian cuisine in an elegant setting. Our master chefs bring decades of culinary expertise to create authentic flavors that transport you to the heart of India. Perfect for family dinners and special occasions.",
        "logo_url": "https://images.unsplash.com/photo-1599458252573-56ae36120de1?w=200",
        "cover_image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
        "gallery_images": [
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800"
        ],
        "cuisines": [CuisineType.INDIAN],
        "service_types": [ServiceType.DINE_IN, ServiceType.DELIVERY, ServiceType.TAKEAWAY],
        "avg_price_for_two": 1500.0,
        "avg_rating": 4.7,
        "total_reviews": 342,
        "status": RestaurantStatus.ACTIVE,
        "is_featured": True,
        "tags": ["fine-dining", "family-friendly", "romantic", "veg-friendly"],
        "admin_index": 1  # Index in USERS_DATA for restaurant admin
    },
    {
        "name": "Sakura Garden",
        "slug": "sakura-garden",
        "description": "Authentic Japanese cuisine featuring fresh sushi, sashimi, and traditional dishes. Our ingredients are sourced directly from Tokyo's famous Tsukiji market. Experience the art of Japanese dining.",
        "logo_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200",
        "cover_image_url": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200",
        "gallery_images": [
            "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
            "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800",
            "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800"
        ],
        "cuisines": [CuisineType.JAPANESE],
        "service_types": [ServiceType.DINE_IN, ServiceType.TAKEAWAY],
        "avg_price_for_two": 2500.0,
        "avg_rating": 4.9,
        "total_reviews": 218,
        "status": RestaurantStatus.ACTIVE,
        "is_featured": True,
        "tags": ["premium", "sushi", "date-night", "authentic"],
        "admin_index": 2
    },
    {
        "name": "La Bella Italia",
        "slug": "la-bella-italia",
        "description": "Bring the taste of Italy to your table. Hand-crafted pasta, wood-fired pizzas, and classic Italian desserts made with imported ingredients. A romantic ambiance perfect for date nights.",
        "logo_url": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=200",
        "cover_image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
        "gallery_images": [
            "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
            "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800"
        ],
        "cuisines": [CuisineType.ITALIAN],
        "service_types": [ServiceType.DINE_IN, ServiceType.DELIVERY],
        "avg_price_for_two": 1800.0,
        "avg_rating": 4.6,
        "total_reviews": 412,
        "status": RestaurantStatus.ACTIVE,
        "is_featured": True,
        "tags": ["romantic", "pizza", "pasta", "wine"],
        "admin_index": 3
    },
    {
        "name": "Spice Garden",
        "slug": "spice-garden",
        "description": "A vegetarian paradise offering a diverse range of South Indian delicacies. From crispy dosas to flavorful sambar, experience authentic South Indian flavors in a contemporary setting.",
        "logo_url": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=200",
        "cover_image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200",
        "gallery_images": [
            "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
            "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
            "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800"
        ],
        "cuisines": [CuisineType.INDIAN],
        "service_types": [ServiceType.DINE_IN, ServiceType.DELIVERY, ServiceType.TAKEAWAY],
        "avg_price_for_two": 800.0,
        "avg_rating": 4.5,
        "total_reviews": 567,
        "status": RestaurantStatus.ACTIVE,
        "is_featured": False,
        "tags": ["vegetarian", "south-indian", "budget-friendly", "family"],
        "admin_index": 4
    },
    {
        "name": "Dragon Palace",
        "slug": "dragon-palace",
        "description": "Authentic Chinese cuisine featuring Sichuan, Cantonese, and Hunan specialties. Our chefs bring 30 years of experience from top restaurants in Shanghai and Beijing.",
        "logo_url": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200",
        "cover_image_url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200",
        "gallery_images": [
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
            "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800"
        ],
        "cuisines": [CuisineType.CHINESE],
        "service_types": [ServiceType.DINE_IN, ServiceType.DELIVERY, ServiceType.TAKEAWAY],
        "avg_price_for_two": 1200.0,
        "avg_rating": 4.4,
        "total_reviews": 289,
        "status": RestaurantStatus.ACTIVE,
        "is_featured": True,
        "tags": ["authentic", "spicy", "dim-sum", "family"],
        "admin_index": 5
    },
]

# ============== MENU DATA ==============
def get_menu_data(restaurant_name: str):
    """Returns menu categories and items based on restaurant type"""
    
    menus = {
        "The Golden Spice": {
            "categories": ["Starters", "Tandoor Specials", "Main Course", "Biryani", "Breads", "Desserts", "Beverages"],
            "items": [
                # Starters
                {"name": "Paneer Tikka", "description": "Cottage cheese marinated in spices and grilled in tandoor", "base_price": 299, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Starters", "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400"},
                {"name": "Chicken Malai Tikka", "description": "Creamy chicken pieces grilled to perfection", "base_price": 349, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Starters", "image_url": "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=400"},
                {"name": "Mutton Seekh Kebab", "description": "Minced mutton skewers with aromatic spices", "base_price": 399, "food_type": FoodType.NON_VEG, "category": "Starters", "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400"},
                {"name": "Veg Spring Rolls", "description": "Crispy rolls stuffed with vegetables", "base_price": 199, "food_type": FoodType.VEG, "category": "Starters", "image_url": "https://images.unsplash.com/photo-1548507200-67a8f2db7d79?w=400"},
                # Tandoor Specials
                {"name": "Tandoori Chicken", "description": "Half chicken marinated overnight and roasted in tandoor", "base_price": 449, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Tandoor Specials", "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400"},
                {"name": "Fish Tikka", "description": "Fresh fish marinated with Indian spices", "base_price": 499, "food_type": FoodType.NON_VEG, "category": "Tandoor Specials", "image_url": "https://images.unsplash.com/photo-1626645738196-c2a72c48e8e8?w=400"},
                # Main Course
                {"name": "Butter Chicken", "description": "Tandoori chicken in rich tomato and butter gravy", "base_price": 399, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400"},
                {"name": "Paneer Butter Masala", "description": "Cottage cheese in creamy tomato gravy", "base_price": 329, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400"},
                {"name": "Dal Makhani", "description": "Black lentils slow-cooked overnight", "base_price": 279, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"},
                {"name": "Mutton Rogan Josh", "description": "Kashmiri style mutton curry", "base_price": 499, "food_type": FoodType.NON_VEG, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400"},
                {"name": "Palak Paneer", "description": "Cottage cheese in spinach gravy", "base_price": 299, "food_type": FoodType.VEG, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=400"},
                # Biryani
                {"name": "Hyderabadi Chicken Biryani", "description": "Authentic dum biryani with succulent chicken", "base_price": 399, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Biryani", "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400"},
                {"name": "Veg Biryani", "description": "Fragrant rice with mixed vegetables", "base_price": 299, "food_type": FoodType.VEG, "category": "Biryani", "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400"},
                {"name": "Mutton Biryani", "description": "Slow-cooked mutton dum biryani", "base_price": 499, "food_type": FoodType.NON_VEG, "category": "Biryani", "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400"},
                # Breads
                {"name": "Butter Naan", "description": "Soft bread brushed with butter", "base_price": 59, "food_type": FoodType.VEG, "category": "Breads", "image_url": "https://images.unsplash.com/photo-1600398138969-4df3f8c2a4e9?w=400"},
                {"name": "Garlic Naan", "description": "Naan topped with garlic and coriander", "base_price": 69, "food_type": FoodType.VEG, "category": "Breads", "image_url": "https://images.unsplash.com/photo-1600398138969-4df3f8c2a4e9?w=400"},
                {"name": "Tandoori Roti", "description": "Whole wheat bread from tandoor", "base_price": 39, "food_type": FoodType.VEG, "category": "Breads", "image_url": "https://images.unsplash.com/photo-1600398138969-4df3f8c2a4e9?w=400"},
                # Desserts
                {"name": "Gulab Jamun", "description": "Deep fried milk dumplings in sugar syrup", "base_price": 129, "food_type": FoodType.VEG, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1666190094764-f8c5ccc0f347?w=400"},
                {"name": "Rasmalai", "description": "Soft cottage cheese dumplings in saffron milk", "base_price": 149, "food_type": FoodType.VEG, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400"},
                # Beverages
                {"name": "Mango Lassi", "description": "Sweet yogurt drink with mango", "base_price": 99, "food_type": FoodType.VEG, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400"},
                {"name": "Masala Chai", "description": "Spiced Indian tea", "base_price": 49, "food_type": FoodType.VEG, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1558857563-b371033873b8?w=400"},
            ]
        },
        "Sakura Garden": {
            "categories": ["Appetizers", "Sushi Rolls", "Sashimi", "Ramen", "Main Course", "Desserts", "Beverages"],
            "items": [
                # Appetizers
                {"name": "Edamame", "description": "Steamed soybeans with sea salt", "base_price": 199, "food_type": FoodType.VEGAN, "category": "Appetizers", "image_url": "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=400"},
                {"name": "Gyoza", "description": "Pan-fried Japanese dumplings", "base_price": 299, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Appetizers", "image_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400"},
                {"name": "Tempura Prawns", "description": "Crispy battered prawns", "base_price": 449, "food_type": FoodType.NON_VEG, "category": "Appetizers", "image_url": "https://images.unsplash.com/photo-1581167723067-91ce61d9d01a?w=400"},
                # Sushi Rolls
                {"name": "California Roll", "description": "Crab, avocado, cucumber", "base_price": 399, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Sushi Rolls", "image_url": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400"},
                {"name": "Dragon Roll", "description": "Shrimp tempura, eel, avocado", "base_price": 599, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Sushi Rolls", "image_url": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400"},
                {"name": "Spicy Tuna Roll", "description": "Fresh tuna with spicy mayo", "base_price": 499, "food_type": FoodType.NON_VEG, "category": "Sushi Rolls", "image_url": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400"},
                {"name": "Vegetable Roll", "description": "Avocado, cucumber, carrot", "base_price": 299, "food_type": FoodType.VEGAN, "category": "Sushi Rolls", "image_url": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400"},
                # Sashimi
                {"name": "Salmon Sashimi", "description": "Fresh Norwegian salmon slices", "base_price": 599, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Sashimi", "image_url": "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400"},
                {"name": "Tuna Sashimi", "description": "Premium bluefin tuna", "base_price": 699, "food_type": FoodType.NON_VEG, "category": "Sashimi", "image_url": "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400"},
                # Ramen
                {"name": "Tonkotsu Ramen", "description": "Rich pork bone broth with chashu", "base_price": 449, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Ramen", "image_url": "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400"},
                {"name": "Miso Ramen", "description": "Fermented soybean broth", "base_price": 399, "food_type": FoodType.VEG, "category": "Ramen", "image_url": "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400"},
                # Main Course
                {"name": "Teriyaki Salmon", "description": "Grilled salmon with teriyaki glaze", "base_price": 699, "food_type": FoodType.NON_VEG, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400"},
                {"name": "Chicken Katsu", "description": "Breaded chicken cutlet with tonkatsu sauce", "base_price": 449, "food_type": FoodType.NON_VEG, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400"},
                # Desserts
                {"name": "Mochi Ice Cream", "description": "Japanese rice cake with ice cream", "base_price": 199, "food_type": FoodType.VEG, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400"},
                {"name": "Matcha Cheesecake", "description": "Green tea flavored cheesecake", "base_price": 249, "food_type": FoodType.VEG, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400"},
                # Beverages
                {"name": "Japanese Green Tea", "description": "Traditional matcha tea", "base_price": 99, "food_type": FoodType.VEGAN, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400"},
                {"name": "Sake", "description": "Premium Japanese rice wine", "base_price": 399, "food_type": FoodType.VEGAN, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=400"},
            ]
        },
        "La Bella Italia": {
            "categories": ["Antipasti", "Pasta", "Pizza", "Risotto", "Main Course", "Desserts", "Beverages"],
            "items": [
                # Antipasti
                {"name": "Bruschetta", "description": "Toasted bread with tomatoes, basil, olive oil", "base_price": 249, "food_type": FoodType.VEG, "category": "Antipasti", "image_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400"},
                {"name": "Caprese Salad", "description": "Fresh mozzarella, tomatoes, basil", "base_price": 299, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Antipasti", "image_url": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400"},
                {"name": "Carpaccio", "description": "Thinly sliced raw beef with arugula", "base_price": 449, "food_type": FoodType.NON_VEG, "category": "Antipasti", "image_url": "https://images.unsplash.com/photo-1535088058435-ecfa5d8dfdbd?w=400"},
                # Pasta
                {"name": "Spaghetti Carbonara", "description": "Creamy pasta with bacon and egg", "base_price": 399, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Pasta", "image_url": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400"},
                {"name": "Penne Arrabbiata", "description": "Spicy tomato sauce pasta", "base_price": 349, "food_type": FoodType.VEG, "category": "Pasta", "image_url": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400"},
                {"name": "Fettuccine Alfredo", "description": "Creamy parmesan pasta", "base_price": 379, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Pasta", "image_url": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400"},
                {"name": "Lasagna", "description": "Layered pasta with meat and cheese", "base_price": 449, "food_type": FoodType.NON_VEG, "category": "Pasta", "image_url": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400"},
                # Pizza
                {"name": "Margherita Pizza", "description": "Classic tomato, mozzarella, basil", "base_price": 399, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Pizza", "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"},
                {"name": "Pepperoni Pizza", "description": "Spicy pepperoni with mozzarella", "base_price": 499, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Pizza", "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400"},
                {"name": "Quattro Formaggi", "description": "Four cheese pizza", "base_price": 549, "food_type": FoodType.VEG, "category": "Pizza", "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"},
                {"name": "Diavola Pizza", "description": "Spicy salami with chili", "base_price": 529, "food_type": FoodType.NON_VEG, "category": "Pizza", "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400"},
                # Risotto
                {"name": "Mushroom Risotto", "description": "Creamy arborio rice with porcini", "base_price": 449, "food_type": FoodType.VEG, "category": "Risotto", "image_url": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400"},
                {"name": "Seafood Risotto", "description": "Mixed seafood in creamy rice", "base_price": 599, "food_type": FoodType.NON_VEG, "category": "Risotto", "image_url": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400"},
                # Desserts
                {"name": "Tiramisu", "description": "Classic coffee-flavored dessert", "base_price": 249, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400"},
                {"name": "Panna Cotta", "description": "Vanilla cream with berry sauce", "base_price": 199, "food_type": FoodType.VEG, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400"},
                # Beverages
                {"name": "Espresso", "description": "Italian coffee shot", "base_price": 99, "food_type": FoodType.VEGAN, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400"},
                {"name": "Limoncello", "description": "Italian lemon liqueur", "base_price": 299, "food_type": FoodType.VEGAN, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400"},
            ]
        },
        "Spice Garden": {
            "categories": ["Breakfast", "Dosas", "Idli & Vada", "Rice Dishes", "Main Course", "Desserts", "Beverages"],
            "items": [
                # Breakfast
                {"name": "Mini Tiffin", "description": "2 idli, 1 vada, sambar, chutney", "base_price": 129, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Breakfast", "image_url": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400"},
                {"name": "Pongal", "description": "Rice and lentil porridge", "base_price": 99, "food_type": FoodType.VEG, "category": "Breakfast", "image_url": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400"},
                # Dosas
                {"name": "Masala Dosa", "description": "Crispy crepe with potato filling", "base_price": 99, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Dosas", "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400"},
                {"name": "Mysore Masala Dosa", "description": "Spicy red chutney dosa", "base_price": 129, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Dosas", "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400"},
                {"name": "Rava Dosa", "description": "Semolina crispy crepe", "base_price": 119, "food_type": FoodType.VEG, "category": "Dosas", "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400"},
                {"name": "Paper Dosa", "description": "Extra thin and crispy", "base_price": 89, "food_type": FoodType.VEG, "category": "Dosas", "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400"},
                {"name": "Ghee Roast", "description": "Dosa roasted in ghee", "base_price": 139, "food_type": FoodType.VEG, "category": "Dosas", "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400"},
                # Idli & Vada
                {"name": "Idli (4 pcs)", "description": "Steamed rice cakes", "base_price": 79, "food_type": FoodType.VEG, "category": "Idli & Vada", "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400"},
                {"name": "Medu Vada (2 pcs)", "description": "Crispy lentil donuts", "base_price": 79, "food_type": FoodType.VEG, "category": "Idli & Vada", "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400"},
                # Rice Dishes
                {"name": "Curd Rice", "description": "Yogurt rice with tempering", "base_price": 99, "food_type": FoodType.VEG, "category": "Rice Dishes", "image_url": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400"},
                {"name": "Lemon Rice", "description": "Tangy rice with peanuts", "base_price": 109, "food_type": FoodType.VEG, "category": "Rice Dishes", "image_url": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400"},
                {"name": "Bisi Bele Bath", "description": "Spicy rice and lentil dish", "base_price": 139, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Rice Dishes", "image_url": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400"},
                # Main Course
                {"name": "Sambar", "description": "Lentil vegetable stew", "base_price": 99, "food_type": FoodType.VEG, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400"},
                {"name": "Rasam", "description": "Tangy tomato soup", "base_price": 79, "food_type": FoodType.VEG, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400"},
                # Desserts
                {"name": "Kesari Bath", "description": "Semolina sweet with saffron", "base_price": 89, "food_type": FoodType.VEG, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400"},
                {"name": "Payasam", "description": "Sweet rice pudding", "base_price": 99, "food_type": FoodType.VEG, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400"},
                # Beverages
                {"name": "Filter Coffee", "description": "Traditional South Indian coffee", "base_price": 49, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400"},
                {"name": "Buttermilk", "description": "Spiced yogurt drink", "base_price": 39, "food_type": FoodType.VEG, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400"},
            ]
        },
        "Dragon Palace": {
            "categories": ["Dim Sum", "Soups", "Starters", "Noodles", "Rice Dishes", "Main Course", "Desserts", "Beverages"],
            "items": [
                # Dim Sum
                {"name": "Chicken Momos", "description": "Steamed chicken dumplings", "base_price": 199, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Dim Sum", "image_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400"},
                {"name": "Veg Momos", "description": "Steamed vegetable dumplings", "base_price": 149, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Dim Sum", "image_url": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400"},
                {"name": "Har Gow", "description": "Crystal shrimp dumplings", "base_price": 299, "food_type": FoodType.NON_VEG, "category": "Dim Sum", "image_url": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400"},
                {"name": "Siu Mai", "description": "Pork and shrimp dumplings", "base_price": 249, "food_type": FoodType.NON_VEG, "category": "Dim Sum", "image_url": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400"},
                # Soups
                {"name": "Hot & Sour Soup", "description": "Tangy and spicy soup", "base_price": 149, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Soups", "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400"},
                {"name": "Manchow Soup", "description": "Spicy Indo-Chinese soup", "base_price": 149, "food_type": FoodType.VEG, "category": "Soups", "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400"},
                {"name": "Wonton Soup", "description": "Clear broth with wontons", "base_price": 179, "food_type": FoodType.NON_VEG, "category": "Soups", "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400"},
                # Starters
                {"name": "Chilli Chicken", "description": "Spicy Indo-Chinese chicken", "base_price": 299, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Starters", "image_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400"},
                {"name": "Crispy Honey Chicken", "description": "Crispy chicken in honey sauce", "base_price": 329, "food_type": FoodType.NON_VEG, "category": "Starters", "image_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400"},
                {"name": "Chilli Paneer", "description": "Cottage cheese in spicy sauce", "base_price": 249, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Starters", "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400"},
                {"name": "Spring Rolls", "description": "Crispy vegetable rolls", "base_price": 179, "food_type": FoodType.VEG, "category": "Starters", "image_url": "https://images.unsplash.com/photo-1548507200-67a8f2db7d79?w=400"},
                # Noodles
                {"name": "Hakka Noodles", "description": "Stir-fried noodles with vegetables", "base_price": 199, "food_type": FoodType.VEG, "is_bestseller": True, "category": "Noodles", "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400"},
                {"name": "Schezwan Noodles", "description": "Spicy Sichuan style noodles", "base_price": 229, "food_type": FoodType.VEG, "category": "Noodles", "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400"},
                {"name": "Chicken Chow Mein", "description": "Crispy noodles with chicken", "base_price": 279, "food_type": FoodType.NON_VEG, "category": "Noodles", "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400"},
                # Rice Dishes
                {"name": "Veg Fried Rice", "description": "Wok-tossed rice with vegetables", "base_price": 179, "food_type": FoodType.VEG, "category": "Rice Dishes", "image_url": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"},
                {"name": "Chicken Fried Rice", "description": "Fried rice with chicken", "base_price": 229, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Rice Dishes", "image_url": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"},
                {"name": "Schezwan Fried Rice", "description": "Spicy fried rice", "base_price": 209, "food_type": FoodType.VEG, "category": "Rice Dishes", "image_url": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"},
                # Main Course
                {"name": "Kung Pao Chicken", "description": "Spicy chicken with peanuts", "base_price": 349, "food_type": FoodType.NON_VEG, "is_bestseller": True, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400"},
                {"name": "Sweet & Sour Pork", "description": "Crispy pork in tangy sauce", "base_price": 379, "food_type": FoodType.NON_VEG, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400"},
                {"name": "Mapo Tofu", "description": "Spicy tofu in chili bean sauce", "base_price": 279, "food_type": FoodType.VEG, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400"},
                # Desserts
                {"name": "Date Pancakes", "description": "Crispy pancakes with date filling", "base_price": 149, "food_type": FoodType.VEG, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400"},
                {"name": "Fried Ice Cream", "description": "Ice cream with crispy coating", "base_price": 179, "food_type": FoodType.VEG, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400"},
                # Beverages
                {"name": "Chinese Tea", "description": "Traditional jasmine tea", "base_price": 79, "food_type": FoodType.VEGAN, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400"},
                {"name": "Lychee Juice", "description": "Fresh lychee drink", "base_price": 99, "food_type": FoodType.VEGAN, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400"},
            ]
        }
    }
    return menus.get(restaurant_name, {"categories": [], "items": []})


# ============== TABLE DATA ==============
def generate_tables(branch_id: str, restaurant_id: str, count: int = 15):
    """Generate tables for a branch"""
    tables = []
    table_types = [
        (TableType.TWO_SEATER, 2, 5),
        (TableType.FOUR_SEATER, 4, 5),
        (TableType.SIX_SEATER, 6, 3),
        (TableType.EIGHT_SEATER, 8, 2),
    ]
    
    table_number = 1
    for table_type, capacity, count in table_types:
        for i in range(count):
            location = random.choice([TableLocation.INDOOR, TableLocation.WINDOW, TableLocation.OUTDOOR])
            tables.append({
                "restaurant_id": restaurant_id,
                "branch_id": branch_id,
                "table_number": f"T{table_number}",
                "table_type": table_type,
                "capacity": capacity,
                "min_capacity": max(1, capacity - 2),
                "location": location,
                "floor": 0 if table_number <= 10 else 1,
                "status": TableStatus.AVAILABLE,
                "has_window_view": location == TableLocation.WINDOW,
                "is_wheelchair_accessible": table_number <= 5,
            })
            table_number += 1
    
    return tables


# ============== MAIN SEEDER ==============
async def seed_database():
    """Main function to seed the database"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.restaurant_saas
    
    # Initialize Beanie
    await init_beanie(
        database=db,
        document_models=[User, Restaurant, Branch, MenuItem, MenuCategory, Table, Order, Review]
    )
    
    print("🗑️  Clearing existing data...")
    await User.delete_all()
    await Restaurant.delete_all()
    await Branch.delete_all()
    await MenuItem.delete_all()
    await MenuCategory.delete_all()
    await Table.delete_all()
    await Order.delete_all()
    await Review.delete_all()
    
    print("👥 Creating users...")
    users = []
    for user_data in USERS_DATA:
        user = User(
            email=user_data["email"],
            phone=user_data["phone"],
            password_hash=hash_password(user_data["password"]),
            full_name=user_data["full_name"],
            role=user_data["role"],
            is_verified=user_data["is_verified"],
            is_active=True
        )
        await user.insert()
        users.append(user)
        print(f"   ✓ Created user: {user.full_name} ({user.role.value})")
    
    print("\n🍽️  Creating restaurants...")
    restaurants = []
    for rest_data in RESTAURANTS_DATA:
        admin_user = users[rest_data["admin_index"]]
        
        restaurant = Restaurant(
            name=rest_data["name"],
            slug=rest_data["slug"],
            description=rest_data["description"],
            logo_url=rest_data["logo_url"],
            cover_image_url=rest_data["cover_image_url"],
            gallery_images=rest_data["gallery_images"],
            owner_id=str(admin_user.id),
            owner_name=admin_user.full_name,
            owner_email=admin_user.email,
            owner_phone=admin_user.phone,
            cuisines=rest_data["cuisines"],
            service_types=rest_data["service_types"],
            avg_price_for_two=rest_data["avg_price_for_two"],
            avg_rating=rest_data["avg_rating"],
            total_reviews=rest_data["total_reviews"],
            status=rest_data["status"],
            is_featured=rest_data["is_featured"],
            tags=rest_data["tags"]
        )
        await restaurant.insert()
        restaurants.append(restaurant)
        
        # Update admin user with restaurant ID
        admin_user.restaurant_id = str(restaurant.id)
        await admin_user.save()
        
        print(f"   ✓ Created restaurant: {restaurant.name}")
        
        # Create branch for restaurant
        branch = Branch(
            restaurant_id=str(restaurant.id),
            name="Main Branch",
            location=Location(
                address=f"{random.randint(1, 100)} {random.choice(['MG Road', 'Connaught Place', 'Khan Market', 'Hauz Khas', 'Nehru Place'])}",
                city="New Delhi",
                state="Delhi",
                pincode=f"1100{random.randint(10, 99)}",
                country="India",
                latitude=28.6139 + random.uniform(-0.1, 0.1),
                longitude=77.2090 + random.uniform(-0.1, 0.1)
            ),
            phone=f"+91{random.randint(9000000000, 9999999999)}",
            email=f"branch@{rest_data['slug'].replace('-', '')}.com",
            working_hours=[
                WorkingHours(day="monday", open_time="11:00", close_time="23:00"),
                WorkingHours(day="tuesday", open_time="11:00", close_time="23:00"),
                WorkingHours(day="wednesday", open_time="11:00", close_time="23:00"),
                WorkingHours(day="thursday", open_time="11:00", close_time="23:00"),
                WorkingHours(day="friday", open_time="11:00", close_time="23:30"),
                WorkingHours(day="saturday", open_time="10:00", close_time="23:30"),
                WorkingHours(day="sunday", open_time="10:00", close_time="23:00"),
            ],
            total_tables=15,
            total_seating_capacity=60,
            is_active=True,
            is_accepting_orders=True,
            is_accepting_reservations=True,
            avg_dining_duration_minutes=75
        )
        await branch.insert()
        
        # Update admin with branch
        admin_user.branch_ids = [str(branch.id)]
        await admin_user.save()
        
        print(f"      ✓ Created branch: {branch.name}")
        
        # Create tables
        tables_data = generate_tables(str(branch.id), str(restaurant.id))
        for table_data in tables_data:
            table = Table(**table_data)
            await table.insert()
        print(f"      ✓ Created {len(tables_data)} tables")
        
        # Create menu categories and items
        menu_data = get_menu_data(rest_data["name"])
        category_map = {}
        
        for idx, cat_name in enumerate(menu_data["categories"]):
            category = MenuCategory(
                restaurant_id=str(restaurant.id),
                branch_id=str(branch.id),
                name=cat_name,
                description=f"Delicious {cat_name.lower()} from our kitchen",
                display_order=idx,
                is_active=True
            )
            await category.insert()
            category_map[cat_name] = str(category.id)
        
        print(f"      ✓ Created {len(menu_data['categories'])} menu categories")
        
        # Create menu items
        for item_data in menu_data["items"]:
            discount = random.choice([0, 0, 0, 10, 15, 20])  # 50% chance of no discount
            final_price = item_data["base_price"] * (1 - discount / 100)
            
            menu_item = MenuItem(
                restaurant_id=str(restaurant.id),
                branch_id=str(branch.id),
                category_id=category_map[item_data["category"]],
                name=item_data["name"],
                description=item_data["description"],
                image_url=item_data.get("image_url"),
                base_price=item_data["base_price"],
                discount_percentage=discount,
                final_price=round(final_price, 2),
                food_type=item_data["food_type"],
                spice_level=random.choice([SpiceLevel.MILD, SpiceLevel.MEDIUM, SpiceLevel.SPICY]) if item_data["food_type"] != FoodType.VEGAN else SpiceLevel.MILD,
                is_available=True,
                is_bestseller=item_data.get("is_bestseller", False),
                is_new=random.random() < 0.1,
                is_recommended=random.random() < 0.2,
                preparation_time_minutes=random.randint(10, 30)
            )
            await menu_item.insert()
        
        print(f"      ✓ Created {len(menu_data['items'])} menu items")
    
    # Create some reviews
    print("\n⭐ Creating reviews...")
    review_texts = [
        "Amazing food and great ambiance! Will definitely come back.",
        "The service was excellent. Highly recommended!",
        "Best restaurant in the city. The flavors were incredible.",
        "Good food but a bit pricey. Overall nice experience.",
        "Loved the food! The staff was very friendly.",
        "Perfect place for a family dinner. Kids loved it too!",
        "The biryani here is to die for! Authentic taste.",
        "Cozy atmosphere and delicious food. A hidden gem!",
        "Quick service and tasty food. Value for money.",
        "Excellent quality and presentation. Worth every penny.",
    ]
    
    customer_users = [u for u in users if u.role == UserRole.CUSTOMER]
    for restaurant in restaurants:
        for _ in range(random.randint(5, 10)):
            customer = random.choice(customer_users)
            review = Review(
                restaurant_id=str(restaurant.id),
                customer_id=str(customer.id),
                customer_name=customer.full_name,
                review_type=ReviewType.RESTAURANT,
                overall_rating=random.randint(4, 5),
                review_text=random.choice(review_texts),
                is_verified_purchase=True,
                is_approved=True
            )
            await review.insert()
    
    print("   ✓ Created reviews for all restaurants")
    
    print("\n" + "="*60)
    print("✅ DATABASE SEEDING COMPLETED!")
    print("="*60)
    print("\n📋 LOGIN CREDENTIALS:")
    print("-"*60)
    print("\n🔐 SUPER ADMIN:")
    print("   Email: superadmin@dineflow.com")
    print("   Password: admin123")
    print("\n👨‍💼 RESTAURANT ADMINS:")
    print("   Email: admin@goldenspice.com | Password: admin123")
    print("   Email: admin@sakura.com | Password: admin123")
    print("   Email: admin@labella.com | Password: admin123")
    print("   Email: admin@spicegarden.com | Password: admin123")
    print("   Email: admin@dragonpalace.com | Password: admin123")
    print("\n👤 CUSTOMERS:")
    print("   Email: customer@gmail.com | Password: customer123")
    print("   Email: john@gmail.com | Password: customer123")
    print("   Email: priya@gmail.com | Password: customer123")
    print("-"*60)
    print("\n🍽️  RESTAURANTS CREATED:")
    for r in restaurants:
        print(f"   • {r.name} ({r.cuisines[0].value}) - {'⭐ Featured' if r.is_featured else ''}")
    print("\n")


if __name__ == "__main__":
    asyncio.run(seed_database())
