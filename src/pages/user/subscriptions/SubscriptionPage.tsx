import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { loadMembershipPricing, formatPounds, type BillingCycle, type PlanTier } from '../../../services/membershipPricingStore'
import { BillingToggle, PricingCard, PricingTierTabs } from '../../../components/public/PricingCards'
import { MembershipLimitCard } from '../../../components/membership/MembershipLimitCard'
import { rulesForContext, getPlanLevelFromName } from '../../../services/membershipEnforcement'
import { mockBusinessProfile } from '../../../services/businessStore'
import { mockVcards } from '../../../services/mockData'

const BUSINESS_ID = 1

export default function SubscriptionPage() {
  const [tier, setTier] = useState<PlanTier>(mockBusinessProfile.tier as PlanTier)
  const [billing, setBilling] = useState<BillingCycle>('quarterly')
  const pricingState = loadMembershipPricing()
  const planLevel = getPlanLevelFromName(mockBusinessProfile.membership)
  const businessRules = rulesForContext(pricingState, planLevel, 'business')
  const currentPlan = pricingState.plans.find((p) => p.id === planLevel)

  const currentPrice = currentPlan?.tiers[tier]?.[billing]
  const renewal = mockBusinessProfile.renewalDate

  const choose = (name: string) => toast.success(`${name} selected — our team will contact you to confirm`)

  return (
    <div>
      <Helmet><title>Subscription - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your subscription plan</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-white/70 mb-1">Current Plan</p>
            <h2 className="text-2xl font-bold">
              {mockBusinessProfile.membership} {mockBusinessProfile.tier}
              {mockBusinessProfile.tier !== 'Normal' ? ' — ' + mockBusinessProfile.tier : ''}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">Active</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">Tier</p>
            <p className="text-lg font-bold">{mockBusinessProfile.tier}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">Quarterly Price</p>
            <p className="text-lg font-bold">{currentPrice ? formatPounds(currentPrice) : '—'}/qtr</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">Renewal</p>
            <p className="text-sm font-bold">{renewal}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">Business</p>
            <p className="text-sm font-bold">{mockBusinessProfile.name}</p>
          </div>
        </div>
        <p className="text-xs text-white/50">Billed {billing} for minimum {billing === 'quarterly' ? '90 days' : billing === 'annual' ? '12 months' : '1 month'} of access.</p>
      </div>

      {/* Plan limits — driven by Pricing & Plans rules */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your {planLevel} {mockBusinessProfile.tier} plan limits</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Live from Pricing &amp; Plans · updated {pricingState.updatedAt || '—'}</p>
          </div>
          <Link to="/membership" className="text-xs font-medium text-blue-600 hover:underline">See plans →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {businessRules.map((r) => (
            <div key={r.label} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/20 p-3">
              <p className="text-[10px] text-gray-400 truncate">{r.label}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{r.values[mockBusinessProfile.tier as PlanTier]}</p>
              {r.description && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{r.description}</p>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <MembershipLimitCard label="Business VCards" used={mockVcards.filter((v) => v.user_id === BUSINESS_ID).length} planLevel={planLevel} context="business" />
        </div>
      </div>

      {/* Available Plans — exactly what Admin set up in Pricing & Plans */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Plans</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Bronze, Silver, Gold and Platinum — each with Normal, Pro and Pro+ tiers. Managed by MCOM.
        </p>
        <div className="flex flex-col items-start gap-3 mb-6">
          <PricingTierTabs tier={tier} onChange={setTier} />
          <BillingToggle billing={billing} onChange={setBilling} />
        </div>
        <PricingCard state={pricingState} tier={tier} billing={billing} onChoose={choose} />
      </div>
    </div>
  )
}
