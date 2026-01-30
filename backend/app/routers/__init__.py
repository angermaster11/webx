# Routers Package
from app.routers.auth import router as auth_router
from app.routers.restaurants import router as restaurants_router
from app.routers.menu import router as menu_router
from app.routers.tables import router as tables_router
from app.routers.orders import router as orders_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "restaurants_router",
    "menu_router",
    "tables_router",
    "orders_router",
    "admin_router"
]
