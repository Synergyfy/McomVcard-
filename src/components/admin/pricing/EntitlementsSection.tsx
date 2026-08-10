import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { MembershipPricingState, PlanLevel, PlanRule, PlanTier, RuleScope } from '../../../services/membershipPricingStore'
import { PLAN_LEVELS, PLAN_TIERS } from '../../../services/membershipPricingStore'
import { resourcePages, resourceUsage } from '../../../services/membershipResources'
import { parseLimit } from '../../../services/membershipEnforcement'

/* ------------------------------------------------------------------ */
/*  Entitlements & Allocation — per-plan limits for each tier.         */
/*                                                                     */
/*  Resources come from the plan RULES in Plans & Pricing → Rule,      */
/*  whose labels are picked from the system resource catalog. Each      */
/*  plan has its own Normal / Pro / Pro+ offering, and editing here     */
/*  writes straight back to those rules, so the change flows to every   */
/*  screen the resource controls.                                       */
/*                                                                     */
/*  The Resource column also shows a live usage badge (with tooltip)    */
/*  pulled from the pages/features each resource actually controls,     */
/*  so admins can see how much of the limit is being consumed.          */
/* ------------------------------------------------------------------ */

const PLAN_COLORS: Record<PlanLevel, string> = {
  Bronze: 'bg-amber-500',
  Silver: 'bg-slate-400',
  Gold: 'bg-yellow-500',
  Platinum: 'bg-blue-600',
}

const SCOPE_STYLES: Record<RuleScope, string> = {
  All: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  'Admin setup': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Business usage': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'Consumer usage': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'Public page': 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
}

const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-colors'

/* Compact usage badge with tooltip — shows live usage from the page. */
function UsageBadge({ label, limitValue }: { label: string; limitValue?: string }) {
  const usage = resourceUsage(label)
  if (!usage) return null

  const limit = parseLimit(limitValue)
  const unlimited = limit === Infinity
  const used = usage.used
  const atLimit = !unlimited && limit !== null && used >= limit
  const nearLimit = !unlimited && limit !== null && used >= limit * 0.8 && !atLimit

  const badgeColor = atLimit
    ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30'
    : nearLimit
      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'

  const display = usage.display
    ? `${usage.display} ${usage.unit ?? ''}`.trim()
    : `${used} ${usage.unit ?? ''} used`.trim()

  const tooltip = usage.display
    ? `Current ${label.toLowerCase()} on the live page: ${usage.display}`
    : `Currently ${used} ${usage.unit ?? ''} in use on the ${label.toLowerCase()} page${limitValue ? ` · limit is ${limitValue}` : ''}`

  return (
    <span className="group relative inline-flex shrink-0">
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${badgeColor}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${atLimit ? 'bg-red-500' : nearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        {display}
      </span>
      {/* Tooltip */}
      <span className="pointer-events-none absolute bottom-full left-0 mb-1.5 w-56 max-w-[min(14rem,70vw)] rounded-lg bg-gray-900 dark:bg-gray-950 text-white text-[9px] leading-snug px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
        {tooltip}
      </span>
    </span>
  )
}

export function EntitlementsSection({ state, update }: {
  state: MembershipPricingState
  update: (fn: (s: MembershipPricingState) => MembershipPricingState) => void
}) {
  const [plan, setPlan] = useState<PlanLevel>('Bronze')

  /* Union of rule labels (order follows the first plan's rules). */
  const labels = useMemo(() => {
    const order: string[] = []
    state.plans.forEach(p => p.rules.forEach(r => { if (!order.includes(r.label)) order.push(r.label) }))
    return order
  }, [state.plans])

  const activePlan = state.plans.find(p => p.id === plan) ?? state.plans[0]
  const ruleFor = (label: string): PlanRule | undefined => activePlan?.rules.find(r => r.label === label)

  const setValue = (label: string, tier: PlanTier, value: string) => {
    update(s => ({
      ...s,
      plans: s.plans.map(p => {
        if (p.id !== plan) return p
        const rules = [...p.rules]
        let idx = rules.findIndex(r => r.label === label)
        if (idx === -1) {
          rules.push({ label, values: { Normal: '', Pro: '', 'Pro+': '' }, description: '', scope: 'All' })
          idx = rules.findIndex(r => r.label === label)
        }
        rules[idx] = { ...rules[idx], values: { ...rules[idx].values, [tier]: value } }
        return { ...p, rules }
      }),
    }))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Entitlements & Allocation</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            What each plan includes, per tier. Choose a plan, then set the Normal, Pro and Pro+ offerings.
          </p>
        </div>

        {/* Plan tabs */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-fit">
          {PLAN_LEVELS.map(p => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${plan === p
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${PLAN_COLORS[p]}`} />
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Editor card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Card header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/20">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${PLAN_COLORS[plan]}`} />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{plan} plan</p>
              <p className="text-[10px] text-gray-400">Set a value for each tier · saved with “Save Pricing”</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-semibold">
            Enforced live across the dashboard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="w-64 px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Resource</th>
                {PLAN_TIERS.map(t => (
                  <th key={t} className="px-3 py-3 text-left">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">{t}</span>
                    <span className="block text-[9px] font-medium text-gray-400">
                      {t === 'Normal' ? 'Get started' : t === 'Pro' ? 'Best value' : 'Maximum power'}
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Used on</th>
              </tr>
            </thead>
            <tbody>
              {labels.map(label => {
                const rule = ruleFor(label)
                const controls = resourcePages(label)
                const limitValue = rule?.values.Normal
                return (
                  <tr key={label} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-900/10 transition-colors align-top">
                    <td className="px-5 py-3">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{label}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {rule && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${SCOPE_STYLES[rule.scope] ?? SCOPE_STYLES.All}`}>
                            {rule.scope}
                          </span>
                        )}
                        {/* Live usage badge */}
                        <UsageBadge label={label} limitValue={limitValue} />
                      </div>
                      {rule?.description && <p className="text-[10px] text-gray-400 mt-1.5 leading-snug max-w-[220px]">{rule.description}</p>}
                    </td>
                    {PLAN_TIERS.map(t => (
                      <td key={t} className="px-3 py-3">
                        <input
                          value={activePlan?.rules.find(r => r.label === label)?.values[t] ?? ''}
                          onChange={e => setValue(label, t, e.target.value)}
                          placeholder="—"
                          className={inputCls}
                        />
                      </td>
                    ))}
                    <td className="px-5 py-3">
                      {controls ? (
                        <div className="flex flex-col gap-1.5">
                          {controls.map((c, i) => (
                            <Link
                              key={i}
                              to={c.href}
                              className="inline-flex items-center gap-1.5 text-[10px] font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 w-fit"
                            >
                              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400">Managed in Plans & Pricing → Rule</p>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
          <p className="text-[10px] text-gray-400">
            Resources are added, renamed or removed in <Link to="/admin/membership/pricing?section=plans" className="text-orange-600 dark:text-orange-400 font-medium">Plans & Pricing → Rule</Link>.
            Values here are enforced on the screens listed under “Used on”. The green badge shows live usage from those screens.
          </p>
        </div>
      </div>
    </div>
  )
}