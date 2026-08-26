# MCOM VCard Social Bio — Admin Implementation Walkthrough

## Guiding Principle
> Businesses should not configure complicated systems. The admin creates templates, defaults, rewards, experiences, journeys. Businesses choose, activate, lightly customise, launch. Complexity stays inside Admin.

---

## Phase 1 — Admin Structure Foundation

> **Status: ✅ Complete**

### Step 1: Admin Login Page
- **`/admin/login`** — Split-screen Stripe/Shopify-style design
- Left panel (55%): Dark gradient brand panel with MCOM logo, tagline, floating feature cards (Smart Cards, Wallet & Rewards, NFC Integration, Analytics)
- Right panel (45%): Clean login card with email/password, remember me, 2FA toggle, orange gradient submit button, forgot password link
- Dark mode support throughout
- Mock auth: seeds `auth_token` and `auth_user` into localStorage on submit

### Step 2: Admin Dashboard Home
- **`/admin`** — Rebuilt with MCOM-specific KPIs:
  - Primary row: Total Revenue (+30.5%), Active Businesses (384), Active Consumers (8,642), Total vCards (12,560 with 1,247 NFC)
  - Secondary row: Wallet Transactions (8,920), Campaigns Running (18), Print Orders (43), Rewards Distributed (14,280)
  - Revenue chart (bar, 12 months) + Plan Distribution (conic gradient donut)
  - Business & Consumer Growth chart (dual bar, 12 months)
  - Quick Actions (6 cards) + Recent Activity feed (live feed with Biz/User badges)
- Dark mode support throughout

### Step 3: Updated User Management
The old "Users" module splits into three:
- **Admin Users** (internal team — Super Admin, Admin, Manager, Consultant, Agent, Support)
- **Businesses** (business accounts with vCards, wallet, campaigns, bookings, loyalty)
- **Consumers** (end users with wallet balance, rewards, saved cards, referrals)

---

## Phase 2 — Core Business Features

### Step 4: Business Management
- Business Table: Name, Owner, Industry, Membership, Card Status, Wallet Status, Verification Status, Campaign Count, Created Date
- Business Profile: Details, Card Preview, Wallet Info, Campaigns, Rewards, Booking Setup, QR Codes, NFC Orders, Activity Timeline
- Actions: View, Edit, Suspend, Verify, Reset Account, Generate Card, Generate QR, Open Wallet, Open Store, Open Loyalty

### Step 5: Consumer Management
- Consumer Table: Name, Email, Wallet Balance, Active Rewards, Cards Saved, Referral Count, Status
- Actions: View, Suspend, Reset, Issue Reward, Add Gift Card, Add Coupon, Add Voucher

### Step 6: Template Management (Henry's biggest requirement)
- Template Categories: Restaurant, Cafe, Barber, Beauty Salon, Accountant, Estate Agent, Solicitor, Consultant, Coach, Retail Store, Service Provider, Healthcare, Fitness, Hotel, Events
- Template Card: Preview Image, Name, Category, Usage Count, Status
- **Create Template (4 Steps)**:
  1. Basic Info (Name, Category, Description)
  2. Theme (Logo Position, Font, Button Style, Background, Color Palette)
  3. Sections Toggle (About, Contact, Website, Products, Rewards, Bookings, Reviews, Social Media, Gallery, Videos, Downloads, Payments, Store Links)
  4. Publish (Save Draft / Publish / Archive)
- Actions: Create, Edit, Clone, Disable, Preview

### Step 7: VCard Management
- Card Table: Card Name, Type, Owner, Status, QR Scans, Shares, Saves
- Card Types: Business Card, Consumer Card, Family Card, Borough Card, Event Card, Campaign Card
- Actions: Open, Edit, Disable, Duplicate, Generate QR

---

## Phase 3 — Wallet, Rewards & Campaigns

### Step 8: Wallet & Rewards
- Wallet Assets: Points, Cashback, Gift Cards, Coupons, Vouchers, Tickets, Membership Credits
- Actions: Add Asset, Remove Asset, Transfer Asset, Freeze Asset, Expire Asset

### Step 9: Campaign Management
- Campaign Types: Referral, QR, Seasonal, Spin, Cashback, Gift, Event
- Actions: Create, Pause, Duplicate, Close, View Analytics

### Step 10: QR Code Management
- Dashboard: Total QR Codes, Active QR Codes, Total Scans, Conversion Rate
- QR Types: Card QR, Reward QR, Campaign QR, Event QR, Booking QR, Store QR
- Actions: Create QR, Bulk Generate, Download PNG/SVG, Print QR

---

## Phase 4 — Booking, Gamification & Physical Products

### Step 11: Booking Management
- Booking Types: Appointment, Consultation, Reservation, Event Registration
- Admin Controls: View All, Cancel, Refund, Reschedule

### Step 12: Gamification
- Games: Ball Drop, Spin Wheel, Scratch Card, Mystery Box
- Actions: Enable, Disable, Edit Rewards

### Step 13: NFC Card Management
- NFC Features: Inventory, Card Assignment, Activation, Replacement
- Actions: Add Stock, Assign Card, Replace Card, Disable Card

### Step 14: Print Order Management
- Print Types: Business Cards, Loyalty Cards, Event Cards, Membership Cards
- Actions: Create Order, Assign Supplier, Mark Printed, Mark Shipped

---

## Phase 5 — Ecosystem & System

### Step 15: Marketplace Connections
- Connected MCOM Platforms: MCOMMall, Rewards, Affiliates, Audit, MCOMSpin, Expo, Hotspot
- Actions: Connect, Disconnect, Sync Data

### Step 16: Analytics
- Metrics: Card Views, QR Scans, Reward Redemptions, Revenue, Referrals, Conversions
- Filters: Today, Week, Month, Quarter, Year

### Step 17: Role Permissions (New Structure)
- Roles: Super Admin, Admin, Manager, Consultant, Agent, Support
- Each permission: View, Create, Edit, Delete, Export
- The old abstract permissions matrix is replaced with meaningful role-based access control tied to actual admin dashboard sections

### Step 18: Settings
- Sections: Branding, Emails, SMS, Notifications, Wallet Rules, Campaign Rules, QR Settings, Booking Settings

### Step 19: Support Center
- Sections: Tickets, Live Chat, Knowledge Base, System Logs

---

## Summary of What Changes

| Current | New MCOM Vision |
|---------|-----------------|
| Generic Users | Businesses + Consumers + Admin Users |
| Simple CRUD pages | Full ecosystem: Wallet, Campaigns, Gamification |
| Abstract permissions | Role-based: Super Admin → Admin → Manager → Consultant → Agent → Support |
| Generic templates | Industry-specific (Restaurant, Barber, Salon, etc.) |
| Basic vCards | Card Types: Business, Consumer, Family, Borough, Event, Campaign |
| No wallet | Wallet with Points, Cashback, Gift Cards, Coupons, Vouchers |
| No campaigns | Referral, QR, Seasonal, Spin, Cashback, Gift, Event campaigns |
| No gamification | Ball Drop, Spin Wheel, Scratch Card, Mystery Box |
| No NFC | NFC inventory, assignment, activation |
| No printing | Print order management |
| No marketplace | MCOM ecosystem connections |
