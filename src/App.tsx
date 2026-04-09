import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from './contexts/AuthContext';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Forbidden from './pages/Forbidden';

// Legacy routes (moved to /legacy/* in R5; old paths now redirect)
import { legacyRoutes } from './legacy/routes';

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
                element={<Navigate to={adminDefault ? '/admin' : '/legacy/dashboard'} replace />}
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

              {/* Legacy routes — canonical paths under /legacy/* */}
              <Route path="/legacy">{legacyRoutes()}</Route>

              {/* Short-path redirects → /legacy/* (kept for one release cycle) */}
              <Route path="/dashboard"  element={<Navigate to="/legacy/dashboard"   replace />} />
              <Route path="/book-ride"  element={<Navigate to="/legacy/book-ride"   replace />} />
              <Route path="/find-rides" element={<Navigate to="/legacy/find-rides"  replace />} />
              <Route path="/offer-ride" element={<Navigate to="/legacy/offer-ride"  replace />} />
              <Route path="/create-trip"element={<Navigate to="/legacy/create-trip" replace />} />
              <Route path="/track-ride" element={<Navigate to="/legacy/track-ride"  replace />} />
              <Route path="/my-rides"   element={<Navigate to="/legacy/my-rides"    replace />} />
              <Route path="/vehicles"   element={<Navigate to="/legacy/vehicles"    replace />} />
              <Route path="/profile"    element={<Navigate to="/legacy/profile"     replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
