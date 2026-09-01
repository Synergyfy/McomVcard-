import { useState, useMemo, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminService } from '../../../services/admin'
import type { User } from '../../../types'

type SortKey = 'consumer' | 'membership' | 'status' | 'joined' | 'lastActivity'
type SortDir = 'asc' | 'desc'

const PER_PAGE_OPTIONS = [25, 50, 100] as const
const MEMBERSHIPS = ['Bronze', 'Bronze Pro', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum Pro', 'Platinum Pro+']
const BUSINESSES: string[] = []
const SOURCES: string[] = []

export default function ConsumerListPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState<number>(25)
  const [sortKey, setSortKey] = useState<SortKey>('consumer')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selected, setSelected] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [consumers, setConsumers] = useState<User[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    adminService.getUsers()
      .then((res) => {
        if (!cancelled) setConsumers(res.data ?? [])
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Filter state
  const [filters, setFilters] = useState({
    accountStatus: 'All',
    membership: 'All',
    vcardStatus: 'All',
    cardStatus: 'All',
    addlEntitlement: 'All',
    allocationType: 'All',
    issuingBusiness: 'All',
    regSource: 'All',
    dateRange: 'All',
    activity: 'All',
  })

  const kpiTotals = useMemo(() => ({
    total: consumers.length,
    active: consumers.filter(c => c.status === 'active').length,
    withVCards: consumers.filter(c => c.status === 'active').length,
    withCards: consumers.filter(c => c.status === 'active').length,
    activeMemberships: consumers.filter(c => c.status === 'active').length,
    addlCardsAllocated: 0,
    pendingEntitlements: 0,
  }), [consumers])

  const filtered = useMemo(() => {
    let items = [...consumers]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(c =>
        (c.name ?? '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q)
      )
    }
    if (filters.accountStatus !== 'All') items = items.filter(c => c.status === filters.accountStatus)
    items.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'consumer') cmp = (a.name ?? a.email).localeCompare(b.name ?? b.email)
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
      else if (sortKey === 'joined') cmp = (a.created_at ?? '').localeCompare(b.created_at ?? '')
      return sortDir === 'asc' ? cmp : -cmp
    })
    return items
  }, [consumers, search, filters, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelected(selected.length === paginated.length ? [] : paginated.map(c => c.id))

  const clearFilters = () => {
    setFilters({ accountStatus: 'All', membership: 'All', vcardStatus: 'All', cardStatus: 'All', addlEntitlement: 'All', allocationType: 'All', issuingBusiness: 'All', regSource: 'All', dateRange: 'All', activity: 'All' })
    setSearch('')
    setPage(0)
  }

  const handleBulkAction = (action: string) => {
    if (selected.length === 0) { toast.error('Select consumers first'); return }
    if (action === 'export') {
      toast.success(`Exporting ${selected.length} consumer records`)
      setSelected([])
      return
    }
    const actionMap: Record<string, string> = {
      suspend: 'Suspended',
      reactivate: 'Reactivated',
      notify: 'Notification sent to',
    }
    const msg = actionMap[action] || action
    toast.success(`${msg} ${selected.length} consumer(s)`)
    setSelected([])
  }

  const handleRowAction = (c: User, action: string) => {
    setMenuOpen(null)
    switch (action) {
      case 'viewDetails': navigate(`/admin/consumers/${c.id}`); break
      case 'suspend': toast.success(`Consumer ${c.name ?? c.email} suspended`); break
      case 'reactivate': toast.success(`Consumer ${c.name ?? c.email} reactivated`); break
      default: break
    }
  }

  const statusColor = (s: string) =>
    s === 'active' ? 'text-green-600 dark:text-green-400' :
    s === 'suspended' ? 'text-red-600 dark:text-red-400' :
    s === 'inactive' ? 'text-gray-500' :
    s === 'Pending' ? 'text-yellow-600' : 'text-gray-500'

  const statusBg = (s: string) =>
    s === 'active' || s === 'Active' ? 'bg-green-500' :
    s === 'suspended' || s === 'Suspended' ? 'bg-red-500' :
    s === 'Pending' || s === 'pending' ? 'bg-yellow-500' :
    s === 'Not Assigned' ? 'bg-gray-300 dark:bg-gray-600' :
    'bg-gray-400'

  const renderKpiCard = (label: string, value: string | number, active: boolean, onClick: () => void, color: string) => (
    <button onClick={onClick} className={`${active ? 'bg-white dark:bg-gray-800 border-orange-500 ring-1 ring-orange-500 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'} rounded-xl border p-3 text-left hover:shadow-sm transition-all`}>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </button>
  )

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return null
    return (
      <svg className={`w-3 h-3 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    )
  }

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v !== 'All').length

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">We couldn't load consumers.</p>
        <div className="flex gap-2">
          <button onClick={() => { setError(false); setLoading(true); adminService.getUsers().then((res) => setConsumers(res.data ?? [])).catch(() => setError(true)).finally(() => setLoading(false)) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600">Try Again</button>
          <button onClick={() => toast.success('Opening system status')} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Check System Status</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>Consumers - MCOM VCard</title></Helmet>
        <div className="h-8 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }, (_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Consumers - MCOM VCard</title></Helmet>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consumers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and monitor all consumers using MCOMVCard, including their VCards, Cards, memberships, entitlements, allocations, and activity.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success('Opening invitation workflow')} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Add / Import Consumer</button>
          <div className="relative">
            <button onClick={() => setShowFilters(true)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters
              {activeFilterCount > 0 && <span className="bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {renderKpiCard('Total Consumers', kpiTotals.total, filters.accountStatus === 'All' && filters.vcardStatus === 'All' && filters.cardStatus === 'All' && filters.membership === 'All', () => { clearFilters(); toast.success('Showing all consumers') }, 'text-gray-900 dark:text-white')}
        {renderKpiCard('Active', kpiTotals.active, filters.accountStatus === 'active', () => { setFilters(prev => ({ ...prev, accountStatus: prev.accountStatus === 'active' ? 'All' : 'active' })); setPage(0) }, 'text-green-600')}
        {renderKpiCard('With VCards', kpiTotals.withVCards, filters.vcardStatus === 'Active', () => { setFilters(prev => ({ ...prev, vcardStatus: prev.vcardStatus === 'Active' ? 'All' : 'Active' })); setPage(0) }, 'text-blue-600')}
        {renderKpiCard('With Cards', kpiTotals.withCards, filters.cardStatus === 'Active', () => { setFilters(prev => ({ ...prev, cardStatus: prev.cardStatus === 'Active' ? 'All' : 'Active' })); setPage(0) }, 'text-purple-600')}
        {renderKpiCard('Active Memberships', kpiTotals.activeMemberships, filters.membership !== 'All', () => { setFilters(prev => ({ ...prev, membership: prev.membership !== 'All' ? 'All' : 'Silver Pro' })); setPage(0) }, 'text-orange-600')}
        {renderKpiCard('Addl Cards Allocated', kpiTotals.addlCardsAllocated, filters.addlEntitlement === 'Fully allocated', () => { setFilters(prev => ({ ...prev, addlEntitlement: prev.addlEntitlement === 'Fully allocated' ? 'All' : 'Fully allocated' })); setPage(0) }, 'text-indigo-600')}
        {renderKpiCard('Pending Entitlements', kpiTotals.pendingEntitlements, filters.addlEntitlement === 'Has unused', () => { setFilters(prev => ({ ...prev, addlEntitlement: prev.addlEntitlement === 'Has unused' ? 'All' : 'Has unused' })); setPage(0) }, 'text-amber-600')}
      </div>

      {/* Search + Bulk Actions + Pagination Top */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search by name, email, phone, Consumer ID, VCard ID, or Card ID" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          </div>
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{selected.length} selected</span>
              <button onClick={() => handleBulkAction('suspend')} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600">Suspend</button>
              <button onClick={() => handleBulkAction('reactivate')} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600">Reactivate</button>
              <button onClick={() => handleBulkAction('export')} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600">Export</button>
              <button onClick={() => setSelected([])} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Clear</button>
            </div>
          )}
          {selected.length === 0 && (
            <button onClick={() => toast.success('Exporting all filtered consumers')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(filters).filter(([, v]) => v !== 'All').map(([key, val]) => (
            <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-medium">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}: {val}
              <button onClick={() => { setFilters(prev => ({ ...prev, [key]: 'All' })); setPage(0) }} className="ml-0.5 hover:text-orange-800">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
          <button onClick={clearFilters} className="text-[10px] text-gray-500 hover:text-orange-600 underline">Clear all</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-3 py-3 w-10"><input type="checkbox" checked={paginated.length > 0 && selected.length === paginated.length} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" /></th>
                <th className="text-left px-3 py-3 font-medium"><button onClick={() => toggleSort('consumer')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">Consumer {sortIcon('consumer')}</button></th>
                <th className="text-left px-3 py-3 font-medium">Consumer ID</th>
                <th className="text-left px-3 py-3 font-medium hidden md:table-cell">Email / Phone</th>
                <th className="text-left px-3 py-3 font-medium"><button onClick={() => toggleSort('membership')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">Membership {sortIcon('membership')}</button></th>
                <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">VCard</th>
                <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Card</th>
                <th className="text-right px-3 py-3 font-medium hidden xl:table-cell">Entitlements</th>
                <th className="text-right px-3 py-3 font-medium hidden xl:table-cell">Allocated</th>
                <th className="text-left px-3 py-3 font-medium hidden xl:table-cell">Allocation</th>
                <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Issued By</th>
                <th className="text-left px-3 py-3 font-medium"><button onClick={() => toggleSort('status')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">Status {sortIcon('status')}</button></th>
                <th className="text-left px-3 py-3 font-medium hidden sm:table-cell"><button onClick={() => toggleSort('lastActivity')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">Last Activity {sortIcon('lastActivity')}</button></th>
                <th className="text-left px-3 py-3 font-medium hidden 2xl:table-cell"><button onClick={() => toggleSort('joined')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">Registered {sortIcon('joined')}</button></th>
                <th className="text-right px-3 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/consumers/${c.id}`)}>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">{(c.name ?? c.email).charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name ?? c.email}</p>
                        <p className="text-[10px] text-gray-400">Consumer</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{c.id}</span>
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    <p className="text-xs text-gray-700 dark:text-gray-300">{c.email}</p>
                    <p className="text-[10px] text-gray-400">{c.phone ?? '—'}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">—</span>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBg(c.status)}`} />
                      {c.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBg(c.status)}`} />
                      {c.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right hidden xl:table-cell">
                    <span className="text-xs font-mono font-medium text-gray-900 dark:text-white">—</span>
                  </td>
                  <td className="px-3 py-3 text-right hidden xl:table-cell">
                    <span className="text-xs font-mono text-orange-600">0</span>
                  </td>
                  <td className="px-3 py-3 hidden xl:table-cell">
                    <div className="text-[10px]"><span className="text-gray-400">—</span></div>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <span className="text-xs text-gray-400">—</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusColor(c.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBg(c.status)}`} />
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{c.updated_at ? new Date(c.updated_at).toLocaleDateString() : '—'}</span>
                  </td>
                  <td className="px-3 py-3 hidden 2xl:table-cell">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</span>
                  </td>
                  <td className="px-3 py-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                    {menuOpen === c.id && (
                      <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg py-1">
                        {[
                          { key: 'viewDetails', label: 'View Details', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
                          { type: 'divider' },
                          c.status === 'active' ? { key: 'suspend', label: 'Suspend Account', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' } : { key: 'reactivate', label: 'Reactivate Account', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                        ].map((item: any, idx: number) =>
                          item.type === 'divider' ? <div key={idx} className="border-t border-gray-100 dark:border-gray-700 my-1" /> :
                          <button key={item.key} onClick={() => handleRowAction(c as any, item.key)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                            {item.label}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={15} className="px-3 py-16 text-center">
                    {search || activeFilterCount > 0 ? (
                      <div>
                        <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No consumers match your filters.</p>
                        <button onClick={clearFilters} className="mt-3 px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Clear Filters</button>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No consumers yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-md mx-auto">Consumers will appear here after they register through the MCOM Solutions centralized account system and are connected to MCOMVCard.</p>
                        <button onClick={() => toast.success('Opening integration status')} className="mt-3 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Integration Status</button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length} consumers</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span>Rows per page:</span>
          <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0) }} className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex gap-1">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const start = Math.max(0, Math.min(page - 3, totalPages - 7))
            const p = start + i
            if (p >= totalPages) return null
            return (
              <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${page === p ? 'bg-orange-500 text-white' : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{p + 1}</button>
            )
          })}
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
        </div>
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowFilters(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
              <div className="flex items-center gap-2">
                <button onClick={clearFilters} className="text-xs text-orange-600 hover:underline">Clear all</button>
                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-5 text-xs">
              {/* Account Status */}
              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 font-medium">Account Status</label>
                <select value={filters.accountStatus} onChange={e => { setFilters(prev => ({ ...prev, accountStatus: e.target.value })); setPage(0) }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {['All', 'active', 'suspended', 'inactive', 'pending'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              {/* Membership */}
              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 font-medium">Membership</label>
                <select value={filters.membership} onChange={e => { setFilters(prev => ({ ...prev, membership: e.target.value })); setPage(0) }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="All">All Memberships</option>
                  {MEMBERSHIPS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {/* VCard Status */}
              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 font-medium">VCard Status</label>
                <select value={filters.vcardStatus} onChange={e => { setFilters(prev => ({ ...prev, vcardStatus: e.target.value })); setPage(0) }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {['All', 'Active', 'Inactive', 'Suspended', 'Not Assigned'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
                </select>
              </div>
              {/* Card Status */}
              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 font-medium">Card Status</label>
                <select value={filters.cardStatus} onChange={e => { setFilters(prev => ({ ...prev, cardStatus: e.target.value })); setPage(0) }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {['All', 'Active', 'Inactive', 'Suspended', 'Not Assigned'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
                </select>
              </div>
              {/* Additional Card Entitlement */}
              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 font-medium">Additional Card Entitlement</label>
                <select value={filters.addlEntitlement} onChange={e => { setFilters(prev => ({ ...prev, addlEntitlement: e.target.value })); setPage(0) }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {['All', 'Has unused', 'Fully allocated', 'No additional'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Allocation Type */}
              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 font-medium">Allocation Type</label>
                <select value={filters.allocationType} onChange={e => { setFilters(prev => ({ ...prev, allocationType: e.target.value })); setPage(0) }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {['All', 'Primary consumer only', 'Family', 'Friend', 'Mixed Family & Friends', 'Unallocated'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Issuing Business */}
              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 font-medium">Issuing / Origin Business</label>
                <select value={filters.issuingBusiness} onChange={e => { setFilters(prev => ({ ...prev, issuingBusiness: e.target.value })); setPage(0) }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="All">All Businesses</option>
                  {BUSINESSES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {/* Registration Source */}
              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 font-medium">Registration Source</label>
                <select value={filters.regSource} onChange={e => { setFilters(prev => ({ ...prev, regSource: e.target.value })); setPage(0) }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="All">All Sources</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Date Range */}
              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 font-medium">Registration Date</label>
                <select value={filters.dateRange} onChange={e => { setFilters(prev => ({ ...prev, dateRange: e.target.value })); setPage(0) }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {['All', 'Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Activity */}
              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 font-medium">Activity</label>
                <select value={filters.activity} onChange={e => { setFilters(prev => ({ ...prev, activity: e.target.value })); setPage(0) }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {['All', 'Active recently', 'No recent activity'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={() => setShowFilters(false)} className="w-full px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
