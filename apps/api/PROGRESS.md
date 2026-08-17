# MCOM API — Development Progress

Tracked per the backend plan (Phases 1–11). Keep this file updated after every completed task.

> Last updated: 2026-08-17 (session: pino removal, PROGRESS tracker, health endpoints, .gitignore/AGENTS.md, naming-convention audit + fixes)
> Working branch: `logic`
> Latest commits: `7901753` (gitignore + health endpoints), `2e0d7af` (progress tracker), `1715f46` (pino removal)

---

## Phase Status Overview

| Phase | Status |
|-------|--------|
| 1 — Foundation | ✅ Complete |
| 2 — Authentication & Identity | 🟡 In progress (auth core done) |
| 3 — Businesses | ⬜ Not started |
| 4 — Core Cards | ⬜ Not started |
| 5 — Business Features | ⬜ Not started |
| 6 — Membership Ecosystem | ⬜ Not started |
| 7 — Financial Ecosystem | ⬜ Not started |
| 8 — Relationships | ⬜ Not started |
| 9 — Growth | ⬜ Not started |
| 10 — Admin | ⬜ Not started |
| 11 — Production Hardening | ⬜ Not started |

---

## Phase 1 — Foundation ✅

- NestJS 10 app with global `/api` prefix, port 3001
- TypeORM + PostgreSQL (`data-source.ts`, migrations, `synchronize` disabled in prod)
- Joi env validation (`JWT_SECRET` required); `.env` config
- Global `ValidationPipe` (whitelist + forbidNonWhitelisted + transform)
- `AllExceptionsFilter` + `TransformInterceptor` → `{ success, message, data }` envelope
- `ThrottlerGuard` (20 req/60s), `helmet()`, request-id middleware, env-driven CORS
- Swagger at `/api/docs` (non-prod)
- Health endpoints (`/api/` liveness, `/api/health` DB ping via Terminus)
- Migration `1690000000000-InitUsersRoles0001` → `users`, `roles`, `user_roles`
- Idempotent seed script (admin role + admin user)
- CI workflow (`api-ci.yml`): tsc + migrations

## Phase 2 — Authentication & Identity 🟡

### Done
- `User` entity (`users` table)
- `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/user`
- bcryptjs password hashing, JWT sign/verify
- `JwtStrategy` (passport-jwt) + `JwtAuthGuard`
- Login/Register DTOs (class-validator)
- `UserResponseDto` (snake_case JSON contract: `is_admin`, `created_at`, `updated_at`)
- Naming-convention audit fixes: JWT claim `user_id`, removed duplicate `jwt.guard.ts`, `appDataSource`, descriptive vars
- `@CurrentUser()` decorator (typed, no `any`), `private readonly authService`
- Full Swagger docs on all auth endpoints: `@ApiBody` examples (admin/user test payloads), envelope + DTO response schemas, bearer auth — verified at `/api/docs-json` and E2E tested (register → login → `/user`)
- Security fixes: register race-condition → catches DB unique violation (23505) and returns 400; login timing attack → dummy bcrypt compare when user not found (prevents user enumeration)
- `name` → `firstName`/`lastName` across API (entity, RegisterDto, UserResponseDto, auth.service/controller, seed) + migration `1712000000000-RenameUserNameToFirstLastName` with data migration of existing rows
- Request logging (NestJS built-in `Logger`, pino removed): `http-logger.middleware.ts` logs single-line JSON per request (request_id, method, path, status, duration_ms, ip, user_agent, user_id) wired in `main.ts` after request-id; `AllExceptionsFilter` logs 5xx with stack. No bodies/passwords/tokens logged.
- Error response de-duplicated: `error` field is now the HTTP status category ("Bad Request", "Unauthorized") via `http.STATUS_CODES`, `message` is the human detail — matches NestJS default shape. Bare exceptions get meaningful fallback messages (401 → "Authentication required", etc.) via `FALLBACK_MESSAGES` map.
- 401 edge cases now distinct: guard `handleRequest` → "Token has expired" / "Invalid token" / "Authentication required"; strategy → "User not found" when token is valid but account is gone. Removed dead `getUserFromToken`.
- Success envelope now `{ data, message, statusCode, success }` (matches `successResponse` mat). HTTP codes aligned: login/logout 200, register 201, payload `statusCode` reflects actual HTTP status.
- Users table normalized to production schema (migration `1712000000001-NormalizeUsersTable`): `id` UUID (default `gen_random_uuid()`), `password_hash`, `first_name`/`last_name`/`phone`/`status` snake_case columns, `created_at`/`updated_at`; `isAdmin` dropped (admin comes back via RBAC roles). `user_roles.user_id` converted to uuid + FK rebuilt. UserResponseDto now snake_case (`first_name`, `last_name`, `phone`, `status`), id is a UUID string, JWT `user_id` claim is now a UUID.

### Remaining
1. `Role` + `UserRole` entities with relations → migration
2. Roles service/module (list, assign, remove)
3. `@Roles()` decorator + `RolesGuard` + permission checks
4. Refresh token flow (`POST /auth/refresh`)
5. Password reset (`POST /auth/forgot-password`, `POST /auth/reset-password`)
6. Email verification (`POST /auth/verify-email`)
7. `/users/me` profile endpoints (GET/PATCH + settings)

---

## Pending Decisions / Questions

- Refresh tokens: stateless JWT vs stored refresh token table — **decide before implementing**
- Email verification/password reset: needs an email provider — **decision needed** (abstraction per plan §29)
- `CORS_ORIGINS` is read in `main.ts` but missing from Joi schema — **fix**
- `config/configuration.ts` is dead code (AppModule reads `process.env` directly) — **fix or wire up**

---

## Known Issues

- Response envelope mismatch: API returns `{ success, message, data: { token, user } }` but web `authService` expects `{ user, token }` at top level — needs frontend alignment or endpoint wrapper change
- Frontend alignment pending: API now uses `firstName`/`lastName` but web `User` type + register page still send/expect `name`; web `services/auth.ts` still calls `/login`, `/register`, `/user` (API routes unchanged for now)
- `tsconfig.tsbuildinfo` is untracked (gitignored build artifact)
- `user_roles` table uses Postgres-style snake_case FKs (`user_id`, `role_id`) while `users`/`roles` use camelCase — intentional (new-schema guidance), revisit when entities are built

---

## Session Start Checklist

1. Read this file.
2. Read `AGENTS.md` (root) — local workflow notes.
3. Check `git status` / `git log` for uncommitted work.
4. Confirm DB is running (`docker compose up -d` if needed) before migration/seed tasks.
5. Verify with `pnpm --filter api exec tsc --noEmit` after changes.