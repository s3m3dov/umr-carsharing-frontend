# Frontend API Integration Guide

This guide defines how the frontend communicates with backend services through the API Gateway.

## 1. Integration Principle

All frontend requests are sent to gateway-prefixed service routes:

- `/auth-service/*`
- `/user-service/*`
- `/trip-service/*`
- `/review-service/*`
- `/notification-service/*`

The client builds each URL as:

```text
${VITE_API_BASE_URL}${servicePrefixedPath}
```

## 2. Shared Client Components

Core files:

- `src/shared/api/client.ts`
- `src/shared/api/error-parser.ts`
- `src/shared/api/service-routes.ts`

### 2.1 Request Client (`client.ts`)

Responsibilities:

- Trim trailing slash from `VITE_API_BASE_URL`
- Attach JSON content headers
- Inject bearer token when present
- Catch network failures and emit friendly mixed-content hints

Supported methods:

- `apiClient.get<T>(path)`
- `apiClient.post<T>(path, body)`
- `apiClient.put<T>(path, body)`
- `apiClient.delete<T>(path)`

### 2.2 Response Parser (`error-parser.ts`)

Parser handles three backend response shapes:

1. Empty body (often gateway rejection)
2. JSON error body (service-level error)
3. JSON success envelope (`ApiResponseWrapper<T>`)

Behavior rules:

- `401`: clear session + redirect to `/login`
- Non-OK with empty body: synthesize status message (for example, `403 -> Access denied.`)
- Non-OK with JSON body: prefer `error.message`, fallback to `message`
- OK with envelope: return `json.data`

## 3. Authentication Model

Session token source: `src/shared/auth/session.ts`

On every request:

- If token exists, client sends `Authorization: Bearer <token>`
- If token missing, request is sent unauthenticated (public endpoints only)

Auth endpoints in route constants:

- `ROUTES.auth.login`
- `ROUTES.auth.signup`
- `ROUTES.auth.validate`
- `ROUTES.auth.resetPassword`
- `ROUTES.auth.resetPasswordConfirm`
- `ROUTES.auth.changePassword`

## 4. Admin Endpoint Map

Admin API constants (`ROUTES.admin`) map to:

- Drivers: `/user-service/api/admin/drivers`
- Passengers: `/user-service/api/admin/passengers`
- Vehicles: `/user-service/api/admin/vehicles`
- Trips: `/trip-service/api/admin/trips`
- Bookings: `/trip-service/api/admin/bookings`
- Reviews: `/review-service/api/admin/reviews`
- Reports: `/trip-service/api/admin/reports`
- Audit logs: `/trip-service/api/admin/audit-logs` (constant present)

Current implementation detail:

- Audit list/get currently use `${r.reports}/audit-logs` in `src/admin/api.ts`, which resolves to `/trip-service/api/admin/reports/audit-logs`.
- Keep this aligned with backend controller mapping and update `ROUTES.admin.auditLogs` usage once backend contract is finalized.

## 5. Admin API Layer (`src/admin/api.ts`)

`src/admin/api.ts` provides typed service wrappers for all admin pages.

### Drivers

- List, get, approve, reject, bulk approve/reject, update, delete

### Passengers

- List, get, create, update, delete

### Vehicles

- List, get, create, update, delete

### Trips

- List, upcoming, history, get, cancel

### Bookings

- List, get, update, cancel, by-passenger

### Reviews

- List, get, flag, publish, delete

### Reports

- Driver, booking, revenue, passenger reports

### Audit Logs

- List with filters and pagination
- Get by log id

## 6. DTO and Enum Contract

Primary frontend admin contracts are in `src/admin/types.ts`.

Important enums used in UI filtering and action gating:

- `DriverStatus`: `PENDING`, `ACTIVE`, `REJECTED`
- `TripStatus`: `CREATED`, `AVAILABLE`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `BookingStatus`: `REQUESTED`, `REJECTED`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `ReviewStatus`: `PENDING`, `PUBLISHED`, `FLAGGED`, `REMOVED`

## 7. Query Conventions

TanStack Query usage patterns in admin pages:

- List views include pagination in query key
- Mutations invalidate list-level keys (`['admin', '<module>']` or similar)
- Page defaults usually: `page = 0`, `size = 20`

Consistency recommendation:

- Normalize all admin query keys to a single shared convention under `.docs/product/tasks.md`

## 8. Legacy API Path

Legacy service file:

- `src/services/api.ts`

Current state:

- Uses hardcoded `http://localhost:8081/api`
- Uses old request envelope (`{ userId, requestContent }`)
- Uses old response shape (`success`, `responseContent`)

This file is retained for transition routes only and should not be used for new feature work.

## 9. Networking and Mixed Content Notes

If app is loaded over HTTPS and `VITE_API_BASE_URL` is HTTP:

- Browser may block requests due to mixed content
- `client.ts` returns a targeted hint telling developer to use HTTP app origin or enable HTTPS backend

## 10. API Troubleshooting Checklist

Use this checklist when requests fail:

1. Verify `VITE_API_BASE_URL` in `.env`
2. Confirm gateway is reachable (`/actuator/health`)
3. Check token presence in `sessionStorage`
4. Confirm `Authorization` header is present in network tab
5. Inspect whether failure is gateway-level empty body or service JSON error
6. Confirm frontend path matches backend controller route
