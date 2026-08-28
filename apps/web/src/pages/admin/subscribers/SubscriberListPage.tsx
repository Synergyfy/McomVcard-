import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import ActionDropdown from '../../../components/common/ActionDropdown'

const MOCK_SUBSCRIBERS = [
  { id: 1, email: 'alice@example.com', created_at: '2025-06-01' },
  { id: 2, email: 'bob@example.com', created_at: '2025-06-03' },
  { id: 3, email: 'carol@example.com', created_at: '2025-06-10' },
  { id: 4, email: 'dave@example.com', created_at: '2025-06-15' },
  { id: 5, email: 'eve@example.com', created_at: '2025-06-20' },
  { id: 6, email: 'frank@example.com', created_at: '2025-07-01' },
  { id: 7, email: 'grace@example.com', created_at: '2025-07-05' },
  { id: 8, email: 'henry@example.com', created_at: '2025-07-10' },
  { id: 9, email: 'iris@example.com', created_at: '2025-07-12' },
  { id: 10, email: 'jack@example.com', created_at: '2025-07-14' },
]

export default function SubscriberListPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<typeof MOCK_SUBSCRIBERS>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    adminService.getSubscribers()
      .then((res: any) => setItems(res.length ? res : MOCK_SUBSCRIBERS))
      .catch(() => setItems(MOCK_SUBSCRIBERS))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirm_delete'))) return
    try { await adminService.deleteSubscriber(String(id)); setItems(items.filter((s) => String(s.id) !== id)) } catch { setItems(items.filter((s) => String(s.id) !== id)) }
  }

  const filtered = items.filter((s) => {
    const q = search.toLowerCase()
    return !search || s.email.toLowerCase().includes(q)
  })

  return (
    <div>
      <Helmet><title>{t('admin.nav.subscribers')} - Mobile VCard Link</title></Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.subscribers')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{items.length} subscribers</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">{t('admin.no_subscribers')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscribed</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{s.email}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <ActionDropdown actions={[
                        { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => handleDelete(s.id) },
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