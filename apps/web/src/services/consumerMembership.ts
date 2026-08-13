/* ------------------------------------------------------------------ */
/*  Consumer membership entitlements.                                  */
/*                                                                     */
/*  The number of family & friend cards a consumer can allocate is a   */
/*  property of their membership (level + tier), exactly as Henry      */
/*  specifies — it must come from the membership configuration, never  */
/*  hard-coded on a page.                                              */
/*                                                                     */
/*  Level ladder: Bronze → Silver → Gold → Platinum                    */
/*  Tier ladder:   Standard → Pro → Pro+                               */
/*                                                                     */
/*  Higher levels and tiers always grant more (or equal) allowances.   */
/* ------------------------------------------------------------------ */

export interface ConsumerEntitlements {
  familyCards: number
  friendCards: number
}

export const CONSUMER_LEVELS = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const
export const CONSUMER_TIERS = ['Standard', 'Pro', 'Pro+'] as const

/** Family & friend card allowances keyed by level, then tier. */
const FAMILY_CARDS_BY_LEVEL: Record<(typeof CONSUMER_LEVELS)[number], Record<(typeof CONSUMER_TIERS)[number], number>> = {
  Bronze: { Standard: 2, Pro: 4, 'Pro+': 6 },
  Silver: { Standard: 4, Pro: 6, 'Pro+': 8 },
  Gold: { Standard: 6, Pro: 8, 'Pro+': 10 },
  Platinum: { Standard: 8, Pro: 10, 'Pro+': 12 },
}

const FRIEND_CARDS_BY_LEVEL: Record<(typeof CONSUMER_LEVELS)[number], Record<(typeof CONSUMER_TIERS)[number], number>> = {
  Bronze: { Standard: 1, Pro: 2, 'Pro+': 3 },
  Silver: { Standard: 2, Pro: 3, 'Pro+': 4 },
  Gold: { Standard: 3, Pro: 4, 'Pro+': 5 },
  Platinum: { Standard: 4, Pro: 5, 'Pro+': 6 },
}

/** Parse a membership name like "Bronze Pro" / "Silver Pro+" into level + tier. */
export function parseMembership(membership: string): { level: (typeof CONSUMER_LEVELS)[number]; tier: (typeof CONSUMER_TIERS)[number] } {
  const lower = membership.toLowerCase()
  const level = (CONSUMER_LEVELS.find((l) => lower.includes(l.toLowerCase())) ?? 'Bronze') as (typeof CONSUMER_LEVELS)[number]
  const tier = (CONSUMER_TIERS.find((t) => lower.includes(t.toLowerCase())) ?? 'Standard') as (typeof CONSUMER_TIERS)[number]
  return { level, tier }
}

/** Look up the family/friend card allowance for a membership name. */
export function getConsumerEntitlements(membership: string): ConsumerEntitlements {
  const { level, tier } = parseMembership(membership)
  return {
    familyCards: FAMILY_CARDS_BY_LEVEL[level][tier],
    friendCards: FRIEND_CARDS_BY_LEVEL[level][tier],
  }
}
