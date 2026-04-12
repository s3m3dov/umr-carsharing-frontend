# Changelog

All notable changes to this project will be documented in this file.

The format is based on **Keep a Changelog**
<https://keepachangelog.com/en/1.1.0/>
and this project adheres to **Semantic Versioning**
<https://semver.org/spec/v2.0.0.html>

---

## [Unreleased]

---

## [v0.3.6] – Admin Feature Refinement (2026-04-12)

**Author:** s3m3dov (Hikmat Samadov)

### Removed

- **Admin Search Functionality** — Removed Driver ID search from `AdminTrips` and Passenger/Trip ID search from `AdminBookings` to simplify the interface.
- **Enforced Server-Side Sorting** — Removed default `desc(createdAt)` and `desc(timestamp)` sorting parameters from all Admin Dashboard API list endpoints.

### Changed

- **Admin API Cleanup** — Refactored `admin-api.ts` to remove hardcoded sort query parameters.

---

## [v0.3.5] – Documentation Cleanup & Legacy Removal (2026-04-12)

**Author:** s3m3dov (Hikmat Samadov)

### Removed

- **Legacy Documentation** — Deleted all "in-progress" and transition-related planning documents (`roadmap.md`, `tasks.md`, `execution-plan.md`, etc.).
- **Unused Source Files** — Deleted unused mobile-related and test scaffold files (`MobileApp.tsx`, `mobile.css`, `MobileDashboard.tsx`, `TestMapPage.tsx`).
- **Legacy Fallbacks** — Removed legacy API endpoint fallbacks from `passengerApi` and unused search route constants.

### Changed

- **Documentation Refresh** — Rewrote `README.md`, `INDEX.md`, and core technical docs to reflect a stable, admin-first architecture without "transition" terminology.
- **Session Management** — Simplified `session.ts` by removing legacy `localStorage` cleanup logic.

---

## [v0.3.4] – Branding & SEO Update (2026-04-12)

**Author:** s3m3dov (Hikmat Samadov)

### Features

- **Admin API Filtering** — Added filtering capabilities to `tripsApi` (by status, driverId) and `bookingsApi` (by status, passengerId, tripId) in the shared admin API layer.
- **Admin Filtering UI** — Implemented filter bars in `AdminTrips` and `AdminBookings` pages, allowing searching by status, driver ID, passenger ID, and trip ID.

### Added

- **OpenGraph image** — Custom SVG-based branding image for social sharing previews (`/og-image.svg`).

### Changed

- **SEO & Social Metadata** — Updated `index.html` to replace default boilerplate "Lovable" metadata with "Kamilli Ride" branding across title, author, OpenGraph, and Twitter tags.

---

## [v0.3.3] – Admin Sorting & Feature Polish (2026-04-11)

**Author:** s3m3dov (Hikmat Samadov)

### Added

- Added a full frontend documentation tree under `.docs/` (architecture, API integration, routing/guards, admin modules, environment, testing, roadmap, user flows, tasks, glossary, and backend integration matrix).

### Features

- **Reviews system** — new Reviews page and API endpoints for driver/passenger reviews:
  - View received reviews and leave reviews for completed trips
  - Rating display on driver and passenger dashboards
  - Reviews quick link module added to both dashboards
  - Review links in MyRides page for completed trips
- **Admin vehicle owner picker** — searchable dropdown to select vehicle owner when registering vehicles
- **Enhanced ride search** — improved API params building with fallback to legacy endpoint

### Changed

- **Admin API Sorting** — enforced server-side sorting by `desc(createdAt)` (or `desc(timestamp)` for audit logs) across all paginated Admin Dashboard list endpoints to ensure newest records appear first by default.
- Rewrote `README.md` to match the admin-first frontend direction and link to the new `.docs/` documentation index and key reference pages.
- Consolidated previous root-level AI planning documents into `.docs/` equivalents and removed obsolete planning files.
- Updated `RideLifecycleStatus` and `UserRole` enums across the codebase

---

## [v0.3.2] – Trip Maps, Dashboard Polish & Branding (2026-04-11)

**Author:** s3m3dov (Hikmat Samadov)

### Added

- **Trip map views** — interactive maps displaying trip routes using polylines:
  - `AdminTrips` — map view toggle in trip detail dialogs
  - `DriverTripView` — route visualization for drivers
  - `PassengerTripView` — route visualization for passengers with pickup/dropoff markers
- **Route geometry DTOs** — `routeGeometry` field added to ride and admin trip DTOs for polyline rendering
- **Health check & KPI stats** — `useAdminHealth` hook with 5-minute stale time; `useKpiStats` query for Admin Dashboard; error boundary wrapping
- **Actuator proxy** — `/actuator/health` proxied to API Gateway for service health monitoring
- **Kamilli Ride branding** — app shell title and branding updated across the application

### Changed

- **Root redirect** — removed `VITE_ADMIN_DEFAULT_ROUTE` feature flag; root now always redirects to `/dashboard`
- **Dashboard alignment** — refactored to unify driver and passenger dashboard styling with admin panel:
  - `Dashboard.tsx` streamlined, charts moved to Reports page
  - Status summary components aligned with health check design
  - Admin health summary polished with unified status badges
- **Sidebar alignment** — driver and passenger sidebar styled to match admin panel for visual consistency
- **Profile styling** — profile page and sidebar components updated to match admin panel design
- **Responsive filter layout** — audit log filter grid improved for better mobile/tablet responsiveness

### Fixed

- **Unit conversion** — admin trip distance (km) and duration (minutes) converted to display units (km/miles, min/hr)
- **Health query isolation** — admin health query keys isolated to prevent status-page crash from key collisions
- **Tooltip cursor** — tooltip indicators now use `cursor-help` for better affordance
- **API route alignment** — frontend API layer modernized to match backend routes and query parameters

---

## [v0.3.1] – Admin Panel, Legacy Migration & UI Polish (2026-04-08 to 2026-04-09)

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
### Fixed

- `AdminBookings` — update dialog no longer fires a network request when no fields were changed, preventing spurious audit log entries on the backend
- `AdminVehicles` — edit dialog was using `useState()` as a side-effect hook to sync form state; replacing a vehicle selection would still show the previous vehicle's data. Corrected with `useEffect([vehicle])`
- `AdminVehicles` — register dialog had no reset on reopen; stale values persisted across open/close cycles. Fixed with `useEffect([open])`

---

## [v0.3.0] – Admin Foundation & API Client (2026-04-07 to 2026-04-08)

**Author:** s3m3dov (Hikmat Samadov)

### Added

- **Admin shell** — `AdminLayout` with sidebar navigation, `AdminRouteGuard` with role check (ADMIN only), `AdminDashboard` module overview, `AdminStatus` live service health monitor
- **Shared API client** (`src/shared/api/client.ts`) — `Authorization: Bearer` injection, mixed-content detection
- **Error parser** (`src/shared/api/error-parser.ts`) — handles three response shapes: empty body (gateway 403), JSON error body, and `ApiResponseWrapper<T>` success
- **Service routes** (`src/shared/api/service-routes.ts`) — gateway-relative paths for all backend services
- **Session module** (`src/shared/auth/session.ts`) — `sessionStorage`-backed session with `{ token, role, email }`; clears legacy `localStorage` keys on logout
- **Vite dev proxy** — forwards `/auth-service/**`, `/user-service/**`, `/trip-service/**`, `/review-service/**`, `/notification-service/**` to the API gateway
- `Forbidden` page for non-admin role rejection

### Changed

- `AuthContext` — rewritten to consume new session module; exposes `token`, `role`, `email`, `isAdmin`
- `Login` and API client error handling — more descriptive error messages surfaced to the user
- `index.html` — updated title, description, and favicon

---

## [v0.2.0] – Core User Features & Driver Dashboard (2025-06-13 to 2025-06-16)

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

## [v0.1.1] – Backend Integration & Styling (2025-06-12 to 2025-06-13)

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
