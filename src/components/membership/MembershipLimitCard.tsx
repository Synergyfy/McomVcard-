import { useMemo } from 'react'
import { loadMembershipPricing, type PlanLevel, type PlanTier } from '../../services/membershipPricingStore'
import { formatLimit, getRule, parseLimit, ruleApplies, type RuleContext } from '../../services/membershipEnforcement'

/* ------------------------------------------------------------------ */
/*  MembershipLimitCard — a small usage-vs-limit card driven by the    */
/*  plan rules defined in Pricing & Plans. Used across business,       */
/*  consumer and admin screens so the rules "control what's happening  */
/*  where it is meant to control".                                     */
/* ------------------------------------------------------------------ */

export function MembershipLimitCard({ label, used, planLevel = 'Bronze', tier = 'Normal', context = 'business', title, hint }: {
  label: string
  used: number
  planLevel?: PlanLevel
  tier?: PlanTier
  context?: RuleContext
  title?: string
  hint?: string
}) {
  const state = useMemo(() => loadMembershipPricing(), [])
  const rule = getRule(state, planLevel, label)
  const value = rule?.values[tier]
  const limit = parseLimit(value)
  const active = rule ? ruleApplies(rule.scope, context) : false
  const unlimited = limit === Infinity

  if (!rule || !active) return null

  const pct = !unlimited && limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const atLimit = !unlimited && limit !== null && used >= limit
  const nearLimit = !unlimited && limit !== null && used >= limit * 0.8 && !atLimit

  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-2 ${atLimit ? 'border-red-200 dark:border-red-500/40 bg-red-50/60 dark:bg-red-500/5' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-100">{title ?? rule.label}</p>
          {rule.description && <p className="text-[10px] text-gray-400 truncate">{rule.description}</p>}
        </div>
        <span className={`text-[10px] font-bold whitespace-nowrap shrink-0 ${atLimit ? 'text-red-600 dark:text-red-400' : unlimited ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {used} / {formatLimit(value)}
        </span>
      </div>
      {!unlimited && limit !== null && (
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${atLimit ? 'bg-red-500' : nearLimit ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
        </div>
      )}
      {atLimit && (
        <p className="text-[10px] font-medium text-red-600 dark:text-red-400">{hint ?? `Limit reached — no more ${rule.label.toLowerCase()} can be added on ${planLevel}.`}</p>
      )}
    </div>
  )
}
