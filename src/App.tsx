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

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Placeholder for admin module pages not yet implemented (R4*)
function ComingSoon({ label }: { label: string }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">{label}</h2>
      <p className="text-muted-foreground mt-1 text-sm">This module is coming soon.</p>
    </div>
  );
}

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
                <Route path="drivers"    element={<ComingSoon label="Drivers" />} />
                <Route path="passengers" element={<ComingSoon label="Passengers" />} />
                <Route path="vehicles"   element={<ComingSoon label="Vehicles" />} />
                <Route path="trips"      element={<ComingSoon label="Trips" />} />
                <Route path="bookings"   element={<ComingSoon label="Bookings" />} />
                <Route path="reviews"    element={<ComingSoon label="Reviews" />} />
                <Route path="reports"    element={<ComingSoon label="Reports" />} />
                <Route path="audit-logs" element={<ComingSoon label="Audit Logs" />} />
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
