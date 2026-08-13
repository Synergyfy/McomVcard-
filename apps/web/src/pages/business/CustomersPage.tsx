import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockCustomers } from '../../services/businessDashboardStore'

export default function BusinessCustomersPage() {
    const navigate = useNavigate()

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Customers - Business Dashboard - MCOMVCard</title></Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Everyone engaging with your business. Tap a customer to see their rewards, transactions and more.
                </p>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Total" value={String(mockCustomers.length)} color="text-gray-900 dark:text-white" />
                <MiniStat label="Active" value={String(mockCustomers.filter(c => c.status === 'active').length)} color="text-emerald-600" />
                <MiniStat label="New" value={String(mockCustomers.filter(c => c.status === 'new').length)} color="text-blue-600" />
            </div>

            {/* Simple list */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                {mockCustomers.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => navigate(`/b/customers/${c.id}`)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                        <div className={`w-11 h-11 rounded-full ${c.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                            {c.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                                {c.status === 'new' && (
                                    <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">NEW</span>
                                )}
                                {c.status === 'at-risk' && (
                                    <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-semibold">AT RISK</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {c.tier} member · {c.rewardsCount} rewards · {c.totalSpend} spent
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <Metric icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" label="Exchanges" value={c.exchanges.length} />
                                <Metric icon="M5 13l4 4L19 7" label="Redemptions" value={c.redeemedOffers.filter(o => o.status === 'redeemed').length} />
                                <Metric icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" label="Appointments" value={c.appointments.length} />
                                <Metric icon="M13 10V3L4 14h7v7l9-11h-7z" label="Activity" value={c.activity.length} />
                            </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                ))}
            </div>
        </div>
    )
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}

function Metric({ icon, label, value }: { icon: string; label: string; value: number }) {
    return (
        <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
            <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
            </svg>
            {value} {label.toLowerCase()}
        </span>
    )
}
