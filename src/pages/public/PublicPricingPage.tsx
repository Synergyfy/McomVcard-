import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { loadMembershipPricing, type BillingCycle, type PlanTier } from '../../services/membershipPricingStore'
import { BillingToggle, PricingCard, PricingTierTabs } from '../../components/public/PricingCards'

/* ------------------------------------------------------------------ */
/*  Public pricing page — /membership                                  */
/*  Normal / Pro / Pro+ tabs switch the price on all 4 plan cards      */
/*  (Bronze, Silver, Gold, Platinum). Data comes from the admin        */
/*  Pricing & Plans page (membershipPricingStore).                     */
/* ------------------------------------------------------------------ */

export default function PublicPricingPage() {
  const [state] = useState(() => loadMembershipPricing())
  const [tier, setTier] = useState<PlanTier>('Normal')
  const [billing, setBilling] = useState<BillingCycle>('quarterly')

  const choose = (name: string) => toast.success(`${name} selected — sign up to get started`)

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
            Four plans — Bronze, Silver, Gold and Platinum — each with Normal, Pro and Pro+ options.
            Billed quarterly for a minimum 90 days of access. Switch tiers below and the price on every plan updates instantly.
          </p>
        </div>
      </div>

      {/* Tier tabs + billing toggle */}
      <div className="px-4 pb-10">
        <div className="flex flex-col items-center gap-3">
          <PricingTierTabs tier={tier} onChange={setTier} />
          <BillingToggle billing={billing} onChange={setBilling} />
        </div>

        {/* Plan cards */}
        <div className="max-w-7xl mx-auto mt-10">
          <PricingCard state={state} tier={tier} billing={billing} onChoose={choose} />
        </div>
      </div>

      {/* Compare strip */}
      <div className="px-4 pb-16">
        <div className="max-w-7xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Compare what's included</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-6">Every plan scales its limits — Pro and Pro+ unlock higher limits and premium features.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[640px]">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2.5 pr-4 font-semibold text-gray-700 dark:text-gray-200">Allocation</th>
                  <th className="py-2.5 pr-4 font-semibold text-gray-700 dark:text-gray-200">Bronze</th>
                  <th className="py-2.5 pr-4 font-semibold text-gray-700 dark:text-gray-200">Silver</th>
                  <th className="py-2.5 pr-4 font-semibold text-gray-700 dark:text-gray-200">Gold</th>
                  <th className="py-2.5 font-semibold text-gray-700 dark:text-gray-200">Platinum</th>
                </tr>
              </thead>
              <tbody>
                {state.plans[0].rules.map((rule, ri) => (
                  <tr key={ri} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{rule.label}</td>
                    {state.plans.map(plan => (
                      <td key={plan.id} className="py-2.5 pr-4 font-medium text-gray-800 dark:text-gray-200">{plan.rules[ri]?.values[tier] ?? '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
