import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams } from 'react-router-dom'
import { CardFlip } from '../../../components/admin/BusinessCardPreview'
import { mockCardDesigns, mockCardBusinesses } from '../../../services/mockData'

const PAGE_SIZE = 8

export default function CardDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const design = mockCardDesigns.find((d) => d.id === Number(id))

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  const allBusinesses = useMemo(
    () => mockCardBusinesses.filter((b) => b.cardDesignId === Number(id)),
    [id],
  )

  const filtered = useMemo(() => {
    let list = allBusinesses
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((b) => b.name.toLowerCase().includes(q) || b.owner.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q))
    }
    if (statusFilter !== 'All') list = list.filter((b) => statusFilter === 'active' ? b.active : !b.active)
    return list
  }, [allBusinesses, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  if (!design) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Card Design Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The card design you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/admin/cards')} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600">Back to Cards</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet><title>{design.name} - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/cards')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{design.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{design.style} · {design.type} Card · {design.usage.toLocaleString()} total scans</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-auto ${
          design.status === 'active' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' :
          design.status === 'inactive' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' :
          'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300'
        }`}>{design.status}</span>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-full max-w-xs sm:max-w-sm">
            <CardFlip d={design} />
          </div>
          <div className="flex-1 text-white space-y-3">
            <h2 className="text-lg font-bold">Card Design Details</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-white/60 text-xs">Style</p>
                <p className="font-semibold">{design.style}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Layout</p>
                <p className="font-semibold capitalize">{design.layout}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Businesses</p>
                <p className="font-semibold">{allBusinesses.length}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Created</p>
                <p className="font-semibold">{design.created}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="px-4 py-2 rounded-xl bg-white/20 text-white text-xs font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm">Edit Design</button>
              <button className="px-4 py-2 rounded-xl bg-white/20 text-white text-xs font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm">Clone</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Businesses Using This Card</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search businesses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center ml-auto">{filtered.length} business{filtered.length !== 1 ? 'es' : ''}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-5 py-3 font-medium">Business</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Owner</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Industry</th>
                <th className="text-left px-5 py-3 font-medium">Contact</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{b.name.charAt(0)}</div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{b.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{b.owner}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{b.industry}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{b.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${b.active ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${b.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {b.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => navigate(`/admin/businesses/${b.id}`)} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">View</button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">No businesses found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400 dark:text-gray-500">Page {safePage} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium ${p === safePage ? 'bg-orange-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{p}</button>
              ))}
              <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
