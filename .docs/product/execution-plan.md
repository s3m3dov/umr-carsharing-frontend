# Frontend Execution Plan

This plan consolidates the previous AI planning notes into a single implementation sequence.

## 1. Delivery Graph

Recommended sequence:

```text
R0 -> R0-VERIFY -> R0.5 -> R1 -> R1-SMOKE -> R2 -> R3 -> R3.5
                                                         |-> R4A (parallel)
                                                         |-> R4B (parallel)
                                                         |-> R4C (parallel; needs BQ-2)
                                                         |-> R4D (parallel)
                                                         |-> R5  (parallel with R4*)
                                                              -> R6
```

## 2. Phase Definitions

### R0 - Docs Baseline

- Lock migration decisions and risk register
- Confirm route policy (`/admin/*` primary, `/legacy/*` transition)

### R0-VERIFY - Contract and Legacy Verification

- Collect backend owner answers for blocking questions
- Audit each legacy route against live gateway behavior
- Decide per-page message (`deprecated` vs `unavailable`)

### R0.5 - Environment Bootstrap

- Validate `.env.example` variables
- Confirm proxy/base URL behavior in local dev
- Verify gateway health access from frontend dev setup

### R1 - Shared API and Auth Foundation

- Shared API client and parser as source of truth
- Session model in `sessionStorage`
- Auth header injection and 401 handling

### R1-SMOKE - Integration Smoke

- Login -> store token -> call admin endpoint
- Validate parser behavior for empty-body 403 and invalid-token 401

### R2 - Routing, Guard, Shell, Feature Flag

- Finalize `/admin/*` route tree
- Ensure guard matrix works (unauthenticated, non-admin, admin)
- Root redirect goes to `/dashboard`

### R3 - Tooling and Quality Foundation

- OpenAPI/codegen baseline
- Test tooling baseline (Vitest/RTL/Playwright)

### R3.5 - Shared Admin UI Primitives

- Stabilize shared table/filter/pagination/action components
- Gate parallel module work on this baseline

### R4A-D - Domain Modules (Parallel)

- R4A: drivers/passengers
- R4B: vehicles
- R4C: trips/bookings (after booking DTO confirmation)
- R4D: reviews/reports/audit logs

### R5 - Legacy Migration (Parallel with R4)

- Route and banner handling
- Redirect compatibility paths
- No new features in legacy area

### R6 - Integration and Release Gate

- Merge tracks
- Run validation checks
- Manual QA and release checklist sign-off

## 3. Shared-File Ownership Rule

To reduce merge churn:

- Coordinator-owned files: `src/App.tsx`, auth/session shared files, shared API files, package/tooling config
- Module track changes should stay in module scope unless explicitly assigned

## 4. Must-Pass Release Gates

1. Admin guard enforces role correctly
2. Authorization header present on admin API calls
3. Shared parser handles success + JSON error + empty-body error
4. No active hardcoded API URLs in current execution paths
5. Root redirect flag works in both states

## 5. Stop-Ship Conditions

Any of these block release:

1. Non-admin user can access `/admin/*` content
2. Unauthenticated user can access protected routes without redirect
3. JWT not attached to admin requests
4. Critical admin modules fail core read/write flows
5. Rollback path is unverified and unavailable
