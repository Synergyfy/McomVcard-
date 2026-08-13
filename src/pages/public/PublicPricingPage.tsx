import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { loadMembershipPricing, type BillingCycle, type PlanLevel, type PlanTier } from '../../services/membershipPricingStore'
import { loadConsumerPricing } from '../../services/consumerPricingStore'
import { LevelDropdown, AccessCards, AccessComparison, BillingToggle, type PricingAudience } from '../../components/public/PricingCards'

/* ------------------------------------------------------------------ */
/*  Public pricing page — /membership                                  */
/*  Two-step selection, never hard-codes prices or durations:          */
/*    Step 1  Choose the membership level (Bronze/Silver/Gold/Plat.)   */
/*    Step 2  Choose the access level (Standard / Pro / Pro+) —        */
/*            Pro+ is presented as the Annual Membership option.       */
/*  A Business / Consumer switch frames the audience. Everything       */
/*  renders from the admin's pricing store configuration — business    */
/*  pricing for businesses, consumer pricing for consumers, each       */
/*  configured separately by the admin.                                */
/* ------------------------------------------------------------------ */

export default function PublicPricingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const audienceParam = searchParams.get('audience') as PricingAudience | null
  const [audience, setAudience] = useState<PricingAudience>(audienceParam ?? 'business')
  const [state, setState] = useState(() => audience === 'consumer' ? loadConsumerPricing() : loadMembershipPricing())
  const [level, setLevel] = useState<PlanLevel>('Gold')
  const [tier, setTier] = useState<PlanTier>('Normal')
  const [billing, setBilling] = useState<BillingCycle>('quarterly')

  // When audience changes, reload data and update URL
  useEffect(() => {
    setState(audience === 'consumer' ? loadConsumerPricing() : loadMembershipPricing())
    setSearchParams({ audience }, { replace: true })
  }, [audience, setSearchParams])

  const choose = (lvl: PlanLevel, t: PlanTier) =>
    toast.success(audience === 'business' ? `${lvl} ${t === 'Normal' ? 'Standard' : t} selected — sign up to get started` : `${lvl} ${t === 'Normal' ? 'Standard' : t} selected — connect with a business to activate it`)

  const audienceTitle = audience === 'business' ? 'Business Membership' : 'Consumer Membership'

  const audienceBlurb =
    audience === 'business'
      ? 'Prices and durations are configured by MCOM and update automatically.'
      : 'Consumer membership is issued by businesses you connect with. Available prices are configured by MCOM and update automatically.'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Helmet><title>Membership Pricing - MCOM VCard</title></Helmet>

      {/* Hero */}
      <div className="pt-14 pb-10 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 text-[10px] font-semibold mb-4">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Membership &amp; Pricing
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Pricing that grows with your business
          </h1>
          <p className="mt-4 text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Four levels — Bronze, Silver, Gold and Platinum — each with Standard, Pro and Pro+ access.
            Pro+ is the annual membership option. {audienceBlurb}
          </p>

          {/* Audience switch */}
          <div className="mt-6 inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {(['business', 'consumer'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  audience === a
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {a === 'business' ? 'Business' : 'Consumer'}
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* Selection flow */}
      <div className="px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="mb-8">
            <p className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Step 1 · Choose your membership level</p>
            <LevelDropdown state={state} level={level} onChange={setLevel} />
          </div>

          {/* Step 2 */}
          <div className="mb-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">Step 2 · Choose your access</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 font-semibold">{audienceTitle}</span>
                {tier !== 'Pro+' && <BillingToggle billing={billing} onChange={setBilling} />}
                {tier === 'Pro+' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-800/40 text-orange-600 text-[11px] font-bold">
                    Pro+ · Annual membership
                  </span>
                )}
              </div>
            </div>
          </div>

          <AccessCards
            state={state}
            level={level}
            tier={tier}
            billing={billing}
            onSelect={setTier}
            onChoose={choose}
          />

          <p className="text-center text-[11px] text-gray-400 mt-6">
            Standard gives access. Pro is the upgrade. Pro+ is the annual membership with the highest access and benefits.
          </p>
        </div>
      </div>

      {/* Comparison table */}
      <div className="px-4 pb-16">
        <div className="max-w-5xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Compare {level} access</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-6">
            Standard · Pro · Pro+ — what each access level includes for {level}. Pro+ is an annual membership and provides the highest level of access and benefits.
          </p>
          <AccessComparison state={state} level={level} />
        </div>
      </div>
    </div>
  )
}
