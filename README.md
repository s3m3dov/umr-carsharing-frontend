# Carsharing Frontend

Admin-first React frontend for the UMR Carsharing platform.

## Overview

This application is the web client for the carsharing system. It is currently in an admin-first transition state:

- Primary surface: `/admin/*`
- Legacy surface (temporary): `/legacy/*`
- Root redirect controlled by feature flag `VITE_ADMIN_DEFAULT_ROUTE`

## Documentation

Comprehensive frontend documentation now lives under `.docs/`.

- Start here: [`.docs/INDEX.md`](.docs/INDEX.md)
- Architecture: [`.docs/technical/crucial/architecture.md`](.docs/technical/crucial/architecture.md)
- API integration: [`.docs/technical/crucial/api-guide.md`](.docs/technical/crucial/api-guide.md)
- Routing and guards: [`.docs/technical/crucial/routing-and-guards.md`](.docs/technical/crucial/routing-and-guards.md)
- Admin modules: [`.docs/technical/crucial/admin-modules.md`](.docs/technical/crucial/admin-modules.md)
- Environment and deployment: [`.docs/technical/devops/environment-and-deployment.md`](.docs/technical/devops/environment-and-deployment.md)
- Testing guide: [`.docs/technical/testing/testing.md`](.docs/technical/testing/testing.md)
- Product roadmap: [`.docs/product/roadmap.md`](.docs/product/roadmap.md)
- User flows: [`.docs/product/user-flows.md`](.docs/product/user-flows.md)
- Backlog tasks: [`.docs/product/tasks.md`](.docs/product/tasks.md)

Additional transition planning artifacts:

- [`.docs/product/execution-plan.md`](.docs/product/execution-plan.md)
- [`.docs/product/legacy-deprecation-policy.md`](.docs/product/legacy-deprecation-policy.md)
- [`.docs/services/backend-open-questions.md`](.docs/services/backend-open-questions.md)
- [`CHANGELOG.md`](CHANGELOG.md)

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router v6
- TanStack Query
- Tailwind CSS + shadcn/ui + Radix UI
- React Hook Form + Zod

## Project Structure

```text
src/
  admin/            # Admin routes, pages, API, shared components
  legacy/           # Legacy route namespace and deprecation wrappers
  shared/           # Shared API and auth utilities
  contexts/         # Auth context
  pages/            # Auth pages + legacy page components
  components/       # Reusable UI and wrappers
```

## Environment Variables

Use `.env.example` as the base.

- `VITE_API_BASE_URL` - API gateway base URL
- `VITE_ADMIN_DEFAULT_ROUTE` - root redirect flag
- `VITE_GOOGLE_MAPS_API_KEY` - required for map/places legacy pages

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Run dev server:

```bash
npm run dev
```

4. Build production bundle:

```bash
npm run build
```

## Available Scripts

- `npm run dev`
- `npm run build`
- `npm run build:dev`
- `npm run preview`
- `npm run lint`

## Current Notes

- Login/admin flows use the shared API client (`src/shared/api/*`).
- Some legacy flows still depend on old client code in `src/services/api.ts`.
- Transition and cleanup plan is documented in `.docs/product/tasks.md`.

## Contributors

- Hikmat Samadov
- Vipul Singh
