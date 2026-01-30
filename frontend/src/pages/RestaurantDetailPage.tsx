import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Share2, 
  Heart,
  ChevronRight,
  Calendar,
  Leaf,
  Flame,
  Plus,
  Minus,
  ShoppingCart,
  X,
  Info
} from 'lucide-react';
import { restaurantApi, menuApi, tableApi } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { MenuItem, Restaurant } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const tabs = ['Menu', 'Book Table', 'Reviews', 'Photos'];

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('Menu');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: restaurant, isLoading: loadingRestaurant } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const response = await restaurantApi.getById(id!);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: menuItems, isLoading: loadingMenu } = useQuery({
    queryKey: ['menu', id],
    queryFn: async () => {
      const response = await menuApi.getByRestaurant(id!);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const response = await menuApi.getCategories(id!);
      return response.data;
    },
    enabled: !!id,
  });

  // Create category ID to name mapping
  const categoryMap = (categories || []).reduce((acc: Record<string, string>, cat: any) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Restaurant not found</p>
          <Link to="/restaurants" className="px-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-xl hover:bg-[#B8960C] transition-colors">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  // Group menu items by category name
  const categorizedMenu = (menuItems || []).reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
    const categoryName = categoryMap[item.category_id] || 'Other';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item);
    return acc;
  }, {});

  const categoryNames = Object.keys(categorizedMenu);
  const activeCategory = selectedCategory || categoryNames[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img
          src={restaurant.cover_image_url || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200`}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Back Button */}
        <Link
          to="/restaurants"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-gray-900 shadow-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back
        </Link>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-3 rounded-full backdrop-blur-sm shadow-lg transition-all ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-700 hover:text-gray-900'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-gray-900 shadow-lg transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Restaurant Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {restaurant.tags?.includes('pure_veg') && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                      <Leaf className="w-3 h-3" />
                      Pure Veg
                    </span>
                  )}
                  {restaurant.status === 'active' ? (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                      Open Now
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                      Closed
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white drop-shadow-lg">
                  {restaurant.name}
                </h1>
                <p className="text-white/90 mt-1 drop-shadow">
                  {restaurant.cuisines?.join(', ') || 'Multi-Cuisine'}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-sm font-bold rounded">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{restaurant.avg_rating?.toFixed(1) || '4.2'}</span>
                    </div>
                    <span className="text-white/80 text-sm ml-1 drop-shadow">
                      ({restaurant.total_reviews || 100}+ reviews)
                    </span>
                  </div>
                  <span className="text-white/50">•</span>
                  <span className="text-white/90 drop-shadow">
                    ₹{restaurant.avg_price_for_two || 800} for two
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {restaurant.service_types?.includes('dine_in') && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBookingModal(true)}
                    className="px-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-xl shadow-lg hover:bg-[#B8960C] transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Table
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 text-gray-600 text-sm whitespace-nowrap">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>{restaurant.address || restaurant.city || 'Location'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm whitespace-nowrap">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>11:00 AM - 11:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm whitespace-nowrap">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>{restaurant.contact_phone || '+91 9876543210'}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-t border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#D4AF37]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {activeTab === 'Menu' && (
            <MenuSection
              categories={categoryNames}
              categorizedMenu={categorizedMenu}
              activeCategory={activeCategory}
              setSelectedCategory={setSelectedCategory}
              restaurant={restaurant}
              isLoading={loadingMenu}
            />
          )}
          {activeTab === 'Book Table' && (
            <BookTableSection
              restaurantId={id!}
            />
          )}
          {activeTab === 'Reviews' && (
            <ReviewsSection restaurant={restaurant} />
          )}
          {activeTab === 'Photos' && (
            <PhotosSection restaurant={restaurant} />
          )}
        </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <BookingModal
            restaurant={restaurant}
            restaurantId={id!}
            onClose={() => setShowBookingModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </div>
  );
}

function MenuSection({
  categories,
  categorizedMenu,
  activeCategory,
  setSelectedCategory,
  restaurant,
  isLoading,
}: {
  categories: string[];
  categorizedMenu: any;
  activeCategory: string;
  setSelectedCategory: (cat: string) => void;
  restaurant: Restaurant;
  isLoading: boolean;
}) {
  const [vegOnly, setVegOnly] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No menu items available</p>
      </div>
    );
  }

  const filteredItems = (categorizedMenu[activeCategory] || []).filter(
    (item: MenuItem) => !vegOnly || item.food_type === 'veg' || item.food_type === 'vegan'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar - Categories */}
      <div className="lg:col-span-1">
        <div className="sticky top-32">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            {/* Veg Filter */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Veg Only</span>
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  vegOnly ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    vegOnly ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Category List */}
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    activeCategory === category
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{category}</span>
                  <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                    {categorizedMenu[category]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="lg:col-span-3">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
          {activeCategory}
        </h2>
        <div className="space-y-4">
          {filteredItems.map((item: MenuItem) => (
            <MenuItemCard key={item.id} item={item} restaurantId={restaurant.id} branchId={restaurant.id} />
          ))}
          {filteredItems.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No items found in this category
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItemCard({ item, restaurantId, branchId }: { item: MenuItem; restaurantId: string; branchId: string }) {
  const { addItem, items, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.menuItem.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(item, restaurantId, branchId);
    toast.success(`${item.name} added to cart`);
  };

  const handleUpdateQuantity = (newQty: number) => {
    updateQuantity(item.id, newQty);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex gap-4 hover:shadow-xl transition-shadow"
    >
      {/* Item Image */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden">
        <img
          src={item.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300`}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.is_bestseller && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#D4AF37] text-white text-xs font-medium rounded shadow">
            Bestseller
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {item.food_type === 'veg' || item.food_type === 'vegan' ? (
              <span className="w-4 h-4 border-2 border-green-500 rounded flex items-center justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              </span>
            ) : (
              <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
              </span>
            )}
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
          </div>
          {item.spice_level && (
            <div className="flex items-center gap-0.5">
              {['mild', 'medium', 'spicy', 'extra_spicy'].indexOf(item.spice_level) >= 1 && (
                <Flame className="w-3 h-3 text-red-500" />
              )}
              {['medium', 'spicy', 'extra_spicy'].indexOf(item.spice_level) >= 1 && (
                <Flame className="w-3 h-3 text-red-500" />
              )}
              {['spicy', 'extra_spicy'].indexOf(item.spice_level) >= 1 && (
                <Flame className="w-3 h-3 text-red-500" />
              )}
            </div>
          )}
        </div>

        <p className="text-lg font-bold text-[#D4AF37] mt-1">
          ₹{item.final_price}
        </p>

        {item.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add Button */}
      <div className="flex-shrink-0 flex items-center">
        {quantity === 0 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            disabled={!item.is_available}
            className={`px-6 py-2 rounded-lg font-medium shadow transition-all ${
              item.is_available
                ? 'bg-[#D4AF37] text-white hover:bg-[#B8960C] hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {item.is_available ? 'ADD' : 'Unavailable'}
          </motion.button>
        ) : (
          <div className="flex items-center gap-2 bg-[#D4AF37] rounded-lg shadow">
            <button
              onClick={() => handleUpdateQuantity(quantity - 1)}
              className="p-2 text-white hover:bg-[#B8960C] rounded-l-lg transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-white font-bold min-w-[24px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(quantity + 1)}
              className="p-2 text-white hover:bg-[#B8960C] rounded-r-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BookTableSection({ restaurantId }: { restaurantId: string }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [duration, setDuration] = useState(2);

  const checkAvailability = async () => {
    if (!date || !time) {
      toast.error('Please select date and time');
      return;
    }

    setIsLoading(true);
    try {
      const response = await tableApi.checkAvailability(restaurantId, {
        date,
        time,
        guests,
        duration_hours: duration,
      });
      setAvailableTables(response.data.available_tables || []);
      if (response.data.available_tables?.length === 0) {
        toast.error('No tables available for this time slot');
      } else {
        toast.success(`${response.data.available_tables.length} tables available!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to check availability');
    } finally {
      setIsLoading(false);
    }
  };

  const bookTable = async () => {
    if (!selectedTable) {
      toast.error('Please select a table');
      return;
    }

    setIsLoading(true);
    
    const reservationData = {
      restaurant_id: restaurantId,
      branch_id: restaurantId,
      table_id: selectedTable,
      reservation_date: date,
      reservation_time: time,
      guest_count: guests,
      duration_minutes: duration * 60,
    };
    
    console.log('='.repeat(50));
    console.log('🍽️ BOOKING TABLE');
    console.log('='.repeat(50));
    console.log('Reservation Data:', JSON.stringify(reservationData, null, 2));
    console.log('Restaurant ID:', restaurantId);
    console.log('Date:', date);
    console.log('Time:', time);
    console.log('Guests:', guests);
    
    try {
      const response = await tableApi.createReservation(reservationData);
      console.log('✅ Reservation Response:', response.data);
      toast.success('Table booked successfully!');
      setAvailableTables([]);
      setSelectedTable(null);
    } catch (error: any) {
      console.error('❌ Reservation Error:', error);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      toast.error(error.response?.data?.detail || 'Failed to book table');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots
  const timeSlots = [];
  for (let h = 11; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      timeSlots.push(`${hour}:${minute}`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
          Book a Table
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Time</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
            >
              <option value="">Select time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Guests */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Number of Guests
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="p-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-xl font-bold text-gray-900 min-w-[40px] text-center">
                {guests}
              </span>
              <button
                onClick={() => setGuests(Math.min(20, guests + 1))}
                className="p-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Duration (hours)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
            >
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
              <option value={4}>4 hours</option>
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={checkAvailability}
          disabled={isLoading}
          className="w-full mt-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-xl shadow-lg hover:bg-[#B8960C] disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Checking...' : 'Check Availability'}
        </motion.button>

        {/* Available Tables */}
        {availableTables.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Tables
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTable === table.id
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md'
                      : 'border-gray-200 hover:border-[#D4AF37]/50'
                  }`}
                >
                  <p className="text-gray-900 font-medium">{table.name}</p>
                  <p className="text-gray-500 text-sm">
                    {table.capacity} seats • {table.location}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700 text-sm">
                Our smart allocation system has selected the optimal table for your party size,
                ensuring you don't get a larger table than needed!
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={bookTable}
              disabled={isLoading || !selectedTable}
              className="w-full mt-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-xl shadow-lg hover:bg-[#B8960C] disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewsSection({ restaurant }: { restaurant: Restaurant }) {
  const reviews = [
    {
      id: 1,
      user: 'Rahul S.',
      rating: 5,
      date: '2 days ago',
      text: 'Amazing food and excellent service! The ambiance was perfect for a romantic dinner.',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
      id: 2,
      user: 'Priya M.',
      rating: 4,
      date: '1 week ago',
      text: 'Great food quality. The butter chicken was exceptional. Slightly pricey but worth it.',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    {
      id: 3,
      user: 'Amit K.',
      rating: 5,
      date: '2 weeks ago',
      text: 'Best dining experience in the city. The staff was very attentive and the food was divine.',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Reviews</h2>
        <button className="px-4 py-2 bg-[#D4AF37] text-white font-semibold rounded-xl shadow hover:bg-[#B8960C] transition-colors">
          Write a Review
        </button>
      </div>

      {/* Rating Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-[#D4AF37]">
              {restaurant.avg_rating?.toFixed(1) || '4.2'}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(restaurant.avg_rating || 4.2)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {restaurant.total_reviews || 150}+ reviews
            </p>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-gray-600 text-sm w-3">{rating}</span>
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{
                      width:
                        rating === 5
                          ? '60%'
                          : rating === 4
                          ? '25%'
                          : rating === 3
                          ? '10%'
                          : '5%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-start gap-4">
              <img
                src={review.avatar}
                alt={review.user}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{review.user}</h4>
                  <span className="text-gray-500 text-sm">{review.date}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < review.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mt-2">{review.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotosSection({ restaurant: _restaurant }: { restaurant: Restaurant }) {
  const photos = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600',
  ];

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Photos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-lg"
          >
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BookingModal({
  restaurant,
  restaurantId,
  onClose,
}: {
  restaurant: Restaurant;
  restaurantId: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold text-gray-900">
            Book Table at {restaurant.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <BookTableSection restaurantId={restaurantId} />
      </motion.div>
    </motion.div>
  );
}

function FloatingCartButton() {
  const { items, getSubtotal } = useCartStore();
  const total = getSubtotal();

  if (items.length === 0) return null;

  return (
    <Link to="/cart">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4 z-40 hover:bg-[#B8960C] transition-colors"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-bold">{items.length} items</span>
        </div>
        <div className="w-px h-6 bg-white/30" />
        <span className="font-bold">₹{total.toFixed(0)}</span>
        <ChevronRight className="w-5 h-5" />
      </motion.div>
    </Link>
  );
}
