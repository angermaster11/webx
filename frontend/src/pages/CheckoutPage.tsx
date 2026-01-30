import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  CreditCard,
  Wallet,
  Building,
  ChevronRight,
  Check,
  Plus,
  Edit2,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { orderApi } from '@/services/api';
import toast from 'react-hot-toast';

const paymentMethods = [
  {
    id: 'upi',
    name: 'UPI',
    icon: Wallet,
    description: 'Pay via Google Pay, PhonePe, Paytm',
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, RuPay',
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: Building,
    description: 'All major banks supported',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: Wallet,
    description: 'Pay when you receive',
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, restaurant, restaurantId, clearCart, getSubtotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const subtotal = getSubtotal();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    address: '',
    city: '',
    pincode: '',
  });

  // Demo addresses
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      label: 'Home',
      address: '123, ABC Street, XYZ Colony',
      city: 'Mumbai',
      pincode: '400001',
    },
    {
      id: '2',
      label: 'Office',
      address: '456, DEF Tower, GHI Business Park',
      city: 'Mumbai',
      pincode: '400002',
    },
  ]);

  // Debug logging for cart state
  console.log('🛒 Checkout Page - Cart State:');
  console.log('   restaurantId:', restaurantId);
  console.log('   restaurant:', restaurant);
  console.log('   items count:', items.length);
  console.log('   items:', items);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/checkout' } });
    return null;
  }

  const deliveryFee = 40;
  const taxes = subtotal * 0.05;
  const grandTotal = subtotal + deliveryFee + taxes;

  const handleAddAddress = () => {
    if (!newAddress.address || !newAddress.city || !newAddress.pincode) {
      toast.error('Please fill all address fields');
      return;
    }
    const id = Date.now().toString();
    setAddresses([...addresses, { ...newAddress, id }]);
    setSelectedAddress(id);
    setShowAddressForm(false);
    setNewAddress({ label: 'Home', address: '', city: '', pincode: '' });
    toast.success('Address added successfully');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    // Use restaurantId from cart, fallback to restaurant.id if available
    const orderRestaurantId = restaurantId || restaurant?.id;
    
    if (!orderRestaurantId) {
      console.error('❌ No restaurant ID found in cart!');
      console.log('restaurantId:', restaurantId);
      console.log('restaurant:', restaurant);
      toast.error('Restaurant information missing. Please add items to cart again.');
      return;
    }

    setIsLoading(true);
    try {
      const address = addresses.find((a) => a.id === selectedAddress);
      const orderData = {
        restaurant_id: orderRestaurantId,
        items: items.map((item) => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          unit_price: item.menuItem.final_price || item.menuItem.base_price,
          special_instructions: item.specialInstructions || '',
        })),
        delivery_address: `${address?.address}, ${address?.city} - ${address?.pincode}`,
        payment_method: selectedPayment,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        taxes: taxes,
        total_amount: grandTotal,
      };

      console.log('='.repeat(50));
      console.log('🛒 PLACING ORDER');
      console.log('='.repeat(50));
      console.log('Order Data:', JSON.stringify(orderData, null, 2));
      console.log('Restaurant ID:', orderRestaurantId);
      console.log('Items Count:', items.length);
      
      const response = await orderApi.create(orderData);
      console.log('✅ Order Response:', response.data);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.id}`);
    } catch (error: any) {
      console.error('❌ Order Error:', error);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                  Delivery Address
                </h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-[#D4AF37] hover:text-primary-400 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>

              {/* Address List */}
              <div className="space-y-3">
                {addresses.map((address) => (
                  <motion.div
                    key={address.id}
                    onClick={() => setSelectedAddress(address.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      selectedAddress === address.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-gray-200 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAddress === address.id
                              ? 'border-[#D4AF37] bg-[#D4AF37]'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedAddress === address.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <span className="px-2 py-0.5 bg-amber-100 text-gray-700 text-xs rounded font-medium">
                            {address.label}
                          </span>
                          <p className="text-gray-900 mt-2">{address.address}</p>
                          <p className="text-gray-500 text-sm">
                            {address.city} - {address.pincode}
                          </p>
                        </div>
                      </div>
                      <span 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-gradient-to-b from-amber-50 to-white rounded-xl"
                >
                  <h3 className="text-gray-900 font-medium mb-4">Add New Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-gray-900/60 text-sm mb-1">
                        Label
                      </label>
                      <select
                        value={newAddress.label}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, label: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-white text-gray-900"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-900/60 text-sm mb-1">
                        Address
                      </label>
                      <textarea
                        value={newAddress.address}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, address: e.target.value })
                        }
                        placeholder="House no., Street, Locality"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-white text-gray-900 resize-none h-20"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-900/60 text-sm mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        placeholder="City"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-900/60 text-sm mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={newAddress.pincode}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, pincode: e.target.value })
                        }
                        placeholder="Pincode"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={handleAddAddress}
                      className="px-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-xl hover:bg-[#B8960C] transition-colors py-2 px-4"
                    >
                      Save Address
                    </button>
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="py-2 px-4 text-gray-900/60 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                Payment Method
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedPayment === method.id
                        ? 'border-luxury-gold bg-[#D4AF37]/10'
                        : 'border-gray-200 hover:border-luxury-gold/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === method.id
                            ? 'border-luxury-gold bg-[#D4AF37]'
                            : 'border-gray-200'
                        }`}
                      >
                        {selectedPayment === method.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <method.icon className="w-6 h-6 text-gray-900/60" />
                      <div>
                        <p className="text-gray-900 font-medium">{method.name}</p>
                        <p className="text-gray-900/50 text-sm">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Items ({items.length})
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-b from-amber-50 to-white rounded text-sm font-medium text-gray-900">
                        {item.quantity}x
                      </div>
                      <span className="text-gray-900">{item.menuItem.name}</span>
                    </div>
                    <span className="text-gray-900/60">
                      ₹{(item.menuItem.final_price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Restaurant Info */}
              {restaurant && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-b from-amber-50 to-white rounded-xl mb-6">
                  <img
                    src={
                      restaurant.logo_url ||
                      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'
                    }
                    alt={restaurant.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-gray-900 font-medium">{restaurant.name}</p>
                    <p className="text-gray-900/50 text-sm">Multi-location</p>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-gray-900/60">
                  <span>Item Total ({items.length} items)</span>
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
                  <span>Total</span>
                  <span className="text-[#D4AF37]">
                    ₹{grandTotal.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={isLoading || !selectedAddress}
                className="w-full px-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-xl hover:bg-[#B8960C] transition-colors py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  'Placing Order...'
                ) : (
                  <>
                    <span>Place Order</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <p className="text-gray-900/40 text-xs text-center mt-4">
                By placing this order, you agree to our Terms of Service and
                Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
