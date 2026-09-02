import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface RuleData {
  id: string; ruleId: string; name: string; qrType: string; owner: string; currentDestination: string; ruleType: string; priority: number; status: string; effectiveDate: string; endDate: string; lastValidation: string; linkedQR: string; linkedOwnerId: string; fallback: string; schedule: { start: string; end: string; destination: string }[]; createdAt: string; updatedAt: string;
}

const RULES: RuleData[] = [
  { id: '1', ruleId: 'RTE-001', name: 'ABC Restaurant Default', qrType: 'Business VCard', owner: 'ABC Restaurant Ltd', currentDestination: 'Business VCard — ABC Restaurant', ruleType: 'Default Route', priority: 3, status: 'Active', effectiveDate: '2026-01-15', endDate: '', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-BV-0001', linkedOwnerId: 'BUS-00215', fallback: 'Business VCard', schedule: [{ start: '', end: '', destination: 'Business VCard — ABC Restaurant' }], createdAt: '2026-01-15', updatedAt: '2026-07-28' },
  { id: '2', ruleId: 'RTE-002', name: 'Summer Campaign Route', qrType: 'Campaign', owner: 'Marketing Team', currentDestination: 'Campaign Landing — Summer Sale', ruleType: 'Scheduled Route', priority: 2, status: 'Active', effectiveDate: '2026-06-01', endDate: '2026-09-01', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-CAMP-001', linkedOwnerId: 'CAMP-001', fallback: 'Business VCard', schedule: [{ start: '2026-06-01', end: '2026-09-01', destination: 'Campaign — Summer Sale' }], createdAt: '2026-05-20', updatedAt: '2026-07-29' },
  { id: '3', ruleId: 'RTE-003', name: 'Café Mocha Campaign', qrType: 'Business VCard', owner: 'Café Mocha', currentDestination: 'Campaign — Spring Promotion', ruleType: 'Scheduled Route', priority: 2, status: 'Active', effectiveDate: '2026-04-01', endDate: '2026-07-31', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-BV-0002', linkedOwnerId: 'BUS-00341', fallback: 'Business VCard', schedule: [{ start: '2026-04-01', end: '2026-07-31', destination: 'Campaign — Spring Promotion' }], createdAt: '2026-03-15', updatedAt: '2026-07-28' },
  { id: '4', ruleId: 'RTE-004', name: 'TechCorp Fallback', qrType: 'Business Card', owner: 'TechCorp Inc', currentDestination: 'Generic Landing Page', ruleType: 'Fallback Route', priority: 4, status: 'Active', effectiveDate: '2026-03-10', endDate: '', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-BC-0001', linkedOwnerId: 'BUS-00102', fallback: 'Platform Home', schedule: [{ start: '', end: '', destination: 'Generic Landing Page' }], createdAt: '2026-03-10', updatedAt: '2026-07-27' },
  { id: '5', ruleId: 'RTE-005', name: 'Sarah K. Default', qrType: 'Consumer VCard', owner: 'Sarah K.', currentDestination: 'Consumer VCard — Sarah K.', ruleType: 'Default Route', priority: 1, status: 'Active', effectiveDate: '2026-04-05', endDate: '', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-CV-0001', linkedOwnerId: 'CON-01234', fallback: 'Consumer VCard', schedule: [{ start: '', end: '', destination: 'Consumer VCard — Sarah K.' }], createdAt: '2026-04-05', updatedAt: '2026-07-28' },
  { id: '6', ruleId: 'RTE-006', name: 'Hotel Grand Maintenance', qrType: 'Business VCard', owner: 'Hotel Grand', currentDestination: 'Maintenance Page', ruleType: 'Maintenance Route', priority: 1, status: 'Active', effectiveDate: '2026-07-25', endDate: '2026-08-01', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-BV-0120', linkedOwnerId: 'BUS-00891', fallback: 'Business VCard', schedule: [{ start: '2026-07-25', end: '2026-08-01', destination: 'Maintenance Page' }], createdAt: '2026-07-25', updatedAt: '2026-07-29' },
  { id: '7', ruleId: 'RTE-007', name: 'Winter Sale (Paused)', qrType: 'Campaign', owner: 'Marketing Team', currentDestination: 'Campaign — Winter Sale', ruleType: 'Scheduled Route', priority: 2, status: 'Disabled', effectiveDate: '2025-12-01', endDate: '2026-02-28', lastValidation: '2026-06-15', linkedQR: 'QR-CAMP-002', linkedOwnerId: 'CAMP-008', fallback: 'Generic Landing Page', schedule: [{ start: '2025-12-01', end: '2026-02-28', destination: 'Campaign — Winter Sale' }], createdAt: '2025-11-15', updatedAt: '2026-07-01' },
  { id: '8', ruleId: 'RTE-008', name: 'Music Festival Schedule', qrType: 'Event', owner: 'Events Team', currentDestination: 'Event Page — Music Festival', ruleType: 'Scheduled Route', priority: 1, status: 'Active', effectiveDate: '2026-06-10', endDate: '2026-08-15', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-EVENT-001', linkedOwnerId: 'EVENT-003', fallback: 'Platform Home', schedule: [{ start: '2026-06-10', end: '2026-08-15', destination: 'Event Page — Music Festival' }], createdAt: '2026-06-01', updatedAt: '2026-07-26' },
  { id: '9', ruleId: 'RTE-009', name: 'Spring Promotion Route', qrType: 'Promotion', owner: 'Marketing Team', currentDestination: 'Promotion — 15% Discount', ruleType: 'Scheduled Route', priority: 2, status: 'Active', effectiveDate: '2026-03-01', endDate: '2026-08-01', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-PROMO-001', linkedOwnerId: 'CAMP-004', fallback: 'Business VCard', schedule: [{ start: '2026-03-01', end: '2026-08-01', destination: 'Promotion — 15% Discount' }], createdAt: '2026-02-20', updatedAt: '2026-07-15' },
  { id: '10', ruleId: 'RTE-010', name: 'Café Mocha Default', qrType: 'Business VCard', owner: 'Café Mocha', currentDestination: 'Business VCard — Café Mocha', ruleType: 'Default Route', priority: 3, status: 'Active', effectiveDate: '2026-02-20', endDate: '', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-BV-0002', linkedOwnerId: 'BUS-00341', fallback: 'Consumer VCard', schedule: [{ start: '', end: '', destination: 'Business VCard — Café Mocha' }], createdAt: '2026-02-20', updatedAt: '2026-07-27' },
  { id: '11', ruleId: 'RTE-011', name: 'GreenLeaf Default Fallback', qrType: 'Business VCard', owner: 'GreenLeaf Spa', currentDestination: 'Business VCard — GreenLeaf Spa', ruleType: 'Fallback Route', priority: 4, status: 'Active', effectiveDate: '2026-02-14', endDate: '', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-BV-0100', linkedOwnerId: 'BUS-00512', fallback: 'Generic Landing Page', schedule: [{ start: '', end: '', destination: 'Business VCard — GreenLeaf Spa' }], createdAt: '2026-02-14', updatedAt: '2026-07-28' },
  { id: '12', ruleId: 'RTE-012', name: 'Loyalty Rewards Route', qrType: 'Promotion', owner: 'Marketing Team', currentDestination: 'Loyalty — Double Points', ruleType: 'Default Route', priority: 1, status: 'Active', effectiveDate: '2026-05-01', endDate: '2026-12-31', lastValidation: '2026-07-30 06:00', linkedQR: 'QR-PROMO-005', linkedOwnerId: 'CAMP-012', fallback: 'Platform Home', schedule: [{ start: '2026-05-01', end: '2026-12-31', destination: 'Loyalty — Double Points' }], createdAt: '2026-04-20', updatedAt: '2026-07-29' },
]

const RULE_TYPES = ['All', 'Default Route', 'Scheduled Route', 'Fallback Route', 'Maintenance Route']
const QR_TYPES_FILTER = ['All', 'Business VCard', 'Business Card', 'Consumer VCard', 'Consumer Card', 'Campaign', 'Product', 'Event', 'Promotion']
const STATUSES = ['All', 'Active', 'Scheduled', 'Disabled', 'Validation Error']
const DATE_FILTERS = ['All', 'Today', 'This Week', 'This Month', 'Custom']

const COMING_SOON_RULES = ['Location-Based Route', 'Language-Based Route', 'Device-Based Route', 'Campaign Optimisation', 'Behaviour-Based Route', 'A/B Route Testing']

const tabs = ['overview', 'destinations', 'priority', 'schedule', 'fallback', 'validation', 'simulation', 'versions', 'activity']
const tabLabels = ['Overview', 'Destinations', 'Priority', 'Schedule', 'Fallback', 'Validation', 'Simulation', 'Version History', 'Activity']

function RuleTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = { 'Default Route': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', 'Scheduled Route': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600', 'Fallback Route': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600', 'Maintenance Route': 'bg-red-50 dark:bg-red-500/10 text-red-600' }
  return <span className={"px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[type] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{type}</span>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { 'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600', 'Scheduled': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', 'Disabled': 'bg-red-50 dark:bg-red-500/10 text-red-600', 'Validation Error': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' }
  const dots: Record<string, string> = { 'Active': 'bg-green-500', 'Scheduled': 'bg-blue-500', 'Disabled': 'bg-red-500', 'Validation Error': 'bg-amber-500' }
  return (
    <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[status] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>
      <span className={"w-1.5 h-1.5 rounded-full " + (dots[status] || 'bg-gray-400')} />{status}
    </span>
  )
}

export default function QRRoutingRulesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterQRType, setFilterQRType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDate, setFilterDate] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState('overview')
  const [simDate, setSimDate] = useState('2026-07-30')
  const [simTime, setSimTime] = useState('14:30')

  const filtered = useMemo(() => {
    return RULES.filter(r => {
      if (search) { const s = search.toLowerCase(); if (!r.ruleId.toLowerCase().includes(s) && !r.name.toLowerCase().includes(s) && !r.owner.toLowerCase().includes(s) && !r.currentDestination.toLowerCase().includes(s)) return false }
      if (filterType !== 'All' && r.ruleType !== filterType) return false
      if (filterQRType !== 'All' && r.qrType !== filterQRType) return false
      if (filterStatus !== 'All' && r.status !== filterStatus) return false
      if (filterDate !== 'All') {
        const today = new Date(); const eff = new Date(r.effectiveDate)
        if (filterDate === 'Today' && eff.toDateString() !== today.toDateString()) return false
        if (filterDate === 'This Week') { const wk = new Date(today); wk.setDate(wk.getDate() - 7); if (eff < wk) return false }
        if (filterDate === 'This Month') { if (eff.getMonth() !== today.getMonth() || eff.getFullYear() !== today.getFullYear()) return false }
      }
      return true
    })
  }, [search, filterType, filterQRType, filterStatus, filterDate])

  const rule = selectedId !== null ? RULES.find(x => x.id === selectedId)! : null

  function handleAction(msg: string) { toast.success(msg) }

  const totalRules = RULES.length
  const activeRules = RULES.filter(x => x.status === 'Active').length
  const scheduledRules = RULES.filter(x => x.status === 'Scheduled').length
  const disabledRules = RULES.filter(x => x.status === 'Disabled').length
  const brokenRoutes = RULES.filter(x => x.status === 'Validation Error').length
  const fallbackActivations = RULES.filter(x => x.ruleType === 'Fallback Route').length
  const defaultRoutes = RULES.filter(x => x.ruleType === 'Default Route').length
  const scheduledRoutes = RULES.filter(x => x.ruleType === 'Scheduled Route').length

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-8 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /><div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to load Routing Rules</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The Routing Engine could not be reached.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 800) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Retry</button>
          <Link to="/admin/system-status" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</Link>
        </div>
      </div>
    )
  }

  if (!rule && selectedId === null) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">QR Routing Rules</h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Define, manage, validate, schedule, and monitor where every Dynamic QR Code directs visitors.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction('Creating routing rule...')} className="px-3 py-1.5 rounded-lg bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-600">Create Routing Rule</button>
              <button onClick={() => handleAction('Importing rules...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Import</button>
              <button onClick={() => handleAction('Exporting rules...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
              <button onClick={() => handleAction('Validating all routes...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Validate All</button>
              <button onClick={() => handleAction('Opening Routing Simulator...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Simulator</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Total Rules</p><p className="text-sm font-bold text-gray-900 dark:text-white">{totalRules}</p><p className="text-[9px] text-gray-400">{activeRules} Active · {scheduledRules} Scheduled · {disabledRules} Disabled</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Active Dests</p><p className="text-sm font-bold text-green-600">{activeRules}</p><p className="text-[9px] text-gray-400">Serving traffic now</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Scheduled Changes</p><p className="text-sm font-bold text-amber-600">{scheduledRoutes}</p><p className="text-[9px] text-gray-400">Pending schedule activations</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-500/10 p-3"><p className="text-[10px] text-red-500">Broken Routes</p><p className="text-sm font-bold text-red-600">{brokenRoutes}</p><p className="text-[9px] text-red-400">Requires immediate attention</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Fallback Activations</p><p className="text-sm font-bold text-gray-900 dark:text-white">{fallbackActivations}</p><p className="text-[9px] text-gray-400">Fallback routes configured</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Default Routes</p><p className="text-sm font-bold text-blue-600">{defaultRoutes}</p><p className="text-[9px] text-gray-400">Always-active destinations</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Avg Redirect</p><p className="text-sm font-bold text-teal-600">118 ms</p><p className="text-[9px] text-gray-400">99th percentile: 340ms</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-500/10 p-3"><p className="text-[10px] text-amber-500">Smart Routing</p><p className="text-sm font-bold text-amber-600">Coming Soon</p><p className="text-[9px] text-amber-400">6 types in development</p></div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search rule ID, name, QR, owner, destination..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-cyan-500" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {RULE_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Rule Types' : t}</option>)}
          </select>
          <select value={filterQRType} onChange={e => setFilterQRType(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {QR_TYPES_FILTER.map(q => <option key={q} value={q}>{q === 'All' ? 'All QR Types' : q}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {DATE_FILTERS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Dates' : d}</option>)}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Routing Validation Centre</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20"><span className="w-2 h-2 rounded-full bg-green-500 shrink-0" /><span className="text-xs text-green-700 dark:text-green-400">All destinations exist</span><span className="ml-auto text-[10px] text-green-600 font-medium">12/12</span></div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20"><span className="w-2 h-2 rounded-full bg-green-500 shrink-0" /><span className="text-xs text-green-700 dark:text-green-400">No circular redirects</span><span className="ml-auto text-[10px] text-green-600 font-medium">Passed</span></div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20"><span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /><span className="text-xs text-amber-700 dark:text-amber-400">2 rules missing fallback</span><span className="ml-auto text-[10px] text-amber-600 font-medium">Warning</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-2 pl-3 font-medium text-gray-400">Rule ID</th>
                <th className="text-left py-2 font-medium text-gray-400">Name</th>
                <th className="text-left py-2 font-medium text-gray-400">QR Type</th>
                <th className="text-left py-2 font-medium text-gray-400">Owner</th>
                <th className="text-left py-2 font-medium text-gray-400">Destination</th>
                <th className="text-left py-2 font-medium text-gray-400">Type</th>
                <th className="text-center py-2 font-medium text-gray-400">Priority</th>
                <th className="text-left py-2 font-medium text-gray-400">Status</th>
                <th className="text-left py-2 font-medium text-gray-400">Effective</th>
                <th className="text-left py-2 font-medium text-gray-400">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className={'border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer ' + (selectedId === r.id ? 'bg-cyan-50 dark:bg-cyan-500/5' : '')} onClick={() => setSelectedId(r.id)}>
                    <td className="py-2 pl-3 font-mono text-[10px] text-gray-900 dark:text-white">{r.ruleId}</td>
                    <td className="py-2 font-medium text-gray-900 dark:text-white">{r.name}</td>
                    <td className="py-2 text-gray-500">{r.qrType}</td>
                    <td className="py-2 text-gray-500">{r.owner}</td>
                    <td className="py-2 text-gray-500 max-w-[140px] truncate" title={r.currentDestination}>{r.currentDestination}</td>
                    <td className="py-2"><RuleTypeBadge type={r.ruleType} /></td>
                    <td className="py-2 text-center"><span className={'inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ' + (r.priority === 1 ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : r.priority === 2 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{r.priority}</span></td>
                    <td className="py-2"><StatusBadge status={r.status} /></td>
                    <td className="py-2 text-gray-400">{r.effectiveDate}</td>
                    <td className="py-2"><div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleAction('Viewing ' + r.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">View</button>
                      <button onClick={() => handleAction('Editing ' + r.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Edit</button>
                      <button onClick={() => handleAction('Simulating ' + r.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Sim</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-8"><p className="text-sm text-gray-400">No routing rules match your filters.</p></div>}
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Coming Soon — Smart Routing Capabilities</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {COMING_SOON_RULES.map((c, i) => (
              <div key={i} className="bg-white dark:bg-gray-800/50 rounded-lg p-2.5 border border-amber-100 dark:border-amber-500/10 flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 rounded text-[8px] font-medium">Soon</span>
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{rule!.name}</h1>
            <p className="text-xs text-gray-500">{rule!.ruleId} · <RuleTypeBadge type={rule!.ruleType} /> · <StatusBadge status={rule!.status} /></p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleAction('Previewing route for ' + rule!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
          <button onClick={() => handleAction('Testing route for ' + rule!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Test Route</button>
          <button onClick={() => handleAction('Opening QR ' + rule!.linkedQR)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open QR</button>
          <button onClick={() => handleAction('Opening owner ' + rule!.owner)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open Owner</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setWorkspaceTab(t)} className={'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ' + (workspaceTab === t ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>{tabLabels[i]}</button>
        ))}
      </div>

      {workspaceTab === 'overview' && rule && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Rule Information</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Rule ID</span><span className="font-mono text-gray-900 dark:text-white">{rule.ruleId}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900 dark:text-white">{rule.name}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Status</span><StatusBadge status={rule.status} /></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Rule Type</span><RuleTypeBadge type={rule.ruleType} /></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Linked QR</span><span className="font-mono text-gray-900 dark:text-white">{rule.linkedQR}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Owner</span><span className="text-gray-900 dark:text-white">{rule.owner}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Current Destination</span><span className="text-gray-900 dark:text-white max-w-[200px] truncate" title={rule.currentDestination}>{rule.currentDestination}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Last Validation</span><span className="text-gray-500">{rule.lastValidation}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-500">Last Updated</span><span className="text-gray-500">{rule.updatedAt}</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Priority Chain</h4>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(p => {
                const isActive = p === rule.priority
                return (
                  <div key={p} className={'flex items-center gap-3 px-3 py-2 rounded-lg text-xs ' + (isActive ? 'bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20' : 'bg-gray-50 dark:bg-gray-700/30 border border-transparent')}>
                    <span className={'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ' + (p === 1 ? 'bg-red-100 text-red-600' : p === 2 ? 'bg-amber-100 text-amber-600' : p === 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500')}>{p}</span>
                    <div className="flex-1">
                      <span className="text-gray-700 dark:text-gray-300">{isActive ? rule.ruleType : p === 4 ? 'Fallback Route' : '—'}</span>
                      {isActive && <span className="text-cyan-600 ml-2">(Active)</span>}
                    </div>
                    <span className="text-gray-400 text-[9px]">{isActive ? rule.currentDestination : p === 4 ? rule.fallback : ''}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {workspaceTab === 'destinations' && rule && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Destinations</h4>
          <div className="space-y-2">
            {rule.schedule.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs">
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">{s.destination}</span>
                  {s.start && <span className="text-gray-400 ml-2">{s.start} → {s.end || 'Ongoing'}</span>}
                </div>
                <span className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 rounded text-[10px] font-medium">Active</span>
              </div>
            ))}
          </div>
          <button onClick={() => handleAction('Adding destination to ' + rule.name)} className="px-3 py-1.5 bg-cyan-500 text-white rounded text-xs font-medium hover:bg-cyan-600">Add Destination</button>
        </div>
      )}

      {workspaceTab === 'priority' && rule && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Priority Configuration</h4>
          <p className="text-xs text-gray-500">The engine evaluates rules from highest priority (1) to lowest. This rule currently has priority <strong className="text-gray-900 dark:text-white">{rule.priority}</strong>.</p>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(p => (
              <div key={p} className={'flex items-center gap-3 px-3 py-2 rounded-lg text-xs border ' + (p === rule.priority ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20' : 'bg-gray-50 dark:bg-gray-700/30 border-transparent')}>
                <span className={'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ' + (p === 1 ? 'bg-red-100 text-red-600' : p === 2 ? 'bg-amber-100 text-amber-600' : p === 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500')}>{p}</span>
                <div className="flex-1"><span className="text-gray-700 dark:text-gray-300">{p === rule.priority ? rule.ruleType : p === 4 ? 'Fallback Route' : 'Available'}</span></div>
                {p === rule.priority && <span className="text-cyan-600 font-medium">Current</span>}
                {p !== rule.priority && <button onClick={() => handleAction('Moving rule to priority ' + p)} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-300">Assign</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {workspaceTab === 'schedule' && rule && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Schedule</h4>
          <div className="space-y-3">
            {rule.schedule.map((s, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{s.destination}</span>
                  <span className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 rounded text-[10px] font-medium">Active</span>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  {s.start ? <span>Start: {s.start}</span> : <span className="text-gray-400">No start date</span>}
                  {s.end ? <span>End: {s.end}</span> : <span className="text-gray-400">No end date</span>}
                </div>
              </div>
            ))}
            <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-3 border border-amber-200 dark:border-amber-500/20">
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Schedule Validation</p>
              <p className="text-[9px] text-amber-600 dark:text-amber-500/70">No overlapping date ranges detected. All schedules are valid.</p>
            </div>
          </div>
          <button onClick={() => handleAction('Adding schedule entry to ' + rule.name)} className="px-3 py-1.5 bg-cyan-500 text-white rounded text-xs font-medium hover:bg-cyan-600">Add Schedule Entry</button>
        </div>
      )}

      {workspaceTab === 'fallback' && rule && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Fallback Configuration</h4>
          <div className="space-y-2 text-xs max-w-md">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Fallback Destination</span><span className="font-medium text-gray-900 dark:text-white">{rule.fallback}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Fallback Type</span><span className="font-medium text-gray-900 dark:text-white">{rule.ruleType === 'Fallback Route' ? 'Primary Fallback' : 'Secondary'}</span></div>
          </div>
          <p className="text-xs text-gray-500">When the preferred destination is unavailable, the engine falls back to: <strong className="text-gray-900 dark:text-white">{rule.fallback}</strong></p>
          <div className="bg-green-50 dark:bg-green-500/5 rounded-lg p-3 border border-green-200 dark:border-green-500/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-700 dark:text-green-400">No redirect loops detected in fallback chain.</span>
          </div>
          <button onClick={() => handleAction('Editing fallback for ' + rule.name)} className="px-3 py-1.5 bg-cyan-500 text-white rounded text-xs font-medium hover:bg-cyan-600">Edit Fallback</button>
        </div>
      )}

      {workspaceTab === 'validation' && rule && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Validation Results</h4><button onClick={() => handleAction('Running validation for ' + rule.name)} className="px-2 py-1 bg-cyan-500 text-white rounded text-[10px] font-medium hover:bg-cyan-600">Validate Now</button></div>
          <div className="space-y-2">
            {[
              { check: 'Destination exists', result: 'Passed' },
              { check: 'Destination is published', result: 'Passed' },
              { check: 'Destination is active', result: 'Passed' },
              { check: 'No circular redirects', result: 'Passed' },
              { check: 'No conflicting schedules', result: 'Passed' },
              { check: 'Rule priority is unique', result: 'Passed' },
              { check: 'External URL meets policy', result: rule.currentDestination.startsWith('External') ? 'Warning' : 'Passed' },
              { check: 'Fallback is configured', result: rule.fallback ? 'Passed' : 'Failed' },
            ].map((v, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0 text-xs">
                <span className="text-gray-600 dark:text-gray-400">{v.check}</span>
                <span className={'px-2 py-0.5 rounded text-[10px] font-medium ' + (v.result === 'Passed' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : v.result === 'Warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600')}>{v.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {workspaceTab === 'simulation' && rule && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Route Simulation</h4>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div><label className="text-[10px] text-gray-500 block mb-1">Simulation Date</label><input type="date" value={simDate} onChange={e => setSimDate(e.target.value)} className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="text-[10px] text-gray-500 block mb-1">Simulation Time</label><input type="time" value={simTime} onChange={e => setSimTime(e.target.value)} className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
          </div>
          <button onClick={() => handleAction('Running simulation for ' + rule.name + ' on ' + simDate + ' at ' + simTime)} className="px-3 py-1.5 bg-cyan-500 text-white rounded text-xs font-medium hover:bg-cyan-600">Run Simulation</button>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2"><span className="text-gray-400">Incoming Scan</span><span className="text-gray-900 dark:text-white font-mono text-[10px]">{rule.linkedQR}</span></div>
              <div className="h-px bg-gray-200 dark:bg-gray-600" />
              <div className="flex items-center gap-2"><span className="text-gray-400">Matched Rule</span><span className="text-cyan-600 font-medium">{rule.name}</span></div>
              <div className="h-px bg-gray-200 dark:bg-gray-600" />
              <div className="flex items-center gap-2"><span className="text-gray-400">Destination</span><span className="text-gray-900 dark:text-white font-medium">{rule.currentDestination}</span></div>
              <div className="h-px bg-gray-200 dark:bg-gray-600" />
              <div className="flex items-center gap-2"><span className="text-gray-400">Validation</span><span className="text-green-600 font-medium">Passed</span></div>
              <div className="h-px bg-gray-200 dark:bg-gray-600" />
              <div className="flex items-center gap-2"><span className="text-gray-400">Redirect Time</span><span className="text-gray-900 dark:text-white font-mono">116 ms</span></div>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-3 border border-amber-200 dark:border-amber-500/20">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mb-1">Coming Soon — Advanced Simulation</p>
            <p className="text-[9px] text-amber-600 dark:text-amber-500/70">Device type, country, language, and campaign context simulation are planned for future releases.</p>
          </div>
        </div>
      )}

      {workspaceTab === 'versions' && rule && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Version History</h4><button onClick={() => handleAction('Exporting version history')} className="text-[10px] text-cyan-600 hover:underline">Export</button></div>
          {[
            { v: 3, date: rule.updatedAt, by: 'Operations', changes: 'Destination updated — ' + rule.currentDestination },
            { v: 2, date: '2026-06-01', by: 'Marketing', changes: 'Schedule dates modified' },
            { v: 1, date: rule.createdAt, by: 'Admin', changes: 'Rule created' },
          ].map((v, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs">
              <span className="font-mono text-cyan-600 shrink-0">v{v.v}</span>
              <div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium text-gray-900 dark:text-white">{v.by}</span><span className="text-gray-400">{v.date}</span></div><p className="text-gray-500">{v.changes}</p></div>
              <div className="flex gap-1"><button onClick={() => handleAction('Comparing v' + v.v)} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-100">Compare</button><button onClick={() => handleAction('Restoring v' + v.v)} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-100">Restore</button></div>
            </div>
          ))}
        </div>
      )}

      {workspaceTab === 'activity' && rule && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity Timeline</h4>
          <div className="relative pl-6">
            {[
              { action: 'Rule Updated', detail: 'Destination changed', date: rule.updatedAt + ' 14:30' },
              { action: 'Validation Passed', detail: 'All checks passed', date: rule.lastValidation },
              { action: 'Route Activated', detail: 'Schedule started — ' + rule.currentDestination, date: rule.effectiveDate + ' 00:00' },
              { action: 'Rule Created', detail: 'Created by Admin', date: rule.createdAt + ' 09:00' },
            ].map((a, i) => (
              <div key={i} className="relative pb-4 last:pb-0">
                {i < 3 && <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />}
                <div className="flex items-start gap-3">
                  <div className="absolute left-[-6px] w-3 h-3 rounded-full bg-cyan-500 border-2 border-white dark:border-gray-800 mt-0.5" />
                  <div className="text-xs ml-4"><p className="font-medium text-gray-900 dark:text-white">{a.action}</p><p className="text-gray-500">{a.detail}</p><p className="text-[10px] text-gray-400 mt-0.5">{a.date}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
