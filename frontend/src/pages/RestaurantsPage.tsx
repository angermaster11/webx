import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  ChevronDown,
  Leaf,
  SlidersHorizontal
} from 'lucide-react';
import { restaurantApi } from '@/services/api';
import { Restaurant } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const cuisineTypes = [
  'All',
  'Indian',
  'Chinese',
  'Italian',
  'Japanese',
  'Mexican',
  'Thai',
  'Continental',
  'Mediterranean',
];

const priceRanges = [
  { label: 'All', value: '' },
  { label: '₹', value: '1' },
  { label: '₹₹', value: '2' },
  { label: '₹₹₹', value: '3' },
  { label: '₹₹₹₹', value: '4' },
];

const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Rating: High to Low', value: 'rating_desc' },
  { label: 'Rating: Low to High', value: 'rating_asc' },
  { label: 'Cost: Low to High', value: 'cost_asc' },
  { label: 'Cost: High to Low', value: 'cost_desc' },
];

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [isVeg, setIsVeg] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants', searchQuery, selectedCuisine, selectedPrice, isVeg, isOpen],
    queryFn: async () => {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCuisine !== 'All') params.cuisine = selectedCuisine;
      if (selectedPrice) params.price_range = selectedPrice;
      if (isVeg) params.is_veg = true;
      if (isOpen) params.is_open = true;
      const response = await restaurantApi.discover(params);
      return response.data;
    },
  });

  const sortedRestaurants = [...(restaurants || [])].sort((a, b) => {
    switch (sortBy) {
      case 'rating_desc':
        return (b.rating || 0) - (a.rating || 0);
      case 'rating_asc':
        return (a.rating || 0) - (b.rating || 0);
      case 'cost_asc':
        return (a.price_range || 1) - (b.price_range || 1);
      case 'cost_desc':
        return (b.price_range || 1) - (a.price_range || 1);
      default:
        return 0;
    }
  });

  const activeFiltersCount = [
    selectedCuisine !== 'All',
    selectedPrice !== '',
    isVeg,
    isOpen,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCuisine('All');
    setSelectedPrice('');
    setIsVeg(false);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Discover <span className="text-luxury-gold">Restaurants</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Explore the finest dining experiences near you
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants, cuisines, or dishes..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-luxury-gold/50 shadow-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* Cuisine Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {cuisineTypes.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCuisine === cuisine
                      ? 'bg-luxury-gold text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>

            {/* Filter & Sort Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:text-gray-900 transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-luxury-gold text-white text-xs font-medium rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:text-gray-900 transition-colors shadow-sm"
                >
                  <span>Sort</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                            sortBy === option.value
                              ? 'text-luxury-gold'
                              : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-luxury-gold hover:text-amber-600"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Price Range */}
                    <div>
                      <label className="block text-gray-600 text-sm mb-3">
                        Price Range
                      </label>
                      <div className="flex gap-2">
                        {priceRanges.map((price) => (
                          <button
                            key={price.value}
                            onClick={() => setSelectedPrice(price.value)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedPrice === price.value
                                ? 'bg-luxury-gold text-white'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {price.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Filters */}
                    <div>
                      <label className="block text-gray-600 text-sm mb-3">
                        Quick Filters
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsVeg(!isVeg)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                            isVeg
                              ? 'bg-green-50 text-green-600 border border-green-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Leaf className="w-4 h-4" />
                          Pure Veg
                        </button>
                        <button
                          onClick={() => setIsOpen(!isOpen)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                            isOpen
                              ? 'bg-amber-50 text-luxury-gold border border-amber-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          Open Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {sortedRestaurants.length} restaurants found
            </p>
          </div>

          {/* Restaurant Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : sortedRestaurants.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">No restaurants found</p>
              <button
                onClick={clearFilters}
                className="text-luxury-gold hover:text-amber-600"
              >
                Clear filters and try again
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedRestaurants.map((restaurant: Restaurant, index: number) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

function RestaurantCard({ restaurant, index }: { restaurant: Restaurant; index: number }) {
  const avgPrice = restaurant.avg_price_for_two || 800;
  const priceLevel = avgPrice < 500 ? 1 : avgPrice < 1000 ? 2 : avgPrice < 2000 ? 3 : 4;
  const priceLabel = '₹'.repeat(priceLevel);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/restaurants/${restaurant.slug || restaurant.id}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={restaurant.cover_image_url || restaurant.logo_url || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&q=80`}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              {restaurant.status === 'active' ? (
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                  Open
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                  Closed
                </span>
              )}
            </div>

            {/* Veg Badge */}
            {restaurant.tags?.includes('pure_veg') && (
              <div className="absolute top-4 right-4">
                <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                  <Leaf className="w-3 h-3" />
                  Veg
                </span>
              </div>
            )}

            {/* Rating */}
            <div className="absolute bottom-4 right-4">
              <div className="flex items-center gap-1 px-2 py-1 bg-luxury-gold text-white text-sm font-bold rounded">
                <Star className="w-3 h-3 fill-current" />
                <span>{restaurant.avg_rating?.toFixed(1) || '4.2'}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-luxury-gold transition-colors">
              {restaurant.name}
            </h3>
            
            <p className="text-gray-500 text-sm mt-1 line-clamp-1">
              {restaurant.cuisines?.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') || 'Multi-Cuisine'}
            </p>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">New Delhi</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span className="text-luxury-gold font-semibold">{priceLabel}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>₹{avgPrice} for two</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>30-40 min</span>
              </div>
              {restaurant.service_types?.includes('dine_in') && (
                <span className="px-2 py-1 bg-luxury-gold/10 text-luxury-gold text-xs rounded font-medium">
                  Table Booking
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
