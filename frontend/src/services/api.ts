import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = 'http://localhost:8001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    console.log(`🔹 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('   Token present:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data) {
      console.log('   Request Body:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
    console.error('   Error Details:', error.response?.data);
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('⚠️ 401 Unauthorized - Logging out user');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    phone: string;
    password: string;
    full_name: string;
  }) => api.post('/auth/register/', data),
  
  login: (data: { email_or_phone: string; password: string }) =>
    api.post('/auth/login/', data),
  
  requestOtp: (phone: string) =>
    api.post('/auth/request-otp/', { phone }),
  
  verifyOtp: (phone: string, otp: string) =>
    api.post('/auth/verify-otp/', { phone, otp }),
  
  getProfile: () => api.get('/auth/me/'),
  
  updateProfile: (data: { full_name?: string; avatar_url?: string }) =>
    api.put('/auth/me/', data),
};

// Restaurant API
export const restaurantApi = {
  list: (params?: {
    search?: string;
    cuisines?: string[];
    min_rating?: number;
    max_price?: number;
    is_featured?: boolean;
    skip?: number;
    limit?: number;
  }) => api.get('/restaurants/', { params }),
  
  discover: (params?: {
    search?: string;
    cuisine?: string;
    price_range?: string;
    is_veg?: boolean;
    is_open?: boolean;
    skip?: number;
    limit?: number;
  }) => api.get('/restaurants/', { params }),
  
  getFeatured: () => api.get('/restaurants/', { params: { is_featured: true } }),
  
  getById: (id: string) => api.get(`/restaurants/${id}`),
  
  getBySlug: (slug: string) => api.get(`/restaurants/${slug}`),
  
  getBranches: (restaurantId: string) =>
    api.get(`/restaurants/${restaurantId}/branches`),
  
  create: (data: any) => api.post('/restaurants/', data),
  
  update: (restaurantId: string, data: any) =>
    api.put(`/restaurants/${restaurantId}`, data),
};

// Menu API
export const menuApi = {
  getCategories: (restaurantId: string, branchId?: string) =>
    api.get(`/menu/restaurant/${restaurantId}/categories`, {
      params: { branch_id: branchId },
    }),
  
  getByRestaurant: (restaurantId: string, params?: {
    category?: string;
    is_veg?: boolean;
  }) => api.get(`/menu/restaurant/${restaurantId}/items`, { params }),
  
  getItems: (restaurantId: string, params?: {
    branch_id?: string;
    category_id?: string;
    food_type?: string;
    is_bestseller?: boolean;
    search?: string;
  }) => api.get(`/menu/restaurant/${restaurantId}/items`, { params }),
  
  getItem: (itemId: string) => api.get(`/menu/items/${itemId}`),
  
  createCategory: (restaurantId: string, data: any) =>
    api.post('/menu/categories/', data, { params: { restaurant_id: restaurantId } }),
  
  createItem: (restaurantId: string, data: any) =>
    api.post('/menu/items/', data, { params: { restaurant_id: restaurantId } }),
  
  updateItem: (itemId: string, data: any) =>
    api.put(`/menu/items/${itemId}`, data),
  
  toggleAvailability: (itemId: string, isAvailable: boolean) =>
    api.patch(`/menu/items/${itemId}/availability`, null, {
      params: { is_available: isAvailable },
    }),
};

// Table API
export const tableApi = {
  getAvailability: (branchId: string, date: string, guestCount: number) =>
    api.get(`/tables/availability/${branchId}`, {
      params: { date, guest_count: guestCount },
    }),
  
  checkAvailability: (restaurantId: string, params: {
    date: string;
    time: string;
    guests: number;
    duration_hours?: number;
  }) => api.post(`/tables/smart-allocation/${restaurantId}`, params),
  
  createReservation: (data: {
    restaurant_id?: string;
    branch_id: string;
    table_id?: string;
    reservation_date: string;
    reservation_time: string;
    guest_count: number;
    duration_minutes?: number;
    guest_name?: string;
    guest_phone?: string;
    guest_email?: string;
    special_requests?: string;
    occasion?: string;
  }) => api.post('/tables/reserve', data),
  
  getMyReservations: () => api.get('/tables/my-reservations/'),
  
  cancelReservation: (reservationId: string, reason?: string) =>
    api.delete(`/tables/reservations/${reservationId}`, {
      params: { reason },
    }),
  
  // Admin
  getAllReservations: (params?: { date?: string; status?: string }) =>
    api.get('/tables/reservations', { params }),
  
  getBranchTables: (branchId: string) =>
    api.get(`/tables/branch/${branchId}`),
  
  createTable: (restaurantId: string, branchId: string, data: any) =>
    api.post('/tables/', data, {
      params: { restaurant_id: restaurantId, branch_id: branchId },
    }),
  
  updateTableStatus: (tableId: string, status: string) =>
    api.patch(`/tables/${tableId}/status`, { status }),
  
  updateReservationStatus: (reservationId: string, status: string) =>
    api.patch(`/tables/reservations/${reservationId}/status`, null, {
      params: { new_status: status },
    }),
  
  getBranchReservations: (branchId: string, date?: string) =>
    api.get(`/tables/branch/${branchId}/reservations`, {
      params: { date },
    }),
  
  getBranchOccupancy: (branchId: string) =>
    api.get(`/tables/branch/${branchId}/occupancy`),
};

// Order API
export const orderApi = {
  create: (data: {
    restaurant_id: string;
    items: Array<{
      menu_item_id: string;
      quantity: number;
      special_instructions?: string;
      unit_price: number;
    }>;
    delivery_address?: string;
    payment_method?: string;
    subtotal: number;
    delivery_fee?: number;
    taxes?: number;
    total_amount: number;
  }) => api.post('/orders/', data),
  
  getMyOrders: (status?: string) =>
    api.get('/orders/my-orders/', { params: { status } }),
  
  getById: (orderId: string) => api.get(`/orders/${orderId}`),
  
  getOrder: (orderId: string) => api.get(`/orders/${orderId}`),
  
  getOrderItems: (orderId: string) => api.get(`/orders/${orderId}/items`),
  
  trackOrder: (orderId: string) => api.get(`/orders/${orderId}/track`),
  
  // Admin
  getAll: (params?: {
    status?: string;
    order_type?: string;
    date?: string;
  }) => api.get('/orders/', { params }),
  
  getBranchOrders: (branchId: string, params?: {
    status?: string;
    order_type?: string;
    date?: string;
  }) => api.get(`/orders/branch/${branchId}/orders`, { params }),
  
  getKitchenOrders: (branchId: string) =>
    api.get(`/orders/branch/${branchId}/kitchen`),
  
  updateOrderStatus: (orderId: string, status: string, notes?: string) =>
    api.patch(`/orders/${orderId}/status`, { status, notes }),
  
  updateStatus: (orderId: string, status: string) =>
    api.patch(`/orders/${orderId}/status`, { status }),
  
  updatePayment: (orderId: string, data: {
    payment_status: string;
    payment_method: string;
    payment_id?: string;
  }) => api.patch(`/orders/${orderId}/payment`, data),
  
  getBranchStats: (branchId: string) =>
    api.get(`/orders/branch/${branchId}/stats`),
};

// Admin API
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  getRestaurants: (params?: {
    status?: string;
    search?: string;
  }) => api.get('/admin/restaurants', { params }),
  
  getUsers: (params?: {
    role?: string;
    is_active?: boolean;
    search?: string;
  }) => api.get('/admin/users', { params }),
  
  listUsers: (params?: {
    role?: string;
    is_active?: boolean;
    search?: string;
  }) => api.get('/admin/users', { params }),
  
  updateUserRole: (userId: string, role: string, restaurantId?: string) =>
    api.patch(`/admin/users/${userId}/role`, null, {
      params: { new_role: role, restaurant_id: restaurantId },
    }),
  
  toggleUserStatus: (userId: string, isActive: boolean) =>
    api.patch(`/admin/users/${userId}/status`, null, {
      params: { is_active: isActive },
    }),
  
  listRestaurants: (params?: {
    status?: string;
    search?: string;
  }) => api.get('/admin/restaurants', { params }),
  
  updateCommission: (restaurantId: string, percentage: number) =>
    api.patch(`/admin/restaurants/${restaurantId}/commission`, null, {
      params: { commission_percentage: percentage },
    }),
  
  toggleFeatured: (restaurantId: string, isFeatured: boolean) =>
    api.patch(`/admin/restaurants/${restaurantId}/featured`, null, {
      params: { is_featured: isFeatured },
    }),
  
  getOrderAnalytics: (days?: number) =>
    api.get('/admin/analytics/orders', { params: { days } }),
  
  getPeakHours: (days?: number) =>
    api.get('/admin/analytics/peak-hours', { params: { days } }),
};

export default api;
