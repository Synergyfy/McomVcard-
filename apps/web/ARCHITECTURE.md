# MCOM VCard — Frozen Product Architecture

> **Status: Frozen** — This document defines the complete product architecture of the MCOM VCard platform. Every page, route, sidebar item, and component MUST be classified into exactly one of the four products below. The Shared Template Engine and Platform Core Services are internal infrastructure shared by all four products. None of these appear as menu items.

---

## Core Principle

There are **four separate products** inside MCOM VCard:

```
Business Card     Business VCard     Consumer Card     Consumer VCard
```

Although they are connected, **they are NOT the same product**.

---

# PRODUCT 1 — BUSINESS CARD

## Purpose

The Business Card is the **business identity card** — a compact, square, professional digital business card.

> **"Who is this business?"**

It is NOT a website. NOT a long page. NOT where campaigns, products, or rewards live. It is simply the **entry point**.

## Contains

Logo, Business Name, Brand Colour, Contact Name, Position, Telephone, Email, Website, QR Code, NFC Link, Business ID, Membership Badge, Open Business VCard Button, Share Card Button, Save Contact Button, Exchange Button, Download Button, Print Version, Card Status, Card Theme.

## Never Contains

Products, Gallery, Campaigns, Rewards, Coupons, Long descriptions, Testimonials, Blogs, Videos, Events, Bookings, Long scrolling content — those belong in the Business VCard.

---

# PRODUCT 2 — BUSINESS VCARD

## Purpose

The interactive digital experience — a business microsite / landing page / smart digital profile.

> **"What does this business offer?"**

This is where all of Henry's described functionality lives: scrolling sections, dynamic content, campaigns, sharing, exchange, redeem, products, services.

## Contains

Cover Banner, Logo, About Business, Business Story, Contact Details, Opening Hours, Location, Google Map, Social Media, Products, Services, Promotions, Campaigns, Events, Videos, Gallery, Documents, Testimonials, Reviews, Bookings, Reservations, Appointment Links, Payment Links, Share Section, Exchange Section, Redeem Section, QR Destination, Dynamic Components, Call To Action, Future Rewards, Future Cashback, Future Donations, Future Spin.

## Never Contains

Card Number, Physical Printing Options, Card Front Design, Card Back Design, NFC Position, Card Size — those belong to Business Card.

---

# PRODUCT 3 — CONSUMER CARD

## Purpose

The consumer's identity card — membership card, loyalty card, wallet card.

> **"Who is this consumer?"**

## Contains

Consumer Name, Membership Tier, QR Code, Card Number, Member ID, Membership Badge, Digital Wallet, Card Theme, Card Status, Friends & Family Summary, Open Consumer VCard, Share Card, Exchange Card, Save Card, Download Card, Print Card.

## Never Contains

Offers, Local Promotions, Campaign Feed, High Street Content, Reward Listings, Events, Gallery, Products, Redeem Pages, Dynamic Sections — those belong in Consumer VCard.

---

# PRODUCT 4 — CONSUMER VCARD

## Purpose

The consumer's living page — a rich, evolving digital experience Henry spent most of his time describing.

> **"What can this consumer do?"**

Not an identity card. A living page.

## Contains

Welcome Banner, Membership Status, Progress, Wallet Summary, Available Rewards (Coming Soon), Cashback (Coming Soon), Donations (Coming Soon), Spin (Coming Soon), Local Offers, Recommended Businesses, High Street Promotions, Campaign Feed, Share Section, Exchange Section, Redeem Section, Friends, Family, Additional Cards, Dynamic QR Destination, Activity, Notifications, Community Updates, Referral (Coming Soon), Personal Profile.

## Never Contains

Physical Card Design, Card Size, NFC Placement, Print Layout, Card Template — those belong to Consumer Card.

---

# CARD → VCARD RELATIONSHIP

- **The Card can exist without the VCard** (e.g. as a printed card or simple digital identity).
- **The VCard is always reachable from the Card** through QR code, NFC, or "Open VCard" action.

```
Business Card                          Consumer Card
  ├── QR Code                            ├── QR Code
  ├── NFC                                ├── Wallet Link
  └── Open Business VCard                └── Open Consumer VCard
          │                                      │
          ▼                                      ▼
  Business VCard (Long Scrolling)       Consumer VCard (Long Scrolling)
```

---

# FROZEN PRODUCT MAP

```
MCOMVCARD
│
├── Business Card
│      Identity, Branding, QR, NFC, Print
│
├── Business VCard
│      Long Scrolling Experience, Dynamic Content, Share, Exchange,
│      Redeem, Products, Campaigns
│
├── Consumer Card
│      Membership Identity, Wallet Card, QR, Friends Summary
│
└── Consumer VCard
       Consumer Experience, Share, Exchange, Redeem,
       Local Offers, High Street, Dynamic Content
```

---

# ROUTE CONVENTION

- Card pages → `/admin/card-management/*`
- VCard pages → `/admin/vcard-management/*`

Never mix routes. If it's a VCard feature, it belongs under `/admin/vcard-management/`. If it's a Card feature, it belongs under `/admin/card-management/`.

---

# SIDEBAR CONVENTION

Sidebar labels must use explicit product prefixes:
- "Card Activity" not "Activity"
- "VCard Activity" not "Template Activity"
- "Business Card Templates" not "Card Templates"
- "Business VCard Templates" not "VCard Templates"

---

# SHARED FEATURES (Internal Infrastructure)

These are used by all four products. They are NOT products themselves and NOT menu items.

```
Media Library     QR Engine     Component Library
Versioning        Publishing    Themes
Permissions       Analytics     Activity
Template Engine   Authentication  Membership
Allocation        Notification  Rewards (Future)
Cashback (Future) Donation (Future)  Gamification (Future)
Integration Gateway  Platform Event Bus  Shared Design System
```

---

# SHARED TEMPLATE ENGINE

## Purpose

The Shared Template Engine is the internal framework that powers all template builders.

It is **never shown as a menu item**.

It provides reusable functionality behind:
- Business VCard Templates
- Consumer VCard Templates
- Business Card Templates (future)
- Consumer Card Templates

Each builder consumes the engine through a **config object** that defines its specific components, categories, presets, panels, and behaviours.

## How It Works

```
TemplateBuilder (Engine)
    │
    ├── Config A  →  Business VCard Builder
    ├── Config B  →  Consumer VCard Builder
    ├── Config C  →  Business Card Builder (future)
    └── Config D  →  Consumer Card Builder
```

The engine itself has no opinions about Card vs VCard. The config makes that decision.

## Engine Modules

```
Template Engine
├── Canvas (Drag & Drop zone)
├── Component Library / Registry
├── Property Panel
├── Theme Manager
├── Preview Renderer
├── Validation Engine
├── Version Manager
├── Publishing Engine
├── Permission Layer
├── History / Undo-Redo
├── Asset Manager
├── QR Integration
├── Rule Engine
└── Shared API Layer
```

Each module is used by builders that need it. A Card builder uses a subset (front/back design, QR placement, NFC). A VCard builder uses a different subset (sections, components, dynamic content).

---

# PLATFORM CORE SERVICES

## Purpose

Internal platform services that every module talks to. Think of them as the operating system of MCOM VCard.

```
                    MCOMVCARD
                       │
             Platform Core Services
                       │
 ┌──────────┬──────────┬──────────┬──────────┐
 │          │          │          │          │
 ▼          ▼          ▼          ▼          ▼
Businesses  Consumers  Templates  Membership  QR
```

### Service List

| Service | Description | Status |
|---------|-------------|--------|
| Authentication Service | Login, session, identity from MCOM Solutions | Future |
| Permission Service | Controls menus, buttons, pages, actions | Active |
| Membership Service | Business/Consumer membership, benefits, expiry | Active |
| Allocation Service | Card/VCard allocation: business, consumer, F&F, limits | Active |
| QR Service | Business QR, Consumer QR, Campaign QR, Dynamic QR, NFC | Active |
| Template Service | All four template types, drafts, publishing, versions | Active |
| Component Service | Shared registry for all builder components | Active |
| Media Service | Images, videos, icons, fonts, backgrounds | Active |
| Activity Service | Every action tracked: created, scanned, shared, redeemed | Active |
| Notification Service | Email, SMS, push, WhatsApp, in-app | Future |
| Rewards Service | MCOM Rewards / 247GBS Rewards integration | Future |
| Cashback Service | MCOMMall Cashback integration | Future |
| Donation Service | FundOrDonate integration | Future |
| Gamification Service | MCOM Spin integration | Future |
| Analytics Service | Business, consumer, card, QR, membership analytics | Active |
| Integration Gateway | Bridge to external MCOM platforms | Future |
| Platform Event Bus | Loosely coupled event-driven communication | Active |

---

# DEVELOPMENT PRINCIPLE

Every Admin page we design must:

1. **Classify** as exactly one of the four products (Card or VCard, Business or Consumer).
2. **Reuse the Shared Template Engine** where builder functionality is needed.
3. **Use the Platform Core Services** instead of implementing business logic locally.
4. **Use the correct route prefix** — `/admin/card-management/` or `/admin/vcard-management/`.
5. **Show Coming Soon placeholders** for ecosystem features until integrated.
6. **Follow the Shared Design System** so the Admin interface remains consistent.

**Zero ambiguity.** No feature should ever straddle Card and VCard.

---

# APPENDIX: SIDEBAR MAP (Current)

```
Admin
├── Dashboard
├── Businesses
│   ├── Business List
│   └── Business VCard / Card (future)
├── Consumers
│   ├── Consumer List
│   └── Consumer VCard / Card (future)
├── VCard Management
│   ├── Business VCards
│   ├── Consumer VCards
│   ├── Business VCard Templates
│   ├── Consumer VCard Templates
│   ├── VCard Template Builder
│   ├── VCard Assignment
│   ├── VCard Preview & Testing
│   ├── Dynamic QR & Content
│   ├── VCard Activity
│   └── VCard Archive
├── Card Management
│   ├── Dashboard
│   ├── Business Card Templates
│   ├── Consumer Card Templates
│   ├── Consumer Card Builder
│   ├── Card Distribution & Assignment
│   └── Card Activity
├── Membership & Pricing
├── Integrations
├── Activity & Audit
└── Settings
```
