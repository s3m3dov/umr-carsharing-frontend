# Frontend to Backend Integration Matrix

This matrix maps frontend features to backend service endpoints through the API Gateway.

## 1. Gateway Strategy

All calls are made to:

```text
${VITE_API_BASE_URL}${service-prefixed-path}
```

Service prefixes:

- `/auth-service`
- `/user-service`
- `/trip-service`
- `/review-service`
- `/notification-service`

## 2. Auth Flows

| Frontend flow | Route constant | Gateway endpoint |
|---------------|----------------|------------------|
| Login | `ROUTES.auth.login` | `/auth-service/api/auth/login` |
| Signup (target) | `ROUTES.auth.signup` | `/auth-service/api/auth/signup` |
| Validate token | `ROUTES.auth.validate` | `/auth-service/api/auth/validate` |
| Reset password request | `ROUTES.auth.resetPassword` | `/auth-service/api/auth/reset-password` |
| Reset password confirm | `ROUTES.auth.resetPasswordConfirm` | `/auth-service/api/auth/reset-password/confirm` |
| Change password | `ROUTES.auth.changePassword` | `/auth-service/api/auth/change-password` |

## 3. Admin Flows

| Frontend module | Backend service | Endpoint family |
|-----------------|-----------------|-----------------|
| Drivers | User Service | `/user-service/api/admin/drivers/**` |
| Passengers | User Service | `/user-service/api/admin/passengers/**` |
| Vehicles | User Service | `/user-service/api/admin/vehicles/**` |
| Trips | Trip Service | `/trip-service/api/admin/trips/**` |
| Bookings | Trip Service | `/trip-service/api/admin/bookings/**` |
| Reviews | Review Service | `/review-service/api/admin/reviews/**` |
| Reports | Trip Service | `/trip-service/api/admin/reports/**` |
| Audit Logs | Trip Service | `/trip-service/api/admin/reports/audit-logs/**` (current implementation path) |

## 4. Health and Status

`/admin/status` currently queries actuator endpoints directly:

- `/actuator/health`
- `/auth-service/actuator/health`
- `/user-service/actuator/health`
- `/trip-service/actuator/health`
- `/review-service/actuator/health`
- `/notification-service/actuator/health`

## 5. Legacy Flow Mapping

Legacy frontend file: `src/services/api.ts`

Legacy calls currently use old path family such as:

- `/users/login`
- `/rides/find-ride`
- `/myrides/upcoming`
- `/ride/create-trip`

These are not aligned with the service-prefixed gateway model and should be considered transition-only behavior.

## 6. Alignment Risks

1. Signup uses legacy request/response contract
2. Audit logs route constant and implementation path are not unified
3. Legacy API file still contains hardcoded base URL

Treat these as high-priority contract stabilization tasks.
