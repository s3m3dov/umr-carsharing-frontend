import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Forbidden from './pages/Forbidden';

// Legacy user pages (kept at original paths; moved to /legacy/* in R5)
import Dashboard from './pages/Dashboard';
import RideBooking from './pages/RideBooking';
import RideOffering from './pages/RideOffering';
import RideTracking from './pages/RideTracking';
import MyRides from './pages/MyRides';
import Vehicles from './pages/Vehicles';
import Profile from './pages/Profile';

// Admin shell
import AdminRouteGuard from './admin/guards/AdminRouteGuard';
import AdminLayout from './admin/layout/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminStatus from './admin/pages/AdminStatus';
import AdminDrivers from './admin/pages/AdminDrivers';
import AdminPassengers from './admin/pages/AdminPassengers';
import AdminVehicles from './admin/pages/AdminVehicles';
import AdminTrips from './admin/pages/AdminTrips';
import AdminBookings from './admin/pages/AdminBookings';
import AdminReviews from './admin/pages/AdminReviews';
import AdminReports from './admin/pages/AdminReports';
import AdminAuditLogs from './admin/pages/AdminAuditLogs';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Feature flag: set VITE_ADMIN_DEFAULT_ROUTE=true to land admins on /admin by default.
const adminDefault = import.meta.env.VITE_ADMIN_DEFAULT_ROUTE === 'true';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forbidden" element={<Forbidden />} />

              {/* Root redirect — controlled by feature flag */}
              <Route
                path="/"
                element={<Navigate to={adminDefault ? '/admin' : '/dashboard'} replace />}
              />

              {/* Admin routes — role-guarded */}
              <Route
                path="/admin"
                element={
                  <AdminRouteGuard>
                    <AdminLayout />
                  </AdminRouteGuard>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="drivers"    element={<AdminDrivers />} />
                <Route path="passengers" element={<AdminPassengers />} />
                <Route path="vehicles"   element={<AdminVehicles />} />
                <Route path="trips"      element={<AdminTrips />} />
                <Route path="bookings"   element={<AdminBookings />} />
                <Route path="reviews"    element={<AdminReviews />} />
                <Route path="reports"    element={<AdminReports />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="status"     element={<AdminStatus />} />
              </Route>

              {/* Legacy user routes (kept at original paths; deprecated; moved in R5) */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/book-ride"  element={<ProtectedRoute><RideBooking /></ProtectedRoute>} />
              <Route path="/find-rides" element={<ProtectedRoute><RideBooking /></ProtectedRoute>} />
              <Route path="/offer-ride" element={<ProtectedRoute><RideOffering /></ProtectedRoute>} />
              <Route path="/create-trip" element={<ProtectedRoute><RideOffering /></ProtectedRoute>} />
              <Route path="/track-ride" element={<ProtectedRoute><RideTracking /></ProtectedRoute>} />
              <Route path="/my-rides"   element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
              <Route path="/vehicles"   element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
              <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
