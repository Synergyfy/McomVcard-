import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import OnboardingLayout from '../../components/onboarding/OnboardingLayout'
import { mockBusinessProfile } from '../../services/businessStore'
import { loadMembershipPricing, formatPounds, PLAN_TIERS, type BillingCycle, type PlanLevel, type PlanTier } from '../../services/membershipPricingStore'
import { buildSelection, saveOnboardingSelection, TIER_LABEL, type OnboardingSelection } from '../../services/onboardingStore'
import { RULE_LABELS } from './membershipEntitlements'
import { inviteQuery } from '../../utils/inviteContext'

/* ------------------------------------------------------------------ */
/*  Onboarding — Choose Membership                                     */
/*  The 4 admin-configurable plan cards (Bronze/Silver/Gold/Platinum)  */
/*  x Standard (Normal) / Pro / Pro+ tiers, with billing cycle,        */
/*  season, duration and per-tier entitlements pulled straight from    */
/*  membershipPricingStore (no hard-coded limits).                     */
/* ------------------------------------------------------------------ */

const LEVEL_STYLES: Record<PlanLevel, { chip: string; ring: string; badge: string; gradient: string }> = {
  Bronze: {
    chip: 'bg-amber-100 text-amber-700',
    ring: 'ring-amber-300',
    badge: 'from-amber-500 to-amber-700',
    gradient: 'from-amber-50 to-amber-100/60',
  },
  Silver: {
    chip: 'bg-slate-200 text-slate-700',
    ring: 'ring-slate-300',
    badge: 'from-slate-400 to-slate-600',
    gradient: 'from-slate-50 to-slate-100/60',
  },
  Gold: {
    chip: 'bg-yellow-100 text-yellow-700',
    ring: 'ring-yellow-400',
    badge: 'from-yellow-400 to-amber-600',
    gradient: 'from-yellow-50 to-amber-50/60',
  },
  Platinum: {
    chip: 'bg-blue-100 text-blue-700',
    ring: 'ring-blue-400',
    badge: 'from-blue-500 to-indigo-700',
    gradient: 'from-blue-50 to-indigo-50/60',
  },
}

const RULE_LABELS_LOCAL: Record<string, string> = RULE_LABELS

export default function ChooseMembershipPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ctx = inviteQuery(searchParams.get('card'), searchParams.get('business'))
  const [state] = useState(() => loadMembershipPricing())
  const [tier, setTier] = useState<PlanTier>('Normal')
  const [billing, setBilling] = useState<BillingCycle>('quarterly')
  const [openAcc, setOpenAcc] = useState<string | null>(null)

  const season = (() => {
    const s = buildSelection(state, 'Gold', 'Normal', billing)
    return { name: s.seasonName, color: s.seasonColor }
  })()

  const choose = (level: PlanLevel) => {
    const sel: OnboardingSelection = buildSelection(state, level, tier, billing)
    saveOnboardingSelection(sel)
    navigate(`/onboarding/payment${ctx}`)
  }

  const toggleAcc = (key: string) => {
    setOpenAcc(prev => (prev === key ? null : key))
  }

  return (
    <OnboardingLayout
      step={2}
      title="Choose your membership"
      subtitle={`Your existing business information from MCOM Solutions is ready to use — pick the plan that fits ${mockBusinessProfile.name}.`}
    >
      <Helmet><title>Choose Membership - MCOM VCard</title></Helmet>

      {/* Business identity reuse banner */}
      <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900">Onboarding for {mockBusinessProfile.name}</p>
            <p className="text-xs text-gray-500">
              {mockBusinessProfile.owner} · {mockBusinessProfile.sector} · membership sourced from MCOM Solutions
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold self-start sm:self-auto">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Verified business
        </span>
      </div>

      {/* Tier tabs + billing toggle */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
          {PLAN_TIERS.map(tr => (
            <button
              key={tr}
              onClick={() => setTier(tr)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                tier === tr ? 'bg-orange-500 text-white shadow' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {TIER_LABEL[tr]}
              <span className={`block text-[8px] font-medium ${tier === tr ? 'text-white/80' : 'text-gray-400'}`}>
                {tr === 'Normal' ? 'Get started' : tr === 'Pro' ? 'Best value' : 'Maximum power'}
              </span>
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
          {(['monthly', 'quarterly', 'annual'] as BillingCycle[]).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                billing === b ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {b === 'monthly' ? 'Monthly' : b === 'quarterly' ? 'Quarterly' : 'Annual'}
              <span className={`block text-[8px] font-medium ${billing === b ? 'text-white/70' : 'text-gray-400'}`}>
                {b === 'quarterly' ? '90 days' : b === 'annual' ? '12 months' : 'flexible'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Membership cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {state.plans.map(plan => {
          const st = LEVEL_STYLES[plan.id] ?? LEVEL_STYLES.Bronze
          const price = plan.tiers[tier][billing]
          const periodLabel = billing === 'monthly' ? '/month' : billing === 'quarterly' ? '/3 months' : '/year'
          const monthlyEquivalent = billing === 'annual' ? Math.round(price / 12) : billing === 'quarterly' ? Math.round(price / 3) : price
          const entitlements = plan.rules
            .filter(r => RULE_LABELS_LOCAL[r.label])
            .map(r => ({ label: RULE_LABELS_LOCAL[r.label], value: r.values[tier] }))

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
                plan.popular ? `border-transparent ring-2 ${st.ring}` : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-full text-center py-1 bg-gradient-to-r ${st.badge} text-white text-[10px] font-bold`}>
                  Most Popular
                </span>
              )}

              {/* Header */}
              <div className={`p-6 pb-4 bg-gradient-to-br ${st.gradient}`}>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${st.chip}`}>{plan.name}</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400">{TIER_LABEL[tier]}</span>
                </div>
                <p className="mt-2 text-[11px] text-gray-500 leading-relaxed min-h-[32px]">{plan.tagline}</p>

                {/* Season + duration */}
                <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: season.color }} />
                    {season.name}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span>{periodLabel === '/month' ? '1 month' : periodLabel === '/3 months' ? '90 days' : '12 months'}</span>
                </div>

                {/* Price */}
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">{formatPounds(price)}</span>
                  <span className="text-[10px] text-gray-400 mb-1">{periodLabel}</span>
                </div>
                {billing === 'quarterly' && (
                  <p className="text-[9px] text-emerald-600 mt-0.5">90 days access · £{monthlyEquivalent}/mo</p>
                )}
              </div>

              {/* Body */}
              <div className="p-6 pt-4 flex-1 flex flex-col">
                {/* Accordion section (mobile only, one open at a time) */}
                <div className="md:hidden border-b border-dashed border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggleAcc(`${plan.id}:access`)}
                    className="w-full flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400 font-bold py-2"
                    aria-expanded={openAcc === `${plan.id}:access`}
                  >
                    <span>Your membership gives you access to</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${openAcc === `${plan.id}:access` ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openAcc === `${plan.id}:access` && (
                    <ul className="space-y-2 mb-3">
                      {entitlements.map(e => (
                        <li key={e.label} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-[11px] text-gray-600">
                            <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            {e.label}
                          </span>
                          <span className="text-[11px] font-bold text-gray-800">{e.value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleAcc(`${plan.id}:included`)}
                    className="w-full flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400 font-bold py-2 border-t border-dashed border-gray-200"
                    aria-expanded={openAcc === `${plan.id}:included`}
                  >
                    <span>What's included</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${openAcc === `${plan.id}:included` ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openAcc === `${plan.id}:included` && (
                    <ul className="space-y-1.5 mb-3">
                      {plan.features.filter(f => f.scope === 'All' || f.scope === 'Public page').slice(0, 6).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-gray-500">
                          <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          {f.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Expanded sections (md+) */}
                <div className="hidden md:block">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Your membership gives you access to</p>
                  <ul className="space-y-2 mb-4">
                    {entitlements.map(e => (
                      <li key={e.label} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-[11px] text-gray-600">
                          <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {e.label}
                        </span>
                        <span className="text-[11px] font-bold text-gray-800">{e.value}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-dashed border-gray-200 pt-3 mb-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">What's included</p>
                    <ul className="space-y-1.5">
                      {plan.features.filter(f => f.scope === 'All' || f.scope === 'Public page').slice(0, 6).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-gray-500">
                          <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          {f.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pro upsell / Pro+ info */}
                <div className="mt-auto space-y-2">
                  {tier === 'Normal' && (
                    <button
                      onClick={() => setTier('Pro')}
                      className="w-full text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Upgrade to Pro · {formatPounds(plan.tiers.Pro[billing])}{periodLabel}
                    </button>
                  )}
                  {tier === 'Pro' && (
                    <button
                      onClick={() => setTier('Pro+')}
                      className="w-full text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      See Pro+ · {formatPounds(plan.tiers['Pro+'][billing])}{periodLabel}
                    </button>
                  )}
                  {tier === 'Pro+' && (
                    <p className="text-[10px] text-indigo-500 font-semibold text-center py-1.5">Pro+ — maximum power selected</p>
                  )}
                </div>

                {/* Purchase */}
                <button
                  onClick={() => choose(plan.id)}
                  className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    plan.popular
                      ? `bg-gradient-to-r ${st.badge} text-white hover:opacity-90 shadow-md`
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Purchase {plan.name} · {formatPounds(price)}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-8">
        Prices and allocations are managed by MCOM Solutions and updated automatically. Quarterly billing covers 90 days of access.
      </p>
    </OnboardingLayout>
  )
}
