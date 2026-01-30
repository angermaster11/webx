// User Types
export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  avatar_url?: string;
  role: 'customer' | 'restaurant_admin' | 'super_admin';
  is_active: boolean;
  is_verified: boolean;
  restaurant_id?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  cover_image_url?: string;
  gallery_images: string[];
  cuisines: CuisineType[];
  service_types: ServiceType[];
  avg_price_for_two: number;
  avg_rating: number;
  total_reviews: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  is_featured: boolean;
  tags: string[];
  created_at: string;
}

export interface Branch {
  id: string;
  restaurant_id: string;
  name: string;
  location: Location;
  phone: string;
  email?: string;
  working_hours: WorkingHours[];
  total_tables: number;
  total_seating_capacity: number;
  is_active: boolean;
  is_accepting_orders: boolean;
  is_accepting_reservations: boolean;
  avg_dining_duration_minutes: number;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WorkingHours {
  day: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export type CuisineType = 
  | 'indian' | 'chinese' | 'italian' | 'mexican' 
  | 'japanese' | 'thai' | 'continental' | 'fast_food' 
  | 'cafe' | 'multi_cuisine';

export type ServiceType = 'dine_in' | 'takeaway' | 'delivery';

// Menu Types
export interface MenuCategory {
  id: string;
  restaurant_id: string;
  branch_id?: string;
  name: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  branch_id?: string;
  category_id: string;
  name: string;
  description: string;
  image_url?: string;
  base_price: number;
  discount_percentage: number;
  final_price: number;
  food_type: 'veg' | 'non_veg' | 'egg' | 'vegan';
  spice_level?: 'mild' | 'medium' | 'spicy' | 'extra_spicy';
  variants: Variant[];
  addons: Addon[];
  customization_options: string[];
  is_available: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_recommended: boolean;
  is_daily_special: boolean;
  preparation_time_minutes: number;
  tags: string[];
  avg_rating: number;
}

export interface Variant {
  name: string;
  price: number;
  is_available: boolean;
}

export interface Addon {
  name: string;
  price: number;
  is_available: boolean;
}

// Table Types
export interface Table {
  id: string;
  restaurant_id: string;
  branch_id: string;
  table_number: string;
  table_type: TableType;
  capacity: number;
  min_capacity: number;
  location: TableLocation;
  floor: number;
  status: TableStatus;
  current_reservation_id?: string;
  current_order_id?: string;
  occupied_at?: string;
  expected_free_at?: string;
  is_active: boolean;
  extra_charge: number;
}

export type TableType = '2_seater' | '4_seater' | '6_seater' | '8_seater' | '10_seater' | 'private_room' | 'outdoor' | 'bar';
export type TableLocation = 'indoor' | 'outdoor' | 'terrace' | 'private' | 'bar_area' | 'window';
export type TableStatus = 'available' | 'reserved' | 'occupied' | 'cleaning' | 'blocked';

export interface Reservation {
  id: string;
  restaurant_id: string;
  branch_id: string;
  table_id?: string;
  customer_id: string;
  reservation_date: string;
  reservation_time: string;
  end_time: string;
  guest_count: number;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  special_requests?: string;
  occasion?: string;
  status: ReservationStatus;
  allocated_capacity?: number;
  allocation_efficiency?: number;
  created_at: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

// Order Types
export interface Order {
  id: string;
  restaurant_id: string;
  branch_id: string;
  customer_id: string;
  order_number: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_id?: string;
  reservation_id?: string;
  delivery_address?: DeliveryAddress;
  status: OrderStatus;
  placed_at: string;
  confirmed_at?: string;
  ready_at?: string;
  estimated_preparation_time: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  delivery_charge: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  customer_name: string;
  customer_phone: string;
  special_instructions?: string;
  rating?: number;
  feedback?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  item_image_url?: string;
  base_price: number;
  variant_name?: string;
  variant_price: number;
  quantity: number;
  customizations: { name: string; price_modifier: number }[];
  addons: { addon_name: string; price: number; quantity: number }[];
  special_instructions?: string;
  unit_price: number;
  total_price: number;
  kitchen_status: string;
}

export interface DeliveryAddress {
  full_address: string;
  landmark?: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contact_phone: string;
}

export type OrderStatus = 
  | 'placed' | 'confirmed' | 'preparing' | 'ready' 
  | 'out_for_delivery' | 'served' | 'delivered' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet' | 'net_banking';

// Cart Types
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedVariant?: Variant;
  selectedAddons: Addon[];
  customizations: string[];
  specialInstructions?: string;
}

export interface Cart {
  restaurantId: string;
  branchId: string;
  items: CartItem[];
}

// Review Types
export interface Review {
  id: string;
  restaurant_id: string;
  customer_id: string;
  overall_rating: number;
  category_ratings: { category: string; rating: number }[];
  title?: string;
  review_text?: string;
  images: string[];
  customer_name: string;
  customer_avatar?: string;
  is_verified_purchase: boolean;
  restaurant_response?: string;
  helpful_count: number;
  created_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
