# MCOM API — Development Progress

Tracked per the backend plan (Phases 1–11). Keep this file updated after every completed task.

> Last updated: 2026-08-18 (session: password reset + profile/settings + Phase 3 Businesses)
> Working branch: `logic`
> Latest commits: `0ce968d` (password reset + change password + `/users/me` profile/settings), `e969643` (RBAC), `47b35db` (email verification, dedicated modules, `lib/`)

---

## Phase Status Overview

| Phase | Status |
|-------|--------|
| 1 — Foundation | ✅ Complete |
| 2 — Authentication & Identity (incl. Roles/RBAC) | ✅ Complete |
| 3 — Businesses | ✅ Complete |
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

## Phase 2 — Authentication & Identity ✅

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
- Refresh tokens (DB-backed, migration `1712000000002-CreateRefreshTokensTable`): opaque 48-byte token, SHA-256 hash stored (`token_hash` unique), 7d TTL (`REFRESH_TOKEN_EXPIRES_IN`), rotation on every refresh (`replaced_by` chain), reuse of a rotated/revoked token revokes ALL user sessions (theft detection), logout revokes the supplied token. Access token stays 1h. `POST /api/refresh` returns `{ token, refresh_token, user }`; login/register now also return `refresh_token`.
- Email verification (migration `1712000000003-AddEmailVerification`): `users.is_verified` + `email_verified_at`; `verification_codes` table (SHA-256 hashed, 6-digit, single-use, 15-min TTL). `MailModule`/`MailService` (nodemailer; dev fallback logs emails when no `MAIL_*` config). Endpoints: `GET /api/email/verify/:token` (public link, signed JWT 24h), `POST /api/email/resend`, `POST /api/email/send-token`, `POST /api/email/verify-token` (all authed). Register auto-sends a verification link; seed admin is pre-verified. `UserResponseDto` gains `is_verified`/`email_verified_at`.
- Structure cleanup: email verification now lives in its own `EmailVerificationModule` (`modules/email-verification/`); `MailModule` stays as the low-level transport. Shared code moved under `lib/`: Nest infrastructure in `lib/common/` (filters, interceptors, middleware), env config in `lib/config/`, and pure helpers/`shared DTOs in `lib/utils/` (`api-response`, `user-response.dto`, `crypto.util` with `sha256Hex`/`generateOpaqueToken`/`generateSixDigitCode`).
- **Phase 3 — Roles/Authorization (RBAC, migration `1712000000004-NormalizeRolesTables`)**: `roles` normalized to UUID + snake_case (`created_at`/`updated_at`); `user_roles` gains `created_at`, `role_id` → UUID, explicit FK constraints rebuilt. New `Role` + `UserRole` entities (explicit join entity so association can hold metadata), `RolesModule`/`RolesService` (`getRoleNamesForUser`, `assignRoleByName`, `assignDefaultRole`, `ensureDefaultRole`), `@Roles()` decorator + `RolesGuard` (403 on insufficient roles). JWT now carries a `roles` claim (login/register/refresh); register assigns the server-controlled default `USER` role (clients cannot submit a role). Seed upserts default roles `USER`/`ADMIN` via entities and links the admin user. New endpoints: `GET /api/admin/users` (`@Roles('ADMIN')`) and `GET /api/user/roles`. All verified live (register→USER, admin→ADMIN, admin endpoint 200/403/401, refresh preserves roles).
- **Remaining auth tasks (migration `1712000000005-AddUserSettings`)**: password reset (`POST /api/forgot-password` anti-enumeration generic message, `POST /api/reset-password` JWT reset token 30m via `MailService.sendPasswordResetLink`, revokes all sessions) and change password (`PUT /api/password` — verifies current password, revokes all sessions). Profile module (`ProfileModule` + `/api/users/me`): `GET`/`PATCH` profile (first/last name, phone, optional email — changing email resets `is_verified`/`email_verified_at`, uniqueness enforced), `GET`/`PATCH` settings (`language`/`theme_mode` columns on users, validated against supported languages + light/dark). `UserResponseDto` gains `language`/`theme_mode`; `WEB_PUBLIC_URL` env added for the reset link. All verified live (register→forgot→reset→login, refresh revoked after reset, profile/settings CRUD, 401/400 cases, email-change reverification).

## Phase 3 — Businesses ✅

- **Phase 3 — Businesses (migration `1712000000006-CreateBusinessTables`)**: entities `businesses` (owner FK, category FK, name/description/email/phone/website/status), `business_categories` (seeded: Restaurant, Retail, Health & Fitness, Beauty & Salon, Services, Entertainment, Education, Other), `business_locations` (address/city/state/country/lat/lng), `business_hours` (day_of_week 0–6, opens/closes time, is_closed — unique per day per business), `brands` (Business **1:N** Brands — decision, see below). `BusinessesModule` + `BusinessesService` with ownership checks (all modification endpoints verify `ownerId` from the JWT; sub-resources resolve their parent business). Snake_case response DTOs (`BusinessResponseDto` nests category/locations/hours/brands; `BusinessLocationResponseDto`, `BusinessHourResponseDto`, `BrandResponseDto`).
- Endpoints (all Swagger-documented, `/api` prefix): `POST /businesses`, `GET /businesses/:id` (any authenticated user — businesses are public profiles), `GET /users/me/businesses`, `PATCH /businesses/:id`, `DELETE /businesses/:id` (cascades to locations/hours/brands); `POST/GET /businesses/:id/locations`, `PATCH/DELETE /locations/:id`; `POST/GET /businesses/:id/hours`, `PATCH/DELETE /business-hours/:id`; `POST/GET /businesses/:id/brands`, `PATCH/DELETE /brands/:id`. All verified live: create→get→update→delete, locations/hours/brands CRUD, duplicate-day 400, invalid day/time 400, ownership 403 (other user GET/PATCH/DELETE/list), 404, 401, bad-UUID 400, cascade delete.

### Remaining
1. Phase 4 — Core Cards (cards, card_profiles, card_customizations, social_links, templates, template_fields, card_access) — next up
2. Phase 5 — Business Features (services, products, appointments)
3. Phase 6 — Membership Ecosystem (tiers, memberships, benefits, seasons)
4. Phase 7 — Financial Ecosystem (rewards, cashback, wallet, vouchers)
5. Phase 8 — Relationships (user_relationships, child_cards, wishlists)
6. Phase 9 — Growth (affiliates, shares, QR codes, campaigns, offers, coupons)
7. Phase 10 — Admin endpoints (`@Roles('ADMIN')`)
8. Frontend reconciliation: point web `authService` at the new profile/settings/password routes and fix `User` type mismatches

---

## Pending Decisions / Questions

- Business↔Brand: **confirmed 1:N** (`brands.business_id` FK) — one business has many brands, each brand belongs to one business. No rework needed.
- Email/password-reset delivery: `MailModule` works with an SMTP provider or a dev log fallback — real production provider (SMTP, Resend, etc.) still needs selection + `MAIL_*` env
- `CORS_ORIGINS` is read in `main.ts` but missing from Joi schema — **fix**
- `config/configuration.ts` is dead code (AppModule reads `process.env` directly) — **fix or wire up**

---

## Known Issues

- Frontend alignment pending: web `authService` still expects the old envelope + `name` field and calls `/theme`/`/language`/`/profile` — tracked as Remaining item 3 above
- `tsconfig.tsbuildinfo` is untracked (gitignored build artifact)
- `user_roles` table uses Postgres-style snake_case FKs (`user_id`, `role_id`) while `users`/`roles` use camelCase — intentional (new-schema guidance), revisit when entities are built

---

## Session Start Checklist

1. Read this file.
2. Read `AGENTS.md` (root) — local workflow notes.
3. Check `git status` / `git log` for uncommitted work.
4. Confirm DB is running (`docker compose up -d` if needed) before migration/seed tasks.
5. Verify with `pnpm --filter api exec tsc --noEmit` after changes.