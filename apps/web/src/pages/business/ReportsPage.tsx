import { useState, type ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import PageHeader from '../../components/business/primitives/PageHeader'
import StatCard from '../../components/business/primitives/StatCard'
import { mockReportData } from '../../services/businessStore'
import type { ReportSection } from '../../types/business'

const SECTIONS: { key: ReportSection; label: string }[] = [
    { key: 'summary', label: 'Summary' },
    { key: 'cardAnalytics', label: 'Card Analytics' },
    { key: 'vcardAnalytics', label: 'VCard Analytics' },
    { key: 'qrAnalytics', label: 'QR Analytics' },
    { key: 'traffic', label: 'Traffic' },
    { key: 'profileViews', label: 'Profile Views' },
    { key: 'customerActivity', label: 'Customer Activity' },
    { key: 'membershipUsage', label: 'Membership Usage' },
    { key: 'exports', label: 'Exports' },
]

export default function ReportsPage() {
    const [active, setActive] = useState<ReportSection>('summary')
    const [range, setRange] = useState('7d')

    return (
        <div>
            <Helmet><title>Reports - MCOMVCard</title></Helmet>
            <PageHeader
                title="Reports"
                subtitle="Analytics across your cards, VCards and QR"
                actions={
                    <select value={range} onChange={(e) => setRange(e.target.value)} className="px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                }
            />

            {/* Section tabs */}
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-6 border-b border-gray-200 dark:border-gray-800">
                {SECTIONS.map(s => (
                    <button
                        key={s.key}
                        onClick={() => setActive(s.key)}
                        className={`px-3.5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${active === s.key
                            ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm border border-gray-200 dark:border-gray-700'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60'
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {active === 'summary' && <SummarySection />}
            {active === 'cardAnalytics' && <CardAnalyticsSection />}
            {active === 'vcardAnalytics' && <VCardAnalyticsSection />}
            {active === 'qrAnalytics' && <QRAnalyticsSection />}
            {active === 'traffic' && <TrafficSection />}
            {active === 'profileViews' && <ProfileViewsSection />}
            {active === 'customerActivity' && <CustomerActivitySection />}
            {active === 'membershipUsage' && <MembershipUsageSection />}
            {active === 'exports' && <ExportsSection />}
        </div>
    )
}

/* ── Shared chart ────────────────────────────────────────────────── */

function BarChart({ data, color = 'from-orange-600 to-orange-400' }: { data: { label: string; value: number }[]; color?: string }) {
    const max = Math.max(...data.map(d => d.value))
    return (
        <div className="flex items-end gap-2 h-40">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{d.value}</span>
                    <div className={`w-full rounded-t-lg bg-gradient-to-t ${color} transition-all duration-700`} style={{ height: `${(d.value / max) * 100}%` }} />
                    <span className="text-[10px] text-gray-400">{d.label}</span>
                </div>
            ))}
        </div>
    )
}

function Card({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 ${className}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            {children}
        </div>
    )
}

/* ── Sections ────────────────────────────────────────────────────── */

function SummarySection() {
    const d = mockReportData
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {d.metrics.map(m => (
                    <StatCard key={m.label} label={m.label} value={m.value} change={m.change} trend={m.trend} icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Daily views"><BarChart data={d.dailyViews} /></Card>
                <Card title="Daily QR scans"><BarChart data={d.dailyScans} color="from-blue-600 to-blue-400" /></Card>
            </div>
        </div>
    )
}

function CardAnalyticsSection() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Card views" value="4,128" change="+12.4%" trend="up" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" accent="blue" />
                <StatCard label="Card shares" value="358" change="+5.2%" trend="up" icon="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" accent="green" />
                <StatCard label="Card scans" value="1,890" change="+8.1%" trend="up" icon="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01" accent="purple" />
                <StatCard label="E-Gift redemptions" value="87" change="-3.0%" trend="down" icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" accent="red" />
            </div>
            <Card title="Card views by day"><BarChart data={mockReportData.dailyViews} color="from-blue-600 to-blue-400" /></Card>
        </div>
    )
}

function VCardAnalyticsSection() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="VCard views" value="3,204" change="+15.2%" trend="up" icon="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" accent="orange" />
                <StatCard label="VCard shares" value="275" change="+9.4%" trend="up" icon="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" accent="green" />
                <StatCard label="Avg time" value="2m 15s" trend="flat" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" accent="purple" />
                <StatCard label="Unique visitors" value="2,410" change="+11.8%" trend="up" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" accent="blue" />
            </div>
            <Card title="VCard views by day"><BarChart data={mockReportData.dailyViews} /></Card>
        </div>
    )
}

function QRAnalyticsSection() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Total scans" value="1,890" change="+8.1%" trend="up" icon="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01" accent="purple" />
                <StatCard label="Unique scanners" value="1,204" change="+6.3%" trend="up" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" accent="blue" />
                <StatCard label="Routing rules" value="3" trend="flat" icon="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" accent="green" />
                <StatCard label="Last scan" value="12m" trend="flat" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" accent="orange" />
            </div>
            <Card title="QR scans by day"><BarChart data={mockReportData.dailyScans} color="from-purple-600 to-purple-400" /></Card>
        </div>
    )
}

function TrafficSection() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Top locations">
                    <div className="space-y-3">
                        {mockReportData.topLocations.map(l => (
                            <div key={l.country} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{l.country}</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{l.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Device breakdown">
                    <div className="space-y-3">
                        {mockReportData.deviceBreakdown.map(d => {
                            const total = mockReportData.deviceBreakdown.reduce((a, x) => a + x.count, 0)
                            const pct = Math.round((d.count / total) * 100)
                            return (
                                <div key={d.device}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{d.device}</span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{pct}%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>
        </div>
    )
}

function ProfileViewsSection() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Profile views" value="3,204" change="+15.2%" trend="up" icon="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" accent="green" />
                <StatCard label="Avg time" value="2m 15s" trend="flat" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" accent="purple" />
                <StatCard label="Bounce rate" value="34%" change="-2.1%" trend="up" icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" accent="blue" />
                <StatCard label="Returning" value="42%" change="+4.3%" trend="up" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" accent="orange" />
            </div>
            <Card title="Profile views by day"><BarChart data={mockReportData.dailyViews} color="from-green-600 to-green-400" /></Card>
        </div>
    )
}

function CustomerActivitySection() {
    return (
        <div className="space-y-6">
            <Card title="Customer actions">
                <div className="space-y-3">
                    {mockReportData.customerActivity.map(a => (
                        <div key={a.action} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{a.action}</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{a.count.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

function MembershipUsageSection() {
    return (
        <div className="space-y-6">
            <Card title="Membership allocation usage">
                <div className="space-y-4">
                    {mockReportData.membershipUsage.map(u => {
                        const limitNum = u.limit === 'Unlimited' ? null : Number(u.limit)
                        const pct = limitNum === null ? 10 : Math.min(100, (u.used / limitNum) * 100)
                        return (
                            <div key={u.resource}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{u.resource}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{u.used} / {u.limit}</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    )
}

function ExportsSection() {
    const [format, setFormat] = useState('csv')
    const [exported, setExported] = useState(false)
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Export reports</h3>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <select value={format} onChange={(e) => setFormat(e.target.value)} className="px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                        <option value="xlsx">Excel (XLSX)</option>
                    </select>
                    <button
                        onClick={() => { setExported(true); setTimeout(() => setExported(false), 2000); }}
                        className="px-5 py-3 min-h-[44px] bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        {exported ? 'Exported ✓' : 'Download report'}
                    </button>
                </div>
                <p className="text-xs text-gray-400">Exports include all analytics for the selected date range.</p>
            </div>
        </div>
    )
}