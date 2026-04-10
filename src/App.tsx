import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider, { useAuth } from './contexts/AuthContext';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Forbidden from './pages/Forbidden';

// Role dashboards
import DriverDashboard from './pages/DriverDashboard';
import PassengerDashboard from './pages/PassengerDashboard';
import RoleRouteGuard from './components/RoleRouteGuard';
import ProtectedRoute from './components/ProtectedRoute';

// Feature pages — passenger
import FindRides from './pages/FindRides';

// Feature pages — driver
import RideOffering from './pages/RideOffering';
import CreateTrip from './pages/CreateTrip';
import Vehicles from './pages/Vehicles';
import RideTracking from './pages/RideTracking';

// Feature pages — shared
import MyRides from './pages/MyRides';
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

/** Role-aware redirect for /dashboard. */
function DashboardRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'DRIVER') return <Navigate to="/driver" replace />;
  if (role === 'PASSENGER') return <Navigate to="/passenger" replace />;
  return <Navigate to="/login" replace />;
}

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

              {/* Driver routes — role-guarded */}
              <Route
                path="/driver"
                element={
                  <RoleRouteGuard requiredRole="DRIVER">
                    <DriverDashboard />
                  </RoleRouteGuard>
                }
              />

              {/* Passenger routes — role-guarded */}
              <Route
                path="/passenger"
                element={
                  <RoleRouteGuard requiredRole="PASSENGER">
                    <PassengerDashboard />
                  </RoleRouteGuard>
                }
              />

              {/* /dashboard — role-aware redirect */}
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Passenger-only feature pages */}
              <Route path="/find-rides" element={<RoleRouteGuard requiredRole="PASSENGER"><FindRides /></RoleRouteGuard>} />

              {/* Driver-only feature pages */}
              <Route path="/offer-ride"  element={<RoleRouteGuard requiredRole="DRIVER"><RideOffering /></RoleRouteGuard>} />
              <Route path="/create-trip" element={<RoleRouteGuard requiredRole="DRIVER"><CreateTrip /></RoleRouteGuard>} />
              <Route path="/vehicles"    element={<RoleRouteGuard requiredRole="DRIVER"><Vehicles /></RoleRouteGuard>} />
              <Route path="/track-ride"  element={<RoleRouteGuard requiredRole="DRIVER"><RideTracking /></RoleRouteGuard>} />

              {/* Shared feature pages (any authenticated user) */}
              <Route path="/my-rides" element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
              <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
