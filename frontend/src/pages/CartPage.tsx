import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, restaurant, updateQuantity, removeItem, clearCart, getSubtotal } =
    useCartStore();
  
  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 mx-auto mb-6 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center"
          >
            <ShoppingCart className="w-12 h-12 text-gray-900/40" />
          </motion.div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-900/60 mb-8">
            Looks like you haven't added any items to your cart yet.
            Start exploring our restaurants!
          </p>
          <Link to="/restaurants" className="px-6 py-3 bg-[#D4AF37] text-gray-900 font-semibold rounded-xl hover:bg-[#B8960C] transition-colors">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = 40;
  const taxes = subtotal * 0.05;
  const grandTotal = subtotal + deliveryFee + taxes;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Your Cart
            </h1>
            {restaurant && (
              <p className="text-gray-900/60 mt-1">
                from{' '}
                <Link
                  to={`/restaurants/${restaurant.id}`}
                  className="text-[#D4AF37] hover:text-primary-400"
                >
                  {restaurant.name}
                </Link>
              </p>
            )}
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.menuItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex gap-4"
              >
                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                  <img
                    src={
                      item.menuItem.image_url ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'
                    }
                    alt={item.menuItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {item.menuItem.food_type === 'veg' || item.menuItem.food_type === 'vegan' ? (
                          <span className="w-4 h-4 border-2 border-green-500 rounded flex items-center justify-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900">
                          {item.menuItem.name}
                        </h3>
                      </div>
                      {item.menuItem.description && (
                        <p className="text-gray-900/50 text-sm mt-1 line-clamp-1">
                          {item.menuItem.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.menuItem.id)}
                      className="p-1 text-gray-900/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-lg font-bold text-[#D4AF37]">
                      ₹{(item.menuItem.final_price * item.quantity).toFixed(0)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-gradient-to-b from-amber-50 to-white border border-gray-200 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.menuItem.id, item.quantity - 1)
                        }
                        className="p-2 text-gray-900/60 hover:text-gray-900 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-gray-900 font-medium min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.menuItem.id, item.quantity + 1)
                        }
                        className="p-2 text-gray-900/60 hover:text-gray-900 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add More Items */}
            {restaurant && (
              <Link
                to={`/restaurants/${restaurant.id}`}
                className="block p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-luxury-gold/50 transition-colors"
              >
                <Plus className="w-6 h-6 mx-auto text-gray-900/40 mb-2" />
                <p className="text-gray-900/60">Add more items</p>
              </Link>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Delivery Address */}
              <div className="p-4 bg-gradient-to-b from-amber-50 to-white rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">Deliver to</p>
                    <p className="text-gray-900/60 text-sm mt-1">
                      Add delivery address
                    </p>
                    <button className="text-[#D4AF37] text-sm mt-2 hover:text-primary-400">
                      Add Address
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-gray-900/60">
                  <span>Item Total</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-900/60">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex items-center justify-between text-gray-900/60">
                  <span>Taxes & Charges</span>
                  <span>₹{taxes.toFixed(0)}</span>
                </div>
                <div className="h-px bg-dark-border" />
                <div className="flex items-center justify-between text-gray-900 font-bold text-lg">
                  <span>Grand Total</span>
                  <span className="text-[#D4AF37]">
                    ₹{grandTotal.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Offer */}
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>You're saving ₹50 on this order!</span>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
                className="w-full px-6 py-3 bg-[#D4AF37] text-gray-900 font-semibold rounded-xl hover:bg-[#B8960C] transition-colors py-4 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-900/40 text-sm text-center">
                  We accept all major payment methods
                </p>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png"
                    alt="Visa"
                    className="h-6 opacity-50"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1200px-MasterCard_Logo.svg.png"
                    alt="Mastercard"
                    className="h-6 opacity-50"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png"
                    alt="UPI"
                    className="h-6 opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
