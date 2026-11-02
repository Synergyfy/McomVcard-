import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/admin'

interface DashboardData {
  businesses: number; consumers: number; totalVCards: number; totalCards: number
  activeVCards: number; activeCards: number; pendingVCards: number; pendingCards: number
  activeMemberships: number; newBusinesses: number; newConsumers: number
  businessVCards: { total: number; active: number; pending: number }
  consumerVCards: { total: number; active: number; pending: number }
  businessCards: { total: number; active: number; pending: number }
  consumerCards: { total: number; active: number; pending: number }
  additionalEntitlements: { available: number; allocated: number; active: number; pending: number }
  businessActivity: Array<{ business: string; action: string; time: string; type: string }>
  consumerActivity: Array<{ consumer: string; action: string; time: string; type: string }>
  recentBusinesses: Array<{ name: string; owner: string; membership: string; vcard: string; card: string; status: string; registered: string }>
  recentConsumers: Array<{ name: string; membership: string; vcard: string; card: string; additional: string; status: string; registered: string }>
  vcardActivity: Array<{ type: string; name: string; action: string; time: string }>
  cardActivity: Array<{ type: string; name: string; action: string; time: string }>
  membershipActivity: Array<{ name: string; action: string; detail: string; time: string }>
  integrations: Array<{ name: string; status: string; lastSync?: string }>
  regTrend: Array<{ period: string; businesses: number; consumers: number }>
  cardGrowth: Array<{ period: string; bizVcards: number; conVcards: number; bizCards: number; conCards: number }>
}

const EMPTY_DASHBOARD: DashboardData = {
  businesses: 0, consumers: 0, totalVCards: 0, totalCards: 0, activeVCards: 0, activeCards: 0,
  pendingVCards: 0, pendingCards: 0, activeMemberships: 0, newBusinesses: 0, newConsumers: 0,
  businessVCards: { total: 0, active: 0, pending: 0 }, consumerVCards: { total: 0, active: 0, pending: 0 },
  businessCards: { total: 0, active: 0, pending: 0 }, consumerCards: { total: 0, active: 0, pending: 0 },
  additionalEntitlements: { available: 0, allocated: 0, active: 0, pending: 0 },
  businessActivity: [], consumerActivity: [], recentBusinesses: [], recentConsumers: [],
  vcardActivity: [], cardActivity: [], membershipActivity: [], integrations: [], regTrend: [], cardGrowth: [],
}

function relative(value: unknown): string {
  if (!value) return ''
  const timestamp = new Date(String(value)).getTime()
  if (!Number.isFinite(timestamp)) return ''
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function normalizeDashboard(payload: any): DashboardData {
  const activity = (rows: any) => (Array.isArray(rows) ? rows : []).map((row: any) => ({
    business: row.business ?? row.name ?? 'Platform',
    consumer: row.consumer ?? row.name ?? 'Platform',
    name: row.name ?? row.business ?? 'Platform',
    action: row.action ?? row.detail ?? '',
    detail: row.detail ?? '',
    time: row.time ? relative(row.time) : '',
    type: row.type ?? 'activity',
  }))
  return {
    ...EMPTY_DASHBOARD, ...payload,
    businessVCards: { ...EMPTY_DASHBOARD.businessVCards, ...(payload?.businessVCards ?? {}) },
    consumerVCards: { ...EMPTY_DASHBOARD.consumerVCards, ...(payload?.consumerVCards ?? {}) },
    businessCards: { ...EMPTY_DASHBOARD.businessCards, ...(payload?.businessCards ?? {}) },
    consumerCards: { ...EMPTY_DASHBOARD.consumerCards, ...(payload?.consumerCards ?? {}) },
    additionalEntitlements: { ...EMPTY_DASHBOARD.additionalEntitlements, ...(payload?.additionalEntitlements ?? {}) },
    businessActivity: activity(payload?.businessActivity),
    consumerActivity: activity(payload?.consumerActivity),
    vcardActivity: activity(payload?.vcardActivity),
    cardActivity: activity(payload?.cardActivity),
    membershipActivity: activity(payload?.membershipActivity),
    recentBusinesses: (Array.isArray(payload?.recentBusinesses) ? payload.recentBusinesses : []).map((row: any) => ({
      name: row.name ?? '—', owner: row.owner ?? '—', membership: row.membership ?? '—', vcard: row.vcard ?? '—',
      card: row.card ?? '—', status: row.status ?? 'Active', registered: row.registered ? relative(row.registered) : '',
    })),
    recentConsumers: (Array.isArray(payload?.recentConsumers) ? payload.recentConsumers : []).map((row: any) => ({
      name: row.name ?? row.email ?? '—', membership: row.membership ?? '—', vcard: row.vcard ?? '—',
      card: row.card ?? '—', additional: row.additional ?? '—', status: row.status ?? 'Active',
      registered: row.registered ? relative(row.registered) : '',
    })),
    integrations: Array.isArray(payload?.integrations) ? payload.integrations : [],
    regTrend: Array.isArray(payload?.regTrend) ? payload.regTrend : [],
    cardGrowth: Array.isArray(payload?.cardGrowth) ? payload.cardGrowth : [],
  }
}

type DateFilter = 'Today' | '7 Days' | '30 Days' | '90 Days' | 'Custom'
type OwnerFilter = 'All' | 'Business' | 'Consumer'
type CardTypeFilter = 'All' | 'VCard' | 'Card'
type StatusFilter = 'All' | 'Active' | 'Pending' | 'Inactive'

function KpiCard({ title, value, subtitle, icon, color, link, children }: {
  title: string; value: string | number; subtitle?: string; icon?: string; color: string; link?: string; children?: React.ReactNode
}) {
  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color === 'orange' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : color === 'green' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : color === 'purple' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : color === 'teal' ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
            </svg>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      {children}
    </div>
  )
  if (link) return <Link to={link}>{content}</Link>
  return content
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('7 Days')
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('All')
  const [cardTypeFilter, setCardTypeFilter] = useState<CardTypeFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    adminService.getStats()
      .then((payload) => { if (!cancelled) setData(normalizeDashboard(payload)) })
      .catch((err) => { if (!cancelled) { setData(EMPTY_DASHBOARD); setLoadError(err?.response?.data?.message || 'Unable to load dashboard statistics') } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const maxReg = Math.max(1, ...data.regTrend.map((r) => Math.max(r.businesses, r.consumers)))
  const maxGrowth = Math.max(1, ...data.cardGrowth.map((r) => Math.max(r.bizVcards, r.conVcards, r.bizCards, r.conCards)))

  return (
    <div className="space-y-6">
      <Helmet><title>Dashboard - MCOM VCard Social Bio</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">MCOMVCard ecosystem at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{loadError}</div>}
      {loading && <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}

      {/* Global Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Date Range</label>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              {(['Today', '7 Days', '30 Days', '90 Days', 'Custom'] as const).map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Owner Type</label>
            <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value as OwnerFilter)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              {(['All', 'Business', 'Consumer'] as const).map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Card Type</label>
            <select value={cardTypeFilter} onChange={(e) => setCardTypeFilter(e.target.value as CardTypeFilter)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              {(['All', 'VCard', 'Card'] as const).map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              {(['All', 'Active', 'Pending', 'Inactive'] as const).map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button className="px-4 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">Apply Filters</button>
          <button onClick={() => { setDateFilter('7 Days'); setOwnerFilter('All'); setCardTypeFilter('All'); setStatusFilter('All') }}
            className="px-4 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Reset</button>
        </div>
      </div>

      {/* KPI Summary */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Key Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard title="Total Businesses" value={data.businesses.toLocaleString()} subtitle={`${data.newBusinesses} new in the last 7 days`} icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" color="blue" link="/admin/businesses" />
          <KpiCard title="Total Consumers" value={data.consumers.toLocaleString()} subtitle={`${data.newConsumers} new in the last 7 days`} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" color="green" link="/admin/consumers" />
          <KpiCard title="Total VCards" value={data.totalVCards.toLocaleString()} color="purple" link="/admin/vcards">
            <div className="flex gap-3 mt-1.5 text-xs">
              <span className="text-blue-600 dark:text-blue-400">Biz: {data.businessVCards.total}</span>
              <span className="text-green-600 dark:text-green-400">Con: {data.consumerVCards.total}</span>
            </div>
          </KpiCard>
          <KpiCard title="Total Cards" value={data.totalCards.toLocaleString()} color="orange" link="/admin/cards">
            <div className="flex gap-3 mt-1.5 text-xs">
              <span className="text-blue-600 dark:text-blue-400">Biz: {data.businessCards.total}</span>
              <span className="text-green-600 dark:text-green-400">Con: {data.consumerCards.total}</span>
            </div>
          </KpiCard>
          <KpiCard title="Active Memberships" value={data.activeMemberships.toLocaleString()} subtitle="Currently active subscriptions" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="teal" link="/admin/plans" />
          <KpiCard title="Active VCards" value={data.activeVCards.toLocaleString()} color="purple" link="/admin/vcards">
            <div className="flex gap-3 mt-1.5 text-xs">
              <span className="text-blue-600 dark:text-blue-400">Biz: {data.businessVCards.active}</span>
              <span className="text-green-600 dark:text-green-400">Con: {data.consumerVCards.active}</span>
            </div>
          </KpiCard>
          <KpiCard title="Active Cards" value={data.activeCards.toLocaleString()} color="orange" link="/admin/cards">
            <div className="flex gap-3 mt-1.5 text-xs">
              <span className="text-blue-600 dark:text-blue-400">Biz: {data.businessCards.active}</span>
              <span className="text-green-600 dark:text-green-400">Con: {data.consumerCards.active}</span>
            </div>
          </KpiCard>
          <KpiCard title="New Registrations" value={(data.newBusinesses + data.newConsumers).toLocaleString()} color="blue">
            <div className="flex gap-3 mt-1.5 text-xs">
              <Link to="/admin/businesses" className="text-blue-600 dark:text-blue-400 hover:underline">Biz: {data.newBusinesses}</Link>
              <Link to="/admin/consumers" className="text-green-600 dark:text-green-400 hover:underline">Con: {data.newConsumers}</Link>
            </div>
          </KpiCard>
          <KpiCard title="Pending VCards" value={data.pendingVCards.toLocaleString()} color="teal" link="/admin/vcards" />
          <KpiCard title="Pending Cards" value={data.pendingCards.toLocaleString()} color="teal" link="/admin/cards" />
        </div>
      </div>

      {/* Card Ecosystem Overview - 4 cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Card Ecosystem Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/vcards/business" className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5 hover:shadow-md transition-all group">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Business VCards</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{data.businessVCards.total.toLocaleString()}</p>
            <div className="flex gap-4 mt-2 text-xs text-blue-700 dark:text-blue-300">
              <span>Active: {data.businessVCards.active}</span>
              <span>Pending: {data.businessVCards.pending}</span>
            </div>
            <span className="inline-block mt-3 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">View →</span>
          </Link>
          <Link to="/admin/cards/business" className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800 p-5 hover:shadow-md transition-all group">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Business Cards</p>
            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">{data.businessCards.total.toLocaleString()}</p>
            <div className="flex gap-4 mt-2 text-xs text-orange-700 dark:text-orange-300">
              <span>Active: {data.businessCards.active}</span>
              <span>Pending: {data.businessCards.pending}</span>
            </div>
            <span className="inline-block mt-3 text-xs font-medium text-orange-600 dark:text-orange-400 group-hover:underline">View →</span>
          </Link>
          <Link to="/admin/vcards/consumer" className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 p-5 hover:shadow-md transition-all group">
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">Consumer VCards</p>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{data.consumerVCards.total.toLocaleString()}</p>
            <div className="flex gap-4 mt-2 text-xs text-green-700 dark:text-green-300">
              <span>Active: {data.consumerVCards.active}</span>
              <span>Pending: {data.consumerVCards.pending}</span>
            </div>
            <span className="inline-block mt-3 text-xs font-medium text-green-600 dark:text-green-400 group-hover:underline">View →</span>
          </Link>
          <Link to="/admin/cards/consumer" className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 p-5 hover:shadow-md transition-all group">
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">Consumer Cards</p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">{data.consumerCards.total.toLocaleString()}</p>
            <div className="flex gap-4 mt-2 text-xs text-purple-700 dark:text-purple-300">
              <span>Active: {data.consumerCards.active}</span>
              <span>Pending: {data.consumerCards.pending}</span>
            </div>
            <span className="inline-block mt-3 text-xs font-medium text-purple-600 dark:text-purple-400 group-hover:underline">View →</span>
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Registration Trend</h2>
            <div className="flex gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> Businesses</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500" /> Consumers</span>
            </div>
          </div>
          <div className="relative h-40">
            <div className="absolute inset-0 flex items-end gap-2">
              {data.regTrend.map((r) => (
                <div key={r.period} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                  <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '100%' }}>
                    <div className="w-1/3 bg-blue-500 rounded-t opacity-80" style={{ height: `${(r.businesses / maxReg) * 100}%` }} title={`Businesses: ${r.businesses}`} />
                    <div className="w-1/3 bg-green-500 rounded-t opacity-80" style={{ height: `${(r.consumers / maxReg) * 100}%` }} title={`Consumers: ${r.consumers}`} />
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1">{r.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card Growth */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Card Creation Trend</h2>
            <div className="flex gap-2 text-[10px] flex-wrap">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> Biz VCards</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500" /> Con VCards</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-500" /> Biz Cards</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500" /> Con Cards</span>
            </div>
          </div>
          <div className="relative h-40">
            <div className="absolute inset-0 flex items-end gap-1">
              {data.cardGrowth.map((r) => (
                <div key={r.period} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                  <div className="w-full flex gap-px items-end justify-center" style={{ height: '100%' }}>
                    <div className="w-1/5 bg-blue-500 rounded-t" style={{ height: `${(r.bizVcards / maxGrowth) * 100}%` }} title={`Biz VCards: ${r.bizVcards}`} />
                    <div className="w-1/5 bg-green-500 rounded-t" style={{ height: `${(r.conVcards / maxGrowth) * 100}%` }} title={`Con VCards: ${r.conVcards}`} />
                    <div className="w-1/5 bg-orange-500 rounded-t" style={{ height: `${(r.bizCards / maxGrowth) * 100}%` }} title={`Biz Cards: ${r.bizCards}`} />
                    <div className="w-1/5 bg-purple-500 rounded-t" style={{ height: `${(r.conCards / maxGrowth) * 100}%` }} title={`Con Cards: ${r.conCards}`} />
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1">{r.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Business Activity</h2>
          <div className="space-y-0">
            {data.businessActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                  a.type === 'vcard' ? 'bg-purple-500' : a.type === 'card' ? 'bg-orange-500' : 'bg-teal-500'
                }`}>{a.business.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{a.business}</span>
                    <span className="text-gray-500 dark:text-gray-400"> {a.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consumer Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Consumer Activity</h2>
          <div className="space-y-0">
            {data.consumerActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {a.consumer.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{a.consumer}</span>
                    <span className="text-gray-500 dark:text-gray-400"> {a.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Businesses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Business Registrations</h2>
            <Link to="/admin/businesses" className="text-xs text-orange-600 dark:text-orange-400 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-2 font-medium">Business</th>
                  <th className="text-left py-2 font-medium">Owner</th>
                  <th className="text-left py-2 font-medium">VCard</th>
                  <th className="text-left py-2 font-medium">Card</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBusinesses.map((b, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-2.5">
                      <Link to="/admin/businesses" className="font-medium text-gray-900 dark:text-white hover:text-orange-600">{b.name}</Link>
                    </td>
                    <td className="text-gray-500">{b.owner}</td>
                    <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${b.vcard === 'Active' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600'}`}>{b.vcard}</span></td>
                    <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${b.card === 'Active' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600'}`}>{b.card}</span></td>
                    <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${b.status === 'Active' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{b.status}</span></td>
                    <td>
                      <Link to="/admin/businesses" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Consumers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Consumer Registrations</h2>
            <Link to="/admin/consumers" className="text-xs text-orange-600 dark:text-orange-400 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-2 font-medium">Consumer</th>
                  <th className="text-left py-2 font-medium">VCard</th>
                  <th className="text-left py-2 font-medium">Card</th>
                  <th className="text-left py-2 font-medium">Additional</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentConsumers.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-2.5">
                      <Link to="/admin/consumers" className="font-medium text-gray-900 dark:text-white hover:text-orange-600">{c.name}</Link>
                    </td>
                    <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.vcard === 'Active' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600'}`}>{c.vcard}</span></td>
                    <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.card === 'Active' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600'}`}>{c.card}</span></td>
                    <td className="text-gray-500">{c.additional}</td>
                    <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.status === 'Active' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{c.status}</span></td>
                    <td>
                      <Link to="/admin/consumers" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VCard & Card Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent VCard Activity</h2>
          <div className="space-y-0">
            {data.vcardActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${a.type === 'Business' ? 'bg-blue-500' : 'bg-green-500'}`}>{a.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded mr-1.5 ${a.type === 'Business' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'bg-green-50 dark:bg-green-500/10 text-green-600'}`}>{a.type} VCard</span>
                    <span className="font-semibold">{a.name}</span>
                    <span className="text-gray-500 dark:text-gray-400"> {a.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Card Activity</h2>
          <div className="space-y-0">
            {data.cardActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${a.type === 'Business' ? 'bg-orange-500' : 'bg-purple-500'}`}>{a.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded mr-1.5 ${a.type === 'Business' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600'}`}>{a.type} Card</span>
                    <span className="font-semibold">{a.name}</span>
                    <span className="text-gray-500 dark:text-gray-400"> {a.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Membership Activity + Additional Card Entitlements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Membership Activity</h2>
          <div className="space-y-0">
            {data.membershipActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{a.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{a.name}</span>
                    <span className="text-gray-500 dark:text-gray-400"> {a.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.detail} · {a.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/admin/plans" className="block mt-3 text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium">View All Membership Activity →</Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Additional Card Entitlements</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-teal-50 dark:bg-teal-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{data.additionalEntitlements.available.toLocaleString()}</p>
              <p className="text-xs text-teal-600 dark:text-teal-400">Available</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{data.additionalEntitlements.allocated.toLocaleString()}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Allocated</p>
            </div>
            <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{data.additionalEntitlements.active.toLocaleString()}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Active</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{data.additionalEntitlements.pending.toLocaleString()}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Pending Allocation</p>
            </div>
          </div>
          <Link to="/admin/consumers" className="block mt-3 text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium">View Consumers with Available Slots →</Link>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Integration Status</h2>
          <Link to="/admin/integrations" className="text-xs text-orange-600 dark:text-orange-400 hover:underline">Manage Integrations</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.integrations.map((int) => (
            <Link key={int.name} to="/admin/integrations" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                int.status === 'connected' ? 'bg-green-500' : int.status === 'coming-soon' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-red-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{int.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {int.status === 'connected' ? `● Connected${int.lastSync ? ` · ${int.lastSync}` : ''}` : int.status === 'in-memory' ? '● Connected (in-memory fallback)' : int.status === 'not-configured' ? '○ Not configured' : '● Connection Error'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { to: '/admin/vcards/business', label: 'Create Business VCard', icon: 'M12 4v16m8-8H4', color: 'blue' },
            { to: '/admin/cards/business', label: 'Create Business Card', icon: 'M12 4v16m8-8H4', color: 'orange' },
            { to: '/admin/vcards/consumer', label: 'Create Consumer VCard', icon: 'M12 4v16m8-8H4', color: 'green' },
            { to: '/admin/cards/consumer', label: 'Create Consumer Card', icon: 'M12 4v16m8-8H4', color: 'purple' },
            { to: '/admin/plans', label: 'Create Membership Plan', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'teal' },
            { to: '/admin/vcard-levels', label: 'Manage VCard Levels', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', color: 'purple' },
            { to: '/admin/templates', label: 'VCard Templates', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z', color: 'blue' },
            { to: '/admin/card-templates', label: 'Card Templates', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z', color: 'orange' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all group ${
                action.color === 'blue' ? 'hover:border-blue-300 dark:hover:border-blue-700' :
                action.color === 'orange' ? 'hover:border-orange-300 dark:hover:border-orange-700' :
                action.color === 'green' ? 'hover:border-green-300 dark:hover:border-green-700' :
                action.color === 'purple' ? 'hover:border-purple-300 dark:hover:border-purple-700' :
                'hover:border-teal-300 dark:hover:border-teal-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                action.color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
                action.color === 'orange' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' :
                action.color === 'green' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' :
                action.color === 'purple' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600' :
                'bg-teal-50 dark:bg-teal-500/10 text-teal-600'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
