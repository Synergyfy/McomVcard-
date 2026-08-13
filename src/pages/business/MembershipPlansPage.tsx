import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loadMembershipPricing, PLAN_TIERS, type BillingCycle, type PlanLevel, type PlanTier } from '../../services/membershipPricingStore'
import { LevelDropdown, AccessCards, AccessComparison, BillingToggle, TIER_LABEL } from '../../components/public/PricingCards'
import { mockMembership } from '../../services/businessDashboardStore'
import { mockBusinessProfile } from '../../services/businessStore'

/* ------------------------------------------------------------------ */
/*  Business — Plans & Pricing (/b/membership/plans)            */
/*  Two-step flow (level → access) driven by the Admin's pricing       */
/*  store — Standard / Pro / Pro+, where Pro+ is the annual option.    */
/*  Defaults to the business's current level and access. Upgrades are  */
/*  requested via the Admin, matching how membership is managed.       */
/* ------------------------------------------------------------------ */

export default function MembershipPlansPage() {
  const navigate = useNavigate()
  const [state] = useState(() => loadMembershipPricing())
  const currentPlan = mockMembership.plan // e.g. "Gold Pro"

  /* Default to the level/access the business is currently on. */
  const currentLevel = (state.plans.find(p => currentPlan.toLowerCase().includes(p.id.toLowerCase()))?.id ?? 'Gold') as PlanLevel
  const currentTier = (PLAN_TIERS as string[]).find(t => currentPlan.toLowerCase().includes(t.toLowerCase())) as PlanTier | undefined
  const [level, setLevel] = useState<PlanLevel>(currentLevel)
  const [tier, setTier] = useState<PlanTier>(currentTier ?? 'Normal')
  const [billing, setBilling] = useState<BillingCycle>('quarterly')

  const choose = (lvl: PlanLevel, t: PlanTier) => {
    const target = `${lvl} ${t === 'Normal' ? 'Standard' : t}`
    toast.success(`Upgrade request submitted — ${mockBusinessProfile.name} will move to ${target}`)
    navigate('/b/membership/confirmation')
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <Helmet><title>Plans &amp; Pricing - My Business - MCOMVCard</title></Helmet>

      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Link to="/b/membership" className="hover:text-orange-600">Membership</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 dark:text-white font-medium">Plans &amp; Pricing</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Plans &amp; Pricing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Every plan your Admin offers, exactly as configured in the Admin pricing dashboard. Standard is access, Pro is the upgrade, Pro+ is the annual membership.
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
            to="/b/membership"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-orange-600 text-xs font-bold hover:opacity-95 self-start sm:self-auto"
          >
            Membership overview
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </div>

      {/* Step 1 — level */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Step 1 · Choose your membership level</p>
        <LevelDropdown state={state} level={level} onChange={setLevel} />
      </div>

      {/* Step 2 — access */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Step 2 · Choose your access</p>
        {tier !== 'Pro+' ? (
          <BillingToggle billing={billing} onChange={setBilling} />
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-800/40 text-orange-600 text-[11px] font-bold">
            Pro+ · Annual membership
          </span>
        )}
      </div>

      <AccessCards state={state} level={level} tier={tier} billing={billing} onSelect={setTier} onChoose={choose} />

      {/* Comparison table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Compare {level} access</h2>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 mb-4">
          {TIER_LABEL[tier]} · how the three access levels scale for {level}. Pro+ is the annual membership.
        </p>
        <AccessComparison state={state} level={level} />
        <p className="text-[10px] text-gray-400 mt-4">
          Plan changes are managed by MCOM Solutions on the Admin dashboard. Selecting a plan submits an upgrade request.
        </p>
      </div>
    </div>
  )
}
