import type { BillingCycle, MembershipPricingState, PlanTier } from '../../services/membershipPricingStore'
import { formatPounds } from '../../services/membershipPricingStore'

/* ------------------------------------------------------------------ */
/*  The 4 plan cards (Bronze / Silver / Gold / Platinum) for one       */
/*  pricing tier. Shared by the public pricing page and the admin      */
/*  Pricing & Plans live preview.                                      */
/* ------------------------------------------------------------------ */

const PLAN_STYLES: Record<string, { chip: string; ring: string; badge: string; gradient: string }> = {
  Bronze: {
    chip: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-200 dark:ring-amber-500/40',
    badge: 'from-amber-500 to-amber-700',
    gradient: 'from-amber-50 to-amber-100/60 dark:from-amber-500/10 dark:to-amber-500/5',
  },
  Silver: {
    chip: 'bg-slate-200 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300',
    ring: 'ring-slate-200 dark:ring-slate-500/40',
    badge: 'from-slate-400 to-slate-600',
    gradient: 'from-slate-50 to-slate-100/60 dark:from-slate-500/10 dark:to-slate-500/5',
  },
  Gold: {
    chip: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    ring: 'ring-yellow-300 dark:ring-yellow-500/40',
    badge: 'from-yellow-400 to-amber-600',
    gradient: 'from-yellow-50 to-amber-50/60 dark:from-yellow-500/10 dark:to-amber-500/5',
  },
  Platinum: {
    chip: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-200 dark:ring-blue-500/40',
    badge: 'from-blue-500 to-indigo-700',
    gradient: 'from-blue-50 to-indigo-50/60 dark:from-blue-500/10 dark:to-indigo-500/5',
  },
}

export function PricingCard({ state, tier, billing, onChoose, currentPlan }: {
  state: MembershipPricingState
  tier: PlanTier
  billing: BillingCycle
  onChoose?: (name: string) => void
  currentPlan?: string
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {state.plans.map(plan => {
        const st = PLAN_STYLES[plan.id] ?? PLAN_STYLES.Bronze
        const p = plan.tiers[tier]
        const price = p[billing]
        const periodLabel = billing === 'monthly' ? '/month' : billing === 'quarterly' ? '/3 months' : '/year'
        const monthlyEquivalent = billing === 'annual' ? Math.round(price / 12) : billing === 'quarterly' ? Math.round(price / 3) : price
        const isCurrent = !!currentPlan && plan.name === currentPlan
        return (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-6 ${
              plan.popular ? `border-transparent ring-2 ${st.ring}` : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {plan.popular && (
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${st.badge} text-white text-[10px] font-bold shadow`}>
                Most Popular
              </span>
            )}
            {isCurrent && (
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold shadow whitespace-nowrap">
                Current Plan
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.chip}`}>{plan.name}</span>
              {tier !== 'Normal' && (
                <span className="text-[9px] uppercase tracking-wider text-gray-400">{tier}</span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed min-h-[48px]">{plan.tagline}</p>
            <div className="mt-4 mb-1 flex items-end gap-1">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{formatPounds(price)}</span>
              <span className="text-[10px] text-gray-400 mb-1">{periodLabel}</span>
            </div>
            {billing === 'quarterly' && (
              <p className="text-[9px] text-emerald-600 mb-2">90 days access · £{monthlyEquivalent}/mo</p>
            )}
            {p.trialDays > 0 && (
              <p className="text-[9px] text-gray-400 mb-2">{p.trialDays}-day free trial{p.setupFee > 0 ? ` · ${formatPounds(p.setupFee)} setup` : ''}</p>
            )}
            <ul className="mt-3 mb-6 space-y-2 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onChoose?.(plan.name)}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                plan.popular
                  ? `bg-gradient-to-r ${st.badge} text-white hover:opacity-90 shadow-md`
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Choose {plan.name}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function BillingToggle({ billing, onChange }: { billing: BillingCycle; onChange: (b: BillingCycle) => void }) {
  const options: { id: BillingCycle; label: string; note?: string }[] = [
    { id: 'monthly', label: 'Monthly', note: 'flexible' },
    { id: 'quarterly', label: 'Quarterly', note: '90 days' },
    { id: 'annual', label: 'Annual' },
  ]
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${billing === o.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
        >
          {o.label}
          {o.note && <span className={`block text-[8px] font-medium ${billing === o.id ? 'text-white/70 dark:text-gray-500' : 'text-gray-400'}`}>{o.note}</span>}
        </button>
      ))}
    </div>
  )
}

export function PricingTierTabs({ tier, onChange }: { tier: PlanTier; onChange: (t: PlanTier) => void }) {
  const tiers: { id: PlanTier; note: string }[] = [
    { id: 'Normal', note: 'Get started' },
    { id: 'Pro', note: 'Best value' },
    { id: 'Pro+', note: 'Maximum power' },
  ]
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {tiers.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${tier === t.id ? 'bg-orange-500 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
        >
          {t.id}
          <span className={`block text-[8px] font-medium ${tier === t.id ? 'text-white/80' : 'text-gray-400'}`}>{t.note}</span>
        </button>
      ))}
    </div>
  )
}
