import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  Package,
  Settings,
  ChefHat,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Timer,
  Bell,
  Grid3X3,
  Edit2,
  Trash2,
  Search,
  Eye,
  LogOut,
  Plus,
  DollarSign,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  Utensils,
  Coffee,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import { orderApi } from '@/services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

// Sidebar Navigation Items
const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'kitchen', label: 'Kitchen Display', icon: ChefHat },
  { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
  { id: 'tables', label: 'Tables', icon: Grid3X3 },
  { id: 'reservations', label: 'Reservations', icon: CalendarDays },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Order Status Colors
const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  placed: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  preparing: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  ready: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

// Mock Data for demonstration
const mockOrders: any[] = [];

const mockTables = [
  { id: 1, number: 'T1', capacity: 2, status: 'occupied', customer: 'Emily Davis' },
  { id: 2, number: 'T2', capacity: 4, status: 'available', customer: null },
  { id: 3, number: 'T3', capacity: 4, status: 'occupied', customer: 'Sarah Williams' },
  { id: 4, number: 'T4', capacity: 6, status: 'reserved', customer: 'Reservation at 7 PM' },
  { id: 5, number: 'T5', capacity: 2, status: 'occupied', customer: 'John Doe' },
  { id: 6, number: 'T6', capacity: 4, status: 'available', customer: null },
  { id: 7, number: 'T7', capacity: 2, status: 'occupied', customer: 'Chris Wilson' },
  { id: 8, number: 'T8', capacity: 8, status: 'occupied', customer: 'David Brown' },
  { id: 9, number: 'T9', capacity: 4, status: 'cleaning', customer: null },
  { id: 10, number: 'T10', capacity: 6, status: 'available', customer: null },
  { id: 11, number: 'T11', capacity: 2, status: 'reserved', customer: 'Reservation at 8 PM' },
  { id: 12, number: 'T12', capacity: 4, status: 'occupied', customer: 'Jane Smith' },
];

export default function NewAdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [orders, setOrders] = useState(mockOrders);
  const [tables, setTables] = useState(mockTables);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch restaurants for super admin and orders
  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchRestaurants();
    }
    fetchMenuItems();
    fetchOrders();
  }, [user]);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getAll();
      const ordersData = response.data.map((order: any) => ({
        id: order.id,
        customer: order.customer_name || order.user_id || 'Customer',
        items: order.items?.length || 0,
        total: order.total_amount || 0,
        status: order.status || 'placed',
        time: getTimeAgo(order.created_at),
        table: order.order_type === 'delivery' ? 'Delivery' : order.table_number || 'N/A',
        delivery_address: order.delivery_address,
        items_detail: order.items,
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API_BASE}/restaurants/`);
      setRestaurants(response.data);
      if (response.data.length > 0) {
        setSelectedRestaurant(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_BASE}/menu/items/`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      // Refresh orders from server
      await fetchOrders();
      toast.success(`Order updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.detail || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats for Dashboard
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'placed' || o.status === 'pending').length,
    preparingOrders: orders.filter(o => o.status === 'preparing').length,
    completedOrders: orders.filter(o => ['delivered', 'completed'].includes(o.status)).length,
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
    occupiedTables: tables.filter(t => t.status === 'occupied').length,
    availableTables: tables.filter(t => t.status === 'available').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/30">
              D
            </div>
            <div>
              <h2 className="text-gray-900 font-bold">DineFlow</h2>
              <p className="text-gray-400 text-xs">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === item.id
                  ? 'bg-amber-50 text-amber-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-amber-500' : ''}`} />
              <span>{item.label}</span>
              {item.id === 'orders' && stats.pendingOrders > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingOrders}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-30">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeSection === 'kitchen' ? 'Kitchen Display' : activeSection.replace('_', ' ')}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {user?.role === 'super_admin' ? 'Super Administrator' : 'Restaurant Admin'} • {user?.full_name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'super_admin' && restaurants.length > 0 && (
                <select
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeSection === 'dashboard' && (
              <DashboardSection stats={stats} orders={orders} tables={tables} />
            )}
            {activeSection === 'orders' && (
              <OrdersSection 
                orders={filteredOrders}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                updateOrderStatus={updateOrderStatus}
              />
            )}
            {activeSection === 'kitchen' && (
              <KitchenSection orders={orders} updateOrderStatus={updateOrderStatus} />
            )}
            {activeSection === 'menu' && (
              <MenuSection menuItems={menuItems} />
            )}
            {activeSection === 'tables' && (
              <TablesSection tables={tables} setTables={setTables} />
            )}
            {activeSection === 'reservations' && (
              <ReservationsSection />
            )}
            {activeSection === 'customers' && (
              <CustomersSection />
            )}
            {activeSection === 'analytics' && (
              <AnalyticsSection />
            )}
            {activeSection === 'settings' && (
              <SettingsSection />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Dashboard Overview Section
function DashboardSection({ stats, orders, tables }: { stats: any; orders: any[]; tables: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          trend="+12%"
          trendUp={true}
          color="amber"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          trend={stats.pendingOrders > 0 ? 'Action needed' : 'All clear'}
          trendUp={stats.pendingOrders === 0}
          color="yellow"
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="+8%"
          trendUp={true}
          color="green"
        />
        <StatCard
          title="Tables Occupied"
          value={`${stats.occupiedTables}/${tables.length}`}
          icon={Grid3X3}
          trend={`${stats.availableTables} available`}
          trendUp={true}
          color="blue"
        />
      </div>

      {/* Recent Orders & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <button className="text-amber-600 text-sm font-medium hover:text-amber-700">
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.customer} • {order.items} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{order.total}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColors[order.status]?.dot}`} />
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Table Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-4 gap-3">
              {tables.slice(0, 12).map((table) => (
                <div
                  key={table.id}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all cursor-pointer hover:scale-105 ${
                    table.status === 'available' ? 'bg-green-100 text-green-700' :
                    table.status === 'occupied' ? 'bg-amber-100 text-amber-700' :
                    table.status === 'reserved' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span className="font-bold">{table.number}</span>
                  <span className="text-[10px] opacity-75">{table.capacity}p</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100" /> Occupied</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100" /> Reserved</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  const colors: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {trendUp ? (
          <ArrowUp className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>{trend}</span>
      </div>
    </div>
  );
}

// Orders Section
function OrdersSection({ orders, searchQuery, setSearchQuery, statusFilter, setStatusFilter, updateOrderStatus }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'placed', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'placed' ? 'New' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Order ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Table</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Items</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Total</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Time</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono font-medium text-gray-900">{order.id}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">{order.table}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">{order.items}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">₹{order.total}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColors[order.status]?.dot}`} />
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">{order.time}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {(order.status === 'placed' || order.status === 'pending') && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        Confirm
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
                      >
                        Start Prep
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600"
                      >
                        Delivered
                      </button>
                    )}
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// Kitchen Display Section
function KitchenSection({ orders, updateOrderStatus }: { orders: any[]; updateOrderStatus: any }) {
  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Orders */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-orange-500" />
            In Progress ({activeOrders.length})
          </h3>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{order.id}</h4>
                    <p className="text-gray-500">{order.table} • {order.customer}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Utensils className="w-4 h-4" />
                    <span>{order.items} items</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{order.time}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(order.status === 'placed' || order.status === 'pending') && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
                    >
                      Accept Order
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
                    >
                      Start Cooking
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
            {activeOrders.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Ready Orders */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Ready for Pickup ({readyOrders.length})
          </h3>
          <div className="space-y-4">
            {readyOrders.map((order) => (
              <div key={order.id} className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-green-800">{order.id}</h4>
                    <p className="text-green-600">{order.table} • {order.customer}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800">
                    READY
                  </span>
                </div>
                <button
                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                  className="w-full py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                >
                  Mark as Delivered
                </button>
              </div>
            ))}
            {readyOrders.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders ready</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Menu Management Section
function MenuSection({ menuItems }: { menuItems: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = menuItems.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600">
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-40">
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.food_type === 'veg' ? 'bg-green-100 text-green-700' :
                  item.food_type === 'non_veg' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.food_type?.toUpperCase() || 'VEG'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-gray-900">{item.name}</h4>
                <span className={`px-2 py-0.5 rounded text-xs ${item.is_available !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.is_available !== false ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-amber-600">₹{item.final_price || item.base_price}</span>
                  {item.discount_percentage > 0 && (
                    <span className="text-sm text-gray-400 line-through ml-2">₹{item.base_price}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No menu items found</p>
        </div>
      )}
    </motion.div>
  );
}

// Tables Management Section
function TablesSection({ tables, setTables }: { tables: any[]; setTables: any }) {
  const updateTableStatus = (tableId: number, newStatus: string) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
    toast.success(`Table status updated`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Available', count: tables.filter(t => t.status === 'available').length, color: 'green' },
          { label: 'Occupied', count: tables.filter(t => t.status === 'occupied').length, color: 'amber' },
          { label: 'Reserved', count: tables.filter(t => t.status === 'reserved').length, color: 'blue' },
          { label: 'Cleaning', count: tables.filter(t => t.status === 'cleaning').length, color: 'gray' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Table Grid */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6">Floor Plan</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              onClick={() => {
                const nextStatus = table.status === 'available' ? 'occupied' : 
                                   table.status === 'occupied' ? 'cleaning' :
                                   table.status === 'cleaning' ? 'available' : table.status;
                if (table.status !== 'reserved') {
                  updateTableStatus(table.id, nextStatus);
                }
              }}
              className={`aspect-square rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                table.status === 'available' ? 'bg-green-100 hover:bg-green-200' :
                table.status === 'occupied' ? 'bg-amber-100 hover:bg-amber-200' :
                table.status === 'reserved' ? 'bg-blue-100 hover:bg-blue-200' :
                'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className={`text-xl font-bold ${
                table.status === 'available' ? 'text-green-700' :
                table.status === 'occupied' ? 'text-amber-700' :
                table.status === 'reserved' ? 'text-blue-700' :
                'text-gray-500'
              }`}>{table.number}</span>
              <span className="text-xs mt-1 opacity-70">{table.capacity} seats</span>
              <span className="text-xs mt-1 capitalize">{table.status}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-6">
          <span className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded bg-green-100" /> Available
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded bg-amber-100" /> Occupied
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded bg-blue-100" /> Reserved
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded bg-gray-100" /> Cleaning
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Reservations Section
function ReservationsSection() {
  const reservations = [
    { id: 1, customer: 'John Doe', phone: '+91 98765 43210', date: 'Today', time: '7:00 PM', guests: 4, table: 'T4', status: 'confirmed' },
    { id: 2, customer: 'Jane Smith', phone: '+91 98765 43211', date: 'Today', time: '8:00 PM', guests: 2, table: 'T11', status: 'pending' },
    { id: 3, customer: 'Mike Johnson', phone: '+91 98765 43212', date: 'Tomorrow', time: '1:00 PM', guests: 6, table: 'T8', status: 'confirmed' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Upcoming Reservations</h3>
          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600">
            Add Reservation
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date & Time</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Guests</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Table</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reservations.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{res.customer}</p>
                    <p className="text-sm text-gray-500">{res.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-900">{res.date}</p>
                    <p className="text-sm text-gray-500">{res.time}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">{res.guests} guests</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded">{res.table}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    res.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {res.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600">
                      Confirm
                    </button>
                    <button className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200">
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// Customers Section
function CustomersSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-2xl p-12 text-center border border-gray-100"
    >
      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Management</h3>
      <p className="text-gray-500">View and manage customer information</p>
    </motion.div>
  );
}

// Analytics Section
function AnalyticsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-2xl p-12 text-center border border-gray-100"
    >
      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
      <p className="text-gray-500">View detailed analytics and reports</p>
    </motion.div>
  );
}

// Settings Section
function SettingsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-2xl p-12 text-center border border-gray-100"
    >
      <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Settings</h3>
      <p className="text-gray-500">Configure restaurant settings</p>
    </motion.div>
  );
}
