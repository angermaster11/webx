import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { 
  CalendarDays, UtensilsCrossed, Star, 
  Clock, ArrowRight,
  Award, Users, MapPin, Phone, Mail,
  ChevronDown, Play, Shield, Zap, Search
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

// Premium Background Images
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
  cuisine: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80',
  features: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
  restaurants: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80',
  cta: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=80',
  about: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1920&q=80',
};

// Hero Section with Clean Video Background and Search
function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Clean Video Background - No overlay/blur */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/assets/hero-poster.jpg"
        >
          <source src="/assets/wshbtaj.mp4" type="video/mp4" />
        </video>
        {/* Very subtle dark overlay at bottom for search bar visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Search Bar at Bottom - Like Taj Hotels */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-4xl mx-auto px-4"
        >
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl p-2 flex items-center">
                <div className="flex-1 flex items-center px-6">
                  <Search className="w-6 h-6 text-luxury-gold mr-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search restaurants, cuisines, or dishes..."
                    className="w-full py-4 bg-transparent text-gray-900 text-lg placeholder-gray-500 outline-none"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-4 bg-luxury-gold text-white font-semibold rounded-full hover:bg-luxury-gold/90 transition-all shadow-lg"
                >
                  Search
                </motion.button>
              </div>
            </div>
          </form>
          
          {/* Quick Links */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <span className="text-white/80 text-sm">Popular:</span>
            {['Indian', 'Chinese', 'Italian', 'Fine Dining', 'Cafes'].map((tag) => (
              <Link
                key={tag}
                to={`/restaurants?search=${tag.toLowerCase()}`}
                className="text-white/90 hover:text-luxury-gold text-sm font-medium transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center text-white/80"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// About Section - Full Screen with Image
function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={IMAGES.about}
          alt="Fine dining"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-luxury-gold/10 text-luxury-gold text-sm font-semibold rounded-full mb-6">
              About DineFlow
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
              Redefining the{' '}
              <span className="text-luxury-gold">Dining Experience</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              DineFlow is your premium gateway to exceptional dining experiences. 
              We connect food lovers with the finest restaurants, offering seamless 
              reservations, smart ordering, and personalized recommendations.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { icon: Shield, label: 'Verified Restaurants' },
                { icon: Zap, label: 'Instant Booking' },
                { icon: Star, label: 'Premium Experience' },
                { icon: Users, label: '24/7 Support' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-luxury-gold/10 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <span className="font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
            <Link to="/restaurants">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-luxury-gold text-white font-semibold rounded-full hover:bg-luxury-gold/90 transition-all shadow-lg shadow-luxury-gold/30 flex items-center gap-2"
              >
                <span>Explore Restaurants</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600"
                alt="Fine dining experience"
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-luxury-gold rounded-full flex items-center justify-center">
                    <Star className="w-7 h-7 text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">4.8</div>
                    <div className="text-gray-500">Average Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Cuisine Categories Section - Full Screen
function CuisineSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const cuisines = [
    { name: 'Indian', icon: '🍛', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
    { name: 'Chinese', icon: '🥡', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400' },
    { name: 'Italian', icon: '🍝', image: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400' },
    { name: 'Japanese', icon: '🍣', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400' },
    { name: 'Mexican', icon: '🌮', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400' },
    { name: 'Thai', icon: '🍜', image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400' },
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center bg-gray-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-luxury-gold/5 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-luxury-gold/10 text-luxury-gold text-sm font-semibold rounded-full mb-4">
            Explore Cuisines
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
            A World of <span className="text-luxury-gold">Flavors</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From authentic Indian curries to Japanese sushi, discover diverse cuisines from around the world
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {cuisines.map((cuisine, index) => (
            <motion.div
              key={cuisine.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/restaurants?cuisine=${cuisine.name.toLowerCase()}`}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img 
                      src={cuisine.image} 
                      alt={cuisine.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-4xl">
                      {cuisine.icon}
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900 group-hover:text-luxury-gold transition-colors">
                      {cuisine.name}
                    </h3>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Restaurant interface
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisines: string[];
  avg_rating: number;
  avg_price_for_two: number;
  cover_image_url: string;
  is_featured: boolean;
  tags: string[];
}

// Featured Restaurants Section - Full Screen
function FeaturedRestaurants() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(`${API_BASE}/restaurants/`);
        // Filter to get only featured restaurants, limit to 4
        const featured = response.data.filter((r: Restaurant) => r.is_featured).slice(0, 4);
        setRestaurants(featured.length > 0 ? featured : response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        // Fallback data
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const formatCuisine = (cuisines: string[]) => {
    if (!cuisines || cuisines.length === 0) return 'Multi Cuisine';
    return cuisines.map(c => c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')).join(', ');
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={IMAGES.restaurants}
          alt="Restaurant interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12"
        >
          <div>
            <span className="inline-block px-4 py-2 bg-luxury-gold/10 text-luxury-gold text-sm font-semibold rounded-full mb-4">
              Top Picks
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900">
              Featured <span className="text-luxury-gold">Restaurants</span>
            </h2>
          </div>
          <Link to="/restaurants" className="mt-6 md:mt-0">
            <motion.button
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-luxury-gold hover:text-luxury-gold/80 font-semibold transition-colors"
            >
              <span>View All Restaurants</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {restaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/restaurants/${restaurant.slug}`}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white text-luxury-gold font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Star className="w-4 h-4 fill-luxury-gold" />
                        <span>{restaurant.avg_rating.toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-luxury-gold transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-500 mt-1">{formatCuisine(restaurant.cuisines)}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        {restaurant.tags && restaurant.tags[0] && (
                          <>
                            <Award className="w-4 h-4" />
                            <span className="capitalize">{restaurant.tags[0].replace('-', ' ')}</span>
                          </>
                        )}
                      </div>
                      <span className="text-luxury-gold font-semibold">₹{restaurant.avg_price_for_two} for two</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
          {loading && (
            <div className="col-span-4 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading restaurants...</p>
            </div>
          )}
          {!loading && restaurants.length === 0 && (
            <div className="col-span-4 text-center py-12">
              <p className="text-gray-500">No restaurants found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Features Section - Full Screen
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: UtensilsCrossed,
      title: 'Easy Ordering',
      description: 'Browse menus, customize your order, and checkout in seconds with our intuitive interface',
      color: 'from-orange-400 to-red-500',
    },
    {
      icon: CalendarDays,
      title: 'Smart Reservations',
      description: 'Book tables instantly with our AI-powered allocation system that ensures the best seating',
      color: 'from-blue-400 to-indigo-500',
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track your order from kitchen to table with live updates and accurate ETAs',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: Award,
      title: 'Verified Reviews',
      description: 'Read authentic reviews from verified diners to make informed decisions',
      color: 'from-purple-400 to-pink-500',
    },
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center bg-white">
      <div className="absolute inset-0">
        <img 
          src={IMAGES.features}
          alt="Restaurant"
          className="w-full h-full object-cover opacity-10"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-luxury-gold/10 text-luxury-gold text-sm font-semibold rounded-full mb-4">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
            Designed for <span className="text-luxury-gold">Excellence</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every feature is crafted to enhance your dining experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center h-full border border-gray-100"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-20 h-20 mx-auto bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    { number: '01', title: 'Choose Restaurant', description: 'Browse through our curated list of premium restaurants' },
    { number: '02', title: 'Select & Customize', description: 'Pick your dishes and customize to your preference' },
    { number: '03', title: 'Book or Order', description: 'Reserve a table or place your order for delivery' },
    { number: '04', title: 'Enjoy!', description: 'Sit back and enjoy your exceptional dining experience' },
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center bg-gray-900">
      <div className="absolute inset-0">
        <img 
          src={IMAGES.cuisine}
          alt="Food"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-luxury-gold/20 text-luxury-gold text-sm font-semibold rounded-full mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
            How It <span className="text-luxury-gold">Works</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Get started with DineFlow in just four simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-luxury-gold to-transparent" />
              )}
              <div className="text-center">
                <div className="text-6xl font-bold text-luxury-gold/30 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/60">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section - Full Screen
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={IMAGES.cta}
          alt="Restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold/90 to-luxury-gold/70" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-8">
            Ready to Transform Your<br />Dining Experience?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Join thousands of food lovers who have discovered the joy of seamless dining with DineFlow
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-white text-luxury-gold font-bold rounded-full hover:bg-gray-100 transition-all shadow-2xl text-lg flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                <span>Get Started Free</span>
              </motion.button>
            </Link>
            <Link to="/restaurants">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-luxury-gold transition-all text-lg flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                <span>Explore Now</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer Section
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <span className="text-3xl font-serif font-bold text-luxury-gold">DineFlow</span>
            <p className="mt-4 text-gray-400 max-w-md">
              Your premium gateway to exceptional dining experiences. 
              Discover, book, and enjoy the finest restaurants.
            </p>
            <div className="flex gap-4 mt-6">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <a 
                  key={social}
                  href="#" 
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-luxury-gold transition-colors"
                >
                  <span className="sr-only">{social}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Restaurants', 'How it Works', 'Partner With Us', 'Careers'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-luxury-gold transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4 text-luxury-gold" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4 text-luxury-gold" />
                <span>hello@dineflow.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-luxury-gold" />
                <span>New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} DineFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <AboutSection />
      <CuisineSection />
      <FeaturedRestaurants />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
