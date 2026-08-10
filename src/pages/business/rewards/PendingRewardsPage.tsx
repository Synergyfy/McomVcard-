import { Helmet } from 'react-helmet-async'
import { mockRedeemHistory, mockCustomers } from '../../../services/businessDashboardStore'

export default function PendingRewardsPage() {
    const pendingRedeems = mockRedeemHistory.filter(r => r.status === 'pending')
    const pendingIssued = mockCustomers.flatMap((c) =>
        c.rewards.filter(r => r.status === 'pending').map(r => ({ ...r, customer: c.name }))
    )

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Pending Rewards - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Rewards</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Rewards awaiting redemption by your customers.</p>
            </div>

            {pendingRedeems.length > 0 && (
                <section>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Pending redemptions</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                        {pendingRedeems.map((r) => (
                            <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{r.item}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.customer} · {r.type} · {r.date}</p>
                                </div>
                                <span className="shrink-0 text-sm font-bold text-amber-600">{r.value}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {pendingIssued.length > 0 && (
                <section>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Pending on customer cards</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                        {pendingIssued.map((r, i) => (
                            <div key={i} className="p-4 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{r.label}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.customer} · {r.value}</p>
                                </div>
                                <span className="shrink-0 text-sm font-bold text-amber-600">Pending</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {pendingRedeems.length === 0 && pendingIssued.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nothing pending right now.</p>
                </div>
            )}

            <p className="text-xs text-gray-400">
                Pending rewards are held on the customer's card by MCOM Rewards and surface here until redeemed.
            </p>
        </div>
    )
}
