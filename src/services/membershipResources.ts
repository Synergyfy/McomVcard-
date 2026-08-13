import type { RuleScope } from './membershipPricingStore'
import { mockVcards, mockClaimedCards, mockConsumers } from './mockData'

/* ------------------------------------------------------------------ */
/*  System resources — the canonical list of things a plan controls.   */
/*                                                                     */
/*  Each resource maps to the screens in the project that actually     */
/*  use/enforce it. Rule labels in Pricing & Plans come from here      */
/*  (no free-typing): an admin picks a resource, then only sets the    */
/*  Normal / Pro / Pro+ numbers.                                       */
/*                                                                     */
/*  Each resource also exposes a live `usage` lookup so the            */
/*  Entitlements & Rules editors can show how much of the limit is     */
/*  actually being consumed by the pages/features it controls.         */
/* ------------------------------------------------------------------ */

export interface SystemResource {
  label: string
  description: string
  scope: RuleScope
  pages: { label: string; href: string }[]
  usage?: { used: number; unit?: string; display?: string }
}

/** Business mock ID used consistently across the business pages. */
const BUSINESS_ID = 1

/** Consumer mock ID used consistently across the consumer pages. */
const CONSUMER_ID = 0

export const SYSTEM_RESOURCES: SystemResource[] = [
  {
    label: 'Business VCards',
    description: 'Business vCards the business can create and publish.',
    scope: 'Business usage',
    pages: [
      { label: 'Business vCards', href: '/user/vcards' },
      { label: 'Admin · VCard templates', href: '/admin/vcard-management/business-vcard-templates' },
    ],
    usage: {
      used: mockVcards.filter(v => v.user_id === BUSINESS_ID).length,
      unit: 'vCards',
    },
  },
  {
    label: 'Consumer VCards',
    description: 'Consumer vCards the business can issue.',
    scope: 'Consumer usage',
    pages: [
      { label: 'Consumer vCards', href: '/c/vcard-templates' },
      { label: 'Admin · Consumer vCard templates', href: '/admin/vcard-management/consumer-vcard-templates' },
    ],
    usage: {
      used: 4,
      unit: 'vCards',
    },
  },
  {
    label: 'Business Cards',
    description: 'Business cards the business can create.',
    scope: 'Business usage',
    pages: [
      { label: 'Business Cards', href: '/user/cards' },
    ],
    usage: {
      used: mockClaimedCards.filter(c => c.business_id === BUSINESS_ID).length,
      unit: 'cards',
    },
  },
  {
    label: 'Consumer Cards',
    description: 'Consumer cards issued to customers.',
    scope: 'Consumer usage',
    pages: [
      { label: 'Consumer Cards', href: '/c/cards' },
    ],
    usage: {
      used: mockConsumers[CONSUMER_ID]?.savedCards?.length ?? 0,
      unit: 'cards',
    },
  },
  {
    label: 'Friends & Family',
    description: 'Cards and vCards each member can allocate to family & friends.',
    scope: 'Business usage',
    pages: [
      { label: 'Friends & Family config', href: '/admin/card-management/card-template-builder/friends-family' },
    ],
    usage: {
      used: (mockConsumers[CONSUMER_ID]?.familyAllocations ?? 0) + (mockConsumers[CONSUMER_ID]?.friendAllocations ?? 0),
      unit: 'allocations',
    },
  },
  {
    label: 'e-Card face value',
    description: 'Total e-card value available.',
    scope: 'Consumer usage',
    pages: [
      { label: 'Admin · Wallet', href: '/admin/wallet' },
      { label: 'Consumer · Wallet', href: '/c/wallet' },
    ],
    usage: {
      used: 0,
      display: mockConsumers[CONSUMER_ID]?.eCardFaceValue ?? '£0.00',
      unit: 'face value',
    },
  },
  {
    label: 'QR routing rules',
    description: 'Dynamic QR routing rules per plan.',
    scope: 'Business usage',
    pages: [
      { label: 'QR routing rules', href: '/admin/qr/routing' },
    ],
    usage: {
      used: 12,
      unit: 'rules',
    },
  },
  {
    label: 'Additional Cards',
    description: 'Extra cards the business can issue on top of the plan and share to family & friends.',
    scope: 'Business usage',
    pages: [
      { label: 'Business memberships · allocation', href: '/admin/membership/business-memberships' },
      { label: 'Friends & Family config', href: '/admin/card-management/card-template-builder/friends-family' },
    ],
    usage: {
      used: mockConsumers[CONSUMER_ID]?.allocatedAdditionalCards ?? 0,
      unit: 'cards',
    },
  },
]

export function systemResource(label: string): SystemResource | undefined {
  return SYSTEM_RESOURCES.find(r => r.label.toLowerCase() === label.toLowerCase())
}

/** The pages a rule label drives (falls back to an empty list). */
export function resourcePages(label: string): { label: string; href: string }[] {
  return systemResource(label)?.pages ?? []
}

/** The live usage for a resource label (falls back to `null`). */
export function resourceUsage(label: string): { used: number; unit?: string; display?: string } | null {
  return systemResource(label)?.usage ?? null
}