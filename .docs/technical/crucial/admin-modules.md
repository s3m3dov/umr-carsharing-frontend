# Admin Modules Reference

This document summarizes each implemented admin module and its frontend integration surface.

## 1. Dashboard (`/admin`)

File:

- `src/admin/pages/AdminDashboard.tsx`

Responsibilities:

- Landing page for admins
- Module entry cards with descriptions
- Current date display

## 2. Drivers (`/admin/drivers`)

File:

- `src/admin/pages/AdminDrivers.tsx`

Capabilities:

- Paginated driver list
- Status filter (`ALL`, `PENDING`, `ACTIVE`, `REJECTED`)
- Row selection with bulk approve/reject
- Per-row approve/reject for pending drivers
- Edit driver dialog
- Delete driver confirmation

API usage:

- `driversApi.list/get/approve/reject/bulkApprove/bulkReject/update/delete`

## 3. Passengers (`/admin/passengers`)

File:

- `src/admin/pages/AdminPassengers.tsx`

Capabilities:

- Paginated passenger list
- Create passenger dialog
- Edit passenger dialog
- Delete passenger confirmation

API usage:

- `passengersApi.list/get/create/update/delete`

## 4. Vehicles (`/admin/vehicles`)

File:

- `src/admin/pages/AdminVehicles.tsx`

Capabilities:

- Paginated vehicle list
- Register vehicle dialog
- Edit vehicle dialog
- Delete vehicle confirmation

API usage:

- `vehiclesApi.list/get/create/update/delete`

## 5. Trips (`/admin/trips`)

File:

- `src/admin/pages/AdminTrips.tsx`

Capabilities:

- Tabbed views: all/upcoming/history
- Status badges
- Trip details dialog
- Cancel action for cancellable statuses (`AVAILABLE`, `CREATED`)

API usage:

- `tripsApi.list/upcoming/history/get/cancel`

## 6. Bookings (`/admin/bookings`)

File:

- `src/admin/pages/AdminBookings.tsx`

Capabilities:

- Paginated booking list
- Status badges and seat data
- Update booking dialog (`status`, `requestedSeats`)
- Cancel booking confirmation for non-final states

API usage:

- `bookingsApi.list/get/update/cancel/byPassenger`

## 7. Reviews (`/admin/reviews`)

File:

- `src/admin/pages/AdminReviews.tsx`

Capabilities:

- Paginated review list
- Status filter (`ALL`, `PENDING`, `PUBLISHED`, `FLAGGED`, `REMOVED`)
- Per-row publish/flag/delete actions
- Star rating rendering
- Tooltip for long comments

API usage:

- `reviewsApi.list/get/flag/publish/delete`

## 8. Reports (`/admin/reports`)

File:

- `src/admin/pages/AdminReports.tsx`

Capabilities:

- Parallel-fetch report cards
- Driver performance stats
- Booking summary stats
- Revenue metrics (EUR formatting)
- Passenger activity stats

API usage:

- `reportsApi.drivers/bookings/revenue/passengers`

## 9. Audit Logs (`/admin/audit-logs`)

File:

- `src/admin/pages/AdminAuditLogs.tsx`

Capabilities:

- Paginated audit log list
- Filters by action, entity type, performed-by
- Debounced text filter (500 ms)
- Action/entity badges and truncated details

API usage:

- `auditLogsApi.list/get`

## 10. Status (`/admin/status`)

File:

- `src/admin/pages/AdminStatus.tsx`

Capabilities:

- Polls gateway and service health endpoints
- Displays per-service status and response latency
- Global operational summary banner
- Manual refresh action

Data source:

- Direct `fetch` against `${VITE_API_BASE_URL}${healthPath}`

## 11. Shared Admin UI Primitives

Files:

- `src/admin/shared/DataTable.tsx`
- `src/admin/shared/TableSkeleton.tsx`
- `src/admin/shared/FilterBar.tsx`
- `src/admin/shared/Pagination.tsx`
- `src/admin/shared/ActionButton.tsx`
- `src/admin/shared/StatusBadge.tsx`
- `src/admin/shared/index.ts`

Current usage note:

- Not all admin pages are fully standardized on the shared wrappers yet; some pages still use direct table/dialog composition.
- Consolidating page implementations onto these primitives is recommended for long-term maintenance.

## 12. Module-Level Consistency Checklist

When extending any admin module, keep the following consistent:

1. Query keys include pagination/filter params
2. Mutations invalidate module-level query prefix
3. All destructive actions require explicit confirmation
4. Loading, empty, and error states are implemented
5. Status badges map backend enums exactly
