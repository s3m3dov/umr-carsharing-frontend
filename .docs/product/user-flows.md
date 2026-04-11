# Frontend User Flows

This document captures the current user journeys in the frontend.

## 1. Admin Login Flow

1. User opens `/login`
2. User submits email and password
3. Frontend calls `POST /auth-service/api/auth/login`
4. On success, session token/role/email are saved in `sessionStorage`
5. If role is `ADMIN`, user is redirected to `/admin`
6. If role is not `ADMIN`, user is redirected to legacy dashboard path (`/dashboard` redirect chain currently ending at `/legacy/dashboard`)

Notes:

- `Login.tsx` already uses shared API client
- Redirect behavior for non-admin users should be reviewed for consistency with transition policy

## 1.1 Role-Based Dashboard Forwarding (Approved)

After successful authentication, dashboard forwarding must be role-based:

- `ADMIN` -> `/admin`
- `DRIVER` -> `/driver`
- `PASSENGER` -> `/passenger`

If backend returns any other role value, frontend must:

1. redirect user to `/forbidden`
2. show explicit message: `Only PASSENGER, DRIVER, and ADMIN roles are supported.`

## 2. Admin Access Guard Flow

1. User tries to open `/admin/*`
2. `AdminRouteGuard` checks session
3. If not authenticated -> redirect `/login`
4. If authenticated but non-admin -> redirect `/forbidden`
5. If admin -> render admin layout and target page

## 3. Admin Operational Flows

### 3.1 Drivers

- Filter by status
- Approve/reject pending records
- Run bulk approve/reject on selected rows
- Edit or delete records

### 3.2 Passengers

- View paginated list
- Create new passenger
- Edit passenger details
- Delete passenger

### 3.3 Vehicles

- View paginated list
- Register new vehicle
- Edit vehicle details
- Delete vehicle

### 3.4 Trips

- Browse all/upcoming/history tabs
- View detailed trip metadata
- Cancel trips in cancellable statuses

### 3.5 Bookings

- View paginated bookings
- Update booking status and requested seat count
- Cancel active bookings

### 3.6 Reviews

- Filter by moderation status
- Publish flagged/pending reviews
- Flag published/pending reviews
- Delete review

### 3.7 Reports and Audit

- View aggregated KPI cards
- Filter and browse audit logs
- Inspect service health status page

## 4. Legacy User Flow (Transition)

Legacy flows are preserved under `/legacy/*` with deprecation banner.

Examples:

- `/legacy/dashboard`
- `/legacy/book-ride`
- `/legacy/offer-ride`
- `/legacy/track-ride`
- `/legacy/my-rides`

Access rule:

- Requires authentication (`ProtectedRoute`)
- Does not enforce admin role

## 5. Signup Flow (Current Gap)

Current signup path:

1. User opens `/signup`
2. Form posts via legacy `apiService.signup`
3. Expects legacy response contract (`success`, `responseContent`)

Risk:

- This differs from login/shared-client contract and can fail against current backend contract.

Recommended target flow:

1. Move signup to shared client route constants
2. Parse `ApiResponseWrapper` success shape
3. Align user data fields with backend signup DTO
