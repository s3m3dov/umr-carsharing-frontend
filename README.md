# Carsharing Frontend

Admin-first React frontend for the UMR Carsharing platform.

## Overview

This application is the web client for the carsharing system.

- Primary surface: `/admin/*`
- Root redirect goes to `/dashboard`

## Documentation

Comprehensive frontend documentation now lives under `.docs/`.

- Start here: [`.docs/INDEX.md`](.docs/INDEX.md)
- Architecture: [`.docs/technical/crucial/architecture.md`](.docs/technical/crucial/architecture.md)
- API integration: [`.docs/technical/crucial/api-guide.md`](.docs/technical/crucial/api-guide.md)
- Routing and guards: [`.docs/technical/crucial/routing-and-guards.md`](.docs/technical/crucial/routing-and-guards.md)
- Admin modules: [`.docs/technical/crucial/admin-modules.md`](.docs/technical/crucial/admin-modules.md)
- Environment and deployment: [`.docs/technical/devops/environment-and-deployment.md`](.docs/technical/devops/environment-and-deployment.md)
- Testing guide: [`.docs/technical/testing/testing.md`](.docs/technical/testing/testing.md)
- User flows: [`.docs/product/user-flows.md`](.docs/product/user-flows.md)

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
  shared/           # Shared API and auth utilities
  contexts/         # Auth context
  pages/            # Auth pages + user-facing page components
  components/       # Reusable UI and wrappers
```

## Environment Variables

Use `.env.example` as the base.

- `VITE_API_BASE_URL` - API gateway base URL
- `VITE_GOOGLE_MAPS_API_KEY` - required for map/places pages

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
- Role-based navigation is implemented:
    - `ADMIN` -> `/admin`
    - `DRIVER` -> `/driver`
    - `PASSENGER` -> `/passenger`

## Contributors

- Hikmat Samadov
- Vipul Singh
