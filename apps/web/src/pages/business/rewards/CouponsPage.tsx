import { Helmet } from 'react-helmet-async'
import { mockCoupons } from '../../../services/businessDashboardStore'

export default function CouponsPage() {
    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Coupons - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discount codes your customers can redeem.</p>
                </div>
                <button className="shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md">
                    New Coupon
                </button>
            </div>

            <div className="space-y-3">
                {mockCoupons.map((c) => (
                    <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{c.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Expires {c.expires} · {c.uses} uses</p>
                                </div>
                                <StatusPill status={c.status} />
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="font-mono text-xs font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-200">{c.code}</span>
                                <span className="text-xs font-semibold text-orange-600">{c.discount}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StatusPill({ status }: { status: 'active' | 'expired' | 'draft' }) {
    const styles = {
        active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        draft: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
        expired: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
    }
    return <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>{status}</span>
}
