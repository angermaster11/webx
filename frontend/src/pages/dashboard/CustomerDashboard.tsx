import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { orderApi, tableApi } from '@/services/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const tabs = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'reservations', label: 'Reservations', icon: Calendar },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="card-luxury p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-luxury-gold to-primary-500 flex items-center justify-center text-3xl font-bold text-dark-bg">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-serif font-bold text-white">
                {user?.full_name || 'User'}
              </h1>
              <p className="text-white/60 mt-1">{user?.email}</p>
              <p className="text-white/40 text-sm mt-1">{user?.phone}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-dark-bg border border-dark-border rounded-xl text-white/70 hover:text-white transition-colors">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-luxury-gold text-dark-bg'
                  : 'bg-dark-card text-white/70 hover:text-white border border-dark-border'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'reservations' && <ReservationsTab />}
        {activeTab === 'favorites' && <FavoritesTab />}
        {activeTab === 'addresses' && <AddressesTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const response = await orderApi.getMyOrders();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const ordersList = orders || [];

  if (ordersList.length === 0) {
    return (
      <div className="card-luxury p-12 text-center">
        <Package className="w-16 h-16 mx-auto text-white/20 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
        <p className="text-white/60 mb-6">
          You haven't placed any orders yet. Start exploring!
        </p>
        <Link to="/restaurants" className="btn-primary">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ordersList.map((order: any) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-bg flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"
                  alt="Order"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Order #{order.order_number || order.id?.slice(-8)}
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  {order.items?.length || 0} items • ₹{order.total_amount?.toFixed(0)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      order.status === 'delivered'
                        ? 'bg-green-500/20 text-green-400'
                        : order.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-luxury-gold/20 text-luxury-gold'
                    }`}
                  >
                    {order.status?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="text-white/40 text-xs">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <Link
              to={`/orders/${order.id}`}
              className="flex items-center gap-1 text-luxury-gold hover:text-primary-400 text-sm"
            >
              View <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ReservationsTab() {
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['myReservations'],
    queryFn: async () => {
      const response = await tableApi.getMyReservations();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const reservationsList = reservations || [];

  if (reservationsList.length === 0) {
    return (
      <div className="card-luxury p-12 text-center">
        <Calendar className="w-16 h-16 mx-auto text-white/20 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          No reservations yet
        </h2>
        <p className="text-white/60 mb-6">
          You haven't made any table reservations yet.
        </p>
        <Link to="/restaurants" className="btn-primary">
          Book a Table
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservationsList.map((reservation: any) => (
        <motion.div
          key={reservation.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-luxury-gold/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-luxury-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {reservation.restaurant_name || 'Restaurant'}
                </h3>
                <div className="flex items-center gap-4 text-white/60 text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {reservation.date} at {reservation.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {reservation.guests} guests
                  </span>
                </div>
                <span
                  className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                    reservation.status === 'confirmed'
                      ? 'bg-green-500/20 text-green-400'
                      : reservation.status === 'cancelled'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-luxury-gold/20 text-luxury-gold'
                  }`}
                >
                  {reservation.status?.toUpperCase()}
                </span>
              </div>
            </div>
            <button className="text-red-400 hover:text-red-300 text-sm">
              Cancel
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FavoritesTab() {
  const favorites = [
    {
      id: 1,
      name: 'The Taj Mahal Palace',
      cuisine: 'Indian, Continental',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    },
    {
      id: 2,
      name: 'Wasabi by Morimoto',
      cuisine: 'Japanese, Sushi',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    },
  ];

  if (favorites.length === 0) {
    return (
      <div className="card-luxury p-12 text-center">
        <Heart className="w-16 h-16 mx-auto text-white/20 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          No favorites yet
        </h2>
        <p className="text-white/60 mb-6">
          Save your favorite restaurants for quick access.
        </p>
        <Link to="/restaurants" className="btn-primary">
          Explore Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map((restaurant) => (
        <motion.div
          key={restaurant.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-luxury overflow-hidden group"
        >
          <div className="relative h-40">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <button className="absolute top-3 right-3 p-2 bg-dark-bg/80 backdrop-blur-sm rounded-full text-red-500">
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-white">{restaurant.name}</h3>
            <p className="text-white/60 text-sm mt-1">{restaurant.cuisine}</p>
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-white font-medium">{restaurant.rating}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AddressesTab() {
  const addresses = [
    {
      id: 1,
      label: 'Home',
      address: '123, ABC Street, XYZ Colony',
      city: 'Mumbai',
      pincode: '400001',
      isDefault: true,
    },
    {
      id: 2,
      label: 'Office',
      address: '456, DEF Tower, GHI Business Park',
      city: 'Mumbai',
      pincode: '400002',
      isDefault: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Saved Addresses</h2>
        <button className="btn-primary py-2 px-4">Add New Address</button>
      </div>

      {addresses.map((address) => (
        <motion.div
          key={address.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-1" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{address.label}</span>
                  {address.isDefault && (
                    <span className="px-2 py-0.5 bg-luxury-gold/20 text-luxury-gold text-xs rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-white/60 mt-1">{address.address}</p>
                <p className="text-white/40 text-sm">
                  {address.city} - {address.pincode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-white/40 hover:text-white transition-colors">
                <Edit2 className="w-4 h-4" />
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
    <div className="space-y-6">
      <div className="card-luxury p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Account Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Full Name</label>
            <input
              type="text"
              defaultValue={user?.full_name}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Email</label>
            <input
              type="email"
              defaultValue={user?.email}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Phone</label>
            <input
              type="tel"
              defaultValue={user?.phone}
              className="input-luxury"
            />
          </div>
          <button className="btn-primary py-2 px-4">Save Changes</button>
        </div>
      </div>

      <div className="card-luxury p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">Push Notifications</span>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded bg-dark-bg border-dark-border text-luxury-gold focus:ring-luxury-gold"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">Email Notifications</span>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded bg-dark-bg border-dark-border text-luxury-gold focus:ring-luxury-gold"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">SMS Updates</span>
            <input
              type="checkbox"
              className="w-5 h-5 rounded bg-dark-bg border-dark-border text-luxury-gold focus:ring-luxury-gold"
            />
          </label>
        </div>
      </div>

      <div className="card-luxury p-6">
        <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <button
            onClick={logout}
            className="w-full py-3 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Logout
          </button>
          <button className="w-full py-3 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
