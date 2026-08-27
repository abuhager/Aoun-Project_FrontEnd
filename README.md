# Aoun Frontend

The frontend application for **Aoun**, built with Next.js 16 App Router and TypeScript. It covers authentication, donation items and needs, bookings and handovers, conversations, notifications, profiles, and administrative workflows.

> Current status: the core product flows are complete. The project is undergoing cleanup, testing, and production-readiness work before a limited pilot. Optional demo login cards are disabled by default and configured only through server-side environment values.

## Requirements

- Node.js 20.19 or newer
- A local or test instance of the Aoun backend

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Update `NEXT_PUBLIC_API_URL` and `BACKEND_URL` in `.env.local` if the backend uses a different origin.

## Verification

```bash
npm run verify
npm run build
```

- `verify` runs ESLint, the TypeScript compiler, and all flow/regression tests.
- `build` creates the optimized production build and requires `NEXT_PUBLIC_API_URL`.

## Project structure

```text
public/                 Static assets used by the application
src/app/                App Router pages and layouts
src/components/         Shared UI components
src/config/             Route, feature, Socket.IO, and CSP configuration
src/context/            Authentication, Socket.IO, and platform configuration
src/hooks/              Shared hooks
src/lib/                API clients, validation, and utilities
src/types/              TypeScript contracts shared with the backend
test/                   Flow, accessibility, security, and regression tests
```

## Environment variables

Required and optional values are documented in [`.env.example`](.env.example). Never commit `.env.local`, Firebase keys, credentials, or other secrets. Demo login is enabled with `DEMO_LOGIN_ENABLED=true`; configure only the demo roles you want to display, and keep it disabled on any deployment that contains real user data.
