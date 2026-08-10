import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loadMembershipPricing, PLAN_TIERS, type BillingCycle, type PlanTier } from '../../services/membershipPricingStore'
import { BillingToggle, PricingCard, PricingTierTabs } from '../../components/public/PricingCards'
import { mockMembership } from '../../services/businessDashboardStore'
import { mockBusinessProfile } from '../../services/businessStore'

/* ------------------------------------------------------------------ */
/*  Business — Plans & Pricing (/business/membership/plans)            */
/*  Shows exactly the pricing plans the Admin created in              */
/*  /admin/membership/pricing (membershipPricingStore) — every plan    */
/*  is rendered, nothing is missing. Upgrades are requested via the    */
/*  Admin, matching how membership is managed on the business side.    */
/* ------------------------------------------------------------------ */

export default function MembershipPlansPage() {
  const navigate = useNavigate()
  const [state] = useState(() => loadMembershipPricing())
  const currentPlan = mockMembership.plan // e.g. "Gold Pro"

  /* Default the tier to the one the business is currently on. */
  const currentTier = (PLAN_TIERS as string[]).find(t => currentPlan.toLowerCase().includes(t.toLowerCase())) as PlanTier | undefined
  const [tier, setTier] = useState<PlanTier>(currentTier ?? 'Normal')
  const [billing, setBilling] = useState<BillingCycle>('quarterly')

  const currentLevel = state.plans.find(p => currentPlan.toLowerCase().includes(p.id.toLowerCase()))?.id

  const choose = (name: string) => {
    toast.success(`Upgrade request submitted — ${mockBusinessProfile.name} will move to ${name}`)
    navigate('/business/membership/confirmation')
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <Helmet><title>Plans &amp; Pricing - My Business - MCOMVCard</title></Helmet>

      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Link to="/business/membership" className="hover:text-orange-600">Membership</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 dark:text-white font-medium">Plans &amp; Pricing</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Plans &amp; Pricing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Every plan your Admin offers, exactly as configured in the Admin pricing dashboard. No plan is hidden.
        </p>
      </div>

      {/* Current plan */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-200 dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/70">Your current plan</p>
            <p className="text-xl font-bold mt-0.5">{mockMembership.plan}</p>
            <p className="text-xs text-white/80 mt-0.5">{mockMembership.season} · {mockMembership.daysRemaining} days left · renews {mockMembership.renewalDate}</p>
          </div>
          <Link
            to="/business/membership"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-orange-600 text-xs font-bold hover:opacity-95 self-start sm:self-auto"
          >
            Membership overview
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <PricingTierTabs tier={tier} onChange={setTier} />
        <BillingToggle billing={billing} onChange={setBilling} />
      </div>

      {/* All plans — rendered from the Admin's pricing store */}
      <PricingCard state={state} tier={tier} billing={billing} onChoose={choose} currentPlan={currentLevel} />

      {/* Comparison table */}
      {state.plans[0] && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Compare what's included</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 mb-4">
            {tier} tier · how every plan scales its limits across the full catalogue.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[640px]">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2.5 pr-4 font-semibold text-gray-700 dark:text-gray-200">Allocation</th>
                  {state.plans.map(plan => (
                    <th key={plan.id} className={`py-2.5 pr-4 font-semibold ${plan.id === currentLevel ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-200'}`}>
                      {plan.name}{plan.id === currentLevel && <span className="ml-1 text-[9px] font-bold text-orange-500">· current</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.plans[0].rules.map((rule, ri) => (
                  <tr key={ri} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{rule.label}</td>
                    {state.plans.map(plan => (
                      <td key={plan.id} className={`py-2.5 pr-4 font-medium ${plan.id === currentLevel ? 'text-orange-700 dark:text-orange-300' : 'text-gray-800 dark:text-gray-200'}`}>
                        {plan.rules[ri]?.values[tier] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-400 mt-4">
            Plan changes are managed by MCOM Solutions on the Admin dashboard. Selecting a plan submits an upgrade request.
          </p>
        </div>
      )}
    </div>
  )
}
