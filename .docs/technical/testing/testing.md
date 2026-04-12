# Frontend Testing Guide

This document describes the quality checks and recommended test strategy for `carsharing-frontend`.

## 1. Quality Checks

Current automated quality checks are:

- TypeScript compilation (`npm run build`)
- Linting (`npm run lint`)

## 2. Recommended Test Strategy

### 2.1 Unit and Component Tests (Vitest + React Testing Library)

Priority targets:

1. `AdminRouteGuard` and `RoleRouteGuard` behavior
2. `ProtectedRoute` redirect behavior
3. `parseResponse` in `src/shared/api/error-parser.ts`
4. Session helpers in `src/shared/auth/session.ts`
5. Shared UI components

### 2.2 E2E Tests (Playwright)

Priority smoke flows:

1. Unauthenticated redirect to `/login`
2. Non-admin redirect to `/forbidden`
3. Admin login and dashboard access
4. Driver/Passenger login and dashboard access

## 3. High-Value Test Cases

### Auth and Session

- 401 response triggers session clear + redirect
- Bearer token attached on authenticated requests
- Logout clears session

### Error Parsing

- Empty-body 403 returns synthesized message
- JSON error body extracts `error.message`
- Success envelope returns `data`

### Routing and Guards

- `/admin/*` rejects unauthenticated users
- `/admin/*` rejects authenticated non-admin users
- Role-specific pages reject incorrect roles
