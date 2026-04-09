# Legacy Deprecation Policy

This policy governs the transition from legacy user flows to the admin-first frontend.

## 1. Objective

- Keep legacy user routes available under `/legacy/*` for one transition release cycle
- Prevent new feature work in legacy area
- Remove legacy routes and code after transition criteria are met

## 2. Transition Rules

1. New feature development is admin-only (`/admin/*`)
2. Legacy area is bugfix-only
3. Legacy pages must show deprecation messaging
4. Legacy pages that are broken against current backend must show `unavailable` messaging
5. Legacy routes are removed in the release after transition cycle

## 3. Route Inventory

| Current route | Legacy route | Replacement target | Current state |
| --- | --- | --- | --- |
| `/dashboard` | `/legacy/dashboard` | `/admin` | Deprecated transition route |
| `/book-ride` | `/legacy/book-ride` | Admin bookings/trips | Deprecated transition route |
| `/find-rides` | `/legacy/find-rides` | Admin trips | Deprecated transition route |
| `/offer-ride` | `/legacy/offer-ride` | Admin trips | Deprecated transition route |
| `/create-trip` | `/legacy/create-trip` | Admin trips | Deprecated transition route |
| `/track-ride` | `/legacy/track-ride` | Admin operations/status | Deprecated transition route |
| `/my-rides` | `/legacy/my-rides` | Admin bookings/trips | Deprecated transition route |
| `/vehicles` | `/legacy/vehicles` | Admin vehicles | Deprecated transition route |
| `/profile` | `/legacy/profile` | Admin user details | Deprecated transition route |

Compatibility note:

- Duplicate short paths remain intentionally redirected (`/book-ride` and `/find-rides`, `/offer-ride` and `/create-trip`) to avoid bookmark breakage.

## 4. UX Messaging

Deprecation banner variants:

- `deprecated`: "This screen is deprecated and will be removed in the next release."
- `unavailable`: "This screen is unavailable and will be removed in the next release."

Where a clear admin replacement exists, include a link/action to the replacement.

## 5. Functional Audit Requirement

Before release sign-off:

1. Validate each `/legacy/*` route against the current gateway
2. Record pass/fail status for each route
3. Switch banner variant to `unavailable` where route is known broken

Track this work in `.docs/product/tasks.md`.

## 6. Rollout and Rollback

- Root route behavior is controlled by `VITE_ADMIN_DEFAULT_ROUTE`
- Rollout sets default entry to admin
- Rollback switches default entry back to legacy

Important:

- Rollback is only useful if legacy routes are still operational enough for emergency use.

## 7. Exit Criteria for Legacy Removal

All must be true:

1. Admin modules cover required operations
2. No critical migration regressions remain open
3. Legacy functionality audit is complete
4. Product and engineering owners approve decommission

## 8. Decommission Scope

When criteria are met:

- Remove `/legacy/*` routes
- Remove short-path legacy redirects that are no longer needed
- Remove legacy API layer (`src/services/api.ts`) and legacy DTOs (`src/types/api.ts`)
- Keep migration summary in changelog
