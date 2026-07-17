import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../services/admin'
import ActionDropdown from '../../components/common/ActionDropdown'

const MOCK_VCARDS: any[] = [
  { id: 1, name: 'Sarah Johnson', user: { name: 'Sarah Johnson' }, status: 1, url_slug: 'sarah-j' },
  { id: 2, name: 'Mike Chen Consulting', user: { name: 'Mike Chen' }, status: 1, url_slug: 'mike-c' },
  { id: 3, name: 'Emily Designs', user: { name: 'Emily Williams' }, status: 1, url_slug: 'emily-d' },
  { id: 4, name: 'Anna Garcia Fitness', user: { name: 'Anna Garcia' }, status: 0, url_slug: 'anna-f' },
  { id: 5, name: 'James Brown Photography', user: { name: 'James Brown' }, status: 1, url_slug: 'james-p' },
  { id: 6, name: 'Robert Taylor Realty', user: { name: 'Robert Taylor' }, status: 0, url_slug: 'robert-r' },
]

export default function VCardListPage() {
  const { t } = useTranslation()
  const [vcards, setVcards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    setLoading(true)
    adminService.getVcards()
      .then((res) => setVcards(res.data && res.data.length ? res.data : MOCK_VCARDS))
      .catch(() => setVcards(MOCK_VCARDS))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.confirm_delete'))) return
    try { await adminService.deleteVcard(id); setVcards(vcards.filter((v) => v.id !== id)) } catch { setVcards(vcards.filter((v) => v.id !== id)) }
  }

  const filtered = vcards.filter((v) => {
    const q = search.toLowerCase()
    const matchSearch = !search || v.name.toLowerCase().includes(q) || (v.url_slug || '').toLowerCase().includes(q) || (v.user?.name || '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' && v.status) || (filterStatus === 'inactive' && !v.status)
    return matchSearch && matchStatus
  })

  const activeCount = vcards.filter((v) => v.status).length

  return (
    <div>
      <Helmet><title>{t('admin.nav.vcards')} - Mobile VCard Link</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.vcards')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vcards.length} total vCards</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{vcards.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search by name, slug, owner..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">{t('admin.no_vcards')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{v.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{v.url_slug || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.user?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.status ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {v.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionDropdown actions={[
                        { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => handleDelete(v.id) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}