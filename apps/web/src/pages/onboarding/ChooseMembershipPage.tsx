import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import OnboardingLayout from '../../components/onboarding/OnboardingLayout'
import { mockBusinessProfile } from '../../services/businessStore'
import { loadMembershipPricing, type BillingCycle, type PlanLevel, type PlanTier } from '../../services/membershipPricingStore'
import { buildSelection, saveOnboardingSelection, type OnboardingSelection } from '../../services/onboardingStore'
import { LevelDropdown, AccessCards, AccessComparison, AudienceSwitch, BillingToggle, type PricingAudience } from '../../components/public/PricingCards'
import { inviteQuery } from '../../utils/inviteContext'

/* ------------------------------------------------------------------ */
/*  Onboarding — Choose Membership                                     */
/*  Two-step selection, fully driven by membershipPricingStore:        */
/*    Step 1  Choose the membership level (Bronze/Silver/Gold/Plat.)   */
/*    Step 2  Choose the access level (Standard / Pro / Pro+).         */
/*  Pro+ is the annual membership option, so selecting it forces       */
/*  annual billing before payment. No prices or limits are hard-coded. */
/* ------------------------------------------------------------------ */

export default function ChooseMembershipPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ctx = inviteQuery(searchParams.get('card'), searchParams.get('business'))
  const [state] = useState(() => loadMembershipPricing())
  const [audience, setAudience] = useState<PricingAudience>('business')
  const [level, setLevel] = useState<PlanLevel>('Gold')
  const [tier, setTier] = useState<PlanTier>('Normal')
  const [billing, setBilling] = useState<BillingCycle>('quarterly')

  const choose = (lvl: PlanLevel, t: PlanTier) => {
    const effectiveBilling: BillingCycle = t === 'Pro+' ? 'annual' : billing
    const sel: OnboardingSelection = buildSelection(state, lvl, t, effectiveBilling)
    saveOnboardingSelection(sel)
    navigate(`/onboarding/payment${ctx}`)
  }

  return (
    <OnboardingLayout
      step={2}
      title="Choose your membership"
      subtitle={`Your existing business information from MCOM Solutions is ready to use — pick the level and access that fits ${mockBusinessProfile.name}.`}
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

      {/* Audience switch */}
      <div className="mb-8 flex justify-center">
        <AudienceSwitch audience={audience} onChange={setAudience} />
      </div>

      {/* Step 1 — level */}
      <div className="mb-8">
        <p className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Step 1 · Choose your membership level</p>
        <LevelDropdown state={state} level={level} onChange={setLevel} />
      </div>

      {/* Step 2 — access */}
      <div className="mb-6">
        <div className="flex flex-col items-center gap-3 mb-6">
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">Step 2 · Choose your access</p>
          {tier !== 'Pro+' && <BillingToggle billing={billing} onChange={setBilling} />}
          {tier === 'Pro+' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 text-[11px] font-bold">
              Pro+ · Annual membership selected
            </span>
          )}
        </div>

        <AccessCards
          state={state}
          level={level}
          tier={tier}
          billing={billing}
          onSelect={setTier}
          onChoose={choose}
        />
      </div>

      {/* Comparison */}
      <div className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Compare {level} access</h2>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4">
          Pro+ is an annual membership and provides the highest level of access and benefits.
        </p>
        <AccessComparison state={state} level={level} />
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-4">
        Prices and allocations are managed by MCOM Solutions and updated automatically. Pro+ bills annually for 12 months of access.
      </p>
    </OnboardingLayout>
  )
}
