import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ShoppingCart, User, 
  ChefHat, CalendarDays, MapPin, LogIn,
  UserPlus, Shield, Building2, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setIsLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLandingPage = location.pathname === '/';

  const navLinks = [
    { name: 'Restaurants', path: '/restaurants', icon: ChefHat },
    { name: 'Reservations', path: '/restaurants', icon: CalendarDays },
    { name: 'Offers', path: '/offers', icon: MapPin },
    { name: 'About', path: '/about', icon: null },
  ];

  // On landing page without scroll: transparent bg, white text
  // On landing page with scroll OR other pages: white bg, dark text
  const isTransparent = isLandingPage && !isScrolled;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? 'bg-gradient-to-b from-black/50 to-transparent'
            : 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center"
              >
                <span className={`text-3xl font-serif font-bold ${isTransparent ? 'text-white' : 'text-luxury-gold'}`}>
                  DineFlow
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`nav-link flex items-center space-x-1 font-medium transition-colors ${
                    isTransparent 
                      ? 'text-white/90 hover:text-luxury-gold' 
                      : 'text-gray-600 hover:text-luxury-gold'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link to="/cart">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-2 rounded-full transition-colors ${
                    isTransparent 
                      ? 'hover:bg-white/20 text-white' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-luxury-gold text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {cartItems}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center space-x-3">
                  <Link to="/dashboard">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                        isTransparent 
                          ? 'bg-white/20 text-white hover:bg-white/30' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{user?.full_name?.split(' ')[0]}</span>
                    </motion.div>
                  </Link>
                  {user?.role === 'restaurant_admin' && (
                    <Link to="/admin" className="px-4 py-2 bg-luxury-gold text-white text-sm font-semibold rounded-full hover:bg-luxury-gold/90 transition-colors">
                      Dashboard
                    </Link>
                  )}
                  {user?.role === 'super_admin' && (
                    <Link to="/superadmin" className="px-4 py-2 bg-luxury-gold text-white text-sm font-semibold rounded-full hover:bg-luxury-gold/90 transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={logout}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isTransparent 
                        ? 'text-white/80 hover:text-white hover:bg-white/20' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-3">
                  {/* Login Dropdown */}
                  <div className="relative" ref={loginDropdownRef}>
                    <button
                      onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                      className={`flex items-center space-x-1 px-4 py-2 rounded-full font-medium transition-colors ${
                        isTransparent 
                          ? 'text-white hover:bg-white/20' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>LOGIN / JOIN</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isLoginDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isLoginDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                          <div className="p-2">
                            <Link
                              to="/login"
                              onClick={() => setIsLoginDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                              <div className="w-10 h-10 bg-luxury-gold/10 rounded-full flex items-center justify-center">
                                <LogIn className="w-5 h-5 text-luxury-gold" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Customer Login</div>
                                <div className="text-xs text-gray-500">Order food & book tables</div>
                              </div>
                            </Link>
                            
                            <Link
                              to="/register"
                              onClick={() => setIsLoginDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Create Account</div>
                                <div className="text-xs text-gray-500">Join DineFlow today</div>
                              </div>
                            </Link>
                            
                            <div className="my-2 border-t border-gray-100" />
                            
                            <Link
                              to="/login?role=admin"
                              onClick={() => setIsLoginDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Restaurant Admin</div>
                                <div className="text-xs text-gray-500">Manage your restaurant</div>
                              </div>
                            </Link>
                            
                            <Link
                              to="/login?role=superadmin"
                              onClick={() => setIsLoginDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Super Admin</div>
                                <div className="text-xs text-gray-500">Platform management</div>
                              </div>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <Link to="/register" className="px-6 py-2 bg-luxury-gold text-white font-semibold rounded-full hover:bg-luxury-gold/90 transition-colors shadow-lg">
                    BOOK A TABLE
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-full transition-colors ${
                  isTransparent 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                  >
                    {link.icon && <link.icon className="w-5 h-5 text-luxury-gold" />}
                    <span className="font-medium">{link.name}</span>
                  </Link>
                ))}
                
                {!isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide px-3">Customer</p>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                    >
                      <LogIn className="w-5 h-5 text-luxury-gold" />
                      <span className="font-medium">Login</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center py-3 bg-luxury-gold text-white font-semibold rounded-full"
                    >
                      Sign Up
                    </Link>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide px-3 mb-3">Admin Access</p>
                      <Link
                        to="/login?role=admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                      >
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Restaurant Admin</span>
                      </Link>
                      <Link
                        to="/login?role=superadmin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                      >
                        <Shield className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Super Admin</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                    >
                      <User className="w-5 h-5 text-luxury-gold" />
                      <span className="font-medium">My Account</span>
                    </Link>
                    {user?.role === 'restaurant_admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                      >
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Restaurant Dashboard</span>
                      </Link>
                    )}
                    {user?.role === 'super_admin' && (
                      <Link
                        to="/superadmin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                      >
                        <Shield className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center space-x-3 p-3 hover:bg-red-50 rounded-xl transition-colors text-red-600"
                    >
                      <X className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar (only on non-landing pages) */}
      {!isLandingPage && <div className="h-20" />}
    </>
  );
}
