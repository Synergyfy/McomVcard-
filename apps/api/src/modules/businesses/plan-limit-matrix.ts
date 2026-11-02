/**
 * Legacy membership-tier limits.
 *
 * These values belong to the `memberships` table (Bronze/Silver/Gold/Platinum
 * × Normal/Pro/Pro+) and are only used as a fallback for users who do not have
 * a locally purchased plan variant. New plans are configured in
 * `/admin/plans/create` and resolved by `CapabilitiesService`.
 *
 * `null` means Unlimited.
 */

export const PLAN_LEVELS = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const
export type PlanLevel = (typeof PLAN_LEVELS)[number]

export const PLAN_TIERS = ['Normal', 'Pro', 'Pro+'] as const
export type PlanTier = (typeof PLAN_TIERS)[number]

export interface PlanLimitMatrixEntry {
  vcards: (number | null)[]
  businessCards: (number | null)[]
  friendsFamily: (number | null)[]
  qrRoutingRules: (number | null)[]
}

export const PLAN_LIMIT_MATRIX: Record<PlanLevel, PlanLimitMatrixEntry> = {
  Bronze: { vcards: [10, 25, 50], businessCards: [25, 50, 100], friendsFamily: [10, 25, 50], qrRoutingRules: [5, 10, 20] },
  Silver: { vcards: [20, 50, 100], businessCards: [50, 100, 200], friendsFamily: [25, 50, 100], qrRoutingRules: [10, 25, 50] },
  Gold: { vcards: [50, 100, 200], businessCards: [100, 250, 500], friendsFamily: [50, 100, 200], qrRoutingRules: [null, null, null] },
  Platinum: { vcards: [null, null, null], businessCards: [null, null, null], friendsFamily: [100, 200, 400], qrRoutingRules: [null, null, null] },
}

/** Map a free-form plan/membership name (e.g. "Gold Pro") to a plan level. */
export function resolvePlanLevel(name: string): PlanLevel {
  const lower = (name ?? '').toLowerCase()
  return PLAN_LEVELS.find((level) => lower.includes(level.toLowerCase())) ?? 'Bronze'
}

/** Map a free-form plan/membership name to a Normal/Pro/Pro+ tier. */
export function resolvePlanTier(name: string): PlanTier {
  const lower = (name ?? '').toLowerCase()
  if (lower.includes('pro+')) return 'Pro+'
  if (lower.includes('pro')) return 'Pro'
  return 'Normal'
}

/** Index into the matrix arrays for a tier. */
export function tierIndex(tier: PlanTier): 0 | 1 | 2 {
  return tier === 'Pro+' ? 2 : tier === 'Pro' ? 1 : 0
}
