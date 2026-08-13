import { Helmet } from 'react-helmet-async'
import { mockCashback } from '../../../services/businessDashboardStore'

export default function CashbackPage() {
    return (
        <div className="space-y-6 animate-fadeIn max-w-lg">
            <Helmet><title>Cashback - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cashback</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Give money back to your loyal customers.</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
                <p className="text-xs text-white/80">Total cashback given</p>
                <p className="text-3xl font-bold mt-1">£181.60</p>
                <p className="text-xs text-white/80 mt-1">Across {mockCashback.length} active programs</p>
            </div>

            <div className="space-y-3">
                {mockCashback.map((c) => (
                    <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{c.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rate: {c.rate} · Earned: {c.earned}</p>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                c.status === 'active'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                            }`}>
                                {c.status === 'active' ? 'Active' : 'Off'}
                            </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-amber-500 text-white text-xs font-bold">
                                {c.status === 'active' ? 'Turn Off' : 'Turn On'}
                            </button>
                            <button className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold">Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
