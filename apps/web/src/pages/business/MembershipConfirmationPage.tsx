import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { loadMembershipPricing, type PlanTier } from '../../services/membershipPricingStore'
import { getRuleValue, getPlanLevelFromName } from '../../services/membershipEnforcement'
import { mockMembership } from '../../services/businessDashboardStore'
import { mockBusinessProfile } from '../../services/businessStore'
import { BIZ_VCARD_TEMPLATES } from '../../services/vcardTemplateCatalogue'

/* ------------------------------------------------------------------ */
/*  Business — Membership Confirmation (/b/membership/confirmation)
/*  Shown after a successful membership payment. Confirms the plan,    */
/*  season, dates, status and the exact entitlements the membership    */
/*  unlocks — templates, cards, Friends & Family allowance and         */
/*  features — then continues to the dashboard.                        */
/* ------------------------------------------------------------------ */

function addDays(dateStr: string, days: number): string {
    const d = new Date(`${dateStr} UTC`)
    if (isNaN(d.getTime())) return dateStr
    d.setUTCDate(d.getUTCDate() + days)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MembershipConfirmationPage() {
    const navigate = useNavigate()

    const state = loadMembershipPricing()
    const planLevel = getPlanLevelFromName(mockBusinessProfile.membership)
    const tier: PlanTier = (['Normal', 'Pro', 'Pro+'].includes(mockBusinessProfile.tier)
        ? mockBusinessProfile.tier
        : 'Normal') as PlanTier
    const plan = state.plans.find(p => p.id === planLevel)

    const planName = mockMembership.plan
    const season = mockMembership.season
    const endDate = mockBusinessProfile.renewalDate
    const startDate = addDays(endDate, -mockMembership.totalDays)
    const status = 'Active'

    /* Entitlements from the membership configuration (never hard-coded). */
    const availableTemplates = BIZ_VCARD_TEMPLATES.filter(t =>
        t.status === 'Published' &&
        t.membershipSupport.some(m => m.toLowerCase().startsWith(planLevel.toLowerCase()))
    ).length
    const businessCards = getRuleValue(state, planLevel, 'Business Cards', tier) ?? '—'
    const consumerCards = getRuleValue(state, planLevel, 'Consumer Cards', tier) ?? '—'
    const ffAllowance = getRuleValue(state, planLevel, 'Friends & Family', tier) ?? '—'
    const features = (plan?.features ?? [])
        .filter(f => f.scope === 'All' || f.scope === 'Public page')

    const summary: { label: string; value: string }[] = [
        { label: 'Membership', value: planName },
        { label: 'Season', value: season },
        { label: 'Start date', value: startDate },
        { label: 'End date', value: endDate },
        { label: 'Membership status', value: status },
        { label: 'Available templates', value: `${availableTemplates} templates` },
        { label: 'Available business cards', value: businessCards },
        { label: 'Available consumer cards', value: consumerCards },
        { label: 'Friends & Family allowance', value: `${ffAllowance} allocations` },
    ]

    return (
        <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
            <Helmet><title>Membership Confirmation - My Business - MCOMVCard</title></Helmet>

            {/* Success message */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-500/30 shadow-sm p-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Payment successful — welcome</h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    Your <span className="font-semibold text-gray-900 dark:text-white">{planName}</span> membership is now
                    active for <span className="font-semibold text-gray-900 dark:text-white">{mockBusinessProfile.name}</span>.
                </p>
            </div>

            {/* Membership summary */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Membership confirmed</h2>
                <p className="text-[11px] text-gray-400 mt-0.5 mb-4">
                    {planLevel} · {tier} tier — everything below is included with your membership.
                </p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {summary.map(s => (
                        <div key={s.label} className="rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 px-3.5 py-3">
                            <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{s.label}</dt>
                            <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{s.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            {/* Available features */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Available features</h3>
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            {f.text}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Continue */}
            <button
                onClick={() => navigate('/b/dashboard')}
                className="w-full py-3.5 min-h-[48px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md hover:opacity-95 transition-opacity"
            >
                Continue to Dashboard
            </button>
            <button
                onClick={() => navigate('/b/membership/plans')}
                className="w-full py-3 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold"
            >
                View Plans &amp; Pricing
            </button>
        </div>
    )
}
