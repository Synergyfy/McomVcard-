import { Helmet } from 'react-helmet-async'
import { mockCustomers } from '../../../services/businessDashboardStore'

const statusStyles = {
    available: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    redeemed: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
} as const

export default function RewardsIssuedPage() {
    const rows = mockCustomers.flatMap((c) =>
        c.rewards.map((r) => ({ ...r, customer: c.name, tier: c.tier }))
    )

    const totals = {
        issued: rows.length,
        available: rows.filter(r => r.status === 'available').length,
        pending: rows.filter(r => r.status === 'pending').length,
        redeemed: rows.filter(r => r.status === 'redeemed').length,
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Rewards Issued - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards Issued</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Every reward your business has given to customers.</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
                <IssueStat label="Issued" value={String(totals.issued)} />
                <IssueStat label="Available" value={String(totals.available)} className="text-emerald-600" />
                <IssueStat label="Pending" value={String(totals.pending)} className="text-amber-600" />
                <IssueStat label="Redeemed" value={String(totals.redeemed)} className="text-gray-400" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((r, i) => (
                    <div key={i} className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{r.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.customer} · {r.tier} · {r.value}</p>
                        </div>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${statusStyles[r.status]}`}>{r.status}</span>
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-400">
                Rewards issued on a customer's card are owned and tracked by MCOM Rewards. MCOMVCard only surfaces them for your business.
            </p>
        </div>
    )
}

function IssueStat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-3 text-center">
            <p className={`text-lg font-bold text-gray-900 dark:text-white ${className}`}>{value}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}
