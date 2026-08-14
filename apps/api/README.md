API (NestJS + TypeORM) scaffold

Quick start (local)

1. Copy `.env.example` to `.env` and edit DB settings.

2. From the workspace root use pnpm (recommended) or npm:

```bash
cd apps/api
pnpm install
pnpm start:dev
```

This starts a minimal API on port 3001 by default and exposes endpoints under the `/api` prefix, e.g. `POST /api/login`.

Notes
- This is a minimal scaffold: it includes a `User` entity and simple auth endpoints (`/login`, `/register`, `/user`, `/logout`).
- Use the root workspace `pnpm` to install from workspace context when appropriate.
