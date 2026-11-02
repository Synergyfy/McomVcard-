# Audit: `/admin/plans/create` entitlements vs. the business dashboard

**Date:** 2 Nov 2026  
**Scope:** `apps/web/src/pages/admin/plans/*`, `apps/web/src/components/admin/plans/PlanForm.tsx`, `apps/web/src/services/planCapabilitySchema.ts`, the `/b/*` business dashboard, and the API modules that resolve or enforce plan capabilities.  
**Method:** static inspection of the current working tree (including uncommitted changes). No code was changed.  
**Question:** can a super-admin configure every business-dashboard feature from `/admin/plans/create`, and are paying users actually limited to what is configured there?

---

## 1. Executive verdict

**Partly configured, not enforced.**

- `/admin/plans/create` **does render** a **Feature access** and **Usage limits** editor for each of the three variants (Standard, Pro, Pro+).
- Those controls write real data into `plan.variants[].configuration.quotas` / `.featureFlags`.
- But **the business dashboard does not use that data**. It reads a separate, hard-coded permissions system based on the user's `memberships` record and `PLAN_LIMIT_MATRIX`.
- No API route uses `@RequireCapability(...)`, so the `CapabilityGuard` is never invoked. The `/capabilities/*` API exists, but it is essentially informational.
- The frontend `useCapabilities()` hook exists but is **never used**. Only `MyPlanCard` reads `/capabilities/me`, and it only *displays* the values.
- Therefore the statement "if a user pays for a plan variant, they are limited to what admin configures on `/admin/plans/create`" is **not true in the current codebase**.

A paying user sees the plan and its capabilities in the "My Plan" card, but every business page remains reachable and every quota is either unenforced or enforced from the separate hard-coded matrix.

---

## 1a. Feature-parity check: admin controls vs. business dashboard

This section answers the specific question: **does every feature the admin can configure on `/admin/plans/create` correspond to a feature the business actually has in its dashboard, and is every business-dashboard feature represented on that page?**

### A. Every admin control → matching dashboard feature?

| Admin control | Type | Matching business-dashboard feature | Match |
|---|---|---|---|
| `maxVCards` | quota | `/b/vcards` — Business VCards | Yes |
| `maxBusinessCards` | quota | `/b/cards` — Business Cards | Yes |
| `maxFriendsFamily` | quota | `/b/family` — Friends & Family allocations | Yes |
| `maxAdditionalCards` | quota | **No business-dashboard page consumes this** | **No — orphan** |
| `advancedAnalytics` | flag | `/b/analytics` | Yes |
| `customerCrm` | flag | `/b/customers` and `/b/customers/:id` | Yes |
| `rewards` | flag | `/b/rewards`, `/b/rewards/issue`, `/b/rewards/history`, `/b/rewards/issued`, `/b/rewards/pending` | Yes |
| `campaigns` | flag | `/b/rewards/campaigns` | Yes |
| `coupons` | flag | `/b/rewards/coupons` | Yes |
| `cashbackPrograms` | flag | `/b/rewards/cashback` | Yes |
| `giftCards` | flag | `/b/rewards/gift-cards` (also appears inside `/b/wallet`) | Yes |
| `friendsFamily` | flag | `/b/family` | Yes (duplicates `maxFriendsFamily`) |
| `appointments` | flag | `/b/appointments` | Yes |
| `customQrCodes` | flag | `/b/qr` | Yes (base QR page only) |
| `wallet` | flag | `/b/wallet` | Yes |
| `reports` | flag | `/b/reports` | Yes (whole page, including exports) |

**Result:** 15 of the 16 controls map to a real dashboard feature. The single orphan is **`maxAdditionalCards`** — nothing in `/b/*` reads it, and the consumer-side "additional cards" feature uses different keys (`familyCards` / `friendCards`).

### B. Every business-dashboard feature → admin control?

| Dashboard feature | Where it appears | Admin control on `/admin/plans/create` |
|---|---|---|
| Home / stats / quick actions | `/b/dashboard` | None (core) |
| Business VCards | `/b/vcards`, `/b/vcards/:id`, `/b/vcards/:id/edit` | `maxVCards` + `content` is not a key; Share/Exchange/Redeem/Password are not keys |
| Business Cards | `/b/cards`, `/b/cards/:id`, `/b/cards/:id/edit` | `maxBusinessCards` + `content`, Share, Password are not keys |
| Customers | `/b/customers`, `/b/customers/:id` | `customerCrm` |
| Rewards hub / issue / history / issued / pending | `/b/rewards/*` | `rewards` |
| Campaigns | `/b/rewards/campaigns` | `campaigns` |
| Coupons | `/b/rewards/coupons` | `coupons` |
| Cashback | `/b/rewards/cashback` | `cashbackPrograms` |
| Gift cards | `/b/rewards/gift-cards`, `/b/wallet` | `giftCards` |
| Friends & Family | `/b/family` | `friendsFamily` + `maxFriendsFamily` |
| Appointments | `/b/appointments` | `appointments` |
| Analytics | `/b/analytics` | `advancedAnalytics` |
| Reports | `/b/reports` | `reports` |
| Wallet / Smart Money | `/b/wallet` | `wallet` |
| QR code | `/b/qr` | `customQrCodes` |
| **Notifications** | `/b/notifications` | **Missing** |
| **Integrations** | `/b/integrations` | **Missing** |
| **Share** (VCard/Card + home quick action) | `/b/vcards/:id`, `/b/cards/:id`, `/b/dashboard` | **Missing** (`share`) |
| **Exchange** | `/b/vcards/:id`, VCard editor | **Missing** (`exchange`) |
| **Redeem** | `/b/vcards/:id`, VCard editor | **Missing** (`redeem`) |
| **Password protection** | `/b/vcards/:id`, `/b/cards/:id` | **Missing** (`passwordAccess`) |
| **Content editing** | `/b/vcards/:id/edit`, `/b/cards/:id/edit` | **Missing** (`content`) |
| **Report exports** (CSV/PDF/XLSX) | `/b/reports` → Exports tab | **Missing** — only the whole `reports` flag |
| **QR scan rules** (Daily/Seasonal/Unlimited) | `/b/qr` → Scan rule | **Missing** — controlled by the `localStorage` membership pricing store |
| Membership / Settings / Help & Support | `/b/membership`, `/b/settings`, `/b/help` | None (core/account — probably should stay un-gated) |

**Result:** 14 paid dashboard areas are represented (some only by a page-level flag), while **7 real features/pages have no control at all** — Notifications, Integrations, Share, Exchange, Redeem, Password protection, Content editing — plus **2 sub-features** (report exports and QR scan rules) that are not independently configurable.

### C. Structural mismatches in the current control set

1. **Parent/child features are flat.** `rewards` is a parent of `campaigns`, `coupons`, `cashbackPrograms`, and `giftCards`, but the four children are separate flags with no dependency. `reports` contains an Exports sub-feature with no flag. `wallet` and `giftCards` overlap because the Wallet page also renders gift cards.
2. **Duplicate control for the same page.** `friendsFamily` (flag) and `maxFriendsFamily` (quota) both target `/b/family`.
3. **One orphan quota.** `maxAdditionalCards` has no consumer in the business dashboard.
4. **Consumer plans are not aligned at all.** The page shows the same 16 business controls for consumer plans, but consumer features (Consumer Cards, Consumer VCards, family/friend allowances, e-card value) are not in the schema.
5. **The admin's "Included features" text list is marketing copy**, not access control. It is displayed at checkout / plan cards, but it is not linked to any dashboard feature.

### D. Direct answer

**No — the control list and the business-dashboard feature list are not in parity.**

- Everything except `maxAdditionalCards` that the admin can configure does correspond to a real business-dashboard feature.
- But the dashboard exposes several real features that cannot be configured at all (most notably Notifications, Integrations, Share/Exchange/Redeem, Password protection, Content editing, report exports, QR scan rules).
- The admin page also exposes one control (`maxAdditionalCards`) that has no matching business-dashboard feature.
- The two lists are therefore **close but incomplete**, and the hierarchy/overlap problems make even the matching entries ambiguous.

---

## 2. What `/admin/plans/create` actually exposes

`PlanCreatePage.tsx` renders `PlanForm` (`apps/web/src/pages/admin/plans/PlanCreatePage.tsx:44`). The form has 4 steps:

1. Plan details
2. Standard (90 days)
3. Pro (180 days)
4. Pro+ (365 days)

The **Feature access** editor is at `PlanForm.tsx:400-453`.  
The **Usage limits** editor is at `PlanForm.tsx:321-398`.  
Both are rendered only for the selected variant (`VariantEditor`, `PlanForm.tsx:455-560`), so an admin must open each variant and configure it separately.

### 2.1 Usage limits (quotas)

Source: `apps/web/src/services/planCapabilitySchema.ts:33-63` (mirrored in `apps/api/src/modules/plans/plan-capability-schema.ts:26-32`).

| Key | Label | Semantics |
|---|---|---|
| `maxVCards` | Business VCards | number, `-1` = unlimited |
| `maxBusinessCards` | Business cards | number, `-1` = unlimited |
| `maxFriendsFamily` | Friends & Family | number, `-1` = unlimited |
| `maxAdditionalCards` | Additional cards | number, `-1` = unlimited |

Stored as `configuration.quotas[key]` on the variant. `0` means disabled, `-1` means unlimited, a positive number means a finite cap.

### 2.2 Feature access (flags)

Source: `planCapabilitySchema.ts:64-125`.

| Key | Label | Intended business-dashboard area |
|---|---|---|
| `advancedAnalytics` | Analytics | `/b/analytics` |
| `customerCrm` | Customers | `/b/customers` |
| `rewards` | Rewards | `/b/rewards` |
| `campaigns` | Campaigns | `/b/rewards/campaigns` |
| `coupons` | Coupons | `/b/rewards/coupons` |
| `cashbackPrograms` | Cashback programmes | `/b/rewards/cashback` |
| `giftCards` | Gift cards | `/b/rewards/gift-cards` |
| `friendsFamily` | Friends & Family | `/b/family` |
| `appointments` | Appointments & bookings | `/b/appointments` |
| `customQrCodes` | QR codes | `/b/qr` |
| `wallet` | Wallet / Smart Money | `/b/wallet` |
| `reports` | Reports & exports | `/b/reports` |

Stored as `configuration.featureFlags[key]` on the variant.

### 2.3 Important form behaviour

- The schema has an `audiences` field (`planCapabilitySchema.ts:24-25`), and `capabilityFieldsForAudience()` filters on it, but **no field defines an audience**. Every quota and flag is therefore shown for both **Business** and **Consumer** plans.
- New variants are seeded with `withSchemaDefaults()` (`PlanForm.tsx:99-121`): **all quotas default to `-1` (Unlimited)** and **all flags default to `false` (off)**. A newly created, priced variant therefore grants unlimited card quotas but no feature modules.
- `configurationPayload()` writes every seeded key explicitly (`PlanForm.tsx:179-192`), so form-created plans carry a complete key set.
- The plan-level `form.configuration` exists in state but has **no editor**; only variant-level configuration is written by this screen.
- The backend DTO accepts arbitrary nested keys (`PlanConfigurationDto`, `apps/api/src/modules/plans/dto/plan.dto.ts:64-80`); there is no server-side validation against the schema.

---

## 3. Business dashboard inventory

The isolated business dashboard is `/b/*` (`apps/web/src/App.tsx:273-308`). It has 31 destinations plus a redirect. The sidebar/menus are in `BusinessSidebar.tsx`, `BusinessBottomNav.tsx`, and `BusinessMoreSheet.tsx`.

| Route | Page | Paid feature? | Control on `/admin/plans/create`? | Real enforcement today |
|---|---|---|---|---|
| `/b/dashboard` | Home / stats / wallet / activity | Core | No | Binary `can_access_vcard` gate only |
| `/b/vcards` | Business VCards list | Yes | `maxVCards` (quota) | UI uses `PLAN_LIMIT_MATRIX`, API create has no quota check |
| `/b/vcards/:id` | VCard detail (share, exchange, redeem, QR, password, history) | Yes | Only QR + analytics flags; share/exchange/redeem/password/history/content missing | No feature gating |
| `/b/vcards/:id/edit` | VCard content editor | Yes | No (`content` is not a key) | No gating |
| `/b/cards` | Business cards | Yes | `maxBusinessCards` (quota) | UI shows matrix remaining; claim/duplicate API has no quota check |
| `/b/cards/:id` | Business card detail | Yes | Same missing sub-features as VCard detail | No gating |
| `/b/cards/:id/edit` | Card content editor | Yes | No (`content` is not a key) | No gating |
| `/b/customers` | Customers / CRM | Yes | `customerCrm` | Flag is never read |
| `/b/customers/:id` | Customer detail | Yes | `customerCrm` | Never read |
| `/b/rewards` | Rewards hub | Yes | `rewards` | Never read |
| `/b/rewards/issue` | Issue reward | Yes | `rewards` | Never read |
| `/b/rewards/campaigns` | Campaigns | Yes | `campaigns` | Never read |
| `/b/rewards/coupons` | Coupons | Yes | `coupons` | Never read |
| `/b/rewards/cashback` | Cashback | Yes | `cashbackPrograms` | Never read |
| `/b/rewards/gift-cards` | Gift cards | Yes | `giftCards` | Never read |
| `/b/rewards/history` | Redemption history | Yes | `rewards` (implied) | Never read |
| `/b/rewards/issued` | Rewards issued | Yes | `rewards` (implied) | Never read |
| `/b/rewards/pending` | Pending rewards | Yes | `rewards` (implied) | Never read |
| `/b/family` | Friends & Family | Yes | `friendsFamily` + `maxFriendsFamily` | Flag never read; quota enforced from matrix |
| `/b/appointments` | Appointments & bookings | Yes | `appointments` | Never read |
| `/b/analytics` | Analytics | Yes | `advancedAnalytics` | Never read; page always renders |
| `/b/reports` | Reports + CSV/PDF/XLSX export | Yes | `reports` | Never read; export tab always available |
| `/b/wallet` | Wallet / Smart Money / gift cards | Yes | `wallet` + partly `giftCards` | Never read |
| `/b/qr` | QR codes + scan rules | Yes | `customQrCodes` only | Flag never read; scan rules come from `localStorage` pricing store |
| `/b/notifications` | Notifications | Yes (probably) | **Missing** | No gating |
| `/b/integrations` | Integrations (coming soon) | Yes (probably) | **Missing** | No gating |
| `/b/membership` | Membership / plan | Account | N/A | Should stay available |
| `/b/membership/plans` | Membership plans | Account | N/A | Should stay available |
| `/b/membership/confirmation` | Purchase confirmation | Account | N/A | Should stay available |
| `/b/settings` | Settings | Core | N/A | Should stay available |
| `/b/help` | Help & Support | Core | N/A | Should stay available |

The dashboard's own legacy feature catalogue (`apps/web/src/types/business.ts:78-95`) defines these keys: `share`, `exchange`, `redeem`, `friendsFamily`, `passwordAccess`, `qr`, `analytics`, `history`, `content`, `reports`, `integrations`, `membership`, `help`, `settings`. The plan schema covers only `friendsFamily`, `qr`, `analytics`, and `reports` from that list — **4 of 14**. Newer pages (`rewards`, `campaigns`, `coupons`, `cashback`, `giftCards`, `appointments`, `wallet`, `customerCrm`) were added to the plan schema but are not in that old catalogue; those flags are still not read anywhere.

---

## 4. What is actually enforced today

### 4.1 No API route uses the capability system

`@RequireCapability` is defined (`apps/api/src/modules/capabilities/require-capability.decorator.ts`) and the guard is implemented (`capability.guard.ts`), but a repository-wide search finds **zero controller usages**:

```
grep -rn "RequireCapability(" apps/api/src --include=*.ts
# only the decorator definition itself
```

The guard is registered in `CapabilitiesModule` (`capabilities.module.ts:13-14`) but is never attached globally or per-controller. So no API endpoint checks `featureFlags` or `quotas`.

`CapabilitiesService.assert()` (`capabilities.service.ts:162-182`) would deny a disabled feature or a reached quota, but it is only called from:

- the unused `CapabilityGuard`,
- `CapabilitiesController` (`GET /capabilities/check/:key`),
- nowhere in the business modules.

### 4.2 The business dashboard reads a different permissions system

The endpoint used by the dashboard is `GET /users/me/business-permissions` (`businesses.controller.ts:171`), which calls `BusinessesService.getPermissionsForUser()` (`businesses.service.ts:122`). That service:

1. Looks up the newest `memberships` row for the user (`businesses.service.ts:132-136`).
2. Derives `planLevel` from the **tier name** (`Bronze/Silver/Gold/Platinum`) and `planTier` from `Normal/Pro/Pro+`.
3. Reads a **hard-coded** `PLAN_LIMIT_MATRIX` (`businesses.service.ts:30-40`).
4. Returns `limits` for `vcards`, `business_cards`, `friends_family`, `qr_routing_rules`.

It never touches `plan.variants[].configuration`. The matrix values are fixed in source:

```ts
Bronze: { vcards: [10, 25, 50], businessCards: [25, 50, 100], friendsFamily: [10, 25, 50], qrRoutingRules: [5, 10, 20] }
Silver: ...
Gold:   ...
Platinum: ...
```

The only backend quota enforcement found is Friends & Family: `BusinessFamilyService.assertWithinLimit()` reads `permissions.limits.friends_family` (`business-family.service.ts:61-69`), i.e. the matrix value. `DashboardService` also reads the same permissions for report/entitlement displays (`dashboard.service.ts:114`).

### 4.3 Plan purchases store a variant, but it does not drive the dashboard

The purchase flow is correct up to a point:

- Checkout sends the selected variant.
- `McomPackagesService` resolves the stored variant and calls `SubscriptionsService.activatePlan()` with `variant` (`mcom-packages.service.ts:122-145`, `286-300`).
- `SubscribedPlan` stores `variant` (`subscriptions/entities/subscribed-plan.entity.ts:38-44`).
- `CapabilitiesService.resolveForUser()` resolves the active subscription, variant, and merged configuration (`capabilities.service.ts:87-131`).
- `GET /capabilities/me` returns those values.

But the business dashboard's `business-permissions` endpoint is based on the **`memberships` table**, not `subscribed_plans`. A plan purchase does not create or update a `memberships` row; it only writes `subscribed_plans` and `users.mcomMembershipTier/Level` (`subscriptions.service.ts:164-169`). So:

- a user who buys a Standard/Pro/Pro+ variant from `/plans` gets the variant in `capabilities/me`,
- but the dashboard's limits still fall back to the latest membership row, or to `Bronze` when none exists (`resolvePlanLevel('') → Bronze`, `businesses.service.ts:42-45`),
- and the admin's `maxVCards`, `maxBusinessCards`, `maxFriendsFamily`, `maxAdditionalCards` never reach the dashboard.

### 4.4 The frontend capability hook is dead code

`apps/web/src/hooks/useCapabilities.ts` is fully implemented (`can`, `limit`, `remaining`), but a search finds **no consumer**:

```
grep -rn "useCapabilities" apps/web/src --include=*.tsx
# only the hook file itself
```

`capabilitiesService.get()` is called only by `MyPlanCard.tsx:68-71`. That card renders the first five capabilities (`MyPlanCard.tsx:224-236`) but does not gate any route, button, or page.

### 4.5 The dashboard pages only use the matrix limits

Pages that call `businessService.getBusinessPermissions()`:

- `VCardsPage.tsx:111` — displays remaining and disables template claim at the matrix limit.
- `CardsPage.tsx:70` — displays remaining only; the claim/duplicate buttons are not blocked by it.
- `AnalyticsPage.tsx:60` — displays entitlements from matrix limits.
- `QRCodePage.tsx:30` — displays plan/tier; scan rules come from `localStorage`.
- `FamilyPage.tsx:36` — blocks allocation at the matrix limit.
- `IntegrationsPage.tsx:16` — only uses the permissions response as a loading flag; it does not check it.

No business page reads `featureFlags` or a capability key.

### 4.6 API mutation routes have no quota checks

- VCard creation / template claim: `CardsService.claimTemplate()` (`cards.service.ts:176-240`) checks ownership, template status and slug, not quotas.
- Card claim/duplicate: same service, no quota check.
- Rewards, campaigns, coupons, cashback, gift cards, appointments, analytics, reports, wallet, QR: their controllers do not use capability guards (see 4.1).
- Only Friends & Family is capped, from the matrix.

So even a "limited" quota is only a display value on most pages.

---

## 5. Coverage gaps on `/admin/plans/create`

### 5.1 Quotas missing from the page

The membership resource catalogue (`apps/web/src/services/membershipResources.ts:71-80`) defines 8 quota resources. The plan builder exposes 4:

| Resource in membership catalogue | On `/admin/plans/create`? |
|---|---|
| Business VCards | ✅ `maxVCards` |
| Business Cards | ✅ `maxBusinessCards` |
| Friends & Family | ✅ `maxFriendsFamily` |
| Additional Cards | ✅ `maxAdditionalCards` |
| **Consumer VCards** | ❌ |
| **Consumer Cards** | ❌ |
| **e-Card face value** | ❌ |
| **QR routing rules** | ❌ |

Additionally, the consumer service reads quota keys that the plan builder cannot create:

- `familyCards` / `family_cards` / `maxFamilyCards`
- `friendCards` / `friend_cards` / `maxFriendCards`

(`apps/api/src/modules/consumer/consumer.service.ts:191-201`). The consumer screens also fall back to hard-coded tables in `apps/web/src/services/consumerMembership.ts:24-36` (`FAMILY_CARDS_BY_LEVEL`, `FRIEND_CARDS_BY_LEVEL`). So consumer entitlements cannot be configured from this page at all.

### 5.2 Feature flags missing from the page

Dashboard features/pages with no flag on the plan builder:

| Dashboard feature | Where it lives | Missing key |
|---|---|---|
| Notifications | `/b/notifications` | none |
| Integrations | `/b/integrations` | none |
| VCard/Card **Share** | detail page | none (`share`) |
| VCard/Card **Exchange** | detail page | none (`exchange`) |
| VCard/Card **Redeem** | detail page | none (`redeem`) |
| **Password protection** | detail page | none (`passwordAccess`) |
| **History** | detail page | none (`history`) |
| **Content editing** | detail/edit pages | none (`content`) |
| **Report exports** (CSV/PDF/XLSX) | `/b/reports` → Exports tab | only whole `reports` flag |
| **QR scan rules / routing rules** | `/b/qr` | only `customQrCodes` |
| Membership / Settings / Help | account pages | none (arguably should not be plan-gated) |

`DetailTabs.tsx` contains a `canSee` map for several of these (`share`, `exchange`, `redeem`, `passwordAccess`, `history`, `content`), but **`DetailTabs` is not imported anywhere** — the real detail pages render `ShareExchangeRedeemPanel` and password controls unconditionally.

### 5.3 Flag semantics do not match the UI copy

The Feature access copy says: *"Leave off to deny access..."* (`PlanForm.tsx:413-415`). However:

- `CapabilitiesService.assert()` treats an **unconfigured** key as allowed (`capabilities.service.ts:166-167`).
- The form writes every key explicitly (`true/false`), so form-created plans are fine.
- But plans created through the API/MCOM connector that omit a key will be **allowed**, not denied.
- Conversely, a new variant defaults all flags to `false` and all quotas to `-1`, so a default plan would mean "unlimited cards but every module off" if the guard were wired.

This needs a single, documented semantic: is absence "allowed", "denied", or "inherit"?

### 5.4 Audience handling is inverted for consumer plans

`capabilityFieldsForAudience()` would filter by `field.audiences`, but no field sets it. As a result:

- Consumer plan variants show **business** quotas and **business** feature flags.
- The consumer quotas that actually matter (`familyCards`, `friendCards`) are absent.
- A consumer admin can configure `maxVCards`, `maxBusinessCards`, etc., which the consumer service never reads.

### 5.5 There are at least three competing sources of truth

| Source | Where | Used by |
|---|---|---|
| `plan.variants[].configuration` | DB (`plans` table) | `/capabilities/me`, `MyPlanCard`, MCOM `active_plan` payload |
| `PLAN_LIMIT_MATRIX` | hard-coded in `businesses.service.ts:30-40` | `/users/me/business-permissions`, business pages, dashboard, Friends & Family enforcement |
| `membershipPricingStore` | `localStorage` | `/admin/membership/pricing`, legacy `/user/*`, public pricing, `MembershipConfirmationPage`, consumer card/vCard pages, QR scan rules |
| `consumerMembership.ts` hard-coded tables | frontend constant | consumer family page quota display |
| `mockBusinessProfile` | frontend mock | legacy `/user/*` pages and subscription page |

An admin editing `/admin/plans/create` changes only the first. Editing `/admin/membership/pricing?section=entitlements` changes the `localStorage` store. Neither changes the hard-coded matrix used by `/b/*`. This is the root cause of the disconnect.

### 5.6 Schema duplication

The schema exists twice, manually kept in sync:

- `apps/web/src/services/planCapabilitySchema.ts`
- `apps/api/src/modules/plans/plan-capability-schema.ts`

The external MCOM Solutions contract maps the API copy (`system-plans.controller.ts:30-42, 87-93`). They currently match, but there is no shared package or generated contract, so drift will silently create fields that the other side ignores.

### 5.7 No end-to-end tests for enforcement

There are unit tests for resolving/merging configuration and for the MCOM package variant flow, but no test asserts that a business route is blocked when a flag is `false` or a quota is reached. There is no route-to-capability contract to test.

---

## 6. What needs to change to meet the requirement

These are recommendations only; no code was written.

### P0 — Make one source of truth authoritative

1. Decide that `plan.variants[].configuration` is the only entitlement source for local plan purchases.
2. Replace `PLAN_LIMIT_MATRIX`/`getPermissionsForUser()` with `CapabilitiesService.resolveForUser()`, using `subscribed_plans.variant` and `mergeConfiguration(plan.configuration, variant.configuration)`.
3. Do the same for the dashboard `limits`/`remaining` display and for the Friends & Family `assertWithinLimit()` check.
4. Remove or explicitly mark the `localStorage` pricing rules and `consumerMembership.ts` tables as "marketing/comparison only", not enforcement.

### P0 — Enforce on the API

1. Add `@UseGuards(CapabilityGuard)` + `@RequireCapability(key)` to every paid business route group: rewards, campaigns, coupons, cashback, gift cards, customers, appointments, analytics, reports, wallet, QR, Friends & Family.
2. Add quota checks in the create/claim/duplicate paths:
   - VCard create/claim → `maxVCards` with current count.
   - Business card claim/duplicate → `maxBusinessCards`.
   - Friends & Family allocate → `maxFriendsFamily` (replace matrix).
   - Additional cards → define what consumes `maxAdditionalCards`.
3. For quotas, enforce `0 = disabled`, positive = `used < limit`, `-1 = unlimited`, and return a clear 403/409 with the upgrade URL.

### P0 — Enforce in the UI

1. Use `useCapabilities()` in `BusinessLayout` / `BusinessSidebar` / `BusinessBottomNav` / `BusinessMoreSheet` to hide unavailable modules.
2. Add route-level guards for `/b/*` feature pages, not only the binary `RequireBusinessAccess`.
3. Disable create/claim/allocate buttons at the finite limit and show "x of y used".
4. Use `can()`/`remaining()` from the hook rather than `businessService.getBusinessPermissions()`.

### P1 — Complete the admin schema

1. Add audience metadata:
   - business-only: `maxVCards`, `maxBusinessCards`, `maxAdditionalCards`, all current flags.
   - consumer-only: `consumerVCards`, `consumerCards`, `familyCards`, `friendCards`, `eCardFaceValue`.
2. Align quota keys with what the services actually read (`consumer.service.ts` keys included).
3. Add missing feature flags: `notifications`, `integrations`, `share`, `exchange`, `redeem`, `passwordAccess`, `history`, `content`, and optionally `reportsExports` / `qrRoutingRules`.
4. Separate "plan feature" from "core account feature" so Settings/Help/Membership are never accidentally gated.
5. Make plan-level defaults editable (or remove plan-level configuration entirely) so variant inheritance is predictable.

### P1 — Close semantic holes

1. Define absence behaviour explicitly: missing key = denied, inherited, or legacy-allowed. Document it and test it.
2. Validate configuration keys and value types against the schema in the API, not just the UI.
3. Make "Leave off to deny" actually true for plans created via API/MCOM.
4. Consider deriving the UI schema from a shared package so the web, API, and MCOM contract cannot drift.

### P2 — Clean-up

1. Delete or wire the unused `DetailTabs.tsx` `canSee` map.
2. Remove dead `useCapabilities`/`CapabilityGuard` or put them to use.
3. Unify the duplicate "Wallet" entries in `BusinessMoreSheet.tsx`.
4. Add tests for each capability/route pair and each quota boundary.

---

## 7. Evidence index

| Claim | Evidence |
|---|---|
| Create page renders `PlanForm` | `apps/web/src/pages/admin/plans/PlanCreatePage.tsx:44` |
| Feature access editor | `apps/web/src/components/admin/plans/PlanForm.tsx:400-453` |
| Usage limits editor | `apps/web/src/components/admin/plans/PlanForm.tsx:321-398` |
| Per-variant editing | `PlanForm.tsx:455-560`, steps at `29-34` |
| Quotas/flags catalogue | `apps/web/src/services/planCapabilitySchema.ts:33-126` |
| API schema copy | `apps/api/src/modules/plans/plan-capability-schema.ts:26-46` |
| Defaults: unlimited quotas, flags off | `PlanForm.tsx:99-133` |
| No audience metadata on any field | `planCapabilitySchema.ts:33-126` |
| Business routes | `apps/web/src/App.tsx:273-308` |
| Sidebar features | `apps/web/src/components/business/layout/BusinessSidebar.tsx:14-40` |
| Capability guard exists | `apps/api/src/modules/capabilities/capability.guard.ts:16-39` |
| Decorator exists | `apps/api/src/modules/capabilities/require-capability.decorator.ts` |
| No `@RequireCapability` usage | repository search; only the definition matches |
| Capabilities service resolution | `apps/api/src/modules/capabilities/capabilities.service.ts:87-131` |
| `assert()` semantics | `capabilities.service.ts:162-182` |
| `CapabilitiesController` only endpoints | `apps/api/src/modules/capabilities/capabilities.controller.ts:16-61` |
| Dashboard permissions endpoint | `apps/api/src/modules/businesses/businesses.controller.ts:171-181` |
| Hard-coded matrix | `apps/api/src/modules/businesses/businesses.service.ts:30-40` |
| Permission computation | `businesses.service.ts:126-173` |
| Friends & Family enforcement | `apps/api/src/modules/businesses/business-family.service.ts:61-69` |
| Dashboard uses permissions | `apps/api/src/modules/dashboard/dashboard.service.ts:114` |
| Plan purchase stores variant | `apps/api/src/modules/mcom/packages/mcom-packages.service.ts:122-145`, `subscriptions.service.ts:110-172` |
| Purchases do not create memberships | `subscriptions.service.ts:164-169` |
| Frontend hook unused | repository search; only `hooks/useCapabilities.ts` matches |
| Only `MyPlanCard` reads capabilities | `apps/web/src/components/business/MyPlanCard.tsx:68-71`, `224-236` |
| Business pages use matrix permissions | `VCardsPage.tsx:111`, `CardsPage.tsx:70`, `AnalyticsPage.tsx:60`, `QRCodePage.tsx:30`, `FamilyPage.tsx:36` |
| Consumer quota keys | `apps/api/src/modules/consumer/consumer.service.ts:191-201` |
| Consumer hard-coded tables | `apps/web/src/services/consumerMembership.ts:24-36` |
| LocalStorage pricing rules | `apps/web/src/services/membershipPricingStore.ts:109-200+` |
| Membership resource catalogue | `apps/web/src/services/membershipResources.ts:71-80` |
| Unused `DetailTabs` | `apps/web/src/components/business/detail/DetailTabs.tsx`; no imports elsewhere |
| MCOM external schema | `apps/api/src/modules/system-plans/system-plans.controller.ts:30-42, 87-93` |
| No API quota check on card claim | `apps/api/src/modules/cards/cards.service.ts:176-240` |
| Config DTO permits arbitrary keys | `apps/api/src/modules/plans/dto/plan.dto.ts:64-80` |

---

## 8. Bottom line

The admin page is a good **data-entry surface**, but today it is **not a control plane**. To make the requirement true, the plan variant configuration must become the single entitlement source, the API must enforce it on every paid route, and the `/b/*` UI must render from it. Until then, changing a toggle or quota on `/admin/plans/create` has no effect on what a paying business user can access or how many resources they can create.

---

## 9. Implementation update (2 Nov 2026)

The P0 wiring described in section 6 has now been implemented:

- `CapabilitiesService.resolveForUser()` resolves, in order:
  1. a **locally purchased plan variant** (highest priority — even when Central
     also reports a membership/trial),
  2. the **Central Hub membership/trial** entitlement. If Central bundles a
     VCard plan (e.g. Gold Standard), its local plan record and exact variant
     configuration are used; Central quotas/flags are only a fallback,
  3. the legacy local membership matrix (older accounts only).
  This keeps existing members working while local plan buyers are driven by the
  exact variant they paid for.
- `CapabilityGuard` is now attached to the business feature controllers
  (`customers`, `analytics` reads, `campaigns`/offers/coupons, cashback
  programmes, gift cards, appointments, QR codes, dashboard reports/QR stats,
  wallet, rewards, notifications, shares, Friends & Family, card content and
  password/access routes).
- Numeric quotas are enforced in the services that create the resource, never
  from client-supplied usage:
  - `maxVCards` → VCard creation / template claim / duplicate
  - `maxBusinessCards` → Business Card creation / template claim / duplicate
  - `maxFriendsFamily` → Friends & Family allocation
- `GET /capabilities/me` is now consumed by the dashboard through
  `useCapabilities()`. The sidebar, bottom nav, more sheet, dashboard quick
  actions, route gates, quota widgets, QR scan rules, report exports, and card
  detail actions render from the resolved variant.
- The admin schema now exposes the previously missing dashboard features:
  `notifications`, `integrations`, `share`, `exchange`, `redeem`,
  `passwordAccess`, `content`, `reportExports`, and `qrScanRules`.
- Quota displays now read from the plan capability, e.g.
  `0 of 3 created` / `3 of 3 created`, and the create/claim/duplicate controls
  disable at the limit. The API also rejects the extra create with a 403.
- `maxAdditionalCards` remains in the schema because it is an existing field.
  It has no business-dashboard surface to enforce it against; no new semantics
  were invented for it. It is therefore the one configured quota that is still
  informational.
