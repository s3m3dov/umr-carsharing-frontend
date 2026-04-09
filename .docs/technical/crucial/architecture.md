# Frontend Architecture

This document describes the current architecture of `carsharing-frontend`.

## 1. System Context

The frontend is a React + TypeScript SPA that integrates with the carsharing backend through the API Gateway.

- Runtime: Vite + React 18
- Data fetching: TanStack Query
- Routing: React Router v6
- UI primitives: Tailwind CSS + shadcn/ui + Radix
- Authentication: JWT persisted in `sessionStorage`
- Backend integration model: service-prefixed gateway routes

## 2. High-Level App Shape

The app is currently admin-first with a legacy transition area.

- Canonical admin namespace: `/admin/*`
- Legacy namespace: `/legacy/*`
- Legacy short paths remain as redirects for one transition cycle

Root routing behavior is controlled by `VITE_ADMIN_DEFAULT_ROUTE`:

- `true`: `/` redirects to `/admin`
- `false`: `/` redirects to `/legacy/dashboard`

## 3. Directory Structure

Primary frontend layout:

```text
src/
  admin/
    api.ts                     # Typed admin API layer
    types.ts                   # Admin DTOs and enums
    guards/
      AdminRouteGuard.tsx      # ADMIN-only route guard
    layout/
      AdminLayout.tsx          # Sidebar shell + outlet
    pages/
      AdminDashboard.tsx
      AdminDrivers.tsx
      AdminPassengers.tsx
      AdminVehicles.tsx
      AdminTrips.tsx
      AdminBookings.tsx
      AdminReviews.tsx
      AdminReports.tsx
      AdminAuditLogs.tsx
      AdminStatus.tsx
    shared/
      DataTable.tsx
      TableSkeleton.tsx
      FilterBar.tsx
      Pagination.tsx
      ActionButton.tsx
      StatusBadge.tsx

  legacy/
    routes.tsx                 # Legacy route declarations
    DeprecationBanner.tsx      # Banner wrapper for legacy pages

  shared/
    api/
      client.ts                # Base request logic + auth header injection
      error-parser.ts          # Envelope + error shape parser
      service-routes.ts        # Gateway-relative route constants
    auth/
      session.ts               # sessionStorage auth source of truth

  contexts/
    AuthContext.tsx            # React context wrapper around shared session

  pages/
    Login.tsx
    Signup.tsx
    Forbidden.tsx
    Dashboard.tsx              # Legacy pages
    RideBooking.tsx
    RideOffering.tsx
    RideTracking.tsx
    MyRides.tsx
    Vehicles.tsx
    Profile.tsx

  components/
    ProtectedRoute.tsx         # Auth-only guard used by legacy area
    ui/*                       # shadcn/ui components

  App.tsx                      # Main route composition
```

## 4. Routing and Access Model

The app uses layered guards:

1. `ProtectedRoute` for authenticated legacy pages
2. `AdminRouteGuard` for authenticated + ADMIN role pages

Flow for admin route access:

- No session token: redirect to `/login`
- Session role not `ADMIN`: redirect to `/forbidden`
- Valid `ADMIN` session: render `AdminLayout` and child page

## 5. Data and API Flow

Request path:

1. UI action triggers TanStack Query query or mutation
2. Feature API (`src/admin/api.ts`) builds URL and params
3. Shared client (`src/shared/api/client.ts`) attaches JSON headers and bearer token
4. Request is sent to `${VITE_API_BASE_URL}${gatewayRelativePath}`
5. `parseResponse` unwraps success envelope (`data`) or throws `ApiError`

Response handling model:

- Success: `ApiResponseWrapper<T>` -> returns `data`
- Service error body: extracts `error.message` or fallback message
- Gateway empty-body error (for example 403): synthesizes status-based message
- 401: clears session and redirects to `/login`

## 6. Auth and Session Model

The frontend stores auth in `sessionStorage` under a single key.

`Session` shape:

```ts
interface Session {
  token: string;
  role: 'ADMIN' | 'DRIVER' | 'PASSENGER';
  email: string;
}
```

Auth context derives:

- `isAuthenticated` from token presence
- `isAdmin` from role equality (`ADMIN`)

Logout behavior:

- Removes session key
- Clears legacy `localStorage` keys (`carpoolUserId`, `carpoolUser`)

## 7. UI Layer Composition

Admin pages follow a consistent pattern:

- Header + summary count
- Query-backed table/list
- Loading state (`TableSkeleton`)
- Empty state
- Error state
- Modal/dialog based mutation actions
- Pagination controls

Common admin pages implemented:

- Users: drivers, passengers
- Fleet: vehicles
- Operations: trips, bookings
- Moderation: reviews
- Analytics: reports
- Compliance: audit logs
- Runtime checks: service status

## 8. Legacy Transition Layer

Legacy pages are still present under `/legacy/*` and wrapped with `DeprecationBanner`.

Short route redirects retained:

- `/dashboard` -> `/legacy/dashboard`
- `/book-ride` -> `/legacy/book-ride`
- `/find-rides` -> `/legacy/find-rides`
- `/offer-ride` -> `/legacy/offer-ride`
- `/create-trip` -> `/legacy/create-trip`
- `/track-ride` -> `/legacy/track-ride`
- `/my-rides` -> `/legacy/my-rides`
- `/vehicles` -> `/legacy/vehicles`
- `/profile` -> `/legacy/profile`

## 9. Mobile Shell Note

`src/MobileApp.tsx` still exists for legacy mobile route composition, but the current web app entry is `src/App.tsx`.

Treat `MobileApp.tsx` as transition scope unless mobile-specific requirements are reactivated.

## 10. Architecture Constraints

Known constraints worth tracking:

- Signup currently uses legacy client code in `src/services/api.ts`, unlike login/admin flow
- No automated test suite is wired in `package.json` yet
- Legacy area still depends on old DTO model and API assumptions

These are tracked in product/task docs under `.docs/product/`.
