import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface LeaderboardRow { name: string; owner: string; type: string; scans: number; uniqueVisitors: number; conversionRate: number; status: string }
interface BIItem { label: string; value: string; change: string; direction: 'up' | 'down' | 'neutral'; type: string }

const KPI_CARDS = [
  { label: 'Total QR Scans', value: '24,892,341', sub: 'Today: 8,214 · Yesterday: 7,312 · This Week: 58,430 · This Month: 245,891', color: 'text-gray-900 dark:text-white' },
  { label: 'Unique Visitors', value: '847,230', sub: '320,180 Returning (37.8%) · 527,050 New (62.2%)', color: 'text-blue-600' },
  { label: 'Avg Daily Scans', value: '428/day', sub: 'Rolling 30-day average', color: 'text-teal-600' },
  { label: 'Avg Redirect Time', value: '116 ms', sub: 'Trend: −3ms vs last month', color: 'text-green-600' },
  { label: 'Engagement Rate', value: '68.4%', sub: 'Downstream actions after scan', color: 'text-purple-600' },
  { label: 'Conversion Rate', value: '14.2%', sub: 'Meaningful actions completed', color: 'text-amber-600' },
  { label: 'Failed Redirects', value: '142', sub: '0.57% of total scans · 12 broken, 130 expired', color: 'text-red-600' },
  { label: 'Active QR Codes', value: '12,847', sub: '12,510 Published · 256 Paused · 81 Disabled', color: 'text-indigo-600' },
]

const QR_TYPE_PERFORMANCE = [
  { type: 'Business VCards', scans: 12418000, pct: 49.9, conversions: 8.2 },
  { type: 'Consumer VCards', scans: 4210000, pct: 16.9, conversions: 12.4 },
  { type: 'Business Cards', scans: 3890000, pct: 15.6, conversions: 6.8 },
  { type: 'Campaign QR', scans: 2450000, pct: 9.8, conversions: 22.1 },
  { type: 'Consumer Cards', scans: 1100000, pct: 4.4, conversions: 15.3 },
  { type: 'Event QR', scans: 540000, pct: 2.2, conversions: 18.7 },
  { type: 'Product QR', scans: 300000, pct: 1.2, conversions: 9.5 },
]

const DESTINATION_PERFORMANCE = [
  { name: 'Business VCard — ABC Restaurant', scans: 12418, conversions: 1740, rate: 14.0 },
  { name: 'Campaign — Summer Sale', scans: 8144, conversions: 1950, rate: 23.9 },
  { name: 'Consumer VCard — Sarah K.', scans: 6750, conversions: 2090, rate: 31.0 },
  { name: 'Booking Page — Café Mocha', scans: 6013, conversions: 1200, rate: 20.0 },
  { name: 'Loyalty — Double Points', scans: 5432, conversions: 1620, rate: 29.8 },
  { name: 'Event — Music Festival', scans: 4890, conversions: 1710, rate: 35.0 },
  { name: 'Product — Premium Coffee', scans: 3450, conversions: 450, rate: 13.0 },
]

const TRAFFIC_SOURCES = [
  { source: 'Printed Business Card', pct: 42, scans: 10454783 },
  { source: 'NFC Card', pct: 18, scans: 4480621 },
  { source: 'Flyer', pct: 14, scans: 3484928 },
  { source: 'Poster', pct: 10, scans: 2489234 },
  { source: 'Website', pct: 7, scans: 1742464 },
  { source: 'Email Signature', pct: 5, scans: 1244617 },
  { source: 'Social Media', pct: 3, scans: 746770 },
  { source: 'Unknown', pct: 1, scans: 248923 },
]

const DEVICE_DATA = [
  { label: 'Mobile', pct: 72, count: 17922485 },
  { label: 'Desktop', pct: 20, count: 4978468 },
  { label: 'Tablet', pct: 8, count: 1991387 },
]

const OS_DATA = [
  { label: 'Android', pct: 45, count: 11201553 },
  { label: 'iOS', pct: 32, count: 7965549 },
  { label: 'Windows', pct: 14, count: 3484928 },
  { label: 'macOS', pct: 7, count: 1742464 },
  { label: 'Other', pct: 2, count: 497847 },
]

const BROWSER_DATA = [
  { label: 'Chrome', pct: 48, count: 11948324 },
  { label: 'Safari', pct: 28, count: 6969856 },
  { label: 'Edge', pct: 12, count: 2987081 },
  { label: 'Firefox', pct: 8, count: 1991387 },
  { label: 'Other', pct: 4, count: 995694 },
]

const LOCATION_DATA = [
  { country: 'United Kingdom', scans: 6210000, pct: 25.0 },
  { country: 'Nigeria', scans: 4230000, pct: 17.0 },
  { country: 'United States', scans: 3740000, pct: 15.0 },
  { country: 'Canada', scans: 2490000, pct: 10.0 },
  { country: 'Germany', scans: 1740000, pct: 7.0 },
  { country: 'Australia', scans: 1490000, pct: 6.0 },
  { country: 'UAE', scans: 1240000, pct: 5.0 },
  { country: 'Other', scans: 2490000, pct: 10.0 },
]

const LEADERBOARD: LeaderboardRow[] = [
  { name: 'ABC Restaurant VCard', owner: 'ABC Restaurant Ltd', type: 'Business VCard', scans: 9831, uniqueVisitors: 4520, conversionRate: 14.0, status: 'Published' },
  { name: 'Summer Campaign 2026', owner: 'Marketing Team', type: 'Campaign', scans: 8452, uniqueVisitors: 3890, conversionRate: 23.9, status: 'Published' },
  { name: 'Sarah K. VCard', owner: 'Sarah K.', type: 'Consumer VCard', scans: 6750, uniqueVisitors: 3100, conversionRate: 31.0, status: 'Published' },
  { name: 'TechCorp Business Card', owner: 'TechCorp Inc', type: 'Business Card', scans: 5432, uniqueVisitors: 2340, conversionRate: 6.8, status: 'Published' },
  { name: 'Spring Promotion', owner: 'Marketing Team', type: 'Promotion', scans: 4890, uniqueVisitors: 2230, conversionRate: 25.0, status: 'Published' },
  { name: 'GreenLeaf Spa VCard', owner: 'GreenLeaf Spa', type: 'Business VCard', scans: 4210, uniqueVisitors: 1980, conversionRate: 12.0, status: 'Published' },
  { name: 'James W. Consumer Card', owner: 'James W.', type: 'Consumer Card', scans: 3450, uniqueVisitors: 1560, conversionRate: 15.3, status: 'Published' },
  { name: 'Music Festival 2026', owner: 'Events Team', type: 'Event', scans: 2980, uniqueVisitors: 1450, conversionRate: 35.0, status: 'Published' },
]

const BI_INSIGHTS: BIItem[] = [
  { label: 'Highest Growth', value: 'ABC Restaurant', change: '+34% scans this month', direction: 'up', type: 'Business' },
  { label: 'Declining Engagement', value: 'XYZ Café', change: '−21% scans this month', direction: 'down', type: 'Business' },
  { label: 'Campaign Winner', value: 'Summer Rewards Campaign', change: 'Highest conversion rate: 23.9%', direction: 'up', type: 'Campaign' },
  { label: 'Underperforming QR', value: 'Old Event Page', change: '3 scans this month — review recommended', direction: 'down', type: 'QR' },
  { label: 'Routing Efficiency', value: '99.98% Success Rate', change: 'Avg 116 ms redirect time', direction: 'neutral', type: 'System' },
  { label: 'Peak Scan Hour', value: '14:00 – 15:00', change: '2,847 scans/hour average', direction: 'neutral', type: 'System' },
]

const ALERTS = [
  { severity: 'info', message: 'Scan spike detected — ABC Restaurant QR: 847 scans/min (+312% above average)', link: '/admin/qr/routing' },
  { severity: 'warning', message: 'Conversion rate decline — Spring Campaign dropped from 25% to 18% this week', link: '/admin/qr/routing' },
  { severity: 'error', message: 'High redirect latency detected — Campaign route averaging 890ms', link: '/admin/qr/routing' },
  { severity: 'warning', message: 'Broken destination detected — Winter Sale route has no valid destination', link: '/admin/qr/routing' },
]

const SAVED_DASHBOARDS = ['Executive Summary', 'Marketing Dashboard', 'Operations Dashboard', 'Campaign Performance', 'Business Performance']

const QR_TYPES = ['All', 'Business VCard', 'Business Card', 'Consumer VCard', 'Consumer Card', 'Campaign', 'Product', 'Event', 'Promotion']
const DATE_RANGES = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Quarter', 'Custom']
const DEVICE_FILTERS = ['All', 'Mobile', 'Desktop', 'Tablet']

const COMING_SOON = [
  'AI Performance Insights — automatically identify high-performing and underperforming QR strategies',
  'Predictive Scan Forecasting — estimate future scan volumes based on historical trends',
  'Campaign Attribution — connect QR scans to marketing outcomes across the wider MCOM ecosystem',
  'Cross-Platform Analytics — combine QR performance with MCOM Rewards, MCOMMall, and future platform data',
  'Recommendation Engine — suggest routing, design, or campaign improvements based on analytics',
]

function MetricBar({ label, pct, count, color }: { label: string; pct: number; count?: number; color?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-medium text-gray-900 dark:text-white">{pct}%{count ? ' (' + count.toLocaleString() + ')' : ''}</span></div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5"><div className={(color || 'bg-teal-500') + ' h-1.5 rounded-full'} style={{ width: pct + '%' }} /></div>
    </div>
  )
}

export default function QRAnalyticsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [filterQRType, setFilterQRType] = useState('All')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [filterDevice, setFilterDevice] = useState('All')
  const [search, setSearch] = useState('')
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [dashView, setDashView] = useState('Executive Summary')

  const filteredLeaderboard = useMemo(() => {
    return LEADERBOARD.filter(q => {
      if (filterQRType !== 'All' && q.type !== filterQRType) return false
      if (search) { const s = search.toLowerCase(); if (!q.name.toLowerCase().includes(s) && !q.owner.toLowerCase().includes(s)) return false }
      return true
    })
  }, [filterQRType, search])

  function handleAction(msg: string) { toast.success(msg) }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
        <div className="grid grid-cols-2 gap-4"><div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" /><div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" /></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to load QR Analytics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The Analytics Warehouse could not be reached.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 800) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Retry</button>
          <Link to="/admin/system-status" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">QR Analytics</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Transform scan events into actionable business intelligence — performance, trends, and decision-making.</p>
          </div>
          <div className="flex gap-2">
            <select value={dashView} onChange={e => setDashView(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              {SAVED_DASHBOARDS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={() => handleAction('Exporting analytics...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
            <button onClick={() => handleAction('Scheduling report...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Schedule</button>
            <button onClick={() => setCompareEnabled(!compareEnabled)} className={'px-3 py-1.5 rounded-lg border text-xs font-medium ' + (compareEnabled ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50')}>Compare</button>
            <button onClick={() => handleAction('Dashboard view saved')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Save View</button>
            <button onClick={() => handleAction('Refreshing analytics data...')} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search QR name, ID, business, campaign..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500" />
          </div>
          <select value={filterQRType} onChange={e => setFilterQRType(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {QR_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All QR Types' : t}</option>)}
          </select>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {DATE_RANGES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterDevice} onChange={e => setFilterDevice(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {DEVICE_FILTERS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Devices' : d}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {KPI_CARDS.map((k) => (
          <div key={k.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{k.label}</p>
            <p className={"text-lg font-bold " + k.color}>{k.value}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">QR Type Performance</h4>
          <div className="space-y-3">
            {QR_TYPE_PERFORMANCE.map((q, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{q.type}</span>
                  <div className="flex gap-3"><span className="font-medium text-gray-900 dark:text-white">{q.scans.toLocaleString()} scans</span><span className="text-green-600 font-medium">{q.conversions}% conv</span></div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: q.pct + '%' }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Device Types</h4>
            <div className="space-y-2">{DEVICE_DATA.map((d, i) => <MetricBar key={i} label={d.label} pct={d.pct} count={d.count} color="bg-blue-500" />)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Operating Systems</h4>
            <div className="space-y-2">{OS_DATA.map((o, i) => <MetricBar key={i} label={o.label} pct={o.pct} count={o.count} color="bg-purple-500" />)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Destination Performance</h4>
          <div className="space-y-2">
            {DESTINATION_PERFORMANCE.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0 text-xs">
                <div className="flex-1 min-w-0"><span className="text-gray-700 dark:text-gray-300 truncate block">{d.name}</span><span className="text-gray-400">{d.scans.toLocaleString()} scans</span></div>
                <span className="ml-2 font-medium text-green-600">{d.rate}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Traffic Sources</h4>
          <div className="space-y-2">
            {TRAFFIC_SOURCES.map((s, i) => <MetricBar key={i} label={s.source} pct={s.pct} count={s.scans} color="bg-amber-500" />)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Browser Distribution</h4>
          <div className="space-y-2">{BROWSER_DATA.map((b, i) => <MetricBar key={i} label={b.label} pct={b.pct} count={b.count} color="bg-indigo-500" />)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Location Insights (Top Countries)</h4>
          <p className="text-[9px] text-gray-400 mb-2">Aggregated data only — no personally identifiable location data is exposed.</p>
          <div className="space-y-2">
            {LOCATION_DATA.map((l, i) => <MetricBar key={i} label={l.country} pct={l.pct} count={l.scans} color="bg-emerald-500" />)}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Top Performing QR Codes</h4>
          <Link to="/admin/qr/codes" className="text-[10px] text-blue-600 hover:underline">View All QR Codes</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700"><th className="text-left py-2 font-medium text-gray-400">QR Name</th><th className="text-left py-2 font-medium text-gray-400">Owner</th><th className="text-left py-2 font-medium text-gray-400">Type</th><th className="text-right py-2 font-medium text-gray-400">Scans</th><th className="text-right py-2 font-medium text-gray-400">Unique Visitors</th><th className="text-right py-2 font-medium text-gray-400">Conversion</th><th className="text-left py-2 font-medium text-gray-400">Status</th><th className="text-left py-2 font-medium text-gray-400">Actions</th></tr></thead>
            <tbody>
              {filteredLeaderboard.map((q, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <td className="py-2 font-medium text-gray-900 dark:text-white">{q.name}</td>
                  <td className="py-2 text-gray-500">{q.owner}</td>
                  <td className="py-2 text-gray-500">{q.type}</td>
                  <td className="py-2 text-right font-medium">{q.scans.toLocaleString()}</td>
                  <td className="py-2 text-right">{q.uniqueVisitors.toLocaleString()}</td>
                  <td className="py-2 text-right"><span className="text-green-600 font-medium">{q.conversionRate}%</span></td>
                  <td className="py-2"><span className={'px-1.5 py-0.5 rounded text-[9px] font-medium ' + (q.status === 'Published' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{q.status}</span></td>
                  <td className="py-2"><div className="flex gap-1"><button onClick={() => handleAction('Viewing ' + q.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">View QR</button><button onClick={() => handleAction('Analytics for ' + q.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Analytics</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3"><h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Business Intelligence</h4><button onClick={() => handleAction('Refreshing insights...')} className="text-[10px] text-blue-600 hover:underline">Refresh</button></div>
          <div className="space-y-2">
            {BI_INSIGHTS.map((b, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                <div className={'w-6 h-6 rounded-full flex items-center justify-center shrink-0 ' + (b.direction === 'up' ? 'bg-green-100 text-green-600' : b.direction === 'down' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600')}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.direction === 'up' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : b.direction === 'down' ? 'M19 14l-7 7m0 0l-7-7m7 7V3' : 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                </div>
                <div className="flex-1"><p className="text-xs font-medium text-gray-900 dark:text-white">{b.label}: {b.value}</p><p className="text-[10px] text-gray-500">{b.change}</p></div>
                <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-[8px] text-gray-500 shrink-0">{b.type}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3"><h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Analytics Alerts</h4><span className="text-[10px] text-gray-400">{ALERTS.length} active</span></div>
          <div className="space-y-2">
            {ALERTS.map((a, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <span className={'text-base shrink-0 ' + (a.severity === 'error' ? 'text-red-500' : a.severity === 'warning' ? 'text-amber-500' : 'text-blue-500')}>{a.severity === 'error' ? '!' : 'i'}</span>
                <div className="flex-1 min-w-0"><p className="text-xs text-gray-700 dark:text-gray-300">{a.message}</p><Link to={a.link} className="text-[10px] text-blue-600 hover:underline">View Route</Link></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3"><h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Reports</h4><button onClick={() => handleAction('Generating report...')} className="px-2 py-1 bg-blue-500 text-white rounded text-[10px] font-medium hover:bg-blue-600">Generate Report</button></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-2">Export Formats</p><div className="flex gap-1">{['CSV', 'Excel', 'PDF'].map(f => <span key={f} className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-blue-50 cursor-pointer">{f}</span>)}</div></div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</p><div className="flex gap-1">{['Daily', 'Weekly', 'Monthly'].map(s => <span key={s} className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-blue-50 cursor-pointer">{s}</span>)}</div></div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery</p><p className="text-xs text-gray-500">In-platform initially. <span className="text-amber-500">Email delivery Coming Soon.</span></p></div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Coming Soon — Advanced Analytics</h4>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {COMING_SOON.map((c, i) => (
            <div key={i} className="bg-white dark:bg-gray-800/50 rounded-lg p-2.5 border border-amber-100 dark:border-amber-500/10">
              <div className="flex items-center gap-1 mb-1"><svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg><span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">Coming Soon</span></div>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">{c}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
