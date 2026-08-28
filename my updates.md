# My Updates

A log of changes made during development and why.

---

## 1. [BACKEND] Added `remember` field to Login DTO

**Date:** 2026-08-24
**Files changed:** `apps/api/src/modules/auth/dto/login.dto.ts`

**What:** Added an optional `remember` boolean field to `LoginDto`.

**Why:** The frontend sends a `remember` field in the login payload (for a "remember me" checkbox). The backend's `ValidationPipe` has `forbidNonWhitelisted: true`, which rejects any property not defined in the DTO, causing a 400 error. Adding the field to the DTO fixes the validation error and allows the backend to use it for extending token expiry in persistent sessions.

---

## 2. [FRONTEND] Integrated Business Dashboard with Backend API

**Date:** 2026-08-24
**Files changed:**
- `apps/web/src/services/businessApi.ts` (new)
- `apps/web/src/pages/business/MyBusinessPage.tsx`

**What:** Replaced hardcoded mock data in the business dashboard with real API calls to the backend. Created a new `businessApi.ts` service that calls `GET /api/users/me/businesses` and `GET /api/businesses/:id`. The dashboard now fetches and displays the real business name, category, location, email, phone, website, opening hours, and brand data.

**Why:** The `/b/dashboard` page was entirely built with mock data from `businessStore.ts` and `businessDashboardStore.ts`, making zero API calls to the backend. The backend already had fully functional endpoints (`GET /api/users/me/businesses`, `GET /api/businesses/:id`) that were unused. Integrating them makes the dashboard display actual business data instead of placeholder content.

---

## 3. [FRONTEND] Integrated Notifications, Wallet, and Membership into Dashboard

**Date:** 2026-08-24
**Files changed:**
- `apps/web/src/services/businessApi.ts`
- `apps/web/src/pages/business/MyBusinessPage.tsx`

**What:** Expanded the dashboard API service and page to call three more backend endpoints:
- `GET /api/notifications` — "For You" section now shows real notifications instead of mock data
- `GET /api/wallet` — Wallet card shows real balance and currency from the backend
- `GET /api/memberships` — Membership card and header show real tier name, status, and expiry date

All three calls run in parallel on mount via `Promise.all` for fast loading.

**Why:** The "For You" section, Wallet card, and Membership card were all using hardcoded mock data (`mockNotifications`, `mockMembership`). The backend already had working endpoints for notifications, wallet, and memberships that were unused. Integrating them gives users real data in these sections instead of fake placeholder content. Sections without backend endpoints (Performance KPIs, Alerts, Recent Activity) still use mock data.

---

## 4. [BACKEND + FRONTEND] Created 4 New Backend Modules & Integrated Dashboard

**Date:** 2026-08-24
**Files changed:**
- `apps/api/src/migrations/1712000000029-CreateDashboardAnalyticsTables.ts` (new)
- `apps/api/src/modules/dashboard/*` (new — controller, service, module)
- `apps/api/src/modules/activity/*` (new — entity, controller, service, module)
- `apps/api/src/modules/analytics/*` (new — entity, controller, service, module)
- `apps/api/src/modules/customers/*` (new — controller, service, module)
- `apps/api/src/app.module.ts`
- `apps/web/src/services/businessApi.ts`
- `apps/web/src/pages/business/MyBusinessPage.tsx`

**What:**
Backend:
- Created 4 new modules with REST endpoints:
  - `GET /api/dashboard/stats` — Aggregated KPIs (total cards, shares, appointments, campaigns, reviews, avg rating, wallet credits, rewards redeemed, active memberships) queried from existing tables
  - `GET /api/activity` — Chronological activity feed from new `activity_logs` table with pagination
  - `POST /api/analytics/events` + `GET /api/analytics/overview` + `GET /api/analytics/timeseries` — Track and query profile views, QR scans, and custom events from new `analytics_events` table
  - `GET /api/customers` — Unique customer list derived from appointments and reviews (no new table)
- Migration creates `activity_logs` and `analytics_events` tables with proper indexes and foreign keys
- All modules registered in `AppModule`

Frontend:
- Added new TypeScript interfaces (`DashboardStats`, `ActivityItem`, `AnalyticsOverview`, `Customer`)
- Added new API methods (`getDashboardStats`, `.getActivity`, `getAnalyticsOverview`, `getCustomers`)
- Dashboard now fetches real stats, activity feed, and analytics on mount
- Performance section shows real data: VCard views, QR scans, shares, appointments, pending, completed, reviews, avg rating
- Recent Activity section shows real activity feed instead of mock data
- Removed unused `KpiCard` component and mock data imports

**Why:** The dashboard had 4 sections still using mock data: Performance KPIs, Alerts, Recent Activity, and Customers. The backend had no endpoints for these. Creating these modules completes the dashboard integration — every section now either shows real data from the API or gracefully falls back to empty states when no data exists.

---

## 5. [FRONTEND] Fixed Header & Sidebar Showing Mock Business/User Names

**Date:** 2026-08-24
**Files changed:**
- `apps/web/src/contexts/AuthContext.tsx`
- `apps/web/src/components/business/layout/BusinessTopBar.tsx`
- `apps/web/src/components/business/layout/BusinessSidebar.tsx`

**What:**
- **AuthContext**: Added mapping of backend `first_name`/`last_name` fields to a single `name` field on the `User` object, both when reading from localStorage and when setting from API response. The backend `UserResponseDto` returns `first_name` and `last_name` separately, but the frontend `User` type expects a single `name` field — so `user?.name` was always `undefined`, falling back to mock data.
- **BusinessTopBar**: Replaced `mockBusinessProfile` usage with real API calls (`businessService.getMyBusinesses`, `businessService.getBusiness`, `businessService.getMyMemberships`). Now shows the real business name in the header and real user name/email in the avatar dropdown.
- **BusinessSidebar**: Same fix — replaced `mockBusinessProfile` with live API calls. Sidebar now shows the real business name, category, membership tier, and days remaining.

**Why:** The header showed "GreenLeaf Coffee" (mock) and "Sarah Johnson" (mock) instead of the logged-in user's real business and name. Two root causes: (1) the auth context didn't map backend `first_name`/`last_name` to the frontend's `name` field, and (2) both layout components imported `mockBusinessProfile` directly instead of fetching from the API.

---

## 6. [BACKEND] VCard Module: Skeleton → Complete Functional Entity

**Date:** 2026-08-24
**Files changed:**
- `apps/api/src/migrations/1712000000030-CreateCardSectionsCentreControls.ts` (new)
- `apps/api/src/modules/cards/entities/card.entity.ts`
- `apps/api/src/modules/cards/entities/card-access.entity.ts`
- `apps/api/src/modules/cards/entities/card-section.entity.ts` (new)
- `apps/api/src/modules/cards/entities/card-centre-control.entity.ts` (new)
- `apps/api/src/modules/cards/dto/card-response.dto.ts`
- `apps/api/src/modules/cards/dto/card-section-response.dto.ts` (new)
- `apps/api/src/modules/cards/dto/card-centre-control-response.dto.ts` (new)
- `apps/api/src/modules/cards/dto/upsert-card-section.dto.ts` (new)
- `apps/api/src/modules/cards/dto/upsert-centre-controls.dto.ts` (new)
- `apps/api/src/modules/cards/dto/create-card-access.dto.ts`
- `apps/api/src/modules/cards/cards.module.ts`
- `apps/api/src/modules/cards/cards.service.ts`
- `apps/api/src/modules/cards/cards.controller.ts`
- `apps/api/src/modules/customers/customers.service.ts`

**What:**
- Migration creates `card_sections` and `card_centre_controls` tables, adds `hint` and `protected_section_ids` to `card_access`
- Card entity gains: `name`, `description`, `category`, `urlSlug`, `assignedAt`, `lastAdminUpdate`, `views`, `scans`, `shares` columns + `sections` and `centreControls` relations
- CardAccess entity gains: `hint` and `protectedSectionIds` fields
- New `CardSection` entity: `cardId`, `schemaId`, `name`, `locked`, `enabled`, `sortOrder`, `content`
- New `CardCentreControl` entity: `cardId`, `centreId`, `enabled`, `editAllowed`, `settings`
- `CardResponseDto` now returns all new fields including nested sections and centre controls
- CardsService gets: `findByBusiness()`, `getSections()`, `upsertSections()`, `getCentreControls()`, `upsertCentreControls()`, `getCardStats()`, `claimFromTemplate()`
- CardsController gets 7 new endpoints:
  - `GET /businesses/:businessId/cards` — list business cards
  - `POST /cards/claim` — claim a published template
  - `GET /cards/:id/stats` — aggregated analytics
  - `GET /cards/:id/sections` — list sections
  - `PATCH /cards/:id/sections` — upsert sections
  - `DELETE /sections/:sectionId` — delete section
  - `GET /cards/:id/centre-controls` — list centre controls
  - `PATCH /cards/:id/centre-controls` — upsert centre controls
- CardsModule registers all new entities (CardSection, CardCentreControl, AnalyticsEvent)
- Fixed `CustomerRecord` interface to be exported (pre-existing type error)

**Why:** The Cards module was a skeleton — it had basic CRUD but was missing the core domain features that the frontend VCard editor expects: sections (content blocks per card), centre controls (share/exchange/redeem toggles), template claiming (creating a card from a published template), business card listing, and card analytics. Without these endpoints the frontend couldn't display or edit real VCard data. The migration and entity updates provide the database foundation, and the service+controller updates expose all operations needed by the frontend VCard editor.

---

## 7. [FRONTEND] Integrated VCard Pages with Backend API

**Date:** 2026-08-24
**Files changed:**
- `apps/web/src/services/businessApi.ts`
- `apps/web/src/pages/business/VCardsPage.tsx`
- `apps/web/src/pages/business/VCardDetailPage.tsx`
- `apps/web/src/pages/business/vcard/VCardContentEditorPage.tsx`

**What:**
- **businessApi.ts**: Added TypeScript interfaces (`VCard`, `VCardSection`, `VCardCentreControl`, `VCardAccess`, `VCardStats`, `VCardProfile`, `VCardCustomization`, `VCardSocialLink`, `Template`, `TemplateField`) and 9 new API methods: `getMyVCards()`, `getVCardsByBusiness()`, `getVCard()`, `getVCardStats()`, `getVCardSections()`, `upsertVCardSections()`, `getVCardCentreControls()`, `upsertVCardCentreControls()`, `claimTemplate()`, `listTemplates()`
- **VCardsPage.tsx**: Fetches real cards from `GET /businesses/:businessId/cards` on mount. Maps API `VCard[]` to the frontend `AssignedVCard[]` format (converting IDs, types, statuses, dates). Merges with mock data as fallback. KPI totals now reflect real API data when available.
- **VCardDetailPage.tsx**: Fetches card from `GET /cards/:id` and sections from `GET /cards/:id/sections` on mount. Maps API card to the mock `AssignedVCard` format for the existing UI. Section list shows real sections from the API when available, falls back to localStorage editor content.
- **VCardContentEditorPage.tsx**: Fetches sections from `GET /cards/:id/sections` and centre controls from `GET /cards/:id/centre-controls` on mount. Merges API section data (name, enabled, locked, content) into the editor state. On Save/Publish, also persists sections and centre controls to the API via `PATCH /cards/:id/sections` and `PATCH /cards/:id/centre-controls`.

**Why:** The three VCard pages (list, detail, editor) were entirely driven by mock data from `businessStore.ts` and `businessVCardEditorStore.ts`. The backend now has full VCard CRUD with sections, centre controls, and analytics — so these pages can show real data. The integration is additive: mock data remains as fallback when no business/cards exist in the API yet (e.g. before the first business is created). Once a business and cards exist in the database, all three pages show real data from the API while preserving the existing UI structure.

---

## 8. [FRONTEND] Removed Mock Data Fallback from VCard Pages

**Date:** 2026-08-24
**Files changed:**
- `apps/web/src/pages/business/VCardsPage.tsx`
- `apps/web/src/pages/business/VCardDetailPage.tsx`
- `apps/web/src/pages/business/vcard/VCardContentEditorPage.tsx`

**What:**
- **VCardsPage.tsx**: Removed imports of `getAllAssignedVCards`, `mockBusinessProfile` from `businessStore.ts`. Removed `mockCards` merge logic — `all` is now purely API-driven from `apiCards.map(...)`. Added API fetch for business membership tier (for template eligibility) via `getMyMemberships()`. Empty state shows when no API cards exist.
- **VCardDetailPage.tsx**: Removed imports of `getVCardById`, `mockBusinessProfile`. Removed `mockVcard` fallback — `vcard` is now `null` when no API card is found (shows "VCard not found" error state). Replaced `mockBusinessProfile.membership/tier/name` references with `apiCard.template.name` or `vcard.name`.
- **VCardContentEditorPage.tsx**: Removed imports of `getVCardById`, `mockBusinessProfile`. Replaced `vcard` state with individual API-fetched state (`apiCardName`, `apiCardStatus`, `apiCardType`, `apiCardCategory`, `apiCardSlug`, `apiCardId`). All `vcard.` references replaced with API state variables. Template info card shows real data from API.

**Why:** The previous integration (entry #7) kept mock data as fallback for when no business/cards existed in the API. This caused a hybrid state where the UI could show stale mock data mixed with real API data. Removing the fallback makes the pages purely API-driven — if the API returns no data, the UI shows empty states or error states. This ensures the frontend always reflects the actual database state and eliminates confusion from phantom mock cards.

---

## 9. [FRONTEND] Removed Mock Data Fallback from Templates Tab

**Date:** 2026-08-24
**Files changed:**
- `apps/web/src/pages/business/VCardsPage.tsx`

**What:**
- Removed imports of `MOCK`, `toBizTemplate`, `templateSeason`, `templateSectors`, `templateCustomization` from admin `BusinessVCardTemplatesPage`
- Removed imports of `loadUserTemplatesByType` from `vcardTemplateStore` and `buildPublishedSections` from admin `BusinessVCardWorkspace`
- Removed `getVCardEditorContent` import (no longer needed for template previews)
- Added `listTemplates()` API call to fetch published templates from `GET /templates`
- Added local `apiTemplateToBiz()` mapper to convert API `Template` to the `BizVCardTemplate` shape used by template cards
- Added local helper functions `templateSeason()`, `templateSectors()`, `templateCustomization()` to replace admin imports
- `allTemplates` is now purely `apiTemplates` (API-driven) — no `MOCK` array, no localStorage `stored` templates
- `sectionsFor()` builds section previews from template features instead of `buildPublishedSections()`

**Why:** The templates tab was still using hardcoded `MOCK` templates from the admin page and localStorage-stored templates from `vcardTemplateStore`. This meant the template library showed phantom templates that don't exist in the database. Replacing with `GET /templates` ensures the business only sees templates that Admin has actually published to the database.

---

## 10. [BACKEND + FRONTEND] Fixed Card Metadata Migration & Removed All Mock Fallbacks

**Date:** 2026-08-24
**Files changed:**
- `apps/api/src/migrations/1712000000031-AddCardMetadataColumns.ts` (new)
- `apps/api/src/scripts/seed.ts`
- `apps/web/src/pages/business/VCardsPage.tsx`
- `apps/web/src/pages/business/vcard/ClaimTemplateModal.tsx`

**What:**
- **Migration**: Added missing columns to `cards` table: `name`, `description`, `category`, `url_slug`, `assigned_at`, `last_admin_update`, `views`, `scans`, `shares`. The previous migration (030) created `card_sections` and `card_centre_controls` tables but never ALTERed the existing `cards` table — causing `column Card.name does not exist` 500 errors on `GET /api/users/me/cards`.
- **Seed**: Removed all 3 hardcoded default templates (Minimal, Modern, Bold) and their template fields from `DEFAULT_TEMPLATES` and `DEFAULT_TEMPLATE_FIELDS`. Templates are now created exclusively by Admin at runtime.
- **VCardsPage**: Removed all admin template imports (`MOCK`, `toBizTemplate`, `buildPublishedSections`, `loadUserTemplatesByType`). Templates tab now fetches exclusively from `GET /templates` API. Added local `apiTemplateToBiz()` mapper and helper functions (`templateSeason`, `templateSectors`, `templateCustomization`).
- **ClaimTemplateModal**: Rewrote to use `businessService.claimTemplate()` API instead of `claimVCard()` from localStorage. Removed `buildPublishedSections` and `loadUserTemplatesByType` imports. Claim flow now: fetches business from API → calls `POST /cards/claim` → saves sections via `PATCH /cards/:id/sections`.
- All 4 VCard pages (VCardsPage, VCardDetailPage, VCardContentEditorPage, ClaimTemplateModal) now have **zero** references to mock data stores.

**Why:** The 500 error on `GET /api/users/me/cards` was caused by the Card entity expecting columns (`name`, `description`, etc.) that the migration never created on the existing `cards` table. The seed file still had placeholder templates that appeared in the template library as phantom entries. Removing them and the mock fallbacks ensures the frontend is 100% API-driven — empty state shows when no data exists, no phantom/mock cards or templates appear.

---

## 11. [FRONTEND] Integrated `/b/cards` (My Business Cards) with real API endpoints

**Date:** 2026-08-25
**Files changed:**
- `apps/web/src/services/businessApi.ts`
- `apps/web/src/pages/business/CardsPage.tsx`
- `apps/web/src/pages/business/CardDetailPage.tsx`
- `apps/web/src/pages/business/card/CardContentEditorPage.tsx`
- `apps/web/src/pages/business/VCardsPage.tsx` (bug fix)
- `apps/web/src/pages/business/VCardDetailPage.tsx` (cleanup)
- `apps/web/src/pages/business/vcard/ClaimTemplateModal.tsx` (cleanup)

**What:**
- Added 4 new API methods to businessService: `updateCard`, `getCardAccess`, `createCardAccess`, `updateCardAccess`. Added `template` relation field to the `VCard` interface (backend CardResponseDto already returned it).
- **CardsPage (/b/cards)**: Now loads business via `GET /users/me/businesses`, cards via `GET /businesses/:id/cards` (falls back to `GET /users/me/cards` filtered to BUSINESS type), and templates via `GET /templates`. KPI tiles computed from real card data. Template chooser lists published API templates; tapping one calls `POST /cards/claim` and creates a REAL Business Card, then refreshes and selects it. QR sheet builds the URL from the active card slug (`/c/:slug`). Customize navigates by UUID. Removed mockAssignedCards, mockBusinessProfile, getBusinessPermissions, businessVCardLink.
- **CardDetailPage (/b/cards/:id)**: Fetches the card via `GET /cards/:id` (UUID-based). Details rows show real fields (template name, slug, views/scans/shares, assigned_at, last_admin_update). Storefront link built from real card slug. Password Protection modal now persists via `POST /cards/:id/access` / `PATCH /card-access/:accessId` (bcrypt-hashed PIN + hint on the backend; PIN is write-only so UI shows dots). Section approval lists built from real `card.sections`.
- **CardContentEditorPage (/b/cards/:id/edit)**: Loads editor state from `GET /cards/:id` sections merged with the client-side BIZ_CARD_SECTIONS schema (locked flags from API win). Save/Publish call `PATCH /cards/:id/sections` upserting content as `{ values, items }`. Reset re-fetches from the API instead of clearing localStorage. Removed getBusinessCardRow/getCardEditorContent/saveCardEditorContent/resetCardEditorContent localStorage usage.
- Shared mapper pattern: API section `content` jsonb stores `{ values, items }`; loaders accept both this shape and legacy flat values for backwards compatibility.
- Fixed latent bug from entry 8 migration: VCardsPage preview modal referenced nonexistent `getVCardEditorContent` — now maps raw API sections (`_apiId` lookup) into BizSectionState for ScrollingVCard. Also removed unused apiLoading/businessName states in VCardsPage + VCardDetailPage and unused GRADIENTS in ClaimTemplateModal.

**Why:** The My Business Cards pages were the last major dashboard surfaces still running entirely on mock arrays and localStorage. Wiring them to the completed cards endpoints means claimed templates, edited sections, and password protection now survive reloads and are stored server-side. Remaining known gaps (documented in the audit report): apply-template-to-existing-card, duplicate/download/print actions, plan-limit permissions endpoint, public view/scan/share tracking, and admin-side template publishing to DB.

---

## 12. [BACKEND + FRONTEND] Completed partial endpoints: card metadata PATCH + public stat tracking

**Date:** 2026-08-25
**Files changed:**
- `apps/api/src/modules/cards/dto/update-card.dto.ts`
- `apps/api/src/modules/cards/dto/track-card-event.dto.ts` (new)
- `apps/api/src/modules/cards/cards-public.controller.ts` (new)
- `apps/api/src/modules/cards/cards.service.ts`
- `apps/api/src/modules/cards/cards.module.ts`
- `apps/web/src/services/businessApi.ts`
- `apps/web/src/pages/public/SharedCardPage.tsx`
- `apps/web/src/pages/business/CardsPage.tsx`
- `apps/web/src/pages/business/CardDetailPage.tsx`

**What:**
- **PATCH /cards/:id completed**: UpdateCardDto now accepts optional `name` (max 200), `description` (max 2000), `category` (max 100) and `status` (enum: active | needs_update | locked | suspended). Service applies them to the entity patch. Previously only slug/type/template_id/business_id were updatable despite columns existing.
- **Stat tracking completed**: New PUBLIC controller `cards-public.controller.ts` (`POST /cards/public/:slug/track`, no JWT — global ThrottlerGuard still rate-limits). Body validated by TrackCardEventDto (event: view | scan | share; whitelist + forbidNonWhitelisted compliant). Service method `trackPublicEvent()` resolves the card by slug, calls the previously-orphaned incrementCardStat(), and inserts an AnalyticsEvent (`card_view`/`card_scan`/`card_share`) when the card has a linked business (analytics_events.business_id is NOT NULL).
- **Frontend integration**: businessService gained `trackCardEvent(slug, event)` and updateCard metadata fields. SharedCardPage fires view on mount and scan when arriving with ?src=qr. CardsPage Share button tracks share; QR sheet URL now appends ?src=qr so QR scans count as scans. CardDetailPage got an Edit Details modal (name/category/description) persisting through PATCH /cards/:id.
- **Verified end-to-end with live API**: create card -> track view x2 / scan / share (unauthenticated) -> GET confirms counters 2/1/1 -> PATCH renames + re-categorises + sets status -> invalid status/event both rejected 400 -> stats endpoint reflects counts -> cleanup.

**Why:** Card view/scan/share counters could never move because incrementCardStat() had no route calling it, and businesses could not rename or categorise their cards even though the DB columns existed since migration 031. Completing both closes the loop between the public card page and the dashboard KPI tiles, which until now always displayed zeros.

---

## 13. [BACKEND + FRONTEND] Built the three missing endpoints: apply-template, duplicate-card, business-permissions

**Date:** 2026-08-25
**Files changed:**
- `apps/api/src/modules/cards/dto/apply-template.dto.ts` (new)
- `apps/api/src/modules/cards/cards.service.ts` — `applyTemplate()`, `duplicate()`
- `apps/api/src/modules/cards/cards.controller.ts` — `POST /cards/:id/apply-template`, `POST /cards/:id/duplicate`
- `apps/api/src/modules/cards/dto/card-response.dto.ts` — sections/centre_controls now mapped through their response DTOs (were leaking raw camelCase entities)
- `apps/api/src/modules/businesses/businesses.service.ts` — `getPermissionsForUser()` + plan limit matrix
- `apps/api/src/modules/businesses/businesses.controller.ts` — `GET /users/me/business-permissions`
- `apps/api/src/modules/businesses/businesses.module.ts` — Membership/MembershipTier/Card repos registered
- `apps/web/src/services/businessApi.ts` — `applyTemplate`, `duplicateCard`, `getBusinessPermissions`, `BusinessPermissions` type
- `apps/web/src/pages/business/CardsPage.tsx`, `apps/web/src/pages/business/VCardsPage.tsx`

**What:**
- **Apply template to existing card** (`POST /cards/:id/apply-template`): owner-checked; swaps `template_id` and mirrors template name/category + `last_admin_update`. Sections the new template enables are upserted — saved content survives when schema_ids match; sections no longer in the template are disabled (not deleted); missing centre controls are re-created.
- **Duplicate card** (`POST /cards/:id/duplicate`): deep-copies the card row (unique `-copy` slug, `(Copy)` name suffix, zeroed stats) plus its sections and centre controls. Access settings/profile/customization/social links deliberately NOT copied — identity-specific.
- **Business permissions** (`GET /users/me/business-permissions`): resolves plan level (Bronze/Silver/Gold/Platinum substring match) + tier (Normal/Pro/Pro+) from the latest membership's tier name, looks up limits from a server-side matrix mirroring the default pricing catalogue (`null` = Unlimited), counts allocated vcards + business cards from DB, returns limits/allocated/remaining.
- **DTO consistency fix**: `CardResponseDto.sections`/`centre_controls` were serialised as raw TypeORM entities (camelCase `schemaId`) while `GET /cards/:id/sections` returned proper snake_case DTOs — any consumer reading embedded card sections got wrong keys. Both now map through `CardSectionResponseDto`/`CardCentreControlResponseDto`.
- **Frontend integration**: CardsPage template chooser now applies templates to the active card via apply-template (claims only when no card exists yet); Duplicate button calls the real duplicate API, prepends the copy and selects it; header shows "X allocated · Y remaining · Plan Tier plan" from the permissions API. VCardsPage header migrated off localStorage `getBusinessPermissions()` to the same endpoint.
- **Verified end-to-end with live API**: seeded two published templates -> claimed A -> saved branding content -> applied B (content preserved, removed sections disabled, signature added) -> duplicated (fresh slug/stats/4 sections) -> permissions showed Bronze 10/25 defaults then allocated 2/2 remaining 23 -> smoke data cleaned up.

**Why:** These were the three highest-value gaps from the audit: businesses could never switch their card's design without creating duplicate cards, could not copy an existing card, and the dashboard had no server-side source of truth for plan allocation ("X allocated · Y remaining" was computed from mock/localStorage pricing). The DTO fix additionally unblocks every future consumer of embedded card sections by making the API shape consistent.

---

## 14. [BACKEND] Enriched `GET /customers` with derived status, membership tier and share counts

**Date:** 2026-08-25
**Files changed:**
- `apps/api/src/modules/customers/customers.service.ts`
- `apps/api/src/modules/customers/customers.module.ts` — Membership repo registered
- `apps/api/src/modules/customers/customers.controller.ts` — Swagger description updated
- `apps/web/src/services/businessApi.ts` — `Customer` interface extended to match (no page consumers yet)

**What:**
- **Shares aggregation added**: `totalShares` existed on the record but was always hardcoded 0 — shares are now aggregated per customer via share -> card -> business join.
- **Derived status** via recency rules: `new` = first activity within 30 days; `at-risk` = no activity for 90+ days; otherwise `active`. Requires MIN(created_at) per source, so first/last activity now tracked across all three sources and merged correctly when an email appears in more than one.
- **Tier + memberSince via memberships join**: latest ACTIVE membership matched by lowercased email gives `tier` (tier name) and `memberSince` (membership start; falls back to first activity for non-members). Tier is null for customers without accounts/memberships.
- **userId exposure**: set when the customer is linked via a review or share (appointment-only guests stay null — matching users by email is a possible follow-up).
- Response keeps the same envelope ({ items, total, limit, offset }) and camelCase field style.
- **Verified live**: seeded business + Alice (appt 2d ago → new), Bob (appt 120d ago → at-risk), Carol (60d+10d appts → active, real user with Gold membership → tier "Gold", memberSince = membership start). All three statuses/tier/member-since correct. Smoke data cleaned up.

**Why:** The audit showed `/b/customers` was ~15% served: the derived endpoint had no classification or membership context, so every list row would have rendered "undefined member · 0 rewards". Status rules give the dashboard its Active/New/At-risk tiles from real data, and the tier join makes the membership tab data derivable before any schema work. Remaining known gaps (notes CRUD, upgrade grants, offers/spend attribution) need migrations and were deliberately left out of this step.

---

## 15. [BACKEND] Added `GET /customers/:email/detail` — single-customer aggregate

**Date:** 2026-08-25
**Files changed:**
- `apps/api/src/modules/customers/customers.service.ts` — `getCustomerDetail()`
- `apps/api/src/modules/customers/customers.controller.ts` — new route + Swagger
- `apps/api/src/modules/customers/customers.module.ts` — ActivityLog + User repos registered
- `apps/web/src/services/businessApi.ts` — `getCustomerDetail()` + `CustomerDetail`/sub-item types

**What:**
- Matches a customer case-insensitively by email (the list's key). Invalid email → 400; no interactions, account AND membership with the business → 404.
- Returns: enriched `customer` summary (identical shape to list items incl. derived status/tier/memberSince), `membership` block (tier/status/startedAt/expiresAt), plus arrays for `appointments` (with service name), `reviews` (rating/comment/status), `shares` (platform) and `activity` logs (type/title/description, capped at 100).
- The linked user account is resolved by email so appointment-only guests get `userId` here even though the list still leaves it null for them; reviews/shares/activity are keyed off that userId.
- Frontend service method distinguishes 404 (returns null → page can show its not-found state) from other failures (rethrows).
- **Verified live**: Carol detail returned status active / Gold tier / userId set / 2 appointments / 5-star review / membership block; unknown email 404; malformed email 400. Smoke data cleaned up.

**Why:** Step 2 of the customers plan — gives the `/b/customers/:id` page one endpoint to render its header, quick stats and four of its eight tabs (Appointments, Membership, Activity, plus Reviews data) without N+1 calls. Rewards, transactions/spend, redeemed offers, exchanges and notes remain unservable pending schema decisions documented in the audit.

---

## 16. [BACKEND] Customer notes — table + CRUD (step 3)

**Date:** 2026-08-25
**Files changed:**
- `apps/api/src/migrations/1712000000032-CreateCustomerNotes.ts` (new) — applied via `npm run migration:run`
- `apps/api/src/modules/customers/entities/customer-note.entity.ts` (new)
- `apps/api/src/modules/customers/dto/create-customer-note.dto.ts`, `update-customer-note.dto.ts` (new)
- `apps/api/src/modules/customers/customers.service.ts` — listNotes/createNote/updateNote/deleteNote + notes folded into detail aggregate
- `apps/api/src/modules/customers/customers.controller.ts` — 4 new routes
- `apps/web/src/services/businessApi.ts` — `CustomerNoteItem` type + 4 methods

**What:**
- **Schema**: `customer_notes(id, business_id → businesses CASCADE, customer_email varchar(255), author_id → users SET NULL, note text, timestamps)` with business and (business, email) indexes. Notes attach to (business, email) because customers are derived, not stored rows.
- **Endpoints** (all owner-scoped to the caller's business):
  - `GET /customers/:email/notes` — newest first, with resolved `author_name`
  - `POST /customers/:email/notes` — author = current user; email validated; works for emails with no prior interactions (CRM-style lead capture)
  - `PATCH /customers/notes/:noteId` — text-only edit; cross-business access returns 404
  - `DELETE /customers/notes/:noteId`
- **Detail aggregate now includes `notes`** array + `totalNotes` in the summary; notes alone make a customer "exist" in detail (existence check extended).
- **Migration bookkeeping fix**: migration 031 had been applied manually via psql but never recorded, so `migration:run` crashed on it before reaching 032. Inserted its row into the migrations table; runner is healthy again.
- **Verified live**: create (author_name resolved) → list → update text → detail shows totalNotes=1 + notes payload → note for a never-seen lead email creates a visible customer in detail → unknown note id 404 → cascade cleanup confirmed zero rows left.

**Why:** Notes was the only fully-missing sub-feature that needed no product decision about attribution semantics — a private business-side record keyed by email. It closes the Notes tab data path and improves the detail endpoint's completeness without touching any shared schema.

---

## 17. [FRONTEND] Customer detail page wired to live API + Notes CRUD UI

**Date:** 2026-08-25
**Files changed:**
- `apps/web/src/pages/business/CustomerDetailPage.tsx` — full rewrite

**What:**
- Route param `:id` is now the URL-encoded customer email; the page fetches `GET /customers/:email/detail` on mount.
- Four real tabs rendered from API data: **Membership** (tier + dates + grants reminder), **Appointments** (service, date, time, status pill), **Activity** (typed icons, timestamps), **Reviews** (star rating, comment, date). Removed unservable tabs (Rewards, Transactions, Redeemed Offers, Exchanges) pending schema decisions.
- **Notes tab** has a full create-read-update-delete UI: add-note textarea at top, each note row shows text + author + timestamp + edit/delete buttons on hover, inline edit with textarea + save/cancel, delete with toast confirmation.
- Quick stats row shows real totals: appointments, reviews, shares, notes.
- Loading skeleton and 404 state with "Back to customers" link.
- Removed `CONSUMER_LEVELS` constant, `getBusinessPermissions` localStorage call, upgrade modal, and the old `getCustomerById` mock import — all zero mock references.
- `avatarColorFor` and `initialsOf` imported from CustomersPage (shared helpers).

**Why:** This was the last mock-data page in the business dashboard. The backend already supports the full detail aggregate (step 2) and notes CRUD (step 3); this wires them together so `/b/customers/:id` is entirely API-driven, completing the three-step customers integration.

---

## 18. [FRONTEND] Rewards pages wired to live API

**Date:** 2026-08-25
**Files changed:**
- `apps/web/src/services/businessApi.ts` — `RewardBalance` + `RewardTransaction` interfaces + 4 service methods
- `apps/web/src/pages/business/RewardsPage.tsx` — removed `mockIntegrations` import; MCOM Rewards card hardcoded
- `apps/web/src/pages/business/rewards/IssueRewardPage.tsx` — rewrote to call `POST /rewards/transactions` + `POST /rewards/balance` (idempotent); customer dropdown from `GET /customers`
- `apps/web/src/pages/business/rewards/RedeemHistoryPage.tsx` — rewrote to call `GET /rewards/transactions`; shows all transaction types with signed amounts
- `apps/web/src/pages/business/rewards/RewardsIssuedPage.tsx` — rewrote to call `GET /rewards/transactions` + `GET /rewards/balance`; summary stats (issued/earned/adjusted/balance) from real ledger
- `apps/web/src/pages/business/rewards/PendingRewardsPage.tsx` — rewrote to call `GET /rewards/transactions` + `GET /rewards/balance`; gradient balance card + pending earns list

**What:**
- **API layer**: Added `RewardBalance` (`id, user_id, balance, status, created_at, updated_at`) and `RewardTransaction` (`id, reward_balance_id, type, amount, balance_after, description, created_at`) interfaces matching the backend DTOs. Added `getRewardBalance`, `createRewardBalance`, `getRewardTransactions`, `createRewardTransaction` methods to `businessService`.
- **IssueRewardPage**: Customer dropdown fetched from real API; form issues EARN or ADJUST transactions with amount + note; ensures balance exists before issuing; toast success/error feedback.
- **RedeemHistoryPage**: Full transaction ledger with type labels (Earned/Redeemed/Expired/Adjusted), signed amounts (green/red), timestamps.
- **RewardsIssuedPage**: Summary stats (total issued, points given, adjusted, current balance) computed from real transactions; list shows all EARN + ADJUST transactions.
- **PendingRewardsPage**: Gradient balance card showing current balance; lists all EARN transactions (pending until redeemed/expired).
- **RewardsPage hub**: Removed `mockIntegrations` import; MCOM Rewards "Coming soon" card is now hardcoded.
- 4 pages without backend endpoints (Campaigns, Coupons, Cashback, GiftCards) left with mock data — those features need new backend endpoints.

**Why:** The core rewards engine (balance + transactions) was fully built on the backend but all frontend pages used mock data from `businessDashboardStore`. This wires the 4 pages that have existing endpoints (Issue, History, Issued, Pending) to the real API, leaving only the 4 feature-specific pages (Campaigns, Coupons, Cashback, GiftCards) for when those backend features are built.

---

## 19. [BACKEND + FRONTEND] Campaigns, Coupons, Cashback Programs, Gift Cards — full stack

**Date:** 2026-08-25
**Files changed:**
- `apps/api/src/migrations/1712000000033-CreateGiftCardAndCashbackProgramTables.ts` (new) — applied
- `apps/api/src/modules/finance/entities/gift-card.entity.ts` (new)
- `apps/api/src/modules/finance/entities/cashback-program.entity.ts` (new)
- `apps/api/src/modules/finance/dto/catalog-response.dto.ts` (new)
- `apps/api/src/modules/finance/dto/catalog.dto.ts` (new)
- `apps/api/src/modules/finance/catalog.service.ts` (new) — 10 methods
- `apps/api/src/modules/finance/catalog.controller.ts` (new) — 10 endpoints
- `apps/api/src/modules/finance/finance.module.ts` — registered CatalogController + CatalogService + GiftCard + CashbackProgram + Business repos
- `apps/web/src/services/businessApi.ts` — 6 new interfaces + 12 new service methods
- `apps/web/src/pages/business/rewards/CampaignsPage.tsx` — rewrote to `GET /campaigns` + toggle status
- `apps/web/src/pages/business/rewards/CouponsPage.tsx` — rewrote to `GET /campaigns` → flatten offers/coupons
- `apps/web/src/pages/business/rewards/CashbackPage.tsx` — rewrote to `GET /cashback-programs` + toggle status
- `apps/web/src/pages/business/rewards/GiftCardsPage.tsx` — rewrote to `GET /gift-cards` + toggle status

**What:**
- **Gift Cards**: `gift_cards` table (business_id FK, title, value, price, status, sold) + full CRUD (5 endpoints: list/create/get/update/delete). Owner-scoped via business ownership check.
- **Cashback Programs**: `cashback_programs` table (business_id FK, title, rate %, status, earned) + full CRUD (5 endpoints: list/create/get/update/delete). Owner-scoped.
- **Campaigns**: Already existed (`GET /campaigns`, `POST /campaigns`, `PATCH /campaigns/:id`, `DELETE /campaigns/:id`) — wired to frontend.
- **Offers**: Already existed (`POST /campaigns/:id/offers`, `GET /campaigns/:id/offers`) — used to flatten coupons for CouponsPage.
- **Coupons**: Already existed (`GET /campaigns/offers/:id/coupons`, `POST /campaigns/offers/:id/coupons`, `PATCH /campaigns/coupons/:id`) — flattened for CouponsPage.
- **Frontend interfaces**: Added `Campaign`, `Offer`, `Coupon`, `GiftCard`, `CashbackProgram` to `businessApi.ts`.
- **Frontend methods**: `getCampaigns`, `createCampaign`, `updateCampaign`, `deleteCampaign`, `listOffers`, `createOffer`, `listCoupons`, `createCoupon`, `updateCoupon`, `getGiftCards`, `createGiftCard`, `updateGiftCard`, `deleteGiftCard`, `getCashbackPrograms`, `createCashbackProgram`, `updateCashbackProgram`, `deleteCashbackProgram`.
- All 9 rewards pages now use real API — zero mock data references remain in the rewards section.
- **Backend tsc clean**; **migration 033 applied**.

**Why:** The 4 remaining mock-only rewards pages (Campaigns, Coupons, Cashback, GiftCards) needed backend endpoints. Campaigns/Coupons already existed but were unwired; Gift Cards and Cashback Programs needed new tables, entities, and CRUD endpoints. This completes the full rewards section — every `/b/rewards/*` page now uses real API data.

---

## 20. [BACKEND + FRONTEND] Campaign templates — table + endpoints + frontend wiring

**Date:** 2026-08-26
**Files changed:**
- `apps/api/src/migrations/1712000000034-CreateCampaignTemplates.ts` (new) — applied
- `apps/api/src/modules/campaigns/entities/campaign-template.entity.ts` (new)
- `apps/api/src/modules/campaigns/dto/campaign-response.dto.ts` — `CampaignTemplateResponseDto` added
- `apps/api/src/modules/campaigns/campaigns.service.ts` — `listTemplates`, `getTemplate`, `createTemplate` + injected `CampaignTemplate` repo
- `apps/api/src/modules/campaigns/campaigns.controller.ts` — `GET /campaigns/templates`, `GET /campaigns/templates/:id` (placed before `:id` to avoid route conflict)
- `apps/api/src/modules/campaigns/campaigns.module.ts` — registered `CampaignTemplate` entity
- `apps/web/src/services/businessApi.ts` — `CampaignTemplate` interface + `getCampaignTemplates()` method
- `apps/web/src/pages/business/rewards/CampaignsPage.tsx` — rewrote templates section to fetch from API

**What:**
- **Schema**: `campaign_templates(name, type, description, suggested_reward, status)` — platform-wide, admin-managed. Seeded with 3 defaults: Spring Expo Promo (Seasonal), Loyalty Boost (Evergreen), Referral Rewards (Referral).
- **Endpoints**: `GET /campaigns/templates` (list all), `GET /campaigns/templates/:id` (get one). Both JWT-auth.
- **Route ordering fix**: Templates routes placed before `:id` in the controller to prevent NestJS matching "templates" as a UUID.
- **Frontend**: CampaignsPage templates section now fetches from `GET /campaigns/templates` instead of hardcoded `AVAILABLE_CAMPAIGNS` array. Shows template name, type pill, description, suggested reward, and activate button.
- **Backend tsc clean**; **migration 034 applied**.

**Why:** The "Available campaigns" section in CampaignsPage was hardcoded mock data with no backend. This creates the `campaign_templates` table and endpoints so templates are admin-managed in the DB and the frontend fetches them in real time.

---

## 21. [BACKEND + FRONTEND] MCOM Solutions SSO + Billing Integration

**Date:** 2026-08-27
**Files changed:**
- `apps/api/.env` / `.env.example` — `MCOM_SOLUTIONS_URL`, `MCOM_CLIENT_ID/SECRET`, `MCOM_HMAC_SECRET`, `MCOM_API_KEY`, `MCOM_WEBHOOK_SECRET`, `MCOM_PLATFORM_SLUG`, `MCOM_REDIRECT_URI`, `MCOM_SCOPES`, `MCOM_MEMBERSHIP_URL`
- `apps/api/src/lib/config/validation.ts` — Joi schema for the new MCOM vars
- `apps/api/src/migrations/1712000000035-AddMcomSsoFields.ts` (new) — applied; adds `mcom_*` columns to `users` (user id, membership level/status, `can_access_vcard`, encrypted access/refresh tokens)
- `apps/api/src/modules/users/entities/user.entity.ts` — mirrored `mcom_*` columns
- `apps/api/src/modules/mcom/` (new module) — `mcom.service.ts`, `mcom.controller.ts`, `mcom.module.ts`, `dto/sso-callback.dto.ts`
- `apps/api/src/lib/utils/mcom-crypto.util.ts` (new) — AES-256-GCM envelope for Central tokens at rest
- `apps/api/src/lib/utils/oauth-state-cookie.util.ts` (new) — CSRF `state` + post-login return-context cookies
- `apps/api/src/lib/utils/dto/user-response.dto.ts` — exposes `permissions.can_access_vcard`, `membership_level`, `membership_status`
- `apps/api/src/modules/auth/auth.service.ts` — JIT provisioning (`mcomProvisionAndIssue`), `syncMcomSession`, public `issueTokens`
- `apps/api/src/app.module.ts` — registered `McomModule`
- `apps/web/src/services/mcom.ts` (new) — SSO start/complete/refresh/status/config
- `apps/web/src/contexts/AuthContext.tsx` — `loginWithMcom`, `completeMcomCallback`, `refreshMcomStatus`
- `apps/web/src/pages/auth/LoginPage.tsx` — "Login with MCOM" button (card/business invite context preserved)
- `apps/web/src/pages/auth/AuthCallbackPage.tsx` (new) + `/auth/callback` route
- `apps/web/src/components/auth/RequireVcardAccess.tsx` (new) — gates `/b/*`, `/c/*`, `/user/*` behind `can_access_vcard`
- `apps/web/src/types/index.ts` — `permissions`, `membership_level`, `membership_status` on `User`/`ApiUserResponse`
- `apps/web/src/i18n/locales/en.json` — `auth.login_with_mcom`, `auth.or`

**What:** OAuth 2.0 authorization-code SSO against MCOM Solutions Central (`http://localhost:3010/api/v1`). Backend `GET /auth/sso/login` issues a 32-byte CSRF `state` cookie + authorize URL; `POST /auth/sso/callback` validates state, exchanges the code (Basic-auth client credentials — Central's DTO forbids `client_secret` in the body), fetches `/auth/sso/userinfo` for dynamic permissions, JIT-provisions/upserts the local user by email, and issues a local JWT + refresh cookie. Also added `/auth/sso/refresh`, `/auth/sso/status?sync=1`, secret-free `/auth/sso/config`, and an HMAC-signed `/auth/sso/data/permissions` call to the Central data-sharing API. Central tokens are stored AES-256-GCM-encrypted. The frontend gates all business/consumer/user dashboards on `can_access_vcard === true` with an upgrade/access-denied screen.
- **Verified**: migration 035 applied; API boots; authorize URL + state cookie correct; HMAC-signed request accepted by Central (404 = auth passed); web `tsc`+build clean; **no secrets in the client bundle** (`.env` is gitignored).

**Why:** vCards authentication/billing is handled centrally at MCOM Solutions. This integrates the app into the Central SSO + billing ecosystem so access to the platform is controlled by the user's active MCOM package (`canAccess_vcard`), with server-side secrets and CSRF-safe OAuth state.
