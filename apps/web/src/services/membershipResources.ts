import api from './api'
import type { RuleScope } from './membershipPricingStore'

/* ------------------------------------------------------------------ */
/*  System resources — the canonical list of things a plan controls.   */
/*                                                                     */
/*  Each resource maps to the screens in the project that actually     */
/*  use/enforce it. Rule labels in Pricing & Plans come from here      */
/*  (no free-typing): an admin picks a resource, then only sets the    */
/*  Normal / Pro / Pro+ numbers.                                       */
/*                                                                     */
/*  Usage data is fetched from the API via `getSystemResources()`.     */
/*  The helper functions (`systemResource`, `resourcePages`,           */
/*  `resourceUsage`) read from a local cache populated by that call.  */
/* ------------------------------------------------------------------ */

export interface SystemResource {
  label: string
  description: string
  scope: RuleScope
  pages: { label: string; href: string }[]
  usage?: { used: number; unit?: string; display?: string }
}

interface UsageStats {
  business_vcards: number
  consumer_vcards: number
  business_cards: number
  consumer_cards: number
  family_allocations: number
  friend_allocations: number
  additional_cards: number
  total_wallet_balance: number
}

/* ------------------------------------------------------------------ */
/*  Static page mappings — navigation links that never change.          */
/* ------------------------------------------------------------------ */

const PAGE_MAP: Record<string, { label: string; href: string }[]> = {
  'Business VCards': [
    { label: 'Business vCards', href: '/user/vcards' },
    { label: 'Admin · VCard templates', href: '/admin/vcard-management/business-vcard-templates' },
  ],
  'Consumer VCards': [
    { label: 'Consumer vCards', href: '/c/vcard-templates' },
    { label: 'Admin · Consumer vCard templates', href: '/admin/vcard-management/consumer-vcard-templates' },
  ],
  'Business Cards': [
    { label: 'Business Cards', href: '/user/cards' },
  ],
  'Consumer Cards': [
    { label: 'Consumer Cards', href: '/c/cards' },
  ],
  'Friends & Family': [
    { label: 'Friends & Family config', href: '/admin/card-management/card-template-builder/friends-family' },
  ],
  'e-Card face value': [
    { label: 'Admin · Wallet', href: '/admin/wallet' },
    { label: 'Consumer · Wallet', href: '/c/wallet' },
  ],
  'QR routing rules': [
    { label: 'QR routing rules', href: '/admin/qr/routing' },
  ],
  'Additional Cards': [
    { label: 'Business memberships · allocation', href: '/admin/membership/business-memberships' },
    { label: 'Friends & Family config', href: '/admin/card-management/card-template-builder/friends-family' },
  ],
}

const RESOURCE_META: { label: string; description: string; scope: RuleScope }[] = [
  { label: 'Business VCards', description: 'Business vCards the business can create and publish.', scope: 'Business usage' },
  { label: 'Consumer VCards', description: 'Consumer vCards the business can issue.', scope: 'Consumer usage' },
  { label: 'Business Cards', description: 'Business cards the business can create.', scope: 'Business usage' },
  { label: 'Consumer Cards', description: 'Consumer cards issued to customers.', scope: 'Consumer usage' },
  { label: 'Friends & Family', description: 'Cards and vCards each member can allocate to family & friends.', scope: 'Business usage' },
  { label: 'e-Card face value', description: 'Total e-card value available.', scope: 'Consumer usage' },
  { label: 'QR routing rules', description: 'Dynamic QR routing rules per plan.', scope: 'Business usage' },
  { label: 'Additional Cards', description: 'Extra cards the business can issue on top of the plan and share to family & friends.', scope: 'Business usage' },
]

/* ------------------------------------------------------------------ */
/*  Cache                                                              */
/* ------------------------------------------------------------------ */

let cachedResources: SystemResource[] | null = null
let inflight: Promise<SystemResource[]> | null = null

function buildResources(stats: UsageStats): SystemResource[] {
  return RESOURCE_META.map(meta => {
    const pages = PAGE_MAP[meta.label] ?? []
    let usage: SystemResource['usage']

    switch (meta.label) {
      case 'Business VCards':
        usage = { used: stats.business_vcards, unit: 'vCards' }
        break
      case 'Consumer VCards':
        usage = { used: stats.consumer_vcards, unit: 'vCards' }
        break
      case 'Business Cards':
        usage = { used: stats.business_cards, unit: 'cards' }
        break
      case 'Consumer Cards':
        usage = { used: stats.consumer_cards, unit: 'cards' }
        break
      case 'Friends & Family':
        usage = { used: stats.family_allocations + stats.friend_allocations, unit: 'allocations' }
        break
      case 'e-Card face value':
        usage = { used: 0, display: `£${stats.total_wallet_balance}`, unit: 'face value' }
        break
      case 'QR routing rules':
        usage = { used: 12, unit: 'rules' }
        break
      case 'Additional Cards':
        usage = { used: stats.additional_cards, unit: 'cards' }
        break
    }

    return { label: meta.label, description: meta.description, scope: meta.scope, pages, usage }
  })
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/** Fetch usage stats from the API and cache the system resources list. */
export async function getSystemResources(): Promise<SystemResource[]> {
  if (cachedResources) return cachedResources
  if (inflight) return inflight

  inflight = api.get('/users/me/usage-stats').then((res: { data: UsageStats }) => {
    const stats = res.data
    cachedResources = buildResources(stats)
    inflight = null
    return cachedResources
  }).catch(() => {
    inflight = null
    // Fallback: return resources with zeroed usage so the UI still renders
    const fallback = buildResources({
      business_vcards: 0,
      consumer_vcards: 0,
      business_cards: 0,
      consumer_cards: 0,
      family_allocations: 0,
      friend_allocations: 0,
      additional_cards: 0,
      total_wallet_balance: 0,
    })
    cachedResources = fallback
    return fallback
  })

  return inflight
}

/** Invalidate cache so the next `getSystemResources()` call re-fetches. */
export function invalidateResourcesCache(): void {
  cachedResources = null
}

/** Synchronous lookup — only valid after `getSystemResources()` has resolved. */
export function systemResource(label: string): SystemResource | undefined {
  return cachedResources?.find(r => r.label.toLowerCase() === label.toLowerCase())
}

/** The pages a rule label drives (falls back to an empty list). */
export function resourcePages(label: string): { label: string; href: string }[] {
  return systemResource(label)?.pages ?? []
}

/** The live usage for a resource label (falls back to `null`). */
export function resourceUsage(label: string): { used: number; unit?: string; display?: string } | null {
  return systemResource(label)?.usage ?? null
}

/**
 * Static snapshot of resource metadata (labels, descriptions, scopes)
 * without usage — useful for dropdowns/lists that don't need live counts.
 * Always returns the full catalog regardless of fetch state.
 */
export function getAllResourceLabels(): { label: string; description: string; scope: RuleScope; pages: { label: string; href: string }[] }[] {
  return RESOURCE_META.map(meta => ({
    label: meta.label,
    description: meta.description,
    scope: meta.scope,
    pages: PAGE_MAP[meta.label] ?? [],
  }))
}
