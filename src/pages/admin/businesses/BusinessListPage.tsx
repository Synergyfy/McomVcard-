import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import StatsCard from '../../../components/admin/StatsCard'
import { mockBusinesses } from '../../../services/mockData'

const INDUSTRIES = ['Café', 'Technology', 'Restaurant', 'Fitness', 'Beauty', 'Legal', 'Real Estate', 'Retail', 'Coach', 'Hotel', 'Healthcare', 'Barber']
const PLANS = ['All Plans', 'Free', 'Starter', 'Business', 'Enterprise']
const STATUSES = ['All', 'verified', 'pending', 'suspended']

type SortKey = 'name' | 'industry' | 'plan' | 'status' | 'cards' | 'campaigns' | 'joined'
type SortDir = 'asc' | 'desc'

export default function BusinessListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('All Plans')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState<number[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(0)
  const perPage = 8

  const filtered = useMemo(() => {
    let items = [...mockBusinesses]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(b => b.name.toLowerCase().includes(q) || b.owner.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q) || b.email.toLowerCase().includes(q))
    }
    if (industryFilter) items = items.filter(b => b.industry === industryFilter)
    if (planFilter !== 'All Plans') items = items.filter(b => b.plan === planFilter)
    if (statusFilter !== 'All') items = items.filter(b => b.status === statusFilter)
    items.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'industry') cmp = a.industry.localeCompare(b.industry)
      else if (sortKey === 'plan') cmp = a.plan.localeCompare(b.plan)
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
      else if (sortKey === 'cards') cmp = a.cards - b.cards
      else if (sortKey === 'campaigns') cmp = a.campaigns - b.campaigns
      else if (sortKey === 'joined') cmp = a.joined.localeCompare(b.joined)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return items
  }, [search, industryFilter, planFilter, statusFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelected(selected.length === paginated.length ? [] : paginated.map(b => b.id))

  const handleBulkAction = (action: string) => {
    if (selected.length === 0) { toast.error('Select businesses first'); return }
    const msgs: Record<string, string> = { verify: 'Businesses verified', suspend: 'Businesses suspended', delete: 'Businesses deleted', email: 'Email sent to selected businesses' }
    toast.success(`${msgs[action] || action} (${selected.length})`)
    setSelected([])
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Businesses - MCOM VCard Social Bio</title></Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Businesses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage business accounts — {mockBusinesses.length} businesses</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Businesses" value={mockBusinesses.length} color="blue" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} subtitle={`${mockBusinesses.filter(b => b.status === 'verified').length} verified`} />
        <StatsCard title="Active Plans" value={mockBusinesses.filter(b => b.plan !== 'Free').length} color="green" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} subtitle="Paid subscriptions" />
        <StatsCard title="Total Cards" value={mockBusinesses.reduce((s, b) => s + b.cards, 0)} color="purple" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>} subtitle="Across all businesses" />
        <StatsCard title="Total Scans" value={mockBusinesses.reduce((s, b) => s + b.scans, 0).toLocaleString()} color="orange" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>} subtitle="Lifetime" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search name, owner, industry..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
          </div>
          <select value={industryFilter} onChange={(e) => { setIndustryFilter(e.target.value); setPage(0) }} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
            <option value="">All Industries</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(0) }} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
            {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20 p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selected.length} selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('verify')} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600">Verify</button>
            <button onClick={() => handleBulkAction('suspend')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">Suspend</button>
            <button onClick={() => handleBulkAction('email')} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600">Email</button>
            <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600">Delete</button>
            <button onClick={() => setSelected([])} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Clear</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={paginated.length > 0 && selected.length === paginated.length} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
                </th>
                {([{ key: 'name', label: 'Business' }, { key: 'industry', label: 'Industry', hide: 'sm' }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status' }, { key: 'cards', label: 'Cards', hide: 'md' }, { key: 'campaigns', label: 'Campaigns', hide: 'lg' }, { key: 'joined', label: 'Joined', hide: 'xl' }] as { key: SortKey; label: string; hide?: string }[]).map(col => (
                  <th key={col.key} className={`text-left px-4 py-3 font-medium ${col.hide ? `hidden ${col.hide === 'sm' ? 'sm:table-cell' : col.hide === 'md' ? 'md:table-cell' : col.hide === 'lg' ? 'lg:table-cell' : 'xl:table-cell'}` : ''}`}>
                    <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
                      {col.label}
                      {sortKey === col.key && (
                        <svg className={`w-3 h-3 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      )}
                    </button>
                  </th>
                ))}
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/businesses/${b.id}`)}>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggleSelect(b.id)} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">{b.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{b.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{b.owner} · {b.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{b.industry}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      b.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' :
                      b.plan === 'Business' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                      b.plan === 'Starter' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300'
                    }`}>{b.plan}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      b.status === 'verified' ? 'text-green-600 dark:text-green-400' :
                      b.status === 'pending' ? 'text-orange-600 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'verified' ? 'bg-green-500' : b.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'}`} />
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{b.cards}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">{b.campaigns}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden xl:table-cell">{b.joined}</td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/admin/businesses/${b.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors" title="View">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => toast.success(`Business ${b.status === 'verified' ? 'suspended' : 'verified'}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors" title={b.status === 'verified' ? 'Suspend' : 'Verify'}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={b.status === 'verified' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                      </button>
                      <button onClick={() => toast.success('Email sent to ' + b.email)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors" title="Email">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">No businesses match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Page {page + 1} of {totalPages} ({filtered.length} results)</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${page === i ? 'bg-orange-500 text-white' : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{i + 1}</button>
            ))}
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}