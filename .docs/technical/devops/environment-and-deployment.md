# Frontend Environment and Deployment

This document defines environment configuration, local development setup, and deployment considerations for `carsharing-frontend`.

## 1. Required Environment Variables

Environment template: `.env.example`

### `VITE_GOOGLE_MAPS_API_KEY`

- Used by legacy map and places components
- Required for map-related legacy screens

### `VITE_API_BASE_URL`

- Base URL prepended to gateway-relative service paths
- Read by `src/shared/api/client.ts`

Examples:

- Direct remote gateway: `http://34.54.55.0`
- Same-origin with Vite proxy: empty string
- Production custom domain: `https://api.your-domain.com`

## 2. Vite Proxy Configuration

File: `vite.config.ts`

Proxy prefixes configured:

- `/auth-service`
- `/user-service`
- `/trip-service`
- `/review-service`
- `/notification-service`

Purpose:

- Avoid CORS issues during local development
- Keep frontend request paths identical to production route format

## 3. Local Development Profiles

### Profile A: Direct Gateway URL

- Set `VITE_API_BASE_URL` to gateway host
- Frontend calls backend directly
- Requires CORS to allow frontend origin

### Profile B: Vite Proxy

- Set `VITE_API_BASE_URL=` (empty)
- Frontend sends relative paths
- Vite forwards service-prefixed routes to target gateway

## 4. Build and Runtime Commands

From `package.json`:

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run build:dev` - development-mode build
- `npm run preview` - preview production build locally
- `npm run lint` - static linting

## 5. Deployment Checklist

Before deploying:

1. Set `VITE_API_BASE_URL` for target environment
2. Confirm login + admin route guard behavior
4. Confirm health status page reaches target services
5. Confirm no hardcoded localhost URLs are used in active code paths

## 6. Security and Transport Notes

Mixed-content rule:

- If app is served over HTTPS and API base is HTTP, browser blocks requests
- Shared client emits explicit mixed-content hint

Session storage rule:

- JWT is persisted in `sessionStorage` (tab scoped)
- Logout clears both session key and stale legacy keys in `localStorage`

## 7. Current Configuration Caveat

`vite.config.ts` proxy target currently points to a remote host (`http://34.54.55.0`) despite comments that mention local gateway setup.

Recommendation:

- Parameterize proxy target via env variables (`VITE_GATEWAY_PROXY_TARGET`) for team-safe local/stage/prod switching.
