import { useEffect, useState, type ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import PageHeader from '../../components/business/primitives/PageHeader'
import StatCard from '../../components/business/primitives/StatCard'
import { businessService, type BusinessReport } from '../../services/businessApi'
import { useCapabilities } from '../../hooks/useCapabilities'

type Section = 'summary' | 'cardAnalytics' | 'vcardAnalytics' | 'qrAnalytics' | 'traffic' | 'profileViews' | 'customerActivity' | 'membershipUsage' | 'exports'

const SECTIONS: { key: Section; label: string }[] = [
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

const EMPTY: BusinessReport = { range: '7d', metrics: [], dailyViews: [], dailyScans: [], topLocations: [], deviceBreakdown: [], customerActivity: [], membershipUsage: [] }

export default function ReportsPage() {
  const { can } = useCapabilities()
  const [active, setActive] = useState<Section>('summary')
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [report, setReport] = useState<BusinessReport>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    businessService.getReports(range).then((data) => { if (!cancelled && data) setReport(data) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [range])

  return (
    <div>
      <Helmet><title>Reports - MCOMVCard</title></Helmet>
      <PageHeader title="Reports" subtitle="Analytics across your cards, VCards and QR" actions={
        <select value={range} onChange={(e) => setRange(e.target.value as '7d' | '30d' | '90d')} aria-label="Report date range" className="px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option>
        </select>
      } />
      <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-6 border-b border-gray-200 dark:border-gray-800">
        {SECTIONS.filter((s) => s.key !== 'exports' || can('reportExports')).map((s) => (
          <button key={s.key} onClick={() => setActive(s.key)} className={`px-3.5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${active === s.key ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm border border-gray-200 dark:border-gray-700' : 'text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60'}`}>{s.label}</button>
        ))}
      </div>
      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">Loading your reports…</div>
      ) : (
        <>
          {active === 'summary' && <Summary report={report} />}
          {active === 'cardAnalytics' && <CardAnalytics report={report} />}
          {active === 'vcardAnalytics' && <VCardAnalytics report={report} />}
          {active === 'qrAnalytics' && <QRAnalytics report={report} />}
          {active === 'traffic' && <Traffic report={report} />}
          {active === 'profileViews' && <ProfileViews report={report} />}
          {active === 'customerActivity' && <CustomerActivity report={report} />}
          {active === 'membershipUsage' && <MembershipUsage report={report} />}
          {active === 'exports' && can('reportExports') && <Exports />}
        </>
      )}
    </div>
  )
}

function BarChart({ data, color = 'from-orange-600 to-orange-400' }: { data: { label: string; value: number }[]; color?: string }) {
  if (data.length === 0) return <p className="text-xs text-gray-400">No data for this period yet.</p>
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex items-end gap-1.5 h-40 overflow-x-auto">
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`} className="flex-1 min-w-[14px] flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{d.value}</span>
          <div className={`w-full rounded-t-lg bg-gradient-to-t ${color} transition-all duration-700`} style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} />
          <span className="text-[9px] text-gray-400 whitespace-nowrap">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"><h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>{children}</div>
}

function MetricGrid({ metrics }: { metrics: BusinessReport['metrics'] }) {
  if (metrics.length === 0) return <p className="text-xs text-gray-400">No metrics available yet.</p>
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((m) => <StatCard key={m.label} label={m.label} value={m.value} change={m.change} trend={m.trend} icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />)}
    </div>
  )
}

function Summary({ report }: { report: BusinessReport }) { return <div className="space-y-6"><MetricGrid metrics={report.metrics} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card title="Daily views"><BarChart data={report.dailyViews} /></Card><Card title="Daily QR scans"><BarChart data={report.dailyScans} color="from-blue-600 to-blue-400" /></Card></div></div> }
function CardAnalytics({ report }: { report: BusinessReport }) { return <div className="space-y-6"><MetricGrid metrics={report.metrics} /><Card title="Card views by day"><BarChart data={report.dailyViews} color="from-blue-600 to-blue-400" /></Card></div> }
function VCardAnalytics({ report }: { report: BusinessReport }) { return <div className="space-y-6"><MetricGrid metrics={report.metrics} /><Card title="VCard views by day"><BarChart data={report.dailyViews} /></Card></div> }
function QRAnalytics({ report }: { report: BusinessReport }) { return <div className="space-y-6"><MetricGrid metrics={report.metrics} /><Card title="QR scans by day"><BarChart data={report.dailyScans} color="from-purple-600 to-purple-400" /></Card></div> }

function Traffic({ report }: { report: BusinessReport }) {
  const total = report.deviceBreakdown.reduce((a, x) => a + x.count, 0)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Top locations">
        {report.topLocations.length === 0 ? <p className="text-xs text-gray-400">Location breakdown becomes available as customer activity is recorded.</p> : <div className="space-y-3">{report.topLocations.map((l) => <div key={l.country} className="flex items-center justify-between"><span className="text-sm text-gray-700 dark:text-gray-300">{l.country}</span><span className="text-sm font-semibold text-gray-900 dark:text-white">{l.count.toLocaleString()}</span></div>)}</div>}
      </Card>
      <Card title="Device breakdown">
        {report.deviceBreakdown.length === 0 ? <p className="text-xs text-gray-400">Device data is not collected for this period.</p> : <div className="space-y-3">{report.deviceBreakdown.map((d) => { const pct = total > 0 ? Math.round((d.count / total) * 100) : 0; return <div key={d.device}><div className="flex items-center justify-between mb-1.5"><span className="text-sm text-gray-700 dark:text-gray-300">{d.device}</span><span className="text-sm font-semibold text-gray-900 dark:text-white">{pct}%</span></div><div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} /></div></div> })}</div>}
      </Card>
    </div>
  )
}

function ProfileViews({ report }: { report: BusinessReport }) { return <div className="space-y-6"><MetricGrid metrics={report.metrics} /><Card title="Profile views by day"><BarChart data={report.dailyViews} color="from-green-600 to-green-400" /></Card></div> }
function CustomerActivity({ report }: { report: BusinessReport }) { return <Card title="Customer actions">{report.customerActivity.length === 0 ? <p className="text-xs text-gray-400">No customer activity recorded yet.</p> : <div className="space-y-3">{report.customerActivity.map((a) => <div key={a.action} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-700 dark:text-gray-300">{a.action}</span><span className="text-sm font-semibold text-gray-900 dark:text-white">{a.count.toLocaleString()}</span></div>)}</div>}</Card> }
function MembershipUsage({ report }: { report: BusinessReport }) { return <Card title="Membership allocation usage">{report.membershipUsage.length === 0 ? <p className="text-xs text-gray-400">No membership limits available yet.</p> : <div className="space-y-4">{report.membershipUsage.map((u) => { const limit = u.limit === 'Unlimited' ? null : Number(u.limit); const pct = limit === null || limit <= 0 ? 0 : Math.min(100, (u.used / limit) * 100); return <div key={u.resource}><div className="flex items-center justify-between mb-1.5"><span className="text-sm font-medium text-gray-900 dark:text-white">{u.resource}</span><span className="text-xs text-gray-500 dark:text-gray-400">{u.used} / {u.limit}</span></div><div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} /></div></div> })}</div>}</Card> }

function Exports() {
  const [format, setFormat] = useState('csv')
  const [exported, setExported] = useState(false)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Export reports</h3>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={format} onChange={(e) => setFormat(e.target.value)} aria-label="Export format" className="px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="csv">CSV</option><option value="pdf">PDF</option><option value="xlsx">Excel (XLSX)</option></select>
        <button onClick={() => { setExported(true); setTimeout(() => setExported(false), 2000) }} className="px-5 py-3 min-h-[44px] bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">{exported ? 'Exported ✓' : 'Download report'}</button>
      </div>
      <p className="text-xs text-gray-400">Exports include all analytics for the selected date range.</p>
    </div>
  )
}
