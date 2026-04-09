/**
 * Legacy user-facing routes, preserved at /legacy/* for one release cycle.
 *
 * All routes carry a deprecation banner.  Once the R0-VERIFY legacy audit
 * confirms which pages are non-functional, set variant="unavailable" on
 * those specific routes.
 *
 * Removal target: Release N+1.
 */
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DeprecationBanner } from './DeprecationBanner';

import Dashboard from '@/pages/Dashboard';
import RideBooking from '@/pages/RideBooking';
import RideOffering from '@/pages/RideOffering';
import RideTracking from '@/pages/RideTracking';
import MyRides from '@/pages/MyRides';
import Vehicles from '@/pages/Vehicles';
import Profile from '@/pages/Profile';

function wrap(element: React.ReactElement) {
  return (
    <ProtectedRoute>
      <DeprecationBanner>{element}</DeprecationBanner>
    </ProtectedRoute>
  );
}

/**
 * Returns all /legacy/* child <Route> elements.
 * Mount these inside a parent <Route path="/legacy"> in App.tsx.
 */
export function legacyRoutes() {
  return (
    <>
      <Route path="dashboard"   element={wrap(<Dashboard />)} />

      {/* Book / Find rides — two canonical paths, same screen */}
      <Route path="book-ride"   element={wrap(<RideBooking />)} />
      <Route path="find-rides"  element={wrap(<RideBooking />)} />

      {/* Offer / Create trip — two canonical paths, same screen */}
      <Route path="offer-ride"  element={wrap(<RideOffering />)} />
      <Route path="create-trip" element={wrap(<RideOffering />)} />

      <Route path="track-ride"  element={wrap(<RideTracking />)} />
      <Route path="my-rides"    element={wrap(<MyRides />)} />
      <Route path="vehicles"    element={wrap(<Vehicles />)} />
      <Route path="profile"     element={wrap(<Profile />)} />
    </>
  );
}
