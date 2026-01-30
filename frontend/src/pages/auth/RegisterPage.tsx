import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, Check } from 'lucide-react';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await authApi.register(registerData);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all outline-none";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
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
            Create Account
          </h2>
          <p className="text-gray-600 mb-8">
            Join us for an exceptional dining experience
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('full_name')}
                  type="text"
                  placeholder="Enter your full name"
                  className={inputClass}
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  className={inputClass}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="Enter your phone number"
                  className={inputClass}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.phone.message}
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
                  placeholder="Create a password"
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

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 pl-12 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-gray-300 bg-white text-luxury-gold focus:ring-luxury-gold"
              />
              <span className="text-gray-600 text-sm">
                I agree to the{' '}
                <Link to="/terms" className="text-luxury-gold hover:text-luxury-gold/80 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-luxury-gold hover:text-luxury-gold/80 font-medium">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-luxury-gold text-white font-semibold rounded-xl hover:bg-luxury-gold/90 transition-all shadow-lg shadow-luxury-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6">
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

            <div className="mt-6">
              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors bg-white">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                <span className="text-gray-700">Sign up with Google</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-luxury-gold hover:text-luxury-gold/80 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
          alt="Restaurant Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-luxury-gold/80 via-luxury-gold/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md p-8 text-right">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link to="/">
                <span className="text-5xl font-serif font-bold text-white drop-shadow-lg">
                  DineFlow
                </span>
              </Link>
              <p className="mt-6 text-xl text-white/90">
                Discover exceptional restaurants and book your perfect table in seconds.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-end space-x-3">
                  <span className="text-white flex items-center">
                    <Check className="w-5 h-5 mr-2 text-white" />
                    Find top restaurants
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <span className="text-white flex items-center">
                    <Check className="w-5 h-5 mr-2 text-white" />
                    Smart table booking
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <span className="text-white flex items-center">
                    <Check className="w-5 h-5 mr-2 text-white" />
                    Order food online
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
