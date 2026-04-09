# Frontend Product Roadmap

This roadmap tracks the frontend transition to an admin-first model and follow-up hardening work.

## Phase 0 - Baseline (Completed)

- React + TypeScript + Vite foundation established
- Legacy user-facing pages implemented
- Initial backend integration added in legacy service layer

## Phase 1 - Admin Foundation (Completed)

- Shared API client introduced (`src/shared/api/client.ts`)
- Centralized response parser introduced (`src/shared/api/error-parser.ts`)
- Session model moved to `sessionStorage` (`src/shared/auth/session.ts`)
- Admin route guard and forbidden page implemented
- Admin shell and navigation implemented
- `VITE_ADMIN_DEFAULT_ROUTE` feature flag added

## Phase 2 - Admin Modules (Completed)

- Drivers module
- Passengers module
- Vehicles module
- Trips module
- Bookings module
- Reviews module
- Reports module
- Audit logs module
- Service status page

## Phase 3 - Legacy Transition (In Progress)

- Legacy routes moved under `/legacy/*`
- Short-path redirects retained for compatibility
- Deprecation banner introduced

Remaining transition tasks:

- Complete functionality audit for each legacy route against current gateway
- Mark non-functional legacy pages with `unavailable` variant
- Remove stale legacy API dependencies where safe

## Phase 4 - Contract and Quality Hardening (Planned)

High-priority actions:

1. Migrate signup to shared API client and current backend contract
2. Resolve audit log endpoint path consistency (`reports/audit-logs` vs dedicated path constant)
3. Standardize query keys and mutation invalidation conventions
4. Expand shared component usage across all admin pages
5. Add first-class automated tests (guards + parser + smoke flows)

## Phase 5 - Release Readiness (Planned)

Goals:

- Stable admin-first release with controlled fallback
- Documented and tested rollback behavior via feature flag
- Reproducible environment and validation checklist

Exit criteria:

- No critical guard or auth regressions
- Admin core modules validated end-to-end
- Legacy area either stabilized for one cycle or explicitly marked unavailable

## Phase 6 - Post-Transition Cleanup (Planned)

- Remove `/legacy/*` route tree after transition window
- Remove old API service and DTO models (`src/services/api.ts`, `src/types/api.ts`)
- Remove legacy-only UI dependencies that are no longer used
- Finalize docs for admin-only frontend surface
