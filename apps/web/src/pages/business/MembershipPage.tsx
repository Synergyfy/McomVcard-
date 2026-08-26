import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { mockMembership, mockMembershipBenefits, mockSeasons } from '../../services/businessDashboardStore'

export default function MembershipPage() {
    const navigate = useNavigate()
    const m = mockMembership

    const progress = Math.round((m.totalDays - m.daysRemaining) / m.totalDays * 100)

    const handleRenew = () => navigate('/b/membership/payment')
    const handleUpgrade = () => navigate('/b/membership/plans')

    return (
        <div className="space-y-6 animate-fadeIn max-w-lg">
            <Helmet><title>Membership - MCOMVCard</title></Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Membership</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your plan, benefits and what happens next.</p>
            </div>

            {/* Current plan hero */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 dark:shadow-none">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-white/70">Current plan</p>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wide">Gold Pro</span>
                </div>
                <p className="text-3xl font-bold mt-2">{m.plan}</p>
                <p className="text-sm text-white/80 mt-1">{m.season} · renews {m.renewalDate}</p>

                <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
                        <span>{m.totalDays - m.daysRemaining} of {m.totalDays} days</span>
                        <span className="font-semibold text-white">{m.daysRemaining} days left</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/25 overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="mt-5 flex gap-2">
                    <button onClick={handleRenew} className="flex-1 py-3 min-h-[44px] rounded-xl bg-white text-orange-600 text-sm font-bold">
                        Renew
                    </button>
                    <button onClick={handleUpgrade} className="flex-1 py-3 min-h-[44px] rounded-xl bg-orange-800/40 border border-white/30 text-white text-sm font-bold">
                        Upgrade
                    </button>
                </div>
            </div>

            {/* Season */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Season</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: mockSeasons[0].color }} />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{mockSeasons[0].name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{mockSeasons[0].endsInDays} days left</span>
                </div>
            </div>

            {/* Benefits */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Your benefits</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Included with your {m.plan} plan</p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockMembershipBenefits.map((b) => (
                        <div key={b.label} className="px-4 py-3 flex items-center justify-between gap-3">
                            <span className="text-sm text-gray-900 dark:text-white">{b.label}</span>
                            <span className={`text-xs font-semibold ${
                                b.status === 'active'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : b.status === 'available'
                                        ? 'text-orange-600 dark:text-orange-400'
                                        : 'text-gray-500 dark:text-gray-400'
                            }`}>
                                {b.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Compare / manage */}
            <button onClick={handleUpgrade} className="w-full py-3.5 min-h-[48px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold">
                Compare Plans
            </button>
            <p className="text-xs text-gray-400 text-center">Membership is managed by the Admin dashboard. Contact MCOM Solutions to change your plan.</p>
        </div>
    )
}
