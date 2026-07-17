import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import StatsCard from '../../../components/admin/StatsCard'
import { mockConsumers } from '../../../services/mockData'

const STATUSES = ['All', 'active', 'inactive', 'suspended']
type SortKey = 'name' | 'wallet' | 'rewards' | 'cards' | 'referrals' | 'status' | 'joined'
type SortDir = 'asc' | 'desc'

export default function ConsumerListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState<number[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(0)
  const perPage = 8

  const filtered = useMemo(() => {
    let items = [...mockConsumers]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.location.toLowerCase().includes(q))
    }
    if (statusFilter !== 'All') items = items.filter(c => c.status === statusFilter)
    items.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'wallet') cmp = a.wallet.balance - b.wallet.balance
      else if (sortKey === 'rewards') cmp = a.stats.rewards - b.stats.rewards
      else if (sortKey === 'cards') cmp = a.stats.cards - b.stats.cards
      else if (sortKey === 'referrals') cmp = a.stats.referrals - b.stats.referrals
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
      else if (sortKey === 'joined') cmp = a.joined.localeCompare(b.joined)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return items
  }, [search, statusFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelected(selected.length === paginated.length ? [] : paginated.map(c => c.id))

  const handleBulkAction = (action: string) => {
    if (selected.length === 0) { toast.error('Select consumers first'); return }
    const msgs: Record<string, string> = { suspend: 'Consumers suspended', reward: 'Reward issued to selected', email: 'Email sent', delete: 'Consumers deactivated' }
    toast.success(`${msgs[action] || action} (${selected.length})`)
    setSelected([])
  }

  const statusColor = (s: string) => s === 'active' ? 'text-green-600 dark:text-green-400' : s === 'suspended' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
  const statusBg = (s: string) => s === 'active' ? 'bg-green-500' : s === 'suspended' ? 'bg-red-500' : 'bg-gray-400'
  const planBadge = (b: number) => b >= 10000 ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : b >= 2000 ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300'

  return (
    <div className="space-y-6">
      <Helmet><title>Consumers - MCOM VCard Social Bio</title></Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consumers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">End users across the platform — {mockConsumers.length} consumers</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Consumers" value={mockConsumers.length} color="green" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} subtitle={`${mockConsumers.filter(c => c.status === 'active').length} active`} />
        <StatsCard title="Total Wallet" value={`$${mockConsumers.reduce((s, c) => s + c.wallet.balance, 0).toLocaleString()}`} color="orange" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} subtitle={`Avg. $${(mockConsumers.reduce((s, c) => s + c.wallet.balance, 0) / mockConsumers.length).toFixed(0)}`} />
        <StatsCard title="Total Rewards" value={mockConsumers.reduce((s, c) => s + c.stats.rewards, 0)} color="purple" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} subtitle="Redeemed & available" />
        <StatsCard title="Referrals" value={mockConsumers.reduce((s, c) => s + c.stats.referrals, 0)} color="teal" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} subtitle={`${mockConsumers.filter(c => c.stats.referrals > 0).length} referrers`} />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search name, email, location..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
          </div>
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
            <button onClick={() => handleBulkAction('reward')} className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-medium hover:bg-purple-600">Issue Reward</button>
            <button onClick={() => handleBulkAction('suspend')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">Suspend</button>
            <button onClick={() => handleBulkAction('email')} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600">Email</button>
            <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600">Deactivate</button>
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
                <th className="px-4 py-3 w-10"><input type="checkbox" checked={paginated.length > 0 && selected.length === paginated.length} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" /></th>
                {([{ key: 'name', label: 'Consumer' }, { key: 'wallet', label: 'Wallet' }, { key: 'rewards', label: 'Rewards' }, { key: 'cards', label: 'Cards', hide: 'sm' }, { key: 'referrals', label: 'Referrals', hide: 'md' }, { key: 'status', label: 'Status' }, { key: 'joined', label: 'Joined', hide: 'lg' }] as { key: SortKey; label: string; hide?: string }[]).map(col => (
                  <th key={col.key} className={`text-left px-4 py-3 font-medium ${col.hide ? `hidden ${col.hide === 'sm' ? 'sm:table-cell' : col.hide === 'md' ? 'md:table-cell' : 'lg:table-cell'}` : ''}`}>
                    <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
                      {col.label}
                      {sortKey === col.key && <svg className={`w-3 h-3 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>}
                    </button>
                  </th>
                ))}
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/consumers/${c.id}`)}>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">{c.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{c.email} · {c.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planBadge(c.wallet.balance)}`}>${c.wallet.balance.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">{c.stats.rewards}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{c.stats.cards}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{c.stats.referrals}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusColor(c.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBg(c.status)}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">{c.joined}</td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/admin/consumers/${c.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors" title="View">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => toast.success('Reward issued to ' + c.name)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors" title="Issue Reward">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                      </button>
                      <button onClick={() => toast.success('Gift card added to ' + c.name)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors" title="Add Gift Card">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      </button>
                      <button onClick={() => toast.success('Coupon added to ' + c.name)} className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors" title="Add Coupon">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">No consumers match your filters</td></tr>}
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