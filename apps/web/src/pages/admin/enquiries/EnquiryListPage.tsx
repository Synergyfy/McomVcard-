import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import type { Enquiry } from '../../../types'
import ActionDropdown from '../../../components/common/ActionDropdown'

const MOCK_ENQUIRIES: Enquiry[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', subject: 'Pricing Question', message: 'Hi, I am interested in the Pro plan. Can you tell me more about the features included?', created_at: '2025-07-12' },
  { id: '2', name: 'Maria Santos', email: 'maria@example.com', subject: 'Partnership', message: 'We would like to partner with Mobile VCard Link for our business event. Please reach out.', created_at: '2025-07-11' },
  { id: '3', name: 'Alex Kim', email: 'alex@example.com', subject: 'Feature Request', message: 'It would be great to have QR code analytics in the dashboard. Any plans for this?', created_at: '2025-07-10' },
  { id: '4', name: 'Sophie Martin', email: 'sophie@example.com', subject: 'Account Issue', message: 'I am unable to log into my account after resetting my password. Can you help?', created_at: '2025-07-09' },
  { id: '5', name: 'Carlos Rivera', email: 'carlos@example.com', subject: 'Refund Request', message: 'I was charged twice for my subscription. Please process a refund for the duplicate.', created_at: '2025-07-08' },
  { id: '6', name: 'Priya Patel', email: 'priya@example.com', subject: 'General Inquiry', message: 'Do you support custom domains for vCards?', created_at: '2025-07-07' },
]

export default function EnquiryListPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    adminService.getEnquiries()
      .then((res) => setItems(res.length ? res : MOCK_ENQUIRIES))
      .catch(() => setItems(MOCK_ENQUIRIES))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirm_delete'))) return
    try { await adminService.deleteEnquiry(String(id)); setItems(items.filter((e) => String(e.id) !== id)); if (selected?.id === id) setSelected(null) } catch { setItems(items.filter((e) => String(e.id) !== id)); if (selected?.id === id) setSelected(null) }
  }

  const filtered = items.filter((e) => {
    const q = search.toLowerCase()
    return !search || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.subject || '').toLowerCase().includes(q) || e.message.toLowerCase().includes(q)
  })

  return (
    <div>
      <Helmet><title>{t('admin.nav.enquiries')} - Mobile VCard Link</title></Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.enquiries')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{items.length} enquiries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search enquiries..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">{t('admin.no_enquiries')}</div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((e) => (
                  <div key={e.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors ${selected?.id === e.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`} onClick={() => setSelected(e)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{e.name}</p>
                        <p className="text-xs text-gray-400">{e.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{new Date(e.created_at).toLocaleDateString()}</span>
                        <ActionDropdown actions={[
                          { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => handleDelete(e.id) },
                        ]} />
                      </div>
                    </div>
                    {e.subject && <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">{e.subject}</p>}
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{e.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selected && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enquiry Detail</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium text-gray-700 dark:text-gray-300">Name:</span> <span className="text-gray-600 dark:text-gray-400">{selected.name}</span></div>
              <div><span className="font-medium text-gray-700 dark:text-gray-300">Email:</span> <span className="text-gray-600 dark:text-gray-400">{selected.email}</span></div>
              {selected.subject && <div><span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span> <span className="text-gray-600 dark:text-gray-400">{selected.subject}</span></div>}
              <div><span className="font-medium text-gray-700 dark:text-gray-300">Message:</span></div>
              <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 whitespace-pre-wrap">{selected.message}</p>
              <div className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}