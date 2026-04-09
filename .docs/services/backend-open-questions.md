# Backend Open Questions

These questions should be confirmed with backend owners to de-risk frontend integration.

## 1. Auth Principal Resolution

- Confirm whether `AuthController.changePassword()` receives a valid authenticated principal when requests pass only through gateway JWT validation.
- Clarify whether auth-service has its own JWT parsing/filter chain in addition to gateway validation.

## 2. Booking Update Contract

- Confirm exact `UpdateBookingRequest` schema.
- Confirm which booking fields are admin-mutable.
- Confirm validation constraints (status transitions, seat bounds, immutable fields).

## 3. JWT Lifecycle

- Confirm access token TTL.
- Confirm whether refresh token flow exists now or is planned.
- Confirm expected frontend behavior on expiry.

## 4. Admin-Created Passenger Lifecycle

- Clarify whether admin-created passengers can authenticate immediately.
- Clarify credential initialization path (temporary password, email flow, disabled until activation).

## 5. Error Shape Consistency

- Confirm exact body format for gateway-origin 403 responses (empty vs JSON payload).
- Confirm whether any other status codes may return empty bodies from gateway filters.

## 6. Audit Logs Route Contract

- Confirm canonical audit logs endpoint path:
  - `/trip-service/api/admin/audit-logs/**` or
  - `/trip-service/api/admin/reports/audit-logs/**`

Frontend should update `ROUTES.admin.auditLogs` and `src/admin/api.ts` to one canonical path after confirmation.

## 7. Signup Contract

- Confirm final request payload and response envelope for `/auth-service/api/auth/signup`.
- Confirm whether signup can return 201 with success envelope payload fields different from login.
