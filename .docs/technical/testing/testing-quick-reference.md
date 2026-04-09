# Testing Quick Reference

Use this as a compact checklist while developing or preparing a release.

## 1. Local Quality Commands

Run from `carsharing-frontend/`:

```bash
npm install
npm run lint
npm run build
```

## 2. Manual Smoke Checklist

1. Open `/login` and log in as ADMIN
2. Verify redirect to `/admin` (or `/legacy/dashboard` depending on feature flag and role)
3. Open `/admin/status` and check all services resolve
4. Verify one list page per module loads successfully
5. Trigger one safe mutation (for example, update dialog open/cancel)

## 3. Guard Verification

1. Open `/admin` without session -> should redirect to `/login`
2. Log in with non-admin role and open `/admin` -> should redirect to `/forbidden`
3. Log in with admin role and open `/admin` -> should render dashboard

## 4. API and Error Verification

1. Confirm `Authorization: Bearer` header in admin API calls
2. Confirm error toast shown for failed request
3. Confirm 401 clears session and returns to `/login`

## 5. Environment Verification

1. Check `.env` values:
   - `VITE_API_BASE_URL`
   - `VITE_ADMIN_DEFAULT_ROUTE`
   - `VITE_GOOGLE_MAPS_API_KEY` (legacy pages only)
2. Confirm expected root redirect behavior at `/`

## 6. Release Gate Essentials

Before release, ensure all are true:

- `npm run lint` passes
- `npm run build` passes
- `/admin/*` guard behavior works for all role scenarios
- Legacy redirects still work (`/dashboard` -> `/legacy/dashboard`, etc.)
- No critical admin module regressions in manual smoke run
