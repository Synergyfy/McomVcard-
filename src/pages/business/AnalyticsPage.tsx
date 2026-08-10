import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockAnalyticsSeries, mockMembership, mockMembershipBenefits } from '../../services/businessDashboardStore'
import { mockReportData } from '../../services/businessStore'

export default function AnalyticsPage() {
    const scrollRef = useRef<HTMLDivElement>(null)

    const benefitsUsed = mockMembershipBenefits.filter(b => b.status === 'active').length
    const benefitsPct = Math.round((benefitsUsed / mockMembershipBenefits.length) * 100)

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Analytics - MCOMVCard</title></Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Swipe through the metrics that matter.</p>
            </div>

            {/* Swipeable chart cards */}
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                {mockAnalyticsSeries.map((s) => {
                    const max = Math.max(...s.points.map(p => p.value))
                    return (
                        <div key={s.key} className="snap-center shrink-0 w-[85%] max-w-sm bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{s.label}</p>
                                </div>
                                <span className={`text-xs font-semibold ${s.tone === 'down' ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{s.change}</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{s.total}</p>

                            {/* Bar chart */}
                            <div className="flex items-end justify-between gap-1.5 mt-5 h-28">
                                {s.points.map((p) => (
                                    <div key={p.label} className="flex-1 flex flex-col items-center gap-1.5">
                                        <div className="w-full rounded-md bg-gray-100 dark:bg-gray-700 flex items-end overflow-hidden" style={{ height: '100%' }}>
                                            <div
                                                className={`w-full rounded-md bg-gradient-to-t ${s.color}`}
                                                style={{ height: `${(p.value / max) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-gray-400">{p.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            <p className="text-center text-xs text-gray-400">Swipe to see more metrics. Full reports available in Reports.</p>

            {/* Membership */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Membership</p>
                    </div>
                    <Link to="/business/membership" className="text-xs font-semibold text-orange-600 dark:text-orange-400">View plan</Link>
                </div>

                {/* Current membership */}
                <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Current membership</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{mockMembership.plan}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{mockMembership.season} · {mockMembership.daysRemaining} days left · renews {mockMembership.renewalDate}</p>
                </div>

                {/* Benefits used */}
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Benefits used</p>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{benefitsUsed} of {mockMembershipBenefits.length} in use</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full" style={{ width: `${benefitsPct}%` }} />
                    </div>
                </div>

                {/* Entitlements used */}
                <div className="mt-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Entitlements used</p>
                    <div className="space-y-2">
                        {mockReportData.membershipUsage.map(u => {
                            const limitNum = u.limit === 'Unlimited' ? null : Number(u.limit)
                            const pct = limitNum === null ? 10 : Math.min(100, (u.used / limitNum) * 100)
                            return (
                                <div key={u.resource}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] text-gray-600 dark:text-gray-300">{u.resource}</span>
                                        <span className="text-[10px] text-gray-400">{u.used} / {u.limit}</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
