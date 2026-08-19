# MCOM API — Development Progress

Tracked per the backend plan (Phases 1–11). Keep this file updated after every completed task.

> Last updated: 2026-08-19 (session: Phase 8 Milestone C — Memberships module built + 53-check e2e passed → Phase 6 complete)
> Working branch: `logic`
> Latest commits: `49ce832` (Phase 8 Milestone C — per-user memberships), `6b45bfa` (Phase 8 Milestone B — membership tiers & benefits), `f149579` (Phase 8 Milestone A — seasons module), `a302b81` (Phase 5 Milestone C — appointments booking engine), `00deeca` (Phase 5 Milestone B — products module + GBP currency default), `1e94c5a` (Phase 5 Milestone A — services module), `fc910c6` (Phase 4 Core Cards module + templates seed), `f6bb430` (reconstructed card-tables migration), `67adeb9` (slug + by-slug + read-only categories + soft account deactivation + CORS fix), `488bee3` (Phase 3 businesses)
> Uncommitted: none

---

## Phase Status Overview

| Phase | Status |
|-------|--------|
| 1 — Foundation | ✅ Complete |
| 2 — Authentication & Identity (incl. Roles/RBAC) | ✅ Complete |
| 3 — Businesses | ✅ Complete |
| 4 — Core Cards | ✅ Complete |
| 5 — Business Features | 🔄 In progress (Milestones A–C ✅ Services/Products/Appointments) |
| 6 — Membership Ecosystem | ✅ Complete (Seasons, Tiers & Benefits, Memberships) |
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
- **Business/Account final decisions implemented (migration `1712000000007-AddBusinessSlug`)**:
  - Business `status` stays internal-only: entity default `active`, **not** settable via the API (whitelist rejects `status` on create/update — verified live). Admin manages status in a later phase; distinct from web `verificationStatus`.
  - Categories are system-defined/seeded (read-only). New `GET /api/business-categories` for the dropdown. No POST/PATCH/DELETE endpoints. `BusinessCategoryResponseDto.fromEntity` added.
  - New unique `slug` on `businesses` (migration backfills existing rows, uniqueness loop appends `-2`, `-3`, …). Auto-generated server-side from `name` (slugify util `lib/utils/slug.util.ts`), guaranteed unique, returned in `BusinessResponseDto`. New `GET /api/businesses/by-slug/:slug` (any authenticated user). `GET /api/businesses/:id` kept.
  - Visibility/ownership unchanged: `GET /businesses/:id` and `GET /businesses/by-slug/:slug` open to any authenticated user; all modification endpoints require owner (403 otherwise).
  - **Account deactivation (soft)**: `DELETE /api/users/me` sets `users.status = 'deactivated'` (row kept, no cascade deletes — verified businesses still exist after deactivation). `revokeAllSessions` kills every refresh token. Deactivated users blocked at: `login` (401), `refresh` (401 + sessions revoked), and `JwtStrategy.validate` (401 — existing tokens dead). Verified live: register→create businesses→deactivate→login 401, old token 401, refresh 401, user row remains `deactivated`, businesses remain.
  - No new `ON DELETE CASCADE` added for user-owned data (existing `fk_businesses_owner` cascade predates this and only fires on a physical user delete, which the flow no longer performs).
- **Prod-readiness e2e (prod build + `NODE_ENV=production`, 72 checks)**: full pass on auth (register/dup 400/bad+unknown login 401/anti-enumeration/no-token 401/bad-token 401/refresh rotation + reuse-theft 401), email verify (send-token 200, bad code 400), profile/settings (PATCH 200, invalid language 400), password change (wrong current 400, mismatch 400, success 200, old pw 401, new pw 200), businesses (create 201, auto-slug + uniqueness loop, status not settable 400 on create+PATCH, by-slug 200/404, categories 200 + 8 seeded, category resolve + fake category 400 + bad UUID 400, slug stable across rename, locations/hours/brands CRUD, dup-day 400, invalid-day 400, list mine), ownership (other-user PATCH/DELETE/location 403, public GET 200 for any authed user, unauthenticated 401), RBAC (admin users 200/403), deactivation (DELETE /users/me 200, login/token/refresh 401, DB row kept `deactivated`, business preserved, generic forgot-password 200). Swagger/docs correctly disabled in production (404); `synchronize` off in prod; prod build + migration:run + seed clean.
- **CORS fix**: `CORS_ORIGINS` (comma-separated, prod only) is now in the Joi schema and `.env.example` — previously read in `main.ts` but missing from validation, which could silently produce an empty origin list in prod.

### Remaining
1. Phase 6 — Membership Ecosystem (tiers, memberships, benefits, seasons)
2. Phase 7 — Financial Ecosystem (rewards, cashback, wallet, vouchers)
3. Phase 8 — Relationships (user_relationships, child_cards, wishlists)
4. Phase 9 — Growth (affiliates, shares, QR codes, campaigns, offers, coupons)
5. Phase 10 — Admin endpoints (`@Roles('ADMIN')`)
6. Frontend reconciliation: point web `authService` at the new profile/settings/password routes and fix `User` type mismatches

---

## Phase 4 — Core Cards ✅

- Built against the reconstructed `1712000000007-CreateCardTables` migration (no schema changes). New `CardsModule` (`modules/cards/`) with 7 entities matching the live tables exactly: `Card` (cards), `CardProfile` (card_profiles), `CardCustomization` (card_customizations), `SocialLink` (social_links), `CardAccess` (card_access), `Template` (templates), `TemplateField` (template_fields). New-schema snake_case columns mapped to camelCase entity properties via `@Column({ name })`.
- **Endpoints** (all Swagger-documented with `@ApiBody` examples + envelope schemas, `/api` prefix, `JwtAuthGuard`):
  - Cards: `POST /cards`, `GET /cards/:id` (any authenticated user — cards are public profiles), `GET /cards/by-slug/:slug`, `GET /users/me/cards`, `PATCH /cards/:id`, `DELETE /cards/:id` (cascades to profile/customization/social links/access).
  - Profile (1:1): `POST /cards/:id/profile`, `GET /cards/:id/profile` (public), `PATCH/DELETE /card-profiles/:profileId`.
  - Customization (1:1): `POST /cards/:id/customization`, `GET /cards/:id/customization` (public), `PATCH/DELETE /card-customizations/:customizationId`.
  - Social links (1:N): `POST/GET /cards/:id/social-links`, `PATCH/DELETE /social-links/:linkId`.
  - Access (1:1): `POST/GET /cards/:id/access`, `PATCH/DELETE /card-access/:accessId` — plaintext `password` hashed (bcrypt) before storage, never returned (`password_hash` excluded from response DTO); `access_expiry` validated (`never`/`until`, `expires_at` required for `until`).
  - Templates (system-defined, read-only): `GET /templates` (published, with fields), `GET /templates/:id`.
- **Decisions applied (mirroring Phase 3 businesses)**: modification endpoints require the card owner (403 otherwise, verified for PATCH/DELETE/profile-update by a second user); reads open to any authenticated user; `type` restricted to `PERSONAL`/`BUSINESS` (whitelist-rejected otherwise); `slug` user-supplied or auto-generated (random hex) with uniqueness loop (`-2`, `-3`, …); `template_id`/`business_id` validated on create/update — template must exist, business must be owned by the card owner (`BusinessesService.findOwned`).
- **Templates seed**: `seed.ts` now upserts 3 templates (Minimal/Modern/Bold) + 23 template_fields (idempotent by slug / template+field_key), matching the live DB data exactly. Verified idempotent against the live DB.
- **Verified live (dev-mode e2e, 37 checks)**: create/get/by-slug/list, slug uniqueness loop + bad-slug 400 + auto slug, profile/customization/social/access CRUD, duplicate 1:1 rejects (400), bcrypt hashing (password never leaked), template assignment + unknown-template 400, DTO snake_case keys on every nested object (no raw-entity leak), ownership 403 (other-user update/delete/profile), business-linked card ownership (owned business ok, unowned business 403), templates list/detail. Swagger reflects all 13 new paths + 13 schemas at `/api/docs` (non-prod). `tsc --noEmit` clean, prod build clean. Test data cleaned after verification (DB back to admin-only, 0 businesses/cards).
- **Prod-readiness e2e (prod build + `NODE_ENV=production`, 125 checks, live DB)**: full pass on templates (3 seeded/published-only, detail 200, unknown 404, nested DTO), card CRUD (create 201, slug uniqueness loop `-2`/`-3`, auto slug, bad slug 400, uppercase 400, invalid type 400, `status` not settable 400, non-uuid business 400, unknown template 400, unknown field rejected 400 via `forbidNonWhitelisted`), reads (by-id/by-slug 200, by-slug 404, unknown 404, bad uuid 400, list mine 4 + snake_case keys), profile (create 201, dup 400, missing name 400, get 200/404, patch 200 + applied, bad uuid 400), customization (create 201, dup 400, patch 200, invalid color 400, bad url 400, get 200/404), social links (create ×2 201, platform/url/missing 400, list ordered, patch 200 + applied, unknown 404), access security (create 201, `password_hash` never leaked in DTO/raw response, dup 400, short password 400, `until` without `expires_at` 400, with date 201 + persisted, patch 200, bcrypt hash confirmed in DB), template assignment (assign 200 + nested fields, unknown 400, type update + invalid 400), business linkage (owned 201 + persisted, unowned 403, unknown 404), ownership (all 6 public reads 200 for other user; all 8 modifications 403 for other user), auth security (no token 401 ×3, garbage token 401, deactivated user login 401 + read 401), cascade delete (200, child rows purged — verified in DB), nested response integrity (no raw entity leak, no password leak). Swagger/docs 404 in prod; `synchronize` off. Test data cleaned after (DB back to admin-only, 0 businesses/cards).

### Remaining

## Phase 5 — Business Features 🔄 (Milestones A–C ✅)

**Milestone A — Services (migration `1712000000008-CreateServicesTables`)**: new `ServicesModule` (`modules/services/`). `Service` entity (`services` table, Business **1:N** Services): `business_id` FK (ON DELETE CASCADE), `name`, `description` (text), `price` (numeric(10,2) with a TypeORM transformer → number in API, null-safe), `currency` (ISO 4217, default `GBP` — matches the web frontend default), `duration` (minutes), `image` (URL), `status` (internal-only, default `active`, not settable via API). `Business` entity gains a `services` OneToMany relation.

- **Endpoints** (all Swagger-documented with `@ApiBody` examples + envelope schemas, `/api` prefix, `JwtAuthGuard`):
  - `POST /businesses/:id/services` — create (business must be owned by the authenticated user; 403 otherwise, 404 if the business doesn't exist)
  - `GET /businesses/:id/services` — list (any authenticated user; parent business must exist → 404)
  - `GET /services/:id` — get one (any authenticated user)
  - `PATCH /services/:id` — update (owner-only, resolves parent business from the service row)
  - `DELETE /services/:id` — delete (owner-only; cascades with the parent business too)
- **DTOs**: `CreateServiceDto` (name 2–150, optional description ≤2000, price ≥0 with ≤2 decimals, currency exactly 3 chars, duration 1–10080 minutes, valid URL image), `UpdateServiceDto` (PartialType), `ServiceResponseDto` (snake_case contract: `business_id`, `created_at`, `updated_at`, etc., static `fromEntity`). `status` is whitelist-rejected (400).
- **Verified live (prod build + `NODE_ENV=production`, 44-check e2e)**: create 201 + snake_case DTO + decimal price round-trip, price/currency optional defaults (null / GBP), validation 400s (missing/short name, negative or 3-decimal price, bad currency length, zero duration, bad image URL, status not settable, bad UUID), unknown business 404 on create AND list, get 200/404/400, list ordering, update 200 + applied, ownership (other user: list/get public 200, update/delete/create 403), auth (no token / garbage token 401), delete 200 + 404 after, business delete cascades to services (DB-verified). `tsc --noEmit` clean, prod build clean. Swagger reflects all 5 new paths + 3 schemas at `/api/docs-json` (non-prod). Test data cleaned after (DB back to admin-only, 0 businesses/services). Default currency later changed to `GBP` (migration `1712000000010-SetDefaultCurrencyGbp`) to match the web frontend default.

**Milestone B — Products (migration `1712000000009-CreateProductsTables`)**: new `ProductsModule` (`modules/products/`). `Product` entity (`products` table, Business **1:N** Products) mirroring services: `business_id` FK (ON DELETE CASCADE), `name`, `description` (text), `price` (numeric(10,2) + number transformer), `currency` (ISO 4217, default `GBP`), `image` (cover URL), `status` (internal-only, default `active`). `ProductImage` entity (`product_images` table, Product **1:N** ProductImages): `product_id` FK (ON DELETE CASCADE), `image_url`, `position` (gallery order, auto-increment if omitted). `Business` entity gains a `products` OneToMany; `Product` gains `images` OneToMany.

- **Endpoints** (all Swagger-documented with `@ApiBody` examples + envelope schemas, `/api` prefix, `JwtAuthGuard`):
  - `POST /businesses/:id/products` — create (business owned by the authenticated user; 403/404 otherwise)
  - `GET /businesses/:id/products` — list with nested gallery (any authenticated user; parent business must exist → 404)
  - `GET /products/:id` — get one with nested gallery (any authenticated user)
  - `PATCH /products/:id` — update (owner-only, resolves parent business from the product row)
  - `DELETE /products/:id` — delete (owner-only; cascades gallery images)
  - `POST /products/:id/images` — add gallery image (owner-only; `position` optional, auto-assigned as last+1)
  - `GET /products/:id/images` — list gallery (any authenticated user)
  - `DELETE /product-images/:imageId` — remove gallery image (owner-only)
- **DTOs**: `CreateProductDto` (same rules as services: name 2–150, description ≤2000, price ≥0 ≤2 decimals, currency 3 chars, cover image URL), `UpdateProductDto` (PartialType), `CreateProductImageDto` (URL + optional position 0–9999), `ProductResponseDto` (snake_case contract, nests ordered `images` via `ProductImageResponseDto`, static `fromEntity`). `status` is whitelist-rejected (400).
- **Verified live (prod build + `NODE_ENV=production`, 58-check e2e)**: create 201 + snake_case DTO + decimal price, price/currency optional, validation 400s (missing/short name, negative/3-decimal price, bad currency, bad image URL, `status` not settable, bad UUID), unknown business 404 on create AND list, get 200/404/400, update 200 + applied, gallery (add with position 0, add without position auto-assigns last+1, list ordered, nested images in product detail, bad/missing image_url 400, unknown product 404, delete image 200/404), ownership (other user: list/get/list-images public 200, update/delete/create/add-image/delete-image 403), auth (no token / garbage token 401), cascade delete (product delete + business delete both purge product_images — DB-verified). `tsc --noEmit` clean, prod build clean. Swagger reflects all 8 new paths + 5 schemas at `/api/docs-json` (non-prod). Test data cleaned after (DB back to admin-only, 0 businesses/products). Default currency later changed to `GBP` (migration `1712000000010-SetDefaultCurrencyGbp`) to match the web frontend default.

**Milestone C — Appointments (migration `1712000000011-CreateAppointmentTables`)**: full booking engine (user-confirmed scope). Three new tables + `AppointmentsModule` (`modules/appointments/`):
- `booking_rules` (Business **1:1**): `enabled` (default true), `default_duration` (60 min), `buffer` (15 min), `lead_time_hours` (24), `advance_window_days` (30), `require_payment`, `confirmation_message`, `cancellation_policy`. If no rules row exists, the API returns a snake_case default config (service returns a snake_case default object, not the camelCase entity).
- `availability` (Business **1:N** weekly slots): `day_of_week` 0–6, `start_time`/`end_time` (`HH:MM`), `is_closed`.
- `appointments` (Business **1:N**, optional `service_id` FK → services `ON DELETE SET NULL`): `customer_name`, `customer_email`, `customer_phone`, `date`, `start_time`, `end_time`, `status` (pending default / confirmed / cancelled / completed), `notes`. Index `(business_id, date)`. `Business` entity gains `bookingRules`/`availability`/`appointments` relations.

- **Endpoints** (all Swagger-documented with `@ApiBody` examples + envelope schemas, `/api` prefix, `JwtAuthGuard`):
  - Booking rules: `GET /businesses/:id/booking-rules` (any authenticated; returns defaults if none), `POST /businesses/:id/booking-rules` (owner-only, 400 if already exist), `PATCH /booking-rules/:id` (owner-only).
  - Availability: `GET /businesses/:id/availability` (any authenticated), `POST /businesses/:id/availability` (owner-only), `PATCH /availability/:id`, `DELETE /availability/:id` (owner-only).
  - Appointments: `POST /businesses/:id/appointments` — **public booking**, any authenticated user (validates business, optional service belongs to business, booking window = lead-time + advance-window, slot availability for that weekday, end_time = start + duration where duration = service.duration → rule.default_duration, end ≤ 23:59, no conflict with existing appointments respecting buffer, status defaults to `pending`); `GET /businesses/:id/appointments` (owner-only list); `GET /appointments/:id` (owner-only); `PATCH /appointments/:id/status` (owner-only; pending/confirmed/cancelled/completed); `PATCH /appointments/:id/reschedule` (owner-only, re-validates window/availability/conflicts, blocked for cancelled); `DELETE /appointments/:id` (owner-only).
- **DTOs**: `CreateBookingRuleDto`/`UpdateBookingRuleDto` (all optional with defaults; `default_duration`/`buffer`/`lead_time_hours`/`advance_window_days` transformed to int, `default_duration` 5–1440, `advance_window_days` 1–365), `CreateAvailabilityDto`/`UpdateAvailabilityDto` (day 0–6, `HH:MM` times from a 30-min-step whitelist), `CreateAppointmentDto` (customer name 2–100, email regex, phone ≤30, date `YYYY-MM-DD` regex, time `HH:MM` regex, notes ≤1000, optional `service_id` UUID), `UpdateAppointmentStatusDto` (`@IsIn` the 4 statuses), `RescheduleAppointmentDto` (date + time), `AvailabilityResponseDto`/`BookingRuleResponseDto`/`AppointmentResponseDto` (snake_case, nest `service` as `{ id, name, price, currency }`, times normalized from Postgres `TIME` `HH:MM:SS` → `HH:MM`).
- **Verified live (prod build + `NODE_ENV=production`, 74-check e2e)**: booking rules defaults + create + duplicate 400 + update + snake_case keys, availability CRUD + validation 400s (bad day, bad time, end-before-start), booking validation 400s (past date, outside advance window, no availability for weekday, bad email/date/time format, disabled booking, end past midnight), booking success (status `pending`, end = start+60 default, service duration overrides to +45 with nested `service`), conflict 400, reschedule 200 + applied + conflict 400, status flow, unknown business 404, service-from-another-business 400, ownership (other user reads 200, all modifications 403), auth 401 ×3, business delete cascades appointments/availability/booking_rules (DB-verified). `tsc --noEmit` clean, prod build clean, migration applied. Swagger reflects all 8 new paths + 10 schemas at `/api/docs-json` (non-prod). Test data cleaned after (DB back to admin-only, 0 businesses).
- **Bugs caught + fixed during e2e**: (1) optional `service_id`/`customer_phone`/`notes` in `CreateAppointmentDto` lacked `@IsOptional()` → global whitelist+forbidNonWhitelisted rejected them (400) — added `@IsOptional()`; (2) `assertWithinAvailability` was async but called without `await` in `book()`/`reschedule()` → unhandled rejection crashed the prod server — added `await`; (3) Postgres `TIME` columns returned `HH:MM:SS` in responses — response DTOs now normalize to `HH:MM`; (4) default booking-rules response leaked camelCase entity keys — service returns a snake_case default object.

### Remaining (Milestone D — Next Business Feature)

---

## Phase 6 — Membership Ecosystem ✅ (Milestones A–C)

**Milestone A — Seasons (migration `1712000000012-CreateSeasonTables`)**: platform-wide `seasons` entity per spec §31 (`name`, `starts_at`, `ends_at`, `status` default `active`; index on `status`). Ownership model per the docs: the complete DB relationship map (§47) attaches Memberships to **Users** (no Business edge) and lists Memberships/Benefits under admin-managed areas — so seasons/tiers/benefits are **platform-wide**, not per-business. Any authenticated user can manage seasons for now; admin-only enforcement is deferred to Phase 10 (Admin, `@Roles('ADMIN')`).

- **Endpoints** (`/api/seasons`, Swagger-documented, `JwtAuthGuard`): `POST /seasons`, `GET /seasons` (ordered by `starts_at`), `GET /seasons/:id`, `PATCH /seasons/:id`, `DELETE /seasons/:id`.
- **DTOs**: `CreateSeasonDto` (name 2–100, `starts_at`/`ends_at` ISO dates), `UpdateSeasonDto` (PartialType), `SeasonResponseDto` (snake_case: `starts_at`, `ends_at`, `created_at`, …). `status` is internal-only (whitelist-rejected 400).
- **Verified live (prod build + `NODE_ENV=production`, 34-check e2e)**: CRUD + ordering, snake_case DTO, validation 400s (missing/short name, bad date, ends-before-starts on create and update, status not settable), 404 unknown, 400 bad UUID, any-authed-user reads AND management (200s), auth 401s (no token ×2, garbage token), delete + 404 after, DB clean after cleanup. `tsc --noEmit` clean, prod build clean, migration applied. Swagger reflects 2 paths + 3 schemas at `/api/docs-json` (non-prod).
- **AGENTS.md** updated: new "Original Documentation First" rule — always consult `apps/api/MASTER_INSTRUCTIONS.md` for feature design; ask the user only when the docs are genuinely silent.

**Milestone B — Tiers & Benefits (migration `1712000000013-CreateMembershipTierTables`)**: per spec §30 (`membership_tiers`, `benefits`, `membership_benefits`) — tier↔benefit relationships are **database-driven** (the docs explicitly forbid hardcoding "Gold = 10% discount"). Platform-wide (same ownership model as Milestone A).
- `membership_tiers`: `name`, `description`, `discount_type` (percentage default / fixed), `discount_value` (numeric(10,2), tier carries its own discount — DB-driven), `sort_order`, `status` (internal-only, default `active`).
- `benefits`: `name`, `description`, `benefit_type` (perk default / discount / access / gift), `status` (internal-only).
- `membership_benefits` (MembershipTier **N:M** Benefit): join with `membership_tier_id`/`benefit_id` FKs (ON DELETE CASCADE) + unique `(membership_tier_id, benefit_id)`.
- **Endpoints** (`/api`, Swagger-documented, `JwtAuthGuard`): tiers `POST/GET /membership-tiers`, `GET/PATCH/DELETE /membership-tiers/:id`; benefits `POST/GET /benefits`, `GET/PATCH/DELETE /benefits/:id`; linking `POST/GET /membership-tiers/:id/benefits`, `DELETE /membership-tiers/:id/benefits/:benefitId`.
- **DTOs**: `CreateMembershipTierDto` (name 2–100, discount_type `percentage`/`fixed`, discount_value 0–100 ≤2dp, sort_order ≥0), `UpdateMembershipTierDto` (PartialType), `CreateBenefitDto` (name 2–100, benefit_type), `UpdateBenefitDto` (PartialType), `LinkBenefitDto` (benefit_id UUID), `MembershipTierResponseDto` (snake_case, nests linked `benefits` as `{ id, name }`), `BenefitResponseDto`.
- **Verified live (prod build + `NODE_ENV=production`, 60-check e2e)**: tier CRUD + snake_case DTO + numeric discount round-trip + sort_order ordering, validation 400s (missing/short name, bad discount_type, negative discount, status not settable), benefit CRUD + validation, linking (link 201, duplicate 400, list ordered, nested benefits in tier detail, unlink 200, unlink-not-linked 404, unknown benefit 404, bad UUID 400), platform-wide ownership (other user reads/manages all 200s/201s), auth 401s (no token ×2, garbage token), cascade delete (tier delete purges its links — DB-verified). `tsc --noEmit` clean, prod build clean, migration applied. Swagger reflects 6 paths + 7 schemas at `/api/docs-json` (non-prod). Test data cleaned after (DB back to admin-only, 0 tiers/benefits).

**Milestone C — Memberships (migration `1712000000014-CreateMembershipTables`)**: per-user link to a membership tier (`USERS ├── MEMBERSHIPS ─── MEMBERSHIP_TIERS`, spec §47). The docs name only the entities + chain — the field list is our design (user confirmed "status + start/expiry").
- `memberships`: `user_id` (FK → users, ON DELETE CASCADE), `membership_tier_id` (FK → membership_tiers, ON DELETE RESTRICT), `status` (active/cancelled/expired, default `active`), `started_at` (default now), `expires_at` (nullable — open-ended memberships). Indexes on user_id + status.
- **Endpoints** (`/api`, Swagger-documented, `JwtAuthGuard`): `POST/GET /memberships`, `GET/PATCH/DELETE /memberships/:id` — **per-user scoped** (a user only reads/manages their own memberships; foreign ids → 404).
- **DTOs**: `CreateMembershipDto` (membership_tier_id UUID, optional started_at/expires_at ISO8601), `UpdateMembershipDto` (PartialType + status IsIn active/cancelled/expired, expires_at nullable to clear), `MembershipResponseDto` (snake_case, nests `tier` summary `{ id, name, discount_type, discount_value }`).
- **Rules**: only `active` tiers assignable (400 otherwise); `expires_at` must be after `started_at` (create + update); deleting a tier with memberships blocked 400 (RESTRICT guard); `status` internal-only (whitelist-rejected).
- **Verified live (prod build + `NODE_ENV=production`, 53-check e2e)**: create (dated + open-ended with defaults), snake_case response + nested tier, list newest-first, get, update status/expiry/clear-null, validation 400s (missing/bad tier, unknown tier 404, inactive tier, expires-before-start, bad status, bad date), per-user isolation (cross-user read/update/delete → 404), auth 401s, tier-in-use delete 400, cascade cleanup (DB back to 0 tiers/memberships). `tsc --noEmit` clean, prod build clean, migration applied. Swagger reflects 2 paths + 4 schemas at `/api/docs-json` (non-prod).

### Remaining (Milestone D — Next Business Feature)

## Pending Decisions / Questions

- Business↔Brand: **confirmed 1:N** (`brands.business_id` FK) — one business has many brands, each brand belongs to one business. No rework needed.
- Phase 5 Business Features: **Milestones A–C — Services, Products, and Appointments done** (migrations `1712000000008`/`1712000000009`/`1712000000011`). Appointments scope confirmed: **full booking engine** (availability, booking rules, lead-time/advance-window validation, conflicts + buffer, rescheduling, status flow). Next: decide Milestone D scope (spec lists Options / Events, etc.).
- Card slug: user-supplied `slug` (validated lowercase-hyphen) or auto-generated random hex, uniqueness loop applied — no name-derived slug (cards have no name column; display name lives on the profile).
- Email/password-reset delivery: `MailModule` works with an SMTP provider or a dev log fallback — real production provider (SMTP, Resend, etc.) still needs selection + `MAIL_*` env
- `config/configuration.ts` is dead code (AppModule reads `process.env` directly) — **fix or wire up**

---

## Known Issues

- **RESOLVED — Pre-existing DB/migration mismatch (Phase 4)**: the local DB had `CreateCardTables1712000000007` applied (id=9) with no migration file in the repo. Reconstructed `apps/api/src/migrations/1712000000007-CreateCardTables.ts` from the live schema (`cards`, `card_profiles`, `card_customizations`, `social_links`, `templates`, `template_fields`, `card_access`). Verified: runs clean from scratch on a fresh DB and produces a schema byte-identical to the live DB (`pg_dump` diff). Resolved: `CardsModule` built against it and templates seed added (fresh envs now get Minimal/Modern/Bold + 23 fields via `pnpm run seed`).
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