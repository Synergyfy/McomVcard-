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

import type { PlanLevel } from './membershipPricingStore'
import { parseMembership } from './consumerMembership'

export type MembershipTier = 'Standard' | 'Pro' | 'Pro+'

export interface ParticipatingBusiness {
  id: string
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

/* ------------------------------------------------------------------ */
/*  Featured businesses — controlled by the Admin.                     */
/*  Persisted to localStorage so the landing page and find-a-business  */
/*  page reflect the Admin's choices. New platform defaults are always */
/*  merged in so older saved states stay valid.                        */
/* ------------------------------------------------------------------ */

const DEFAULT_FEATURED_IDS = ['1', '2', '4', '6', '7', '10']
const FEATURED_KEY = 'mcom_featured_businesses'

function loadFeaturedIds(): Set<string> {
  const ids = new Set<string>(DEFAULT_FEATURED_IDS)
  try {
    const raw = localStorage.getItem(FEATURED_KEY)
    if (!raw) return ids
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      parsed.forEach((n: unknown) => { if (typeof n === 'string') ids.add(n) })
    }
  } catch { /* ignore corrupt storage */ }
  return ids
}

function saveFeaturedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(FEATURED_KEY, JSON.stringify(Array.from(ids)))
  } catch { /* ignore quota */ }
}

export function getFeaturedIds(): Set<string> {
  return loadFeaturedIds()
}

export function toggleFeatured(id: string): boolean {
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

function formatJoined(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

/* ------------------------------------------------------------------ */
/*  API shape from GET /businesses/directory.                          */
/* ------------------------------------------------------------------ */

interface ApiCategory {
  id: string
  name: string
}

interface ApiLocation {
  address: string
  city: string
}

interface ApiBusiness {
  id: string
  name: string
  slug: string
  description: string
  email: string
  phone: string
  website: string
  status: string
  category: ApiCategory
  locations: ApiLocation[]
  created_at: string
}

interface ApiResponse {
  success: boolean
  data: ApiBusiness[]
  message: string
}

function mapApiBusiness(b: ApiBusiness): ParticipatingBusiness {
  const membership = 'Bronze Standard'
  const { level, tier } = parseMembership(membership)
  const address = b.locations?.[0]?.address || ''
  const city = b.locations?.[0]?.city || toCity(address)

  return {
    id: b.id,
    name: b.name,
    industry: b.category?.name || '',
    address,
    city,
    description: b.description,
    website: b.website,
    phone: b.phone,
    email: b.email,
    verified: b.status === 'active',
    initials: toInitials(b.name),
    membership,
    membershipLevel: level,
    membershipTier: tier,
    featured: loadFeaturedIds().has(b.id),
    scans: 0,
    cards: 0,
    joined: formatJoined(b.created_at),
  }
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

let cachedBusinesses: ParticipatingBusiness[] | null = null

async function fetchDirectory(): Promise<ParticipatingBusiness[]> {
  if (cachedBusinesses) return cachedBusinesses

  const res = await fetch(`${API_BASE}/businesses/directory`)
  if (!res.ok) throw new Error(`Failed to fetch businesses: ${res.status}`)

  const json: ApiResponse = await res.json()
  if (!json.success) throw new Error(json.message || 'Failed to fetch businesses')

  cachedBusinesses = json.data.map(mapApiBusiness)
  return cachedBusinesses
}

function invalidateCache(): void {
  cachedBusinesses = null
}

export const participatingBusinessService = {
  async getAll(): Promise<ParticipatingBusiness[]> {
    const businesses = await fetchDirectory()
    return businesses.map(withFeatured)
  },

  async getById(id: string): Promise<ParticipatingBusiness | undefined> {
    const businesses = await fetchDirectory()
    const b = businesses.find((x) => x.id === id)
    return b ? withFeatured(b) : undefined
  },

  async search(
    query: string,
    industry?: string,
    level?: PlanLevel,
    tier?: MembershipTier,
  ): Promise<ParticipatingBusiness[]> {
    const q = query.trim().toLowerCase()

    let url = `${API_BASE}/businesses/directory`
    const params = new URLSearchParams()
    if (q) params.set('search', q)
    if (params.toString()) url += `?${params.toString()}`

    let businesses: ParticipatingBusiness[]

    if (q || (!industry && !level && !tier)) {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to search businesses: ${res.status}`)
      const json: ApiResponse = await res.json()
      if (!json.success) throw new Error(json.message || 'Failed to search businesses')
      businesses = json.data.map(mapApiBusiness)
    } else {
      businesses = await fetchDirectory()
    }

    return businesses
      .filter((b) => {
        if (industry && b.industry !== industry) return false
        if (level && b.membershipLevel !== level) return false
        if (tier && b.membershipTier !== tier) return false
        return true
      })
      .map(withFeatured)
  },

  /** Force re-fetch on next call (e.g. after admin changes). */
  refresh(): void {
    invalidateCache()
  },
}

/* ------------------------------------------------------------------ */
/*  Derived directory data — lazy-loaded from the API.                 */
/* ------------------------------------------------------------------ */

let _industries: string[] | null = null
let _cities: string[] | null = null

export async function getParticipatingIndustries(): Promise<string[]> {
  if (_industries) return _industries
  const businesses = await fetchDirectory()
  _industries = Array.from(new Set(businesses.map((b) => b.industry))).sort()
  return _industries
}

export async function getParticipatingCities(): Promise<string[]> {
  if (_cities) return _cities
  const businesses = await fetchDirectory()
  _cities = Array.from(new Set(businesses.map((b) => b.city).filter(Boolean))).sort()
  return _cities
}

export async function getParticipatingBusinesses(): Promise<ParticipatingBusiness[]> {
  return participatingBusinessService.getAll()
}

/* Parse a "Jan 2026"-style joined date into a comparable Date. */
export function joinedToDate(joined: string): Date {
  const match = joined.match(/^([A-Za-z]{3})\s+(\d{4})$/)
  if (!match) return new Date(0)
  const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
  const month = months[match[1]]
  if (month === undefined) return new Date(0)
  return new Date(Number(match[2]), month, 1)
}
