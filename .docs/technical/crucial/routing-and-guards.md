# Routing and Guards

This document describes the route topology and route protection behavior.

## 1. Router Entry Point

Main route composition is in `src/App.tsx`.

Public routes:

- `/login`
- `/signup`
- `/forbidden`

Protected namespaces:

- `/admin/*` (admin-only)
- `/legacy/*` (authenticated legacy user flows)

## 2. Admin Route Tree

`/admin` is wrapped by `AdminRouteGuard` and `AdminLayout`.

Child pages:

- `/admin` (dashboard)
- `/admin/drivers`
- `/admin/passengers`
- `/admin/vehicles`
- `/admin/trips`
- `/admin/bookings`
- `/admin/reviews`
- `/admin/reports`
- `/admin/audit-logs`
- `/admin/status`

## 4. Legacy Route Tree

Legacy child routes are produced by `legacyRoutes()` in `src/legacy/routes.tsx`.

Mounted under `/legacy`:

- `/legacy/dashboard`
- `/legacy/book-ride`
- `/legacy/find-rides`
- `/legacy/offer-ride`
- `/legacy/create-trip`
- `/legacy/track-ride`
- `/legacy/my-rides`
- `/legacy/vehicles`
- `/legacy/profile`

Each legacy element is wrapped with:

1. `ProtectedRoute` (auth required)
2. `DeprecationBanner`

## 5. Legacy Short-Path Redirects

Legacy short paths are still accepted and redirected:

- `/dashboard` -> `/legacy/dashboard`
- `/book-ride` -> `/legacy/book-ride`
- `/find-rides` -> `/legacy/find-rides`
- `/offer-ride` -> `/legacy/offer-ride`
- `/create-trip` -> `/legacy/create-trip`
- `/track-ride` -> `/legacy/track-ride`
- `/my-rides` -> `/legacy/my-rides`
- `/vehicles` -> `/legacy/vehicles`
- `/profile` -> `/legacy/profile`

This avoids broken bookmarks and stale external links during transition.

## 6. Guard Behavior

### 6.1 `ProtectedRoute`

File: `src/components/ProtectedRoute.tsx`

Rule:

- If `isAuthenticated === false`: redirect to `/login`
- Else: render children

Used for legacy area and mobile shell paths.

### 6.2 `AdminRouteGuard`

File: `src/admin/guards/AdminRouteGuard.tsx`

Rules:

- If not authenticated: redirect to `/login`
- If authenticated but `isAdmin === false`: redirect to `/forbidden`
- Else: render children

This ensures admin routes are role-protected, not only session-protected.

## 7. Forbidden UX

File: `src/pages/Forbidden.tsx`

Purpose:

- Explicit user feedback when role does not have access
- Action path back to `/login`

### 7.1 Unsupported Role Policy (Approved)

If the frontend receives an authenticated user role that is not one of the supported
application roles, the user must be redirected to `/forbidden`.

Supported roles are:

- `ADMIN`
- `DRIVER`
- `PASSENGER`

Required message on forbidden screen for this case:

- `Only PASSENGER, DRIVER, and ADMIN roles are supported.`

## 8. Deprecation Banner Variants

File: `src/legacy/DeprecationBanner.tsx`

Supported variants:

- `deprecated`: page still works and is scheduled for removal
- `unavailable`: page is non-functional and scheduled for removal

Default variant is currently `deprecated`.

## 9. Current Gaps to Track

- `/signup` still posts through legacy API client instead of shared API client
- There is no catch-all `NotFound` route in `src/App.tsx` for unknown paths
- Guard unit tests are not yet present in repository tooling

Track closure in `.docs/product/tasks.md`.
