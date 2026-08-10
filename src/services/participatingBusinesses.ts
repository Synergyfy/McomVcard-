/* ------------------------------------------------------------------ */
/*  Participating businesses — consumer acquisition.                   */
/*                                                                     */
/*  A consumer does not buy MCOMVCard. They connect with a business    */
/*  that issues them access, then create/sign in to their MCOM account */
/*  and enter MCOMVCard through that business's card/vCard.            */
/*                                                                     */
/*  Every participating business carries a membership (level + tier)   */
/*  so consumers can filter the directory by the membership they want  */
/*  — Bronze → Silver → Gold → Platinum, each with Standard / Pro /    */
/*  Pro+ tiers.                                                        */
/* ------------------------------------------------------------------ */

import { mockBusinesses } from './mockData'
import type { PlanLevel } from './membershipPricingStore'
import { parseMembership } from './consumerMembership'

export type MembershipTier = 'Standard' | 'Pro' | 'Pro+'

export interface ParticipatingBusiness {
  id: number
  name: string
  industry: string
  address: string
  city: string
  description: string
  website: string
  logo?: string
  phone: string
  email: string
  verified: boolean
  initials: string
  membership: string
  membershipLevel: PlanLevel
  membershipTier: MembershipTier
  /* Directory metadata used by the home showcase + find-a-business. */
  featured: boolean
  scans: number
  cards: number
  joined: string
}

/** Membership levels ordered lowest → highest (Bronze first). */
export const PARTICIPATING_LEVELS: PlanLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum']

/** Membership tiers ordered lowest → highest. */
export const PARTICIPATING_TIERS: MembershipTier[] = ['Standard', 'Pro', 'Pro+']

/** Business ids hand-picked to surface on the home page "featured" row. */
const DEFAULT_FEATURED_IDS = [1, 2, 4, 6, 7, 10]

const FEATURED_KEY = 'mcom_featured_businesses'

/* ------------------------------------------------------------------ */
/*  Featured businesses — controlled by the Admin.                     */
/*  Persisted to localStorage (mock backend) so the landing page and   */
/*  find-a-business page reflect the Admin's choices. New platform     */
/*  defaults are always merged in so older saved states stay valid.    */
/* ------------------------------------------------------------------ */

function loadFeaturedIds(): Set<number> {
  const ids = new Set<number>(DEFAULT_FEATURED_IDS)
  try {
    const raw = localStorage.getItem(FEATURED_KEY)
    if (!raw) return ids
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      parsed.forEach((n) => { if (typeof n === 'number') ids.add(n) })
    }
  } catch { /* ignore corrupt storage */ }
  return ids
}

function saveFeaturedIds(ids: Set<number>): void {
  try {
    localStorage.setItem(FEATURED_KEY, JSON.stringify(Array.from(ids)))
  } catch { /* ignore quota */ }
}

export function getFeaturedIds(): Set<number> {
  return loadFeaturedIds()
}

/** Toggle the featured flag for a business id. Returns the new state. */
export function toggleFeatured(id: number): boolean {
  const next = loadFeaturedIds()
  const on = !next.has(id)
  if (on) next.add(id)
  else next.delete(id)
  saveFeaturedIds(next)
  return on
}

function withFeatured(b: ParticipatingBusiness): ParticipatingBusiness {
  return { ...b, featured: loadFeaturedIds().has(b.id) }
}

function toCity(address: string): string {
  const parts = address.split(',').map((p) => p.trim())
  return parts.length > 1 ? parts[parts.length - 2] : parts[0] || ''
}

function toInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'
}

export const PARTICIPATING_BUSINESSES: ParticipatingBusiness[] = mockBusinesses
  .filter((b) => b.status === 'verified')
  .map((b) => {
    const { level, tier } = parseMembership(b.membership || 'Bronze Standard')
    return {
      id: b.id,
      name: b.name,
      industry: b.industry,
      address: b.address,
      city: toCity(b.address),
      description: b.description,
      website: b.website,
      logo: b.logo,
      phone: b.phone,
      email: b.email,
      verified: b.status === 'verified',
      initials: toInitials(b.name),
      membership: b.membership || 'Bronze Standard',
      membershipLevel: level,
      membershipTier: tier,
      featured: DEFAULT_FEATURED_IDS.includes(b.id),
      scans: b.scans ?? 0,
      cards: b.cards ?? 0,
      joined: b.joined ?? '',
    }
  })

export const PARTICIPATING_INDUSTRIES: string[] = Array.from(
  new Set(PARTICIPATING_BUSINESSES.map((b) => b.industry)),
).sort()

export const PARTICIPATING_CITIES: string[] = Array.from(
  new Set(PARTICIPATING_BUSINESSES.map((b) => b.city).filter(Boolean)),
).sort()

/* Parse a "Jan 2026"-style joined date into a comparable Date. */
export function joinedToDate(joined: string): Date {
  const match = joined.match(/^([A-Za-z]{3})\s+(\d{4})$/)
  if (!match) return new Date(0)
  const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
  const month = months[match[1]]
  if (month === undefined) return new Date(0)
  return new Date(Number(match[2]), month, 1)
}

const delay = () => new Promise((r) => setTimeout(r, 300))

export const participatingBusinessService = {
  async getAll(): Promise<ParticipatingBusiness[]> {
    return delay().then(() => PARTICIPATING_BUSINESSES.map(withFeatured))
  },
  async getById(id: number): Promise<ParticipatingBusiness | undefined> {
    return delay().then(() => {
      const b = PARTICIPATING_BUSINESSES.find((x) => x.id === id)
      return b ? withFeatured(b) : undefined
    })
  },
  async search(
    query: string,
    industry?: string,
    level?: PlanLevel,
    tier?: MembershipTier,
  ): Promise<ParticipatingBusiness[]> {
    return delay().then(() => {
      const q = query.trim().toLowerCase()
      return PARTICIPATING_BUSINESSES.filter((b) => {
        if (industry && b.industry !== industry) return false
        if (level && b.membershipLevel !== level) return false
        if (tier && b.membershipTier !== tier) return false
        if (!q) return true
        return (
          b.name.toLowerCase().includes(q) ||
          b.industry.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          b.membership.toLowerCase().includes(q)
        )
      }).map(withFeatured)
    })
  },
}
