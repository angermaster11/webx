import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  ChefHat,
  Truck,
  Home,
  Star,
  MessageSquare,
} from 'lucide-react';
import { orderApi } from '@/services/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const orderStatuses = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await orderApi.getById(id!);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900/60 text-lg mb-4">Order not found</p>
          <Link to="/orders" className="px-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-xl hover:bg-[#B8960C] transition-colors">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = orderStatuses.findIndex(
    (s) => s.key === order.status
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Track Order
            </h1>
            <p className="text-gray-900/60 mt-1">
              Order #{order.order_number || order.id?.slice(-8)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg border border-gray-100 border border-gray-200 rounded-xl text-gray-900/70 hover:text-gray-900 transition-colors">
              <Phone className="w-4 h-4" />
              Call Restaurant
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg border border-gray-100 border border-gray-200 rounded-xl text-gray-900/70 hover:text-gray-900 transition-colors">
              <MessageSquare className="w-4 h-4" />
              Chat Support
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Status
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered'
                      ? 'bg-green-500/20 text-green-400'
                      : order.status === 'cancelled'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  }`}
                >
                  {order.status?.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              {/* Status Timeline */}
              <div className="relative">
                {orderStatuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = status.icon;

                  return (
                    <div key={status.key} className="flex items-start gap-4 pb-8 last:pb-0">
                      {/* Line */}
                      {index < orderStatuses.length - 1 && (
                        <div
                          className={`absolute left-5 ml-[-1px] w-0.5 h-8 top-[52px] ${
                            index < currentStatusIndex
                              ? 'bg-[#D4AF37]'
                              : 'bg-dark-border'
                          }`}
                          style={{ top: `${index * 64 + 40}px` }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-[#D4AF37]'
                            : 'bg-white shadow-lg border border-gray-100 border border-gray-200'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isCompleted ? 'text-white' : 'text-gray-900/40'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            isCompleted ? 'text-gray-900' : 'text-gray-900/40'
                          }`}
                        >
                          {status.label}
                        </p>
                        {isCurrent && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[#D4AF37] text-sm mt-1"
                          >
                            {status.key === 'preparing'
                              ? 'Your food is being prepared with love ❤️'
                              : status.key === 'out_for_delivery'
                              ? 'Your order is on the way!'
                              : 'In progress...'}
                          </motion.p>
                        )}
                        {isCompleted && index < currentStatusIndex && (
                          <p className="text-gray-900/40 text-sm mt-1">
                            Completed
                          </p>
                        )}
                      </div>

                      {/* Time */}
                      {isCompleted && (
                        <div className="text-gray-900/40 text-sm">
                          {index === 0
                            ? new Date(order.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '--:--'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estimated Time */}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-gray-900/60 text-sm">
                      Estimated Delivery Time
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {order.estimated_delivery_time || '30-40 mins'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                Delivery Address
              </h2>
              <p className="text-gray-900/70">
                {order.delivery_address || 'No address provided'}
              </p>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {(order.items || []).map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-b from-amber-50 to-white rounded-lg flex items-center justify-center text-gray-900 font-medium">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="text-gray-900">{item.name || 'Menu Item'}</p>
                        {item.special_instructions && (
                          <p className="text-gray-900/40 text-sm">
                            {item.special_instructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-900/60">
                      ₹{(item.unit_price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
                Payment Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-gray-900/60">
                  <span>Item Total</span>
                  <span>₹{order.subtotal?.toFixed(0) || '0'}</span>
                </div>
                <div className="flex items-center justify-between text-gray-900/60">
                  <span>Delivery Fee</span>
                  <span>₹{order.delivery_fee?.toFixed(0) || '40'}</span>
                </div>
                <div className="flex items-center justify-between text-gray-900/60">
                  <span>Taxes & Charges</span>
                  <span>₹{order.taxes?.toFixed(0) || '0'}</span>
                </div>
                <div className="h-px bg-dark-border" />
                <div className="flex items-center justify-between text-gray-900 font-bold text-lg">
                  <span>Total Paid</span>
                  <span className="text-[#D4AF37]">
                    ₹{order.total_amount?.toFixed(0) || '0'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl mb-6">
                <p className="text-green-400 text-sm text-center">
                  Payment Successful via {order.payment_method?.toUpperCase() || 'UPI'}
                </p>
              </div>

              {/* Actions */}
              {order.status === 'delivered' && (
                <div className="space-y-3">
                  <button className="w-full px-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-xl hover:bg-[#B8960C] transition-colors flex items-center justify-center gap-2">
                    <Star className="w-4 h-4" />
                    Rate Order
                  </button>
                  <Link
                    to={`/restaurants/${order.restaurant_id}`}
                    className="w-full py-3 border border-gray-200 rounded-xl text-gray-900/70 hover:text-gray-900 hover:bg-gray-50 transition-colors text-center block"
                  >
                    Order Again
                  </Link>
                </div>
              )}

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button className="w-full py-3 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
