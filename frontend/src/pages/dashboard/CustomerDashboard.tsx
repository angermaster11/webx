import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Package,
  Calendar,
  Heart,
  MapPin,
  Settings,
  ChevronRight,
  Clock,
  Star,
  Edit2,
  Bell,
  CreditCard,
  Gift,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'reservations', label: 'Reservations', icon: Calendar },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Dummy data
const dummyOrders = [
  {
    id: '1',
    order_number: 'ORD-20260130-A1B2',
    restaurant_name: 'The Golden Spice',
    restaurant_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
    items: [
      { name: 'Butter Chicken', quantity: 2 },
      { name: 'Garlic Naan', quantity: 4 },
      { name: 'Dal Makhani', quantity: 1 },
    ],
    total_amount: 1250,
    status: 'delivered',
    created_at: '2026-01-28T14:30:00Z',
  },
  {
    id: '2',
    order_number: 'ORD-20260129-C3D4',
    restaurant_name: 'Sakura Garden',
    restaurant_image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=200',
    items: [
      { name: 'Salmon Sushi Roll', quantity: 2 },
      { name: 'Miso Soup', quantity: 2 },
    ],
    total_amount: 890,
    status: 'delivered',
    created_at: '2026-01-29T19:15:00Z',
  },
  {
    id: '3',
    order_number: 'ORD-20260130-E5F6',
    restaurant_name: 'Spice Garden',
    restaurant_image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200',
    items: [
      { name: 'Paneer Tikka', quantity: 1 },
      { name: 'Biryani', quantity: 2 },
    ],
    total_amount: 680,
    status: 'preparing',
    created_at: '2026-01-30T12:00:00Z',
  },
];

const dummyReservations = [
  {
    id: '1',
    restaurant_name: 'The Golden Spice',
    restaurant_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
    date: '2026-02-01',
    time: '19:30',
    guests: 4,
    table_number: 'T-5',
    status: 'confirmed',
  },
  {
    id: '2',
    restaurant_name: 'Sakura Garden',
    restaurant_image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=200',
    date: '2026-02-05',
    time: '20:00',
    guests: 2,
    table_number: 'T-12',
    status: 'pending',
  },
];

const dummyFavorites = [
  {
    id: '1',
    name: 'The Golden Spice',
    cuisine: 'Indian, North Indian',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    priceForTwo: 1200,
  },
  {
    id: '2',
    name: 'Sakura Garden',
    cuisine: 'Japanese, Sushi',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400',
    priceForTwo: 1500,
  },
  {
    id: '3',
    name: 'Spice Garden',
    cuisine: 'Indian, Mughlai',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
    priceForTwo: 800,
  },
];

const dummyAddresses = [
  {
    id: '1',
    label: 'Home',
    address: '123, Sunshine Apartments, MG Road',
    city: 'Mumbai',
    pincode: '400001',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    address: '456, Tech Park, BKC',
    city: 'Mumbai',
    pincode: '400051',
    isDefault: false,
  },
];

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8960C] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                Welcome back, {user?.full_name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">{user?.email || 'user@example.com'}</p>
              <p className="text-gray-400 text-sm mt-1">{user?.phone || '+91 98765 43210'}</p>
            </div>
            <div className="flex gap-3">
              <button className="p-3 bg-amber-50 border border-[#D4AF37]/20 rounded-xl text-[#D4AF37] hover:bg-amber-100 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all font-medium ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-[#D4AF37]/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'reservations' && <ReservationsTab />}
        {activeTab === 'favorites' && <FavoritesTab />}
        {activeTab === 'addresses' && <AddressesTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const stats = [
    { label: 'Total Orders', value: '24', icon: Package, color: 'bg-blue-500' },
    { label: 'Reservations', value: '8', icon: Calendar, color: 'bg-green-500' },
    { label: 'Favorites', value: '12', icon: Heart, color: 'bg-red-500' },
    { label: 'Reward Points', value: '2,450', icon: Gift, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold text-gray-900">Recent Orders</h2>
          <button className="text-[#D4AF37] hover:text-[#B8960C] text-sm font-medium flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {dummyOrders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <img src={order.restaurant_image} alt={order.restaurant_name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{order.restaurant_name}</p>
                <p className="text-gray-500 text-sm">{order.items.length} items • ₹{order.total_amount}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'preparing' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Reservations */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold text-gray-900">Upcoming Reservations</h2>
          <button className="text-[#D4AF37] hover:text-[#B8960C] text-sm font-medium flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {dummyReservations.map((reservation) => (
            <div key={reservation.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8960C] flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{reservation.restaurant_name}</p>
                <p className="text-gray-500 text-sm">{reservation.date} at {reservation.time} • {reservation.guests} guests</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                reservation.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="space-y-4">
      {dummyOrders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={order.restaurant_image}
                alt={order.restaurant_name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{order.restaurant_name}</h3>
                <p className="text-gray-500 text-sm mt-1">Order #{order.order_number}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {order.items.map((item, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'preparing' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#D4AF37]">₹{order.total_amount}</p>
              <Link
                to={`/orders/${order.id}`}
                className="inline-flex items-center gap-1 text-[#D4AF37] hover:text-[#B8960C] text-sm font-medium mt-2"
              >
                View Details <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ReservationsTab() {
  return (
    <div className="space-y-4">
      {dummyReservations.map((reservation, index) => (
        <motion.div
          key={reservation.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={reservation.restaurant_image}
                alt={reservation.restaurant_name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{reservation.restaurant_name}</h3>
                <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" />
                    {reservation.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    {reservation.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4 text-[#D4AF37]" />
                    {reservation.guests} guests
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                    Table {reservation.table_number}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    reservation.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {reservation.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-white text-sm font-medium rounded-lg hover:shadow-md transition-all">
                Modify
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FavoritesTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dummyFavorites.map((restaurant, index) => (
        <motion.div
          key={restaurant.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group"
        >
          <div className="relative h-44">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-md">
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 text-lg">{restaurant.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{restaurant.cuisine}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-gray-900 font-medium">{restaurant.rating}</span>
              </div>
              <span className="text-gray-500 text-sm">₹{restaurant.priceForTwo} for two</span>
            </div>
            <Link
              to={`/restaurants/${restaurant.id}`}
              className="block mt-4 text-center py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-white font-medium rounded-xl hover:shadow-md transition-all"
            >
              Order Now
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AddressesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-bold text-gray-900">Saved Addresses</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-white font-medium rounded-xl hover:shadow-md transition-all">
          Add New Address
        </button>
      </div>

      {dummyAddresses.map((address, index) => (
        <motion.div
          key={address.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B8960C]/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-semibold">{address.label}</span>
                  {address.isDefault && (
                    <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#B8960C] text-xs font-medium rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{address.address}</p>
                <p className="text-gray-400 text-sm">{address.city} - {address.pincode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SettingsTab() {
  const { user, logout } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account Settings */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              defaultValue={user?.full_name || 'John Doe'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              defaultValue={user?.email || 'john@example.com'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              defaultValue={user?.phone || '+91 98765 43210'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
            />
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-white font-semibold rounded-xl hover:shadow-md transition-all">
            Save Changes
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Payment Methods</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-[#D4AF37]" />
              <div>
                <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-gray-500 text-sm">Expires 12/28</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#B8960C] text-xs font-medium rounded">Default</span>
          </div>
          <button className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
            + Add New Payment Method
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="text-gray-700">Push Notifications</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-[#D4AF37] focus:ring-[#D4AF37]" />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="text-gray-700">Email Notifications</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-[#D4AF37] focus:ring-[#D4AF37]" />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="text-gray-700">SMS Updates</span>
            <input type="checkbox" className="w-5 h-5 rounded text-[#D4AF37] focus:ring-[#D4AF37]" />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="text-gray-700">Promotional Offers</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-[#D4AF37] focus:ring-[#D4AF37]" />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-md border border-red-100 p-6">
        <h2 className="text-xl font-serif font-bold text-red-500 mb-6">Danger Zone</h2>
        <div className="space-y-3">
          <button
            onClick={logout}
            className="w-full py-3 border border-red-200 rounded-xl text-red-500 font-medium hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
          <button className="w-full py-3 border border-red-200 rounded-xl text-red-500 font-medium hover:bg-red-50 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
