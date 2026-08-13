import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const KPI_CARDS = [
  { label: 'Total Dynamic QR Codes', value: '15,482', sub: '12,847 Active · 1,935 Draft · 700 Archived', color: 'text-gray-900 dark:text-white' },
  { label: 'QR Scans Today', value: '8,214', sub: '+12.4% vs yesterday · +8.7% vs last week', color: 'text-green-600' },
  { label: 'Active Campaign QR Codes', value: '128', sub: 'Linked to active campaigns', color: 'text-purple-600' },
  { label: 'QR Routing Success Rate', value: '99.98%', sub: '12 failed requests', color: 'text-teal-600' },
  { label: 'Failed QR Requests', value: '12', sub: 'Missing destination · Disabled · Expired · Invalid route', color: 'text-red-600' },
  { label: 'NFC Linked QR Codes', value: '2,413', sub: 'Future NFC integration ready', color: 'text-amber-600' },
  { label: 'Businesses Using QR', value: '1,934', sub: 'Across all business types', color: 'text-blue-600' },
  { label: 'Consumers Using QR', value: '18,920', sub: 'Across all consumer levels', color: 'text-indigo-600' },
]

const SCAN_KPIS = [
  { label: 'Total Scans (All Time)', value: '4,892,341', sub: 'Since platform launch' },
  { label: 'Unique Visitors', value: '847,230', sub: '17.3% of total scans' },
  { label: 'Returning Visitors', value: '312,450', sub: '36.9% of unique visitors' },
  { label: 'Average Daily Scans', value: '11,432', sub: 'Based on last 30 days' },
  { label: 'Peak Hour', value: '14:00 - 15:00', sub: '2,847 scans/hour avg' },
  { label: 'Average Redirect Time', value: '122 ms', sub: '99th percentile: 340ms' },
  { label: 'Top Performing QR', value: 'ABC Restaurant', sub: '9,831 total scans · 14% conversion' },
  { label: 'Least Active QR', value: 'Old Event Page', sub: '3 scans this month' },
]

const HEALTH_ITEMS = [
  { label: 'Dynamic QR Engine', status: 'Healthy', color: 'text-green-600', dot: 'bg-green-500' },
  { label: 'Routing Engine', status: 'Healthy', color: 'text-green-600', dot: 'bg-green-500' },
  { label: 'Analytics Engine', status: 'Healthy', color: 'text-green-600', dot: 'bg-green-500' },
  { label: 'QR Storage', status: 'Healthy', color: 'text-green-600', dot: 'bg-green-500' },
  { label: 'Failed Redirect Queue', status: '0', color: 'text-green-600', dot: 'bg-green-500' },
  { label: 'Average Redirect Time', status: '122 ms', color: 'text-teal-600', dot: 'bg-teal-500' },
]

const DISTRIBUTION = [
  { type: 'Business VCards', pct: 46, count: 7122 },
  { type: 'Consumer VCards', pct: 20, count: 3096 },
  { type: 'Business Cards', pct: 18, count: 2787 },
  { type: 'Consumer Cards', pct: 11, count: 1703 },
  { type: 'Campaign QR', pct: 5, count: 774 },
]

const TOP_QRS = [
  { name: 'ABC Restaurant', owner: 'ABC Restaurant Ltd', type: 'Business VCard', todayScans: 312, totalScans: 9831, conversionRate: 14, status: 'Healthy' },
  { name: 'Summer Campaign 2026', owner: 'Marketing Team', type: 'Campaign', todayScans: 284, totalScans: 8452, conversionRate: 22, status: 'Healthy' },
  { name: 'Sarah K. VCard', owner: 'Sarah K.', type: 'Consumer VCard', todayScans: 198, totalScans: 6750, conversionRate: 31, status: 'Healthy' },
  { name: 'TechCorp Business Card', owner: 'TechCorp Inc', type: 'Business Card', todayScans: 167, totalScans: 5432, conversionRate: 18, status: 'Healthy' },
  { name: 'Spring Promotion', owner: 'Marketing Team', type: 'Campaign', todayScans: 145, totalScans: 4890, conversionRate: 25, status: 'Warning' },
  { name: 'GreenLeaf Spa VCard', owner: 'GreenLeaf Spa', type: 'Business VCard', todayScans: 134, totalScans: 4210, conversionRate: 12, status: 'Healthy' },
  { name: 'James W. Consumer Card', owner: 'James W.', type: 'Consumer Card', todayScans: 98, totalScans: 3450, conversionRate: 28, status: 'Healthy' },
  { name: 'Music Festival Event', owner: 'Events Team', type: 'Event', todayScans: 87, totalScans: 2980, conversionRate: 35, status: 'Healthy' },
]

const RECENT_ACTIVITY = [
  { time: '09:14', action: 'Business QR Published', target: 'ABC Restaurant', type: 'publish' },
  { time: '09:17', action: 'Campaign Routing Updated', target: 'Summer Promotion', type: 'update' },
  { time: '09:21', action: 'Consumer Card QR Activated', target: 'John Smith', type: 'activate' },
  { time: '09:24', action: 'QR Disabled', target: 'Expired Campaign - Winter Sale', type: 'disable' },
  { time: '09:28', action: 'QR Scanned', target: 'ABC Restaurant VCard · iPhone 16 · UK', type: 'scan' },
  { time: '09:32', action: 'Business QR Published', target: 'Café Mocha', type: 'publish' },
  { time: '09:36', action: 'Routing Rule Updated', target: 'Destination → Spring Campaign', type: 'update' },
  { time: '09:41', action: 'QR Reactivated', target: 'TechCorp Business Card', type: 'activate' },
  { time: '09:45', action: 'Campaign Started', target: 'Easter Promotion 2026', type: 'campaign' },
  { time: '09:48', action: 'QR Assignment Changed', target: 'Gold Consumer Card → Sarah K.', type: 'update' },
]

const ALERTS = [
  { severity: 'warning', message: 'QR without destination — QR-BV-1107', link: '/admin/qr/codes' },
  { severity: 'error', message: 'Disabled campaign QR still active in routing — QR-CAMP-003', link: '/admin/qr/routing' },
  { severity: 'error', message: 'Broken routing detected — QR redirect loop', link: '/admin/qr/routing' },
  { severity: 'warning', message: 'Duplicate QR assignment — QR-CV-0456 assigned to 2 consumers', link: '/admin/qr/codes' },
  { severity: 'info', message: 'High scan spike detected — 847 scans/min on ABC Restaurant QR', link: '/admin/qr/analytics' },
]

const RECENT_CODES = [
  { id: 'QR-BV-2101', name: 'Café Mocha VCard', type: 'Business VCard', createdBy: 'Admin', createdDate: '2026-07-30', status: 'Active' },
  { id: 'QR-CAMP-012', name: 'Easter Promotion', type: 'Campaign', createdBy: 'Marketing', createdDate: '2026-07-29', status: 'Draft' },
  { id: 'QR-CV-0922', name: 'Emily R. Consumer VCard', type: 'Consumer VCard', createdBy: 'System', createdDate: '2026-07-29', status: 'Active' },
  { id: 'QR-BC-1187', name: 'GreenLeaf Business Card', type: 'Business Card', createdBy: 'Admin', createdDate: '2026-07-28', status: 'Active' },
  { id: 'QR-EVENT-004', name: 'Summer Music Fest', type: 'Event', createdBy: 'Events Team', createdDate: '2026-07-28', status: 'Draft' },
  { id: 'QR-PROMO-009', name: 'Loyalty Rewards', type: 'Promotion', createdBy: 'Marketing', createdDate: '2026-07-27', status: 'Active' },
]

const QR_TYPES = ['All', 'Business VCard', 'Business Card', 'Consumer VCard', 'Consumer Card', 'Campaign', 'Product', 'Service', 'Event']
const STATUS_FILTERS = ['All', 'Active', 'Draft', 'Disabled', 'Archived']
const DATE_RANGES = ['Today', 'Yesterday', 'Last 7 Days', 'Last Month', 'Custom']

const NOTIFICATIONS = [
  { text: 'QR Routing Updated — Summer Promotion', time: '2 min ago' },
  { text: 'Business QR Published — Café Mocha', time: '8 min ago' },
  { text: 'Campaign Started — Easter Promotion 2026', time: '15 min ago' },
  { text: 'Campaign Ended — Winter Sale', time: '32 min ago' },
  { text: 'QR Disabled — Old Event Page', time: '1 hour ago' },
  { text: 'QR Reactivated — TechCorp Business Card', time: '2 hours ago' },
]

const COMING_SOON = [
  'Smart Destination Switching — automatically change destinations based on campaign schedules or business rules',
  'Context-Aware Routing — serve different destinations based on time, location, or device',
  'A/B Destination Testing — compare different landing experiences using the same Dynamic QR',
  'Offline Scan Queue — support environments with intermittent connectivity',
  'Cross-Platform QR Usage — unified QR analytics across MCOM Rewards, MCOMMall, and other platforms',
]

const QUICK_ACTIONS = [
  { label: 'Create Dynamic QR', to: '/admin/qr/codes', icon: 'M12 4v16m8-8H4' },
  { label: 'Manage QR Codes', to: '/admin/qr/codes', icon: 'M4 6h16M4 12h16M4 18h16' },
  { label: 'View Routing Rules', to: '/admin/qr/routing', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { label: 'Open QR Analytics', to: '/admin/qr/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Download QR Assets', to: '/admin/qr/assets', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'View Activity', to: '/admin/qr/activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
]

export default function QRDashboardPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [dateRange, setDateRange] = useState('Today')
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const filteredTopQRs = useMemo(() => {
    return TOP_QRS.filter(q => {
      if (filterType !== 'All' && q.type !== filterType) return false
      if (filterStatus !== 'All') {
        const statusMap: Record<string, string> = { 'Active': 'Healthy', 'Draft': 'Warning', 'Disabled': 'Warning', 'Archived': 'Warning' }
        if (statusMap[filterStatus] !== q.status) return false
      }
      if (search) {
        const qLower = search.toLowerCase()
        if (!q.name.toLowerCase().includes(qLower) && !q.owner.toLowerCase().includes(qLower) && !q.type.toLowerCase().includes(qLower)) return false
      }
      return true
    })
  }, [filterType, filterStatus, search])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="flex-1 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to load QR Dashboard</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The QR Analytics & Monitoring Service could not be reached.</p>
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 3a4 4 0 00-4 4v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7zM5 8h14M5 12h14M5 16h14M8 5v14m4-14v14m4-14v14" /></svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">QR Code Management Dashboard</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Operational control centre — live visibility into the health, usage, and performance of the Dynamic QR infrastructure.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 relative">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">6</span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-700"><span className="text-xs font-semibold">Notifications</span></div>
                  <div className="max-h-60 overflow-y-auto">
                    {NOTIFICATIONS.map((n, i) => (
                      <div key={i} className="px-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                        <p className="text-xs text-gray-700 dark:text-gray-300">{n.text}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-100 dark:border-gray-700 text-center"><button className="text-[10px] text-teal-600 hover:underline">View All</button></div>
                </div>
              )}
            </div>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              {DATE_RANGES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={() => toast.success('Dashboard refreshed')} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button onClick={() => toast.success('Dashboard exported')} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </button>
            <button onClick={() => toast.success('Dashboard settings opened')} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search QR ID, name, business, campaign..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {QR_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Live QR Health</h4>
          <div className="space-y-3">
            {HEALTH_ITEMS.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">{h.label}</span>
                <div className="flex items-center gap-1.5"><span className={"w-1.5 h-1.5 rounded-full " + h.dot} /><span className={"font-medium " + h.color}>{h.status}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">QR Distribution</h4>
          <div className="space-y-4">
            {DISTRIBUTION.map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{d.type}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{d.pct}% ({d.count.toLocaleString()})</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2"><div className="bg-teal-500 h-2 rounded-full" style={{ width: d.pct + '%' }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Live Scan Analytics</h4>
          <div className="space-y-2">
            {SCAN_KPIS.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div><span className="text-xs text-gray-600 dark:text-gray-400">{s.label}</span><p className="text-[9px] text-gray-400">{s.sub}</p></div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Top Performing QR Codes</h4>
          <Link to="/admin/qr/analytics" className="text-[10px] text-teal-600 hover:underline">View Full Analytics</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700"><th className="text-left py-2 font-medium text-gray-400">QR Name</th><th className="text-left py-2 font-medium text-gray-400">Owner</th><th className="text-left py-2 font-medium text-gray-400">Type</th><th className="text-right py-2 font-medium text-gray-400">Today's Scans</th><th className="text-right py-2 font-medium text-gray-400">Total Scans</th><th className="text-right py-2 font-medium text-gray-400">Conversion Rate</th><th className="text-left py-2 font-medium text-gray-400">Status</th></tr></thead>
            <tbody>
              {filteredTopQRs.map((q, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <td className="py-2 text-gray-900 dark:text-white font-medium">{q.name}</td>
                  <td className="py-2 text-gray-500">{q.owner}</td>
                  <td className="py-2"><span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400">{q.type}</span></td>
                  <td className="py-2 text-right font-medium">{q.todayScans.toLocaleString()}</td>
                  <td className="py-2 text-right font-medium">{q.totalScans.toLocaleString()}</td>
                  <td className="py-2 text-right"><span className="text-green-600 font-medium">{q.conversionRate}%</span></td>
                  <td className="py-2"><span className={"px-1.5 py-0.5 rounded text-[9px] font-medium " + (q.status === 'Healthy' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600')}>{q.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live Activity Feed</h4>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="space-y-0">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <span className="text-[10px] text-gray-400 font-mono w-10 shrink-0">{a.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-300">{a.action}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{a.target}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">QR Alerts</h4>
            <span className="text-[10px] text-gray-400">{ALERTS.length} active</span>
          </div>
          <div className="space-y-2">
            {ALERTS.map((a, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <span className={"text-base shrink-0 " + (a.severity === 'error' ? 'text-red-500' : a.severity === 'warning' ? 'text-amber-500' : 'text-blue-500')}>
                  {a.severity === 'error' ? '!' : a.severity === 'warning' ? '!' : 'i'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-300">{a.message}</p>
                  <Link to={a.link} className="text-[10px] text-teal-600 hover:underline">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recently Created QR Codes</h4>
          <Link to="/admin/qr/codes" className="text-[10px] text-teal-600 hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700"><th className="text-left py-2 font-medium text-gray-400">QR ID</th><th className="text-left py-2 font-medium text-gray-400">QR Name</th><th className="text-left py-2 font-medium text-gray-400">Type</th><th className="text-left py-2 font-medium text-gray-400">Created By</th><th className="text-left py-2 font-medium text-gray-400">Created Date</th><th className="text-left py-2 font-medium text-gray-400">Status</th><th className="text-left py-2 font-medium text-gray-400">Actions</th></tr></thead>
            <tbody>
              {RECENT_CODES.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <td className="py-2 text-gray-900 dark:text-white font-mono text-[10px]">{c.id}</td>
                  <td className="py-2 text-gray-700 dark:text-gray-300">{c.name}</td>
                  <td className="py-2 text-gray-500">{c.type}</td>
                  <td className="py-2 text-gray-500">{c.createdBy}</td>
                  <td className="py-2 text-gray-400">{c.createdDate}</td>
                  <td className="py-2"><span className={"px-1.5 py-0.5 rounded text-[9px] font-medium " + (c.status === 'Active' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{c.status}</span></td>
                  <td className="py-2"><div className="flex gap-1"><button onClick={() => toast.success('Viewing ' + c.name)} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">View</button><button onClick={() => toast.success('Editing ' + c.name)} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Edit</button><button onClick={() => toast.success('Previewing ' + c.name)} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Preview</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {QUICK_ACTIONS.map((a, i) => (
          <Link key={i} to={a.to} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col items-center justify-center gap-2 hover:border-teal-500 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20 transition-colors">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} /></svg>
            </div>
            <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium text-center">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Coming Soon — Future QR Capabilities</h4>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {COMING_SOON.map((c, i) => (
            <div key={i} className="bg-white dark:bg-gray-800/50 rounded-lg p-2.5 border border-amber-100 dark:border-amber-500/10">
              <div className="flex items-center gap-1 mb-1">
                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">Coming Soon</span>
              </div>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">{c}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
