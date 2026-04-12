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
- `/driver/*` (driver-only)
- `/passenger/*` (passenger-only)

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

## 3. User Route Tree

User-facing pages are wrapped by either `ProtectedRoute`, `RoleRouteGuard`, or `AdminRouteGuard`.

- `/driver`: `RoleRouteGuard` (DRIVER)
- `/passenger`: `RoleRouteGuard` (PASSENGER)
- `/find-rides`: `RoleRouteGuard` (PASSENGER)
- `/offer-ride`: `RoleRouteGuard` (DRIVER)
- `/my-rides`: `ProtectedRoute` (Auth)
- `/profile`: `ProtectedRoute` (Auth)

## 4. Guard Behavior

### 4.1 `ProtectedRoute`

File: `src/components/ProtectedRoute.tsx`

Rule:

- If `isAuthenticated === false`: redirect to `/login`
- Else: render children

### 4.2 `RoleRouteGuard`

File: `src/components/RoleRouteGuard.tsx`

Rule:

- If not authenticated: redirect to `/login`
- If authenticated but role does not match `requiredRole`: redirect to `/forbidden`
- Else: render children

### 4.3 `AdminRouteGuard`

File: `src/admin/guards/AdminRouteGuard.tsx`

Rules:

- If not authenticated: redirect to `/login`
- If authenticated but `isAdmin === false`: redirect to `/forbidden`
- Else: render children

## 5. Forbidden UX

File: `src/pages/Forbidden.tsx`

Purpose:

- Explicit user feedback when role does not have access
- Action path back to `/login`

Supported roles are:

- `ADMIN`
- `DRIVER`
- `PASSENGER`

Message shown for unsupported roles or restricted access:

- `Only PASSENGER, DRIVER, and ADMIN roles are supported.`
