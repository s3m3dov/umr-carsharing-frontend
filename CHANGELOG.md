# Changelog

All notable changes to this project will be documented in this file.

The format is based on **Keep a Changelog**
<https://keepachangelog.com/en/1.1.0/>
and this project adheres to **Semantic Versioning**
<https://semver.org/spec/v2.0.0.html>

---

## [Unreleased]

---

## [v0.5.0] – Admin Panel, Legacy Migration & UI Polish (2026-04-08 to 2026-04-09)

**Author:** s3m3dov (Hikmat Samadov)

### Added

- **Admin module pages** — full implementation of all 8 previously-placeholder admin routes:
  - `AdminDrivers` — status filter (ALL/PENDING/ACTIVE/REJECTED), per-row approve/reject, bulk approve/reject with checkboxes, edit and delete dialogs
  - `AdminPassengers` — paginated list with create, edit, and delete dialogs
  - `AdminVehicles` — register/edit/delete with vehicle type select
  - `AdminTrips` — All/Upcoming/History tabs, status badges, cancel with confirmation, detail view dialog
  - `AdminBookings` — update status and seat count via dialog, cancel with confirmation
  - `AdminReviews` — status filter, flag/publish/delete actions per row with star rating display
  - `AdminReports` — four parallel-fetched KPI cards (driver performance, booking summary, revenue, passenger activity)
  - `AdminAuditLogs` — filterable log table (action, entity type, performer, date range) with 500 ms debounced text filter
- **Shared admin API layer** (`src/admin/api.ts`) — typed functions for all admin endpoints using `apiClient` and `service-routes`
- **Shared admin types** (`src/admin/types.ts`) — TypeScript interfaces for all backend DTOs and enums
- **Shared admin UI primitives** (`src/admin/shared/`):
  - `DataTable` — wraps `@tanstack/react-table` with optional row selection
  - `TableSkeleton` — variably-sized skeleton `TableBody` for loading states
  - `Pagination` — previous/next with item range display
  - `FilterBar` — composable horizontal filter row with optional clear button
  - `StatusBadge` + pre-built color maps for driver, trip, booking, and review status enums
  - `ActionButton` — button with optional inline `AlertDialog` confirmation
- **Legacy route migration** (R5):
  - All user-facing pages served under `/legacy/*` with a `DeprecationBanner`
  - Old short paths (`/dashboard`, `/book-ride`, etc.) redirect to `/legacy/*` equivalents
  - Both canonical and duplicate paths preserved (`/legacy/book-ride` and `/legacy/find-rides`)
  - Banner `variant` prop supports `deprecated` and `unavailable` messaging
- `@tanstack/react-table` dependency

### Changed

- `AdminDashboard` — colored icon containers per module, card hover lift with arrow indicator, welcome header with current date
- `AdminReports` — flat stat rows replaced with 2-column KPI stat grid; large `text-2xl` numbers; currency formatted via `Intl.NumberFormat`
- `AdminLayout` sidebar footer — replaced email text + full-width logout button with avatar (initials), truncated email, and ghost icon logout button with tooltip
- `App.tsx` — removed `ComingSoon` placeholder component; all 8 admin routes wired to real pages; legacy routes moved to `/legacy/*` with redirects
- Root `/` redirect now lands on `/legacy/dashboard` when `VITE_ADMIN_DEFAULT_ROUTE=false`

### Fixed

- `AdminBookings` — update dialog no longer fires a network request when no fields were changed, preventing spurious audit log entries on the backend
- `AdminVehicles` — edit dialog was using `useState()` as a side-effect hook to sync form state; replacing a vehicle selection would still show the previous vehicle's data. Corrected with `useEffect([vehicle])`
- `AdminVehicles` — register dialog had no reset on reopen; stale values persisted across open/close cycles. Fixed with `useEffect([open])`

---

## [v0.4.0] – Admin Foundation & API Client (2026-04-07 to 2026-04-08)

**Author:** s3m3dov (Hikmat Samadov)

### Added

- **Admin shell** — `AdminLayout` with sidebar navigation, `AdminRouteGuard` with role check (ADMIN only), `AdminDashboard` module overview, `AdminStatus` live service health monitor
- **Shared API client** (`src/shared/api/client.ts`) — `Authorization: Bearer` injection, mixed-content detection
- **Error parser** (`src/shared/api/error-parser.ts`) — handles three response shapes: empty body (gateway 403), JSON error body, and `ApiResponseWrapper<T>` success
- **Service routes** (`src/shared/api/service-routes.ts`) — gateway-relative paths for all backend services
- **Session module** (`src/shared/auth/session.ts`) — `sessionStorage`-backed session with `{ token, role, email }`; clears legacy `localStorage` keys on logout
- **Vite dev proxy** — forwards `/auth-service/**`, `/user-service/**`, `/trip-service/**`, `/review-service/**`, `/notification-service/**` to the API gateway
- `VITE_ADMIN_DEFAULT_ROUTE` feature flag in `.env.example`
- `Forbidden` page for non-admin role rejection

### Changed

- `AuthContext` — rewritten to consume new session module; exposes `token`, `role`, `email`, `isAdmin`
- `Login` and API client error handling — more descriptive error messages surfaced to the user
- `index.html` — updated title, description, and favicon

---

## [v0.3.0] – Core User Features & Driver Dashboard (2025-06-13 to 2025-06-16)

**Author:** VipulSingh-10

### Added

- Minimal driver/passenger dashboard (`Dashboard.tsx`) with upcoming rides and vehicle overview
- Separate pages for core user flows: Find Rides, Book Ride, Offer Ride / Create Trip, Track Ride, My Rides, Vehicles, Profile
- Google Maps Autocomplete integration (`PlacesAutocomplete` component, `@googlemaps/js-api-loader`)
- Mobile app scaffold with React Native / Capacitor (`MobileApp.tsx`, `MobileDashboard`)
- Persisted form input values in `RideOffering` and `FindRides` across re-renders
- `.env` added to `.gitignore`

### Fixed

- `PlacesAutocompleteProps` type mismatch
- Replaced deprecated `Autocomplete` with `PlaceAutocompleteElement`
- Google Maps TypeScript errors
- `AuthContext` and `Profile` component type errors

---

## [v0.2.0] – Backend Integration & Styling (2025-06-12 to 2025-06-13)

**Author:** gpt-engineer-app[bot] (Lovable)

### Added

- Frontend connected to backend API (`src/services/api.ts`)
- `AuthContext` with login/logout and `userId`-based session (localStorage)
- `ProtectedRoute` component

### Changed

- Frontend DTOs updated to match backend response shapes
- UI/UX and overall styling improvements

### Fixed

- Typo in `ErrorMessages`

---

## [v0.1.0] – Initial Setup (2025-06-12)

**Author:** gpt-engineer-app[bot] (Lovable)

### Added

- Project bootstrapped with Vite + React + TypeScript + shadcn/ui (`vite_react_shadcn_ts`)
- TanStack Query, React Hook Form, Zod, Radix UI, Lucide React, Tailwind CSS
- `@capacitor/android`, `@capacitor/ios` for cross-platform support
