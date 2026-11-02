import type { PlanAudience } from './plans'

/**
 * Structured plan configuration surfaced in the admin plan builder.
 *
 * Every field below maps to a real business-dashboard area or an existing
 * business plan entitlement. Do not add speculative features here — the admin
 * form is the single place where plan variants are configured.
 *
 * - quota fields are stored in `configuration.quotas` as numbers (`-1` = unlimited)
 * - feature fields are stored in `configuration.featureFlags` as booleans
 *
 * Keep the keys in sync with the API schema at
 * `apps/api/src/modules/plans/plan-capability-schema.ts`.
 */
export interface PlanCapabilityField {
  key: string
  label: string
  description: string
  /** Example value shown in the empty numeric input. */
  placeholder?: number
  /** Numeric limits support the "Unlimited" toggle (-1). */
  unlimited?: boolean
  /** Which plan audiences this field applies to. Defaults to every audience. */
  audiences?: PlanAudience[]
}

export interface PlanCapabilitySchema {
  quotas: PlanCapabilityField[]
  featureFlags: PlanCapabilityField[]
}

export const PLAN_CAPABILITY_SCHEMA: PlanCapabilitySchema = {
  quotas: [
    {
      key: 'maxVCards',
      label: 'Business VCards',
      description: 'Business VCards the business can create and publish.',
      placeholder: 10,
      unlimited: true,
    },
    {
      key: 'maxBusinessCards',
      label: 'Business cards',
      description: 'Business cards the business can create.',
      placeholder: 25,
      unlimited: true,
    },
    {
      key: 'maxFriendsFamily',
      label: 'Friends & Family',
      description: 'Friends & Family allocations each member can use.',
      placeholder: 10,
      unlimited: true,
    },
    {
      key: 'maxAdditionalCards',
      label: 'Additional cards',
      description: 'Extra cards the business can issue on top of the plan.',
      placeholder: 2,
      unlimited: true,
    },
  ],
  featureFlags: [
    {
      key: 'advancedAnalytics',
      label: 'Analytics',
      description: 'Access the business analytics dashboard.',
    },
    {
      key: 'customerCrm',
      label: 'Customers',
      description: 'Access customer records and customer history.',
    },
    {
      key: 'rewards',
      label: 'Rewards',
      description: 'Issue loyalty points and use the rewards ledger.',
    },
    {
      key: 'campaigns',
      label: 'Campaigns',
      description: 'Activate, pause and manage business campaigns.',
    },
    {
      key: 'coupons',
      label: 'Coupons',
      description: 'Create and manage coupon offers for customers.',
    },
    {
      key: 'cashbackPrograms',
      label: 'Cashback programmes',
      description: 'Run cashback and loyalty programmes for customers.',
    },
    {
      key: 'giftCards',
      label: 'Gift cards',
      description: 'Issue and manage gift cards for customers.',
    },
    {
      key: 'friendsFamily',
      label: 'Friends & Family',
      description: 'Allocate additional cards to family and friends.',
    },
    {
      key: 'appointments',
      label: 'Appointments & bookings',
      description: 'Accept customer bookings and manage availability.',
    },
    {
      key: 'customQrCodes',
      label: 'QR codes',
      description: 'Create and manage business QR codes.',
    },
    {
      key: 'qrScanRules',
      label: 'QR scan rules',
      description: 'Configure how often the business QR code can be scanned.',
    },
    {
      key: 'wallet',
      label: 'Wallet / Smart Money',
      description: 'Access the wallet and smart-money module.',
    },
    {
      key: 'reports',
      label: 'Reports',
      description: 'Generate and view business reports.',
    },
    {
      key: 'reportExports',
      label: 'Report exports',
      description: 'Download reports as CSV, PDF or Excel.',
    },
    {
      key: 'notifications',
      label: 'Notifications',
      description: 'Receive and manage business notifications.',
    },
    {
      key: 'integrations',
      label: 'Integrations',
      description: 'Access MCOM ecosystem integrations.',
    },
    {
      key: 'share',
      label: 'Share',
      description: 'Share business VCards and cards with customers.',
    },
    {
      key: 'exchange',
      label: 'Exchange',
      description: 'Use the exchange centre on business VCards.',
    },
    {
      key: 'redeem',
      label: 'Redeem',
      description: 'Use the redeem centre on business VCards.',
    },
    {
      key: 'passwordAccess',
      label: 'Password protection',
      description: 'Protect cards and VCards with a password.',
    },
    {
      key: 'content',
      label: 'Content editing',
      description: 'Edit card and VCard content.',
    },
  ],
}

/** Fields that apply to a specific plan audience. */
export function capabilityFieldsForAudience(
  schema: PlanCapabilitySchema,
  audience: PlanAudience,
): PlanCapabilitySchema {
  const applies = (field: PlanCapabilityField) => !field.audiences || field.audiences.includes(audience)
  return {
    quotas: schema.quotas.filter(applies),
    featureFlags: schema.featureFlags.filter(applies),
  }
}

export const PLAN_CAPABILITY_LABELS: Record<string, string> = Object.fromEntries(
  [...PLAN_CAPABILITY_SCHEMA.quotas, ...PLAN_CAPABILITY_SCHEMA.featureFlags].map((field) => [
    field.key,
    field.label,
  ]),
)
