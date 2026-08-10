import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockBusinessProfile, getAllAssignedVCards, mockAssignedCards, mockActivity, businessVCardLink } from '../../services/businessStore'
import {
    homeKpiPages,
    quickActions,
    mockNotifications,
    currentSeason,
    mockMembership,
    activeVCardTemplate,
    activeCardTemplate,
    mockAppointments,
    mockCampaigns,
} from '../../services/businessDashboardStore'
import type { HomeKpiCard } from '../../services/businessDashboardStore'

const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning 👋'
    if (h < 17) return 'Good Afternoon 👋'
    return 'Good Evening 👋'
}

const walletIcon = 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
const vcardIcon = 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0'
const cardIcon = 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
const customersIcon = 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
const rewardsIcon = 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
const membershipIcon = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'

export default function BusinessHomePage() {
    const firstName = mockBusinessProfile.owner.split(' ')[0]

    const activeVCards = getAllAssignedVCards().filter(v => v.status === 'active').length
    const activeCards = mockAssignedCards.filter(c => c.status === 'active').length
    const pendingAppointments = mockAppointments.filter(a => a.status === 'pending').length
    const activeCampaigns = mockCampaigns.filter(c => c.status === 'active')
    const membershipPct = Math.round((mockMembership.daysRemaining / mockMembership.totalDays) * 100)

    /* ── Main cards (six core business surfaces) ── */
    const mainCards = [
        {
            label: 'My VCard',
            subtitle: `${activeVCards} active · ${activeVCardTemplate.name}`,
            value: '12,480',
            icon: vcardIcon,
            gradient: 'from-orange-500 to-amber-500',
            to: '/business/vcards',
        },
        {
            label: 'My Business Card',
            subtitle: `${activeCards} active · ${activeCardTemplate.name}`,
            value: '8,342',
            icon: cardIcon,
            gradient: 'from-slate-600 to-slate-800',
            to: '/business/cards',
        },
        {
            label: 'Membership',
            subtitle: `${mockMembership.plan} · ${mockMembership.daysRemaining}d left`,
            value: mockBusinessProfile.membership,
            icon: membershipIcon,
            gradient: 'from-amber-500 to-orange-600',
            to: '/business/membership',
        },
        {
            label: 'Customers',
            subtitle: 'New & returning guests',
            value: '2,451',
            icon: customersIcon,
            gradient: 'from-blue-500 to-indigo-600',
            to: '/business/customers',
        },
        {
            label: 'Rewards',
            subtitle: 'Points, perks & campaigns',
            value: '1,208',
            icon: rewardsIcon,
            gradient: 'from-purple-500 to-violet-600',
            to: '/business/rewards',
        },
        {
            label: 'Wallet / Smart Money',
            subtitle: 'Balance & history',
            value: '£4,850',
            icon: walletIcon,
            gradient: 'from-emerald-500 to-teal-600',
            to: '/business/rewards/cashback',
        },
    ]

    /* ── Performance — only metrics available from connected systems ── */
    const performance = [
        { label: 'VCard views', kpi: homeKpiPages[0][0] },
        { label: 'QR scans', kpi: homeKpiPages[0][1] },
        { label: 'Shares', kpi: homeKpiPages[1][2] },
        { label: 'Exchanges', kpi: homeKpiPages[1][3] },
        { label: 'Redemptions', kpi: homeKpiPages[2][1] },
        { label: 'Reward activity', kpi: homeKpiPages[0][3] },
        { label: 'Appointments', kpi: homeKpiPages[1][0] },
        { label: 'Campaign activity', kpi: homeKpiPages[2][0] },
    ]

    /* ── Quick actions (all eight) ── */
    const actionItems = [
        { label: 'View VCard', subtitle: 'Digital profile', icon: vcardIcon, color: 'from-orange-500 to-amber-500', to: '/business/vcards' },
        { label: 'View Business Card', subtitle: '85 × 55 mm identity', icon: cardIcon, color: 'from-slate-600 to-slate-800', to: '/business/cards' },
        { label: 'Share', subtitle: 'Send to anyone', icon: quickActions[0].icon, color: 'from-blue-500 to-cyan-500', to: businessVCardLink('share') },
        { label: 'Show QR', subtitle: 'Scan & connect', icon: quickActions[1].icon, color: 'from-purple-500 to-violet-600', to: '/business/qr' },
        { label: 'Reward Customer', subtitle: 'Points & perks', icon: quickActions[2].icon, color: 'from-emerald-500 to-teal-600', to: '/business/rewards/issue' },
        { label: 'Manage Appointment', subtitle: 'Manage bookings', icon: quickActions[4].icon, color: 'from-cyan-500 to-sky-600', to: '/business/appointments' },
        { label: 'View Membership', subtitle: 'Plan & benefits', icon: membershipIcon, color: 'from-amber-500 to-orange-600', to: '/business/membership' },
        { label: 'View Wallet', subtitle: 'Smart Money balance', icon: walletIcon, color: 'from-rose-500 to-pink-600', to: '/business/rewards/cashback' },
    ]

    /* ── Alerts — grouped by type ── */
    const alerts = [
        { tone: 'warning' as const, title: 'Membership expiry', description: `Your Gold membership expires in ${mockMembership.daysRemaining} days (${mockMembership.renewalDate}). Renew to keep Premium benefits active.`, time: '2 hrs ago', to: '/business/membership' },
        { tone: 'success' as const, title: 'Template activation', description: `Your ${activeVCardTemplate.name} VCard template and ${activeCardTemplate.name} card are active and live.`, time: 'Today' },
        { tone: 'success' as const, title: 'Reward activity', description: '23 customers redeemed rewards today. Great engagement — rewards are working.', time: '5 hrs ago' },
        { tone: 'info' as const, title: 'Appointment activity', description: `${pendingAppointments} appointment${pendingAppointments === 1 ? '' : 's'} awaiting confirmation for today.`, time: 'Today' },
        { tone: 'info' as const, title: 'Campaign notifications', description: activeCampaigns.length
            ? `${activeCampaigns.map(c => c.name).join(' · ')} — ${activeCampaigns.reduce((s, c) => s + c.redemptions, 0)} redemptions so far.`
            : 'No campaigns running right now.', time: 'Today' },
        { tone: 'warning' as const, title: 'Important system message', description: 'Scheduled maintenance Sunday 02:00–04:00. Some analytics may be delayed.', time: 'Yesterday' },
    ]

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Home - Business Dashboard - MCOMVCard</title></Helmet>

            {/* ── Welcome + identity header ── */}
            <section>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome {firstName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{greeting()} Here's your business at a glance.</p>
            </section>

            <section className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-200 dark:shadow-none">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold shrink-0">
                        {mockBusinessProfile.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold truncate">{mockBusinessProfile.name}</p>
                        <p className="text-xs text-white/80">{mockBusinessProfile.category} · {mockBusinessProfile.sector}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                {mockBusinessProfile.membership} · {mockBusinessProfile.tier}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                                {currentSeason.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Season + membership expiry countdown */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/20">
                    <div>
                        <p className="text-[11px] text-white/70">Season ends in</p>
                        <p className="text-lg font-bold">{currentSeason.endsInDays} days</p>
                    </div>
                    <div>
                        <p className="text-[11px] text-white/70">Membership expires</p>
                        <p className="text-lg font-bold">{mockMembership.daysRemaining} days</p>
                        <p className="text-[10px] text-white/70">{mockMembership.renewalDate}</p>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${membershipPct}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-white/80">
                        <span>{mockMembership.daysRemaining} of {mockMembership.totalDays} days left</span>
                        <Link to="/business/membership" className="underline font-semibold">View plan</Link>
                    </div>
                </div>
            </section>

            {/* ── Main cards ── */}
            <section>
                <SectionTitle>Your Business</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                    {mainCards.map((c) => (
                        <Link
                            key={c.label}
                            to={c.to}
                            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon} />
                                    </svg>
                                </div>
                                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{c.value}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{c.label}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{c.subtitle}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Performance — only expose available metrics ── */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <SectionTitle>Performance</SectionTitle>
                    <Link to="/business/analytics" className="text-xs font-semibold text-orange-600 dark:text-orange-400">View analytics</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {performance.map(({ label, kpi }) => (
                        <KpiCard key={label} label={label} kpi={kpi} />
                    ))}
                </div>
            </section>

            {/* ── Quick Actions (all eight) ── */}
            <section>
                <SectionTitle>Quick Actions</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                    {actionItems.map((a) => (
                        <Link
                            key={a.label}
                            to={a.to}
                            className="group flex items-start gap-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-3.5 hover:shadow-md transition-all"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{a.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{a.subtitle}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Alerts ── */}
            <section>
                <SectionTitle>Alerts</SectionTitle>
                <div className="space-y-3">
                    {alerts.map((n, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-sm ${
                                n.tone === 'warning'
                                    ? 'bg-amber-50/80 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/40'
                                    : n.tone === 'success'
                                        ? 'bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/40'
                                        : 'bg-blue-50/80 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/40'
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                n.tone === 'warning'
                                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                                    : n.tone === 'success'
                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                            }`}>
                                {n.tone === 'warning'
                                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.024-.833-2.732 0L4.354 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                    : n.tone === 'success'
                                        ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                }
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.description}</p>
                                {n.to && (
                                    <Link to={n.to} className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
                                        View
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Guidance notifications ── */}
            <section>
                <SectionTitle>For You</SectionTitle>
                <div className="space-y-3">
                    {mockNotifications.map((n) => (
                        <div
                            key={n.id}
                            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-sm ${
                                n.tone === 'warning'
                                    ? 'bg-amber-50/80 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/40'
                                    : n.tone === 'success'
                                        ? 'bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/40'
                                        : 'bg-blue-50/80 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/40'
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                n.tone === 'warning'
                                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                                    : n.tone === 'success'
                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                            }`}>
                                {n.tone === 'warning'
                                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.024-.833-2.732 0L4.354 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                    : n.tone === 'success'
                                        ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                }
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.description}</p>
                                {n.actionLabel && n.actionTo && (
                                    <Link to={n.actionTo} className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
                                        {n.actionLabel}
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Recent activity + Admin updates ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <SectionTitle>Recent Activity</SectionTitle>
                        <Link to="/business/reports" className="text-xs font-semibold text-orange-600 dark:text-orange-400">View all</Link>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                        {mockActivity.slice(0, 5).map(a => (
                            <div key={a.id} className="flex items-start gap-3 p-3.5">
                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                    <ActivityIcon type={a.type} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{a.description}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 shrink-0">{a.time}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <SectionTitle>Admin Updates</SectionTitle>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                        {getAllAssignedVCards().filter(v => v.status === 'needs_update').map(v => (
                            <div key={v.id} className="flex items-center justify-between p-3.5 border-l-4 border-l-amber-400">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{v.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Updated {v.lastAdminUpdate}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold shrink-0">Needs update</span>
                            </div>
                        ))}
                        {getAllAssignedVCards().filter(v => v.status === 'needs_update').length === 0 && (
                            <div className="p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">No pending admin updates.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}

function SectionTitle({ children }: { children: ReactNode }) {
    return <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{children}</h2>
}

function KpiCard({ label, kpi }: { label: string; kpi: HomeKpiCard }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={kpi.icon} />
                    </svg>
                </div>
                <span className={`text-[11px] font-semibold ${kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                    {kpi.change}
                </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-3">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}

function ActivityIcon({ type }: { type: string }) {
    const icons: Record<string, string> = {
        scan: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01',
        share: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
        redeem: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        exchange: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
        update: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        view: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
        system: 'M13 10V3L4 14h7v7l9-11h-7z',
    }
    return (
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons[type] || icons.system} />
        </svg>
    )
}
