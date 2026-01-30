import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuthStore } from './store/authStore';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const RestaurantsPage = lazy(() => import('./pages/RestaurantsPage'));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const CustomerDashboard = lazy(() => import('./pages/dashboard/CustomerDashboard'));

// Admin Pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const NewAdminDashboard = lazy(() => import('./pages/admin/NewAdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/admin/SuperAdminDashboard'));

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Admin Protected Route
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated || (user?.role !== 'restaurant_admin' && user?.role !== 'super_admin')) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderTrackingPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Login Route */}
        <Route path="/admin" element={<AdminLoginPage />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <NewAdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <AdminProtectedRoute>
            <NewAdminDashboard />
          </AdminProtectedRoute>
        } />

        {/* Super Admin Routes */}
        <Route path="/superadmin/*" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
