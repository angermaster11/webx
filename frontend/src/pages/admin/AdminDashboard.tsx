import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  Package,
  Settings,
  Plus,
  ChefHat,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  Bell,
  Grid3X3,
  Edit2,
  Trash2,
  Search,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { orderApi, menuApi, tableApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'kds', label: 'Kitchen Display', icon: ChefHat },
  { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
  { id: 'tables', label: 'Table Management', icon: Grid3X3 },
  { id: 'reservations', label: 'Reservations', icon: CalendarDays },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-dark-card border-r border-dark-border z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-luxury-gold to-primary-500 flex items-center justify-center text-dark-bg font-bold">
              D
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-white font-semibold">DineFlow</h2>
                <p className="text-white/40 text-xs">Restaurant Admin</p>
              </div>
            )}
          </div>
        </div>

        <nav className="p-2 space-y-1 mt-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeSection === item.id
                  ? 'bg-luxury-gold/20 text-luxury-gold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-white capitalize">
                {activeSection.replace('_', ' ')}
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Welcome back, {user?.full_name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-white/60 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxury-gold to-primary-500 flex items-center justify-center text-dark-bg font-bold">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'orders' && <OrdersSection />}
          {activeSection === 'kds' && <KitchenDisplaySection />}
          {activeSection === 'menu' && <MenuManagementSection />}
          {activeSection === 'tables' && <TableManagementSection />}
          {activeSection === 'reservations' && <ReservationsSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}

function DashboardSection() {
  const stats = [
    {
      label: 'Today\'s Orders',
      value: '45',
      change: '+12%',
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Revenue',
      value: '₹32,450',
      change: '+8%',
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: 'Active Tables',
      value: '12/18',
      change: '67%',
      icon: Grid3X3,
      color: 'text-luxury-gold',
      bg: 'bg-luxury-gold/10',
    },
    {
      label: 'Pending Orders',
      value: '8',
      change: '-3',
      icon: Clock,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
  ];

  const recentOrders = [
    { id: '001', table: 'T-5', items: 4, total: 1240, status: 'preparing', time: '5 min ago' },
    { id: '002', table: 'T-3', items: 2, total: 560, status: 'ready', time: '10 min ago' },
    { id: '003', table: 'T-8', items: 6, total: 2100, status: 'served', time: '15 min ago' },
    { id: '004', table: 'T-1', items: 3, total: 890, status: 'pending', time: '20 min ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-luxury p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-400' : 'text-white/40'}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card-luxury p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <button className="text-luxury-gold text-sm hover:text-primary-400">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-white/40 text-sm border-b border-dark-border">
                  <th className="text-left py-3 px-2">Order ID</th>
                  <th className="text-left py-3 px-2">Table</th>
                  <th className="text-left py-3 px-2">Items</th>
                  <th className="text-left py-3 px-2">Total</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-dark-border/50">
                    <td className="py-3 px-2 text-white">#{order.id}</td>
                    <td className="py-3 px-2 text-white/70">{order.table}</td>
                    <td className="py-3 px-2 text-white/70">{order.items}</td>
                    <td className="py-3 px-2 text-luxury-gold">₹{order.total}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          order.status === 'ready'
                            ? 'bg-green-500/20 text-green-400'
                            : order.status === 'preparing'
                            ? 'bg-orange-500/20 text-orange-400'
                            : order.status === 'served'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-white/40 text-sm">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-luxury p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 bg-dark-bg rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">
              <Plus className="w-5 h-5 text-luxury-gold" />
              <span>Add New Menu Item</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-dark-bg rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">
              <CalendarDays className="w-5 h-5 text-luxury-gold" />
              <span>View Reservations</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-dark-bg rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">
              <ChefHat className="w-5 h-5 text-luxury-gold" />
              <span>Kitchen Display</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-dark-bg rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">
              <Users className="w-5 h-5 text-luxury-gold" />
              <span>Manage Staff</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersSection() {
  const [filter, setFilter] = useState('all');

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['adminOrders', filter],
    queryFn: async () => {
      console.log('='.repeat(50));
      console.log('📦 FETCHING ADMIN ORDERS');
      console.log('='.repeat(50));
      console.log('Filter:', filter);
      
      try {
        const response = await orderApi.getAll({ status: filter === 'all' ? undefined : filter });
        console.log('✅ Orders Response:', response.data);
        console.log('Orders Count:', response.data?.length || 0);
        return response.data;
      } catch (err: any) {
        console.error('❌ Orders Fetch Error:', err);
        console.error('Error Response:', err.response?.data);
        console.error('Error Status:', err.response?.status);
        throw err;
      }
    },
  });

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      orderApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order status updated');
    },
  });

  if (error) {
    console.error('❌ Orders Query Error:', error);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const ordersList = orders || [];
  console.log('📋 Rendering orders list:', ordersList.length, 'orders');

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-luxury-gold text-dark-bg'
                : 'bg-dark-card text-white/60 hover:text-white border border-dark-border'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ordersList.map((order: any) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-luxury p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-medium">
                  Order #{order.order_number || order.id?.slice(-6)}
                </h4>
                <p className="text-white/40 text-sm">
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  order.status === 'ready'
                    ? 'bg-green-500/20 text-green-400'
                    : order.status === 'preparing'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {order.status?.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {(order.items || []).slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{item.quantity}x {item.name || 'Item'}</span>
                  <span className="text-white/40">₹{item.unit_price}</span>
                </div>
              ))}
              {(order.items?.length || 0) > 3 && (
                <p className="text-white/40 text-sm">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-dark-border">
              <p className="text-luxury-gold font-bold">₹{order.total_amount}</p>
              <div className="flex items-center gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'confirmed' })}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'preparing' })}
                    className="p-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                  >
                    <ChefHat className="w-4 h-4" />
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'ready' })}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 text-white/40 hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {ordersList.length === 0 && (
        <div className="card-luxury p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <p className="text-white/60">No orders found</p>
        </div>
      )}
    </div>
  );
}

function KitchenDisplaySection() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['kdsOrders'],
    queryFn: async () => {
      const response = await orderApi.getAll({ status: 'preparing' });
      return response.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const queryClient = useQueryClient();

  const markReadyMutation = useMutation({
    mutationFn: (orderId: string) => orderApi.updateStatus(orderId, 'ready'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kdsOrders'] });
      toast.success('Order marked as ready!');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const kdsOrders = orders || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-luxury-gold" />
          Kitchen Display System
        </h2>
        <span className="text-white/60">
          {kdsOrders.length} orders in queue
        </span>
      </div>

      {kdsOrders.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <ChefHat className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <p className="text-white/60 text-lg">All caught up!</p>
          <p className="text-white/40">No orders in the kitchen queue</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kdsOrders.map((order: any, index: number) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="card-luxury p-4 border-l-4 border-orange-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white">
                    #{order.order_number || order.id?.slice(-4)}
                  </h4>
                  <div className="flex items-center gap-1 text-orange-400 text-sm">
                    <Timer className="w-4 h-4" />
                    <span>
                      {Math.floor(
                        (Date.now() - new Date(order.created_at).getTime()) / 60000
                      )} min
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium">
                  Cooking
                </span>
              </div>

              <div className="space-y-3">
                {(order.items || []).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 bg-dark-bg rounded-lg"
                  >
                    <span className="w-6 h-6 bg-luxury-gold text-dark-bg rounded-full flex items-center justify-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.name || 'Item'}</p>
                      {item.special_instructions && (
                        <p className="text-yellow-400 text-xs mt-1">
                          Note: {item.special_instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => markReadyMutation.mutate(order.id)}
                className="w-full mt-4 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Mark Ready
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuManagementSection() {
  const [_showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['adminMenu'],
    queryFn: async () => {
      // This would normally use the restaurant ID from context
      const response = await menuApi.getByRestaurant('current');
      return response.data;
    },
  });

  const menu = menuItems || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-luxury-gold/50"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : menu.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <UtensilsCrossed className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <p className="text-white/60 text-lg mb-4">No menu items yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menu
            .filter((item: any) =>
              item.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item: any) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-luxury p-4"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-dark-bg flex-shrink-0">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {item.is_veg ? (
                            <span className="w-4 h-4 border-2 border-green-500 rounded flex items-center justify-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full" />
                            </span>
                          ) : (
                            <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full" />
                            </span>
                          )}
                          <h4 className="text-white font-medium">{item.name}</h4>
                        </div>
                        <p className="text-luxury-gold font-bold mt-1">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-white/40 hover:text-white transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-white/40 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-white/50 text-sm mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-border">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      item.is_available
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="text-white/40 text-sm">
                    {item.category_name || 'Uncategorized'}
                  </span>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}

function TableManagementSection() {
  const tables = [
    { id: 1, name: 'T-1', capacity: 2, status: 'available', location: 'Window' },
    { id: 2, name: 'T-2', capacity: 2, status: 'occupied', location: 'Window' },
    { id: 3, name: 'T-3', capacity: 4, status: 'reserved', location: 'Center' },
    { id: 4, name: 'T-4', capacity: 4, status: 'available', location: 'Center' },
    { id: 5, name: 'T-5', capacity: 6, status: 'occupied', location: 'Private' },
    { id: 6, name: 'T-6', capacity: 6, status: 'available', location: 'Private' },
    { id: 7, name: 'T-7', capacity: 8, status: 'available', location: 'VIP' },
    { id: 8, name: 'T-8', capacity: 10, status: 'reserved', location: 'VIP' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 border-green-500 text-green-400';
      case 'occupied':
        return 'bg-red-500/20 border-red-500 text-red-400';
      case 'reserved':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      default:
        return 'bg-white/10 border-dark-border text-white/60';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-white/60 text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-white/60 text-sm">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-white/60 text-sm">Reserved</span>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Table
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <motion.div
            key={table.id}
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${getStatusColor(
              table.status
            )}`}
          >
            <div className="text-center">
              <h4 className="text-2xl font-bold">{table.name}</h4>
              <p className="text-sm opacity-70 mt-1">
                {table.capacity} seats • {table.location}
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-black/20 rounded text-xs capitalize">
                {table.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Smart Allocation Info */}
      <div className="card-luxury p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-luxury-gold" />
          Smart Table Allocation Stats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-dark-bg rounded-xl">
            <p className="text-white/60 text-sm">Optimized Allocations Today</p>
            <p className="text-2xl font-bold text-white mt-1">24</p>
            <p className="text-green-400 text-sm">
              Saved 8 tables from over-allocation
            </p>
          </div>
          <div className="p-4 bg-dark-bg rounded-xl">
            <p className="text-white/60 text-sm">Average Wait Time</p>
            <p className="text-2xl font-bold text-white mt-1">12 min</p>
            <p className="text-green-400 text-sm">-5 min from last week</p>
          </div>
          <div className="p-4 bg-dark-bg rounded-xl">
            <p className="text-white/60 text-sm">Table Utilization</p>
            <p className="text-2xl font-bold text-white mt-1">87%</p>
            <p className="text-green-400 text-sm">+12% from smart allocation</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservationsSection() {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: reservations, isLoading, error } = useQuery({
    queryKey: ['adminReservations', filter],
    queryFn: async () => {
      console.log('='.repeat(50));
      console.log('🍽️ FETCHING ADMIN RESERVATIONS');
      console.log('='.repeat(50));
      console.log('Filter:', filter);
      
      try {
        const response = await tableApi.getAllReservations({ 
          status: filter === 'all' ? undefined : filter 
        });
        console.log('✅ Reservations Response:', response.data);
        console.log('Reservations Count:', response.data?.length || 0);
        return response.data;
      } catch (err: any) {
        console.error('❌ Reservations Fetch Error:', err);
        console.error('Error Response:', err.response?.data);
        console.error('Error Status:', err.response?.status);
        throw err;
      }
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ reservationId, status }: { reservationId: string; status: string }) =>
      tableApi.updateReservationStatus(reservationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      toast.success('Reservation status updated');
    },
    onError: (err: any) => {
      console.error('❌ Update Reservation Status Error:', err);
      toast.error(err.response?.data?.detail || 'Failed to update status');
    },
  });

  if (error) {
    console.error('❌ Reservations Query Error:', error);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const reservationsList = reservations || [];
  console.log('📋 Rendering reservations list:', reservationsList.length, 'reservations');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {['all', 'pending', 'confirmed', 'cancelled'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-xl transition-colors capitalize ${
                filter === filterOption
                  ? 'bg-luxury-gold text-dark-bg'
                  : 'bg-dark-card border border-dark-border text-white/60 hover:text-white'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>
      </div>

      {reservationsList.length === 0 ? (
        <div className="card-luxury p-8 text-center">
          <CalendarDays className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No reservations found</p>
        </div>
      ) : (
        <div className="card-luxury overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-white/40 text-sm border-b border-dark-border">
                <th className="text-left py-4 px-4">Guest</th>
                <th className="text-left py-4 px-4">Date & Time</th>
                <th className="text-left py-4 px-4">Guests</th>
                <th className="text-left py-4 px-4">Table</th>
                <th className="text-left py-4 px-4">Status</th>
                <th className="text-left py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservationsList.map((reservation: any) => (
                <tr key={reservation.id} className="border-b border-dark-border/50">
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">{reservation.guest_name || 'Guest'}</p>
                    <p className="text-white/40 text-sm">{reservation.guest_phone || '-'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white">{reservation.reservation_date}</p>
                    <p className="text-white/40 text-sm">{reservation.reservation_time}</p>
                  </td>
                  <td className="py-4 px-4 text-white">{reservation.guest_count}</td>
                  <td className="py-4 px-4 text-white">T-{reservation.table_id?.slice(-4) || '-'}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        reservation.status === 'confirmed'
                          ? 'bg-green-500/20 text-green-400'
                          : reservation.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : reservation.status === 'seated'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {reservation.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateStatusMutation.mutate({ reservationId: reservation.id, status: 'confirmed' })}
                            className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateStatusMutation.mutate({ reservationId: reservation.id, status: 'cancelled' })}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {reservation.status === 'confirmed' && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ reservationId: reservation.id, status: 'seated' })}
                          className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 text-white/40 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card-luxury p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Restaurant Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              defaultValue="The Grand Kitchen"
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              defaultValue="+91 9876543210"
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Address</label>
            <textarea
              defaultValue="123, ABC Street, Mumbai - 400001"
              className="input-luxury resize-none h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">
                Opening Time
              </label>
              <input type="time" defaultValue="11:00" className="input-luxury" />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">
                Closing Time
              </label>
              <input type="time" defaultValue="23:00" className="input-luxury" />
            </div>
          </div>
          <button className="btn-primary py-2 px-4">Save Changes</button>
        </div>
      </div>

      <div className="card-luxury p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">New Order Alerts</span>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded bg-dark-bg border-dark-border text-luxury-gold focus:ring-luxury-gold"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">Reservation Notifications</span>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded bg-dark-bg border-dark-border text-luxury-gold focus:ring-luxury-gold"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">Review Alerts</span>
            <input
              type="checkbox"
              className="w-5 h-5 rounded bg-dark-bg border-dark-border text-luxury-gold focus:ring-luxury-gold"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
