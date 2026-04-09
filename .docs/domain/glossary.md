# Frontend Domain Glossary

This glossary provides consistent terminology for frontend development and documentation.

| Term | Definition | Frontend Usage |
|------|------------|----------------|
| User | Any authenticated account in the platform | Session identity (`email`, `role`) |
| Admin | Platform operator with management permissions | Required role for `/admin/*` |
| Driver | User role that offers trips | Managed in admin drivers module |
| Passenger | User role that books rides | Managed in admin passengers module |
| Trip | Driver's published route with seat inventory | Listed in admin trips module |
| Booking | Passenger reservation inside a trip | Listed in admin bookings module |
| Ride | User-facing term often mapped to booking semantics | Mostly legacy page language |
| Review | Rating/comment between trip participants | Moderated in admin reviews module |
| Audit Log | Immutable record of admin/system action | Listed in admin audit logs module |
| Report | Aggregated business metrics | Presented in admin reports page |
| API Gateway | Single HTTP entry point for all services | `VITE_API_BASE_URL` target |
| Service Prefix | Path namespace per backend service | `/auth-service`, `/trip-service`, etc. |
| Session | Frontend-auth state container | Stored in `sessionStorage` |
| Guard | Route-level access check | `ProtectedRoute`, `AdminRouteGuard` |
| Legacy Route | Transition-era user flow path | `/legacy/*` namespace |
| Admin Route | Primary management UI route | `/admin/*` namespace |
| Deprecation Banner | Legacy warning wrapper component | `DeprecationBanner` |

## Enum Vocabulary

Key status enums used in frontend logic:

- `DriverStatus`: `PENDING`, `ACTIVE`, `REJECTED`
- `TripStatus`: `CREATED`, `AVAILABLE`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `BookingStatus`: `REQUESTED`, `REJECTED`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `ReviewStatus`: `PENDING`, `PUBLISHED`, `FLAGGED`, `REMOVED`

These must stay aligned with backend contracts to avoid action/filter mismatches.
