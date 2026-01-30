import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Phone, ArrowLeft } from 'lucide-react';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email_or_phone: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      const { access_token, user } = response.data;
      login(user, access_token);
      toast.success(`Welcome back, ${user.full_name}!`);
      
      // Redirect based on role
      if (user.role === 'super_admin') {
        navigate('/superadmin');
      } else if (user.role === 'restaurant_admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
          alt="Restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold/80 via-luxury-gold/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md p-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link to="/">
                <span className="text-5xl font-serif font-bold text-white drop-shadow-lg">
                  DineFlow
                </span>
              </Link>
              <p className="mt-6 text-xl text-white/90">
                Welcome back! Login to continue your culinary journey.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-luxury-gold mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Home</span>
          </Link>

          <div className="lg:hidden mb-8 text-center">
            <Link to="/">
              <span className="text-3xl font-serif font-bold text-luxury-gold">
                DineFlow
              </span>
            </Link>
          </div>

          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Sign In
          </h2>
          <p className="text-gray-600 mb-8">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email or Phone
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email_or_phone')}
                  type="text"
                  placeholder="Enter email or phone"
                  className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all outline-none"
                />
              </div>
              {errors.email_or_phone && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.email_or_phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pl-12 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 bg-white text-luxury-gold focus:ring-luxury-gold"
                />
                <span className="text-gray-600 text-sm">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-luxury-gold hover:text-luxury-gold/80 text-sm font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-luxury-gold text-white font-semibold rounded-xl hover:bg-luxury-gold/90 transition-all shadow-lg shadow-luxury-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors bg-white">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                <span className="text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors bg-white">
                <Phone className="w-5 h-5 mr-2 text-green-500" />
                <span className="text-gray-700">OTP Login</span>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-luxury-gold hover:text-luxury-gold/80 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
