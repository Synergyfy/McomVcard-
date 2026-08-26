/* ------------------------------------------------------------------ */
/*  Membership levels at a glance — Bronze / Silver / Gold / Platinum  */
/*  with the Standard / Pro / Pro+ access ladder.                      */
/*                                                                     */
/*  Fully data-driven from membershipPricingStore: names, taglines     */
/*  and highlights render from the admin configuration. No "Normal"    */
/*  label is ever shown — the display name is always "Standard".       */
/* ------------------------------------------------------------------ */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadMembershipPricing, type MembershipPricingState, type PlanLevel, type PlanTier } from '../../services/membershipPricingStore'
import { planStyle, TIER_LABEL, ACCESS_META } from '../public/PricingCards'

const TIER_ORDER: PlanTier[] = ['Normal', 'Pro', 'Pro+']

export default function MembershipOverview({ ctaTo = '/register', ctaLabel = 'Compare membership' }: {
  ctaTo?: string
  ctaLabel?: string
}) {
  const [state] = useState(() => loadMembershipPricing())

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="inline-block px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
            Membership levels
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Four levels. Three ways to access.</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Every level comes as Standard, Pro or Pro+ access — configured by MCOM, never hard-coded.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {['Bronze', 'Silver', 'Gold', 'Platinum'].map((lv) => (
            <LevelCard key={lv} level={lv as PlanLevel} state={state} />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={ctaTo}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:opacity-90 hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-[0.98]"
          >
            {ctaLabel}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

function LevelCard({ level, state }: { level: PlanLevel; state: MembershipPricingState }) {
  const [hoverTier, setHoverTier] = useState<PlanTier>('Pro')
  const plan = state.plans.find((p) => p.id === level) ?? state.plans[0]
  const st = planStyle(plan.id)

  const headline = plan.rules.filter((r) => r.scope === 'All' || r.scope === 'Public page')
  const topRules = headline.slice(0, 3)

  return (
    <div
      onMouseEnter={() => setHoverTier('Pro')}
      className={`relative flex flex-col rounded-2xl border bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl transition-all overflow-hidden ${
        plan.popular ? 'border-transparent ring-2 ring-yellow-300 dark:ring-yellow-500/40' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {plan.popular && (
        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${st.badge} text-white text-[10px] font-bold shadow`}>
          Most Popular
        </span>
      )}

      <div className={`h-14 bg-gradient-to-br ${st.gradient} flex items-center justify-center`}>
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${st.chip}`}>{plan.name}</span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{plan.tagline}</p>

        <ul className="space-y-2 mb-4 flex-1">
          {topRules.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-gray-600 dark:text-gray-300 truncate">{r.label}</span>
              <span className="font-bold text-gray-900 dark:text-white shrink-0">{r.values[hoverTier]}</span>
            </li>
          ))}
        </ul>

        {/* Access selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
          {TIER_ORDER.map((t) => (
            <button
              key={t}
              onClick={() => setHoverTier(t)}
              className={`flex-1 px-1.5 py-1 rounded-md text-[9px] font-bold transition-colors ${
                hoverTier === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {TIER_LABEL[t]}
            </button>
          ))}
        </div>
        <p className="text-[8px] text-gray-400 mt-1 text-center">{ACCESS_META[hoverTier].sub}</p>
      </div>
    </div>
  )
}