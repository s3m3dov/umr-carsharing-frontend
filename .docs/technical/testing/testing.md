# Frontend Testing Guide

This document describes testing status, current quality checks, and recommended test strategy for `carsharing-frontend`.

## 1. Current State

At the moment, frontend test tooling is not fully wired:

- No `test` script in `package.json`
- No Vitest configuration committed
- No Playwright configuration committed
- No React Testing Library suites committed

Current automated quality checks are:

- TypeScript compile via build (`vite build`)
- ESLint (`npm run lint`)

## 2. Existing Manual Validation Paths

Given current tooling, the project relies on manual validation for:

- Login and session behavior
- Route guard behavior (`/admin/*`, `/legacy/*`)
- CRUD/mutation behavior in admin pages
- Error handling and toast feedback
- Service health monitoring page behavior

## 3. Recommended Test Pyramid

### 3.1 Unit and Component Tests (Vitest + RTL)

Priority targets:

1. `AdminRouteGuard` behavior matrix
2. `ProtectedRoute` redirect behavior
3. `parseResponse` in `src/shared/api/error-parser.ts`
4. Session helpers in `src/shared/auth/session.ts`
5. Shared admin components in `src/admin/shared/*`

### 3.2 Integration Tests (React pages + mocked API)

Priority targets:

1. Login success and role-based navigation
2. Admin page list loading + empty/error states
3. Mutation flows with cache invalidation
4. Legacy route wrappers showing deprecation banners

### 3.3 E2E Tests (Playwright)

Priority smoke flows:

1. Unauthenticated to `/admin` -> `/login`
2. Non-admin to `/admin` -> `/forbidden`
3. Admin login -> `/admin` dashboard
4. One CRUD mutation path per major module
5. Root redirect behavior for both `VITE_ADMIN_DEFAULT_ROUTE` values

## 4. High-Value Test Cases

## Auth and Session

- 401 response triggers session clear + redirect
- Bearer token attached on authenticated requests
- Logout clears session and legacy localStorage keys

## Error Parsing

- Empty-body 403 returns synthesized message
- JSON error body extracts `error.message`
- Success envelope returns `data`

## Routing and Guards

- `/admin/*` rejects unauthenticated users
- `/admin/*` rejects authenticated non-admin users
- `/legacy/*` requires authentication but not admin role

## Admin Modules

- Pagination controls request next pages correctly
- Status filters update query keys and results
- Destructive actions require confirmation

## 5. Contract Regression Checks

Because frontend/backend contracts are evolving, include these recurring checks:

1. DTO compatibility between `src/admin/types.ts` and backend responses
2. Endpoint path alignment in `src/shared/api/service-routes.ts`
3. HTTP method correctness for cancel/delete endpoints
4. Enum value drift detection for statuses

## 6. Suggested Minimal Tooling Additions

Recommended baseline:

- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `jsdom`
- `playwright`

Suggested scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

## 7. Definition of Done for Test Baseline

A practical baseline is complete when:

1. Guard tests exist and pass
2. Error parser tests exist and pass
3. At least one admin page integration test exists
4. At least one Playwright smoke flow exists
5. CI runs lint, build, and test commands
