/**
 * Standard plan configuration fields exposed to MCOM Solutions.
 *
 * Every field maps to a real business-dashboard area or an existing business
 * plan entitlement. Do not add speculative features here.
 *
 * Quotas are stored in `PlanConfiguration.quotas` (number, `-1` = unlimited)
 * and feature flags in `PlanConfiguration.featureFlags` (boolean).
 *
 * Keep the keys in sync with the admin UI schema at
 * `apps/web/src/services/planCapabilitySchema.ts`.
 */
export interface PlanCapabilityField {
  key: string
  label: string
  description: string
  placeholder?: number
  unlimited?: boolean
}

export interface PlanCapabilitySchema {
  quotas: PlanCapabilityField[]
  featureFlags: PlanCapabilityField[]
}

export const PLAN_CAPABILITY_SCHEMA: PlanCapabilitySchema = {
  quotas: [
    { key: 'maxVCards', label: 'Business VCards', description: 'Business VCards the business can create and publish.', placeholder: 10, unlimited: true },
    { key: 'maxBusinessCards', label: 'Business cards', description: 'Business cards the business can create.', placeholder: 25, unlimited: true },
    { key: 'maxFriendsFamily', label: 'Friends & Family', description: 'Friends & Family allocations each member can use.', placeholder: 10, unlimited: true },
    { key: 'maxAdditionalCards', label: 'Additional cards', description: 'Extra cards the business can issue on top of the plan.', placeholder: 2, unlimited: true },
  ],
  featureFlags: [
    { key: 'advancedAnalytics', label: 'Analytics', description: 'Access the business analytics dashboard.' },
    { key: 'customerCrm', label: 'Customers', description: 'Access customer records and customer history.' },
    { key: 'rewards', label: 'Rewards', description: 'Issue loyalty points and use the rewards ledger.' },
    { key: 'campaigns', label: 'Campaigns', description: 'Activate, pause and manage business campaigns.' },
    { key: 'coupons', label: 'Coupons', description: 'Create and manage coupon offers for customers.' },
    { key: 'cashbackPrograms', label: 'Cashback programmes', description: 'Run cashback and loyalty programmes for customers.' },
    { key: 'giftCards', label: 'Gift cards', description: 'Issue and manage gift cards for customers.' },
    { key: 'friendsFamily', label: 'Friends & Family', description: 'Allocate additional cards to family and friends.' },
    { key: 'appointments', label: 'Appointments & bookings', description: 'Accept customer bookings and manage availability.' },
    { key: 'customQrCodes', label: 'QR codes', description: 'Create and manage business QR codes.' },
    { key: 'qrScanRules', label: 'QR scan rules', description: 'Configure how often the business QR code can be scanned.' },
    { key: 'wallet', label: 'Wallet / Smart Money', description: 'Access the wallet and smart-money module.' },
    { key: 'reports', label: 'Reports', description: 'Generate and view business reports.' },
    { key: 'reportExports', label: 'Report exports', description: 'Download reports as CSV, PDF or Excel.' },
    { key: 'notifications', label: 'Notifications', description: 'Receive and manage business notifications.' },
    { key: 'integrations', label: 'Integrations', description: 'Access MCOM ecosystem integrations.' },
    { key: 'share', label: 'Share', description: 'Share business VCards and cards with customers.' },
    { key: 'exchange', label: 'Exchange', description: 'Use the exchange centre on business VCards.' },
    { key: 'redeem', label: 'Redeem', description: 'Use the redeem centre on business VCards.' },
    { key: 'passwordAccess', label: 'Password protection', description: 'Protect cards and VCards with a password.' },
    { key: 'content', label: 'Content editing', description: 'Edit card and VCard content.' },
  ],
}
