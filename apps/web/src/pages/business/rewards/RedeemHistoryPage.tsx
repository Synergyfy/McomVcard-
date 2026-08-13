import { Helmet } from 'react-helmet-async'
import { mockRedeemHistory } from '../../../services/businessDashboardStore'

const statusStyles = {
    completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    expired: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
} as const

export default function RedeemHistoryPage() {
    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Redeem History - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Redeem History</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Every reward your customers have redeemed.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                {mockRedeemHistory.map((r) => (
                    <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{r.item}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.customer} · {r.type} · {r.date}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{r.value}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusStyles[r.status]}`}>{r.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
