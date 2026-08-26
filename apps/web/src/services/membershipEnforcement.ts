import { loadMembershipPricing, defaultMembershipPricing, PLAN_LEVELS, type MembershipPricingState, type PlanLevel, type PlanRule, type PlanTier, type RuleScope } from './membershipPricingStore'
import { resourceUsage } from './membershipResources'

/* ------------------------------------------------------------------ */
/*  Membership rule enforcement helpers.                               */
/*                                                                     */
/*  Rules defined on the pricing plans carry a `scope` that controls   */
/*  where each rule is enforced:                                       */
/*    - Admin setup    → admin screens (e.g. BusinessProfilePage)      */
/*    - Business usage → business user screens (e.g. vcard list)       */
/*    - Consumer usage → consumer screens (e.g. claimed cards)         */
/*    - Public page    → the public comparison table                   */
/*    - All            → everywhere                                    */
/* ------------------------------------------------------------------ */

export type RuleContext = 'admin' | 'business' | 'consumer' | 'public'

const SCOPE_BY_CONTEXT: Record<RuleContext, RuleScope> = {
  admin: 'Admin setup',
  business: 'Business usage',
  consumer: 'Consumer usage',
  public: 'Public page',
}

/** Whether a rule with the given scope should be enforced in a context. */
export function ruleApplies(scope: RuleScope, ctx: RuleContext): boolean {
  return scope === 'All' || scope === SCOPE_BY_CONTEXT[ctx]
}

/** Map a free-form plan name (e.g. "Bronze Pro") to a PlanLevel. */
export function getPlanLevelFromName(name?: string | null): PlanLevel {
  if (!name) return 'Bronze'
  const found = PLAN_LEVELS.find(l => name.toLowerCase().includes(l.toLowerCase()))
  return found ?? 'Bronze'
}

/** Parse a rule value like "10", "£1,000", "Unlimited" into a number. */
export function parseLimit(value: string | undefined): number | null {
  if (!value) return null
  const t = value.trim().toLowerCase()
  if (t === 'unlimited' || t === '∞' || t === 'n/a' || t === 'yes') return Infinity
  if (t === 'no' || t === 'none') return 0
  const digits = value.replace(/[£$,\s]/g, '')
  if (digits === '') return null
  const n = Number(digits)
  return Number.isFinite(n) ? n : null
}

/** Human display of a limit value ("Unlimited" for ∞). */
export function formatLimit(value: string | undefined): string {
  if (!value) return '—'
  return parseLimit(value) === Infinity ? 'Unlimited' : value
}

export function getPlanCard(state: MembershipPricingState, planLevel: PlanLevel) {
  return state.plans.find(p => p.id === planLevel)
}

export function getRule(state: MembershipPricingState, planLevel: PlanLevel, label: string): PlanRule | undefined {
  const plan = getPlanCard(state, planLevel)
  return plan?.rules.find(r => r.label.toLowerCase() === label.toLowerCase())
}

export function getRuleValue(state: MembershipPricingState, planLevel: PlanLevel, label: string, tier: PlanTier = 'Normal'): string | undefined {
  return getRule(state, planLevel, label)?.values[tier]
}

/** All rules for a plan that are enforced in the given context. */
export function rulesForContext(state: MembershipPricingState, planLevel: PlanLevel, ctx: RuleContext): PlanRule[] {
  const plan = getPlanCard(state, planLevel)
  if (!plan) return []
  return plan.rules.filter(r => ruleApplies(r.scope, ctx))
}

/** Load pricing state once (memoized) for hooks/renders. */
export function useMembershipState() {
  return loadMembershipPricing()
}

/** Live usage for a resource label (from the pages/features it controls). */
export function getResourceUsage(label: string): { used: number; unit?: string; display?: string } | null {
  return resourceUsage(label)
}

/* ------------------------------------------------------------------ */
/*  QR scan rules — the scan modes a business QR can use (Daily,       */
/*  Seasonal allowance, Unlimited). The available options come from    */
/*  the membership configuration ('QR scan rules' rule) for the        */
/*  business's plan + tier — never hard-coded on the page.             */
/* ------------------------------------------------------------------ */

export type QrScanRule = 'Daily' | 'Seasonal' | 'Unlimited'

export interface QrScanRuleOption {
  id: QrScanRule
  label: string
  limit?: number
}

/** Parse a rule value like "Daily:500, Seasonal:10000, Unlimited" into options. */
export function parseQrScanRules(value: string | undefined): QrScanRuleOption[] {
  if (!value) return []
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(token => {
      const [name, num] = token.split(':')
      const id = name as QrScanRule
      if (id === 'Unlimited' || !num) return { id, label: id }
      const limit = Number(num.replace(/[^0-9]/g, ''))
      return { id, label: id, limit: Number.isFinite(limit) ? limit : undefined }
    })
}

/**
 * Scan-rule options available to a business for its plan + tier.
 * Falls back to the default plan configuration when the rule has not
 * been persisted (older localStorage states won't include it yet).
 */
export function getQrScanRules(state: MembershipPricingState, planLevel: PlanLevel, tier: PlanTier = 'Normal'): QrScanRuleOption[] {
  const value = getRuleValue(state, planLevel, 'QR scan rules', tier)
  if (value !== undefined) return parseQrScanRules(value)
  return parseQrScanRules(getRuleValue(defaultMembershipPricing(), planLevel, 'QR scan rules', tier))
}
