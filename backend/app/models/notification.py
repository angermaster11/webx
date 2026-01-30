from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    ORDER_PLACED = "order_placed"
    ORDER_CONFIRMED = "order_confirmed"
    ORDER_PREPARING = "order_preparing"
    ORDER_READY = "order_ready"
    ORDER_DELIVERED = "order_delivered"
    ORDER_CANCELLED = "order_cancelled"
    RESERVATION_CONFIRMED = "reservation_confirmed"
    RESERVATION_REMINDER = "reservation_reminder"
    RESERVATION_CANCELLED = "reservation_cancelled"
    TABLE_READY = "table_ready"
    REVIEW_REQUEST = "review_request"
    PROMOTION = "promotion"
    SYSTEM = "system"


class NotificationChannel(str, Enum):
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class Notification(Document):
    user_id: Indexed(str)
    
    # Type and content
    notification_type: NotificationType
    title: str
    message: str
    
    # Related entities
    restaurant_id: Optional[str] = None
    order_id: Optional[str] = None
    reservation_id: Optional[str] = None
    
    # Channels sent
    channels: list[NotificationChannel] = [NotificationChannel.IN_APP]
    
    # Status
    is_read: bool = False
    read_at: Optional[datetime] = None
    
    # Action
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    
    # Metadata
    image_url: Optional[str] = None
    data: Optional[dict] = None  # Additional data
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    
    class Settings:
        name = "notifications"
        indexes = [
            "user_id",
            "notification_type",
            "is_read",
            "created_at"
        ]


# Pydantic Schemas
class NotificationCreate(BaseModel):
    user_id: str
    notification_type: NotificationType
    title: str
    message: str
    restaurant_id: Optional[str] = None
    order_id: Optional[str] = None
    reservation_id: Optional[str] = None
    channels: list[NotificationChannel] = [NotificationChannel.IN_APP]
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    image_url: Optional[str] = None
    data: Optional[dict] = None


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    notification_type: NotificationType
    title: str
    message: str
    restaurant_id: Optional[str]
    order_id: Optional[str]
    reservation_id: Optional[str]
    is_read: bool
    read_at: Optional[datetime]
    action_url: Optional[str]
    action_text: Optional[str]
    image_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
