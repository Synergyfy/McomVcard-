import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useEffect, useState } from 'react'
import OnboardingLayout from '../../components/onboarding/OnboardingLayout'
import { loadMembershipPricing, formatPounds } from '../../services/membershipPricingStore'
import { loadOnboardingSelection, clearOnboardingSelection, TIER_LABEL } from '../../services/onboardingStore'
import { RULE_LABELS } from './membershipEntitlements'
import { inviteQuery } from '../../utils/inviteContext'

/* ------------------------------------------------------------------ */
/*  Onboarding — Membership confirmation                               */
/*  Success state after purchasing the selected membership. Renders    */
/*  the plan, season, start/end dates, status and the entitlements     */
/*  that membership actually unlocks (per-tier, from the store).       */
/* ------------------------------------------------------------------ */

const LEVEL_STYLES: Record<string, string> = {
  Bronze: 'from-amber-500 to-amber-700',
  Silver: 'from-slate-400 to-slate-600',
  Gold: 'from-yellow-400 to-amber-600',
  Platinum: 'from-blue-500 to-indigo-700',
}

export default function MembershipConfirmationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sel = loadOnboardingSelection()
  const ctx = inviteQuery(searchParams.get('card'), searchParams.get('business'))
  const [state] = useState(() => loadMembershipPricing())

  useEffect(() => {
    if (!sel && !searchParams.get('demo')) {
      navigate(`/onboarding/choose-membership${ctx}`, { replace: true })
    }
  }, [sel, searchParams, navigate, ctx])

  if (!sel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const plan = state.plans.find(p => p.id === sel.level) ?? state.plans[0]
  const st = LEVEL_STYLES[sel.level] ?? LEVEL_STYLES.Bronze
  const entitlements = plan.rules
    .filter(r => RULE_LABELS[r.label])
    .map(r => ({ label: RULE_LABELS[r.label], value: r.values[sel.tier] }))
  const tierName = TIER_LABEL[sel.tier]

  const continueDashboard = () => {
    clearOnboardingSelection()
    navigate(`/business${ctx}`)
  }

  return (
    <OnboardingLayout
      step={3}
      title="Membership confirmed"
      subtitle={`Your ${sel.planName} for ${sel.businessName} is now active.`}
    >
      <Helmet><title>Membership Confirmation - MCOM VCard</title></Helmet>

      <div className="max-w-3xl mx-auto">
        {/* Success card */}
        <div className="rounded-3xl bg-white shadow-xl shadow-emerald-100/60 border border-emerald-100 p-8 text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-5 text-xl font-extrabold text-gray-900">Payment successful — welcome aboard</h2>
          <p className="mt-2 text-sm text-gray-500">
            {sel.businessName} is now a {sel.level} {tierName} member. Your dashboard is ready.
          </p>

          <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${st} text-white text-sm font-bold shadow`}>
            {sel.planName}
          </div>

          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Season</dt>
              <dd className="mt-1 text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: sel.seasonColor }} />
                {sel.seasonName}
              </dd>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Start date</dt>
              <dd className="mt-1 text-sm font-bold text-gray-800">{sel.startDate}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">End date</dt>
              <dd className="mt-1 text-sm font-bold text-gray-800">{sel.endDate}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Status</dt>
              <dd className="mt-1 text-sm font-bold text-emerald-600">{sel.status}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Billing</dt>
              <dd className="mt-1 text-sm font-bold text-gray-800">{sel.billing === 'quarterly' ? 'Quarterly' : sel.billing === 'annual' ? 'Annual' : 'Monthly'}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Price</dt>
              <dd className="mt-1 text-sm font-bold text-gray-800">{formatPounds(sel.price)}</dd>
            </div>
          </dl>
        </div>

        {/* Entitlements */}
        <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Your membership gives you access to</h3>
          <p className="text-[11px] text-gray-400 mb-4">
            {sel.level} · {tierName} tier — limits come from your selected plan and may be upgraded any time.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entitlements.map(e => (
              <li key={e.label} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="text-xs text-gray-600">{e.label}</span>
                <span className="text-xs font-bold text-gray-800">{e.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-dashed border-gray-200 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Included features</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.features.filter(f => f.scope === 'All' || f.scope === 'Public page').slice(0, 8).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-gray-500">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={continueDashboard}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-blue-200"
          >
            Continue to Dashboard
          </button>
          <button
            onClick={() => navigate(`/membership${ctx}`)}
            className="w-full sm:w-auto px-8 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all"
          >
            View full pricing
          </button>
        </div>
      </div>
    </OnboardingLayout>
  )
}
