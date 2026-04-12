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

The app is built with an admin-first focus while supporting core user flows for drivers and passengers.

- Canonical admin namespace: `/admin/*`
- User-facing routes: `/driver`, `/passenger`, `/find-rides`, `/offer-ride`, etc.

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
    DriverDashboard.tsx
    PassengerDashboard.tsx
    FindRides.tsx
    RideBooking.tsx
    RideOffering.tsx
    RideTracking.tsx
    MyRides.tsx
    Vehicles.tsx
    Profile.tsx

  components/
    ProtectedRoute.tsx         # Auth-only guard
    RoleRouteGuard.tsx         # Role-specific guard (DRIVER, PASSENGER)
    ui/*                       # shadcn/ui components

  App.tsx                      # Main route composition
```

## 4. Routing and Access Model

The app uses layered guards:

1. `ProtectedRoute` for authenticated pages
2. `RoleRouteGuard` for role-specific user pages
3. `AdminRouteGuard` for authenticated + ADMIN role pages

Role-forwarding policy for dashboard entry points:

- `ADMIN` users are forwarded to `/admin`
- `DRIVER` users are forwarded to `/driver`
- `PASSENGER` users are forwarded to `/passenger`
- Any unsupported role value must route to `/forbidden` with message:
  `Only PASSENGER, DRIVER, and ADMIN roles are supported.`

## 5. Data and API Flow

Request path:

1. UI action triggers TanStack Query query or mutation
2. Feature API builds URL and params
3. Shared client (`src/shared/api/client.ts`) attaches JSON headers and bearer token
4. Request is sent to `${VITE_API_BASE_URL}${gatewayRelativePath}`
5. `parseResponse` unwraps success envelope (`data`) or throws `ApiError`

Response handling model:

- Success: returns `data`
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

## 8. Development Constraints

- TypeScript strict mode is enabled.
- ESLint is used for code quality.
- The project uses a shared API client for all new integrations.
