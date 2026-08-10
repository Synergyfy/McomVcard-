import type { BillingCycle, MembershipPricingState, PlanLevel, PlanTier } from './membershipPricingStore'
import { loadMembershipPricing, formatPounds } from './membershipPricingStore'
import { loadSeasons, seasonStatus, type Season } from './catalogStore'
import { mockBusinessProfile } from './businessStore'

/* ------------------------------------------------------------------ */
/*  Onboarding store — captures the membership a business picks during */
/*  the Get Started → MCOM Solutions → Choose Membership flow.         */
/*  Persisted in localStorage so the confirmation page can render the  */
/*  selected plan, season, dates and entitlements after purchase.      */
/* ------------------------------------------------------------------ */

export interface OnboardingSelection {
  level: PlanLevel
  tier: PlanTier
  billing: BillingCycle
  planName: string
  price: number
  seasonName: string
  seasonColor: string
  startDate: string
  endDate: string
  status: string
  businessName: string
  businessOwner: string
}

const KEY = 'mcom.onboarding.selection'

export const BILLING_LABEL: Record<BillingCycle, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly (90 days)',
  annual: 'Annual',
}

export const TIER_LABEL: Record<PlanTier, string> = {
  Normal: 'Standard',
  Pro: 'Pro',
  'Pro+': 'Pro+',
}

/** The season currently displayed for the membership (active first, else first upcoming). */
export function onboardingSeason(now = new Date()): Season {
  const all = loadSeasons()
  return all.find(s => seasonStatus(s, now) === 'active') ?? all.find(s => seasonStatus(s, now) === 'upcoming') ?? all[0]
}

export function buildSelection(
  state: MembershipPricingState,
  level: PlanLevel,
  tier: PlanTier,
  billing: BillingCycle,
  now = new Date(),
): OnboardingSelection {
  const plan = state.plans.find(p => p.id === level) ?? state.plans[0]
  const season = onboardingSeason(now)
  const start = now
  const end = new Date(start)
  if (billing === 'monthly') end.setMonth(end.getMonth() + 1)
  else if (billing === 'quarterly') end.setMonth(end.getMonth() + 3)
  else end.setFullYear(end.getFullYear() + 1)

  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const tierName = tier === 'Normal' ? '' : `${TIER_LABEL[tier]} `
  return {
    level: plan.id,
    tier,
    billing,
    planName: `${plan.name} ${tierName}membership`.trim(),
    price: plan.tiers[tier][billing],
    seasonName: season?.name ?? '—',
    seasonColor: season?.color ?? '#F97316',
    startDate: fmt(start),
    endDate: fmt(end),
    status: 'Active',
    businessName: mockBusinessProfile.name,
    businessOwner: mockBusinessProfile.owner,
  }
}

export function saveOnboardingSelection(sel: OnboardingSelection): OnboardingSelection {
  try {
    localStorage.setItem(KEY, JSON.stringify(sel))
  } catch {
    /* ignore quota errors */
  }
  return sel
}

export function loadOnboardingSelection(): OnboardingSelection | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as OnboardingSelection
  } catch {
    return null
  }
}

export function clearOnboardingSelection() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export { loadMembershipPricing, formatPounds }
