from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum


class OrderType(str, Enum):
    DINE_IN = "dine_in"
    TAKEAWAY = "takeaway"
    DELIVERY = "delivery"


class OrderStatus(str, Enum):
    PLACED = "placed"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    OUT_FOR_DELIVERY = "out_for_delivery"
    SERVED = "served"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    UPI = "upi"
    WALLET = "wallet"
    NET_BANKING = "net_banking"


class OrderItemCustomization(BaseModel):
    """Customization applied to an order item"""
    name: str
    price_modifier: float = 0.0


class OrderItemAddon(BaseModel):
    """Addon applied to an order item"""
    addon_name: str
    price: float
    quantity: int = 1


class OrderItem(Document):
    order_id: Indexed(str)
    menu_item_id: str
    
    # Item details (denormalized for history)
    item_name: str
    item_image_url: Optional[str] = None
    base_price: float
    
    # Variant
    variant_name: Optional[str] = None
    variant_price: float = 0.0
    
    # Quantity
    quantity: int = 1
    
    # Customizations & Addons
    customizations: List[OrderItemCustomization] = []
    addons: List[OrderItemAddon] = []
    
    # Special instructions
    special_instructions: Optional[str] = None
    
    # Calculated prices
    unit_price: float = 0.0  # base + variant + addons
    total_price: float = 0.0  # unit_price * quantity
    
    # Kitchen status
    kitchen_status: str = "pending"  # pending, preparing, ready
    started_at: Optional[datetime] = None
    ready_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "order_items"
        indexes = [
            "order_id",
            "menu_item_id"
        ]
    
    def calculate_prices(self):
        """Calculate unit and total prices"""
        addon_total = sum(a.price * a.quantity for a in self.addons)
        customization_total = sum(c.price_modifier for c in self.customizations)
        self.unit_price = self.base_price + self.variant_price + addon_total + customization_total
        self.total_price = self.unit_price * self.quantity


class DeliveryAddress(BaseModel):
    """Delivery address for delivery orders"""
    full_address: str
    landmark: Optional[str] = None
    city: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_phone: str


class Order(Document):
    # Reference IDs
    restaurant_id: Indexed(str)
    branch_id: Indexed(str)
    customer_id: Indexed(str)
    
    # Order number (human readable)
    order_number: Indexed(str, unique=True)
    
    # Type
    order_type: OrderType
    
    # For dine-in
    table_id: Optional[str] = None
    reservation_id: Optional[str] = None
    
    # For delivery
    delivery_address: Optional[DeliveryAddress] = None
    delivery_partner_id: Optional[str] = None
    delivery_instructions: Optional[str] = None
    
    # Status
    status: OrderStatus = OrderStatus.PLACED
    
    # Timing
    placed_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: Optional[datetime] = None
    preparing_started_at: Optional[datetime] = None
    ready_at: Optional[datetime] = None
    served_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    
    # ETA
    estimated_preparation_time: int = 30  # minutes
    estimated_delivery_time: Optional[int] = None  # minutes
    
    # Pricing
    subtotal: float = 0.0
    discount_amount: float = 0.0
    discount_code: Optional[str] = None
    tax_amount: float = 0.0
    tax_percentage: float = 5.0
    delivery_charge: float = 0.0
    packing_charge: float = 0.0
    service_charge: float = 0.0
    total_amount: float = 0.0
    
    # Payment
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    payment_id: Optional[str] = None  # Transaction ID
    paid_at: Optional[datetime] = None
    
    # Customer info (denormalized)
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    
    # Special instructions
    special_instructions: Optional[str] = None
    
    # Feedback
    rating: Optional[float] = None
    feedback: Optional[str] = None
    
    # Cancellation
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[str] = None  # customer, restaurant, system
    
    # Metadata
    source: str = "web"  # web, mobile, pos
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "orders"
        indexes = [
            "restaurant_id",
            "branch_id",
            "customer_id",
            "order_number",
            "status",
            "placed_at",
            "table_id"
        ]


# ============================================
# PYDANTIC SCHEMAS
# ============================================

class OrderItemCreate(BaseModel):
    menu_item_id: str
    quantity: int = 1
    variant_name: Optional[str] = None
    customizations: List[OrderItemCustomization] = []
    addons: List[OrderItemAddon] = []
    special_instructions: Optional[str] = None


class OrderCreate(BaseModel):
    restaurant_id: Optional[str] = None
    branch_id: Optional[str] = None
    order_type: OrderType = OrderType.DELIVERY
    items: List[OrderItemCreate]
    
    # For dine-in
    table_id: Optional[str] = None
    reservation_id: Optional[str] = None
    
    # For delivery - accepts string or DeliveryAddress object
    delivery_address: Optional[Union[str, DeliveryAddress]] = None
    delivery_instructions: Optional[str] = None
    
    # Payment
    payment_method: Optional[PaymentMethod] = None
    
    # Discount
    discount_code: Optional[str] = None
    
    # Special instructions
    special_instructions: Optional[str] = None
    
    # Direct fields for simple orders
    subtotal: Optional[float] = None
    delivery_fee: Optional[float] = None
    taxes: Optional[float] = None
    total_amount: Optional[float] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    notes: Optional[str] = None


class OrderPaymentUpdate(BaseModel):
    payment_status: PaymentStatus
    payment_method: PaymentMethod
    payment_id: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    menu_item_id: str
    item_name: str
    item_image_url: Optional[str]
    base_price: float
    variant_name: Optional[str]
    variant_price: float
    quantity: int
    customizations: List[OrderItemCustomization]
    addons: List[OrderItemAddon]
    special_instructions: Optional[str]
    unit_price: float
    total_price: float
    kitchen_status: str
    
    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    restaurant_id: str
    branch_id: str
    customer_id: str
    order_number: str
    order_type: OrderType
    table_id: Optional[str]
    reservation_id: Optional[str]
    delivery_address: Optional[DeliveryAddress]
    status: OrderStatus
    placed_at: datetime
    confirmed_at: Optional[datetime]
    ready_at: Optional[datetime]
    estimated_preparation_time: int
    subtotal: float
    discount_amount: float
    tax_amount: float
    delivery_charge: float
    total_amount: float
    payment_status: PaymentStatus
    payment_method: Optional[PaymentMethod]
    customer_name: str
    customer_phone: str
    special_instructions: Optional[str]
    rating: Optional[float]
    feedback: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class KitchenOrderView(BaseModel):
    """Simplified view for Kitchen Display System"""
    order_id: str
    order_number: str
    order_type: OrderType
    table_number: Optional[str]
    customer_name: str
    items: List[dict]
    status: OrderStatus
    placed_at: datetime
    elapsed_minutes: int
    priority: int  # 1 = highest
    special_instructions: Optional[str]
