import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Store,
  Users,
  TrendingUp,
  Settings,
  Bell,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  MoreVertical,
  DollarSign,
  ShoppingBag,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/services/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'restaurants', label: 'Restaurants', icon: Store },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function SuperAdminDashboard() {
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              SA
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-white font-semibold">DineFlow</h2>
                <p className="text-white/40 text-xs">Super Admin</p>
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
                  ? 'bg-purple-500/20 text-purple-400'
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
                {activeSection}
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Super Admin Panel
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-white/60 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeSection === 'dashboard' && <DashboardOverview />}
          {activeSection === 'restaurants' && <RestaurantsManagement />}
          {activeSection === 'users' && <UsersManagement />}
          {activeSection === 'analytics' && <AnalyticsSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}

function DashboardOverview() {
  const stats = [
    {
      label: 'Total Restaurants',
      value: '156',
      change: '+12',
      changeType: 'up',
      icon: Store,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Total Users',
      value: '24,580',
      change: '+1,240',
      changeType: 'up',
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: 'Total Revenue',
      value: '₹45.2L',
      change: '+18%',
      changeType: 'up',
      icon: DollarSign,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      label: 'Total Orders',
      value: '89,450',
      change: '+2,340',
      changeType: 'up',
      icon: ShoppingBag,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
  ];

  const recentRestaurants = [
    { name: 'The Grand Kitchen', city: 'Mumbai', status: 'pending', date: '2 hours ago' },
    { name: 'Spice Garden', city: 'Delhi', status: 'approved', date: '5 hours ago' },
    { name: 'Ocean Pearl', city: 'Goa', status: 'approved', date: '1 day ago' },
    { name: 'Mountain View', city: 'Shimla', status: 'rejected', date: '2 days ago' },
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
                <div className="flex items-center gap-1 mt-1">
                  {stat.changeType === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <span className={stat.changeType === 'up' ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                    {stat.change}
                  </span>
                  <span className="text-white/40 text-sm">this month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Restaurant Applications */}
        <div className="card-luxury p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Recent Applications
            </h3>
            <button className="text-purple-400 text-sm hover:text-purple-300">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentRestaurants.map((restaurant, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-dark-bg rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{restaurant.name}</p>
                    <p className="text-white/40 text-sm">{restaurant.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      restaurant.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : restaurant.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {restaurant.status}
                  </span>
                  <span className="text-white/40 text-xs">{restaurant.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Activity */}
        <div className="card-luxury p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Platform Activity
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Active Restaurants</span>
              <span className="text-white font-medium">142 / 156</span>
            </div>
            <div className="w-full bg-dark-bg rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: '91%' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/60">Verified Users</span>
              <span className="text-white font-medium">22,450 / 24,580</span>
            </div>
            <div className="w-full bg-dark-bg rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: '91%' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/60">Order Success Rate</span>
              <span className="text-white font-medium">96.5%</span>
            </div>
            <div className="w-full bg-dark-bg rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: '96.5%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="card-luxury p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Revenue Overview
        </h3>
        <div className="h-64 flex items-center justify-center bg-dark-bg rounded-xl">
          <p className="text-white/40">Revenue chart will be displayed here</p>
        </div>
      </div>
    </div>
  );
}

function RestaurantsManagement() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['adminRestaurants', filter],
    queryFn: async () => {
      const response = await adminApi.getRestaurants({ status: filter === 'all' ? undefined : filter });
      return response.data;
    },
  });

  const restaurantsList = restaurants || [];

  // Demo data if no restaurants
  const demoRestaurants = [
    { id: 1, name: 'The Grand Kitchen', city: 'Mumbai', owner: 'Rahul Sharma', status: 'approved', rating: 4.5, orders: 1250 },
    { id: 2, name: 'Spice Garden', city: 'Delhi', owner: 'Priya Mehta', status: 'pending', rating: 0, orders: 0 },
    { id: 3, name: 'Ocean Pearl', city: 'Goa', owner: 'Amit Patel', status: 'approved', rating: 4.2, orders: 890 },
    { id: 4, name: 'Mountain View', city: 'Shimla', owner: 'Neha Singh', status: 'suspended', rating: 3.8, orders: 450 },
  ];

  const displayRestaurants = restaurantsList.length > 0 ? restaurantsList : demoRestaurants;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants..."
            className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div className="flex items-center gap-3">
          {['all', 'pending', 'approved', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl transition-all capitalize ${
                filter === status
                  ? 'bg-purple-500 text-white'
                  : 'bg-dark-card text-white/60 hover:text-white border border-dark-border'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="card-luxury overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-white/40 text-sm border-b border-dark-border">
                <th className="text-left py-4 px-4">Restaurant</th>
                <th className="text-left py-4 px-4">Owner</th>
                <th className="text-left py-4 px-4">City</th>
                <th className="text-left py-4 px-4">Rating</th>
                <th className="text-left py-4 px-4">Orders</th>
                <th className="text-left py-4 px-4">Status</th>
                <th className="text-left py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayRestaurants
                .filter((r: any) =>
                  r.name?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((restaurant: any) => (
                  <tr key={restaurant.id} className="border-b border-dark-border/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Store className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-white font-medium">
                          {restaurant.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/70">{restaurant.owner || 'N/A'}</td>
                    <td className="py-4 px-4 text-white/70">{restaurant.city}</td>
                    <td className="py-4 px-4 text-white">
                      {restaurant.rating > 0 ? `⭐ ${restaurant.rating}` : '-'}
                    </td>
                    <td className="py-4 px-4 text-white">{restaurant.orders || 0}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          restaurant.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : restaurant.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {restaurant.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {restaurant.status === 'pending' && (
                          <>
                            <button className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 text-white/40 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
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

function UsersManagement() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers', filter],
    queryFn: async () => {
      const response = await adminApi.getUsers({ role: filter === 'all' ? undefined : filter });
      return response.data;
    },
  });

  const usersList = users || [];

  // Demo data
  const demoUsers = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', role: 'customer', status: 'active', orders: 45 },
    { id: 2, name: 'Priya Mehta', email: 'priya@example.com', role: 'restaurant_admin', status: 'active', orders: 0 },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', role: 'customer', status: 'suspended', orders: 12 },
    { id: 4, name: 'Neha Singh', email: 'neha@example.com', role: 'customer', status: 'active', orders: 89 },
  ];

  const displayUsers = usersList.length > 0 ? usersList : demoUsers;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div className="flex items-center gap-3">
          {['all', 'customer', 'restaurant_admin'].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-xl transition-all capitalize ${
                filter === role
                  ? 'bg-purple-500 text-white'
                  : 'bg-dark-card text-white/60 hover:text-white border border-dark-border'
              }`}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="card-luxury overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-white/40 text-sm border-b border-dark-border">
                <th className="text-left py-4 px-4">User</th>
                <th className="text-left py-4 px-4">Email</th>
                <th className="text-left py-4 px-4">Role</th>
                <th className="text-left py-4 px-4">Orders</th>
                <th className="text-left py-4 px-4">Status</th>
                <th className="text-left py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers
                .filter((u: any) =>
                  u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((user: any) => (
                  <tr key={user.id} className="border-b border-dark-border/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0)}
                        </div>
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/70">{user.email}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          user.role === 'restaurant_admin'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white">{user.orders || 0}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-white/40 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
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

function AnalyticsSection() {
  const metrics = [
    { label: 'Daily Active Users', value: '8,450', change: '+12%' },
    { label: 'Avg. Order Value', value: '₹580', change: '+8%' },
    { label: 'Customer Retention', value: '78%', change: '+5%' },
    { label: 'Platform Uptime', value: '99.9%', change: '0%' },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-luxury p-4"
          >
            <p className="text-white/60 text-sm">{metric.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
            <p className="text-green-400 text-sm mt-1">{metric.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-luxury p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Orders by City
          </h3>
          <div className="h-64 flex items-center justify-center bg-dark-bg rounded-xl">
            <p className="text-white/40">Chart will be displayed here</p>
          </div>
        </div>

        <div className="card-luxury p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Revenue Trend
          </h3>
          <div className="h-64 flex items-center justify-center bg-dark-bg rounded-xl">
            <p className="text-white/40">Chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="card-luxury p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Top Performing Restaurants
        </h3>
        <div className="space-y-3">
          {[
            { name: 'The Grand Kitchen', city: 'Mumbai', orders: 1250, revenue: '₹7.5L' },
            { name: 'Spice Garden', city: 'Delhi', orders: 980, revenue: '₹5.8L' },
            { name: 'Ocean Pearl', city: 'Goa', orders: 890, revenue: '₹5.2L' },
          ].map((restaurant, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-dark-bg rounded-xl"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="text-white font-medium">{restaurant.name}</p>
                  <p className="text-white/40 text-sm">{restaurant.city}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{restaurant.orders} orders</p>
                <p className="text-green-400 text-sm">{restaurant.revenue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card-luxury p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Platform Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">
              Platform Name
            </label>
            <input
              type="text"
              defaultValue="DineFlow"
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">
              Support Email
            </label>
            <input
              type="email"
              defaultValue="support@dineflow.com"
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              defaultValue="15"
              className="input-luxury"
            />
          </div>
          <button className="btn-primary py-2 px-4">Save Changes</button>
        </div>
      </div>

      <div className="card-luxury p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          System Maintenance
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">Enable Maintenance Mode</span>
            <input
              type="checkbox"
              className="w-5 h-5 rounded bg-dark-bg border-dark-border text-purple-500 focus:ring-purple-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">Allow New Registrations</span>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded bg-dark-bg border-dark-border text-purple-500 focus:ring-purple-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
