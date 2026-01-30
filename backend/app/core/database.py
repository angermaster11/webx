from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.restaurant import Restaurant, Branch
from app.models.menu import MenuItem, MenuCategory
from app.models.table import Table, TableReservation
from app.models.order import Order, OrderItem
from app.models.review import Review
from app.models.notification import Notification


class Database:
    client: AsyncIOMotorClient = None
    

db = Database()


async def connect_to_mongo():
    """Connect to MongoDB and initialize Beanie ODM"""
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    
    await init_beanie(
        database=db.client[settings.DATABASE_NAME],
        document_models=[
            User,
            Restaurant,
            Branch,
            MenuItem,
            MenuCategory,
            Table,
            TableReservation,
            Order,
            OrderItem,
            Review,
            Notification
        ]
    )
    print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("❌ MongoDB connection closed")


def get_database():
    return db.client[settings.DATABASE_NAME]
