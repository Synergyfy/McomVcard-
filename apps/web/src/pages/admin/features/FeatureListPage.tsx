import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import ActionDropdown from '../../../components/common/ActionDropdown'

const MOCK_FEATURES: any[] = [
  { id: 1, name: 'QR Code Generation', description: 'Generate unique QR codes for each vCard that link directly to your digital business card.' },
  { id: 2, name: 'Social Media Links', description: 'Add links to all your social media profiles including Instagram, LinkedIn, Twitter, and Facebook.' },
  { id: 3, name: 'Analytics Dashboard', description: 'Track views, clicks, and engagement with detailed analytics for each of your vCards.' },
  { id: 4, name: 'Custom Branding', description: 'Customize the look and feel of your vCard with your own colors, fonts, and logo.' },
  { id: 5, name: 'Multiple Templates', description: 'Choose from a wide variety of professionally designed templates for your vCard.' },
  { id: 6, name: 'Contact Sharing', description: 'Share your vCard with one tap via email, text message, or any messaging platform.' },
]

export default function FeatureListPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    adminService.getFrontFeatures()
      .then((res) => setItems(res.length ? res : MOCK_FEATURES))
      .catch(() => setItems(MOCK_FEATURES))
      .finally(() => setLoading(false))
  }, [])

  const startEdit = (item: any) => { setEditing(item); setForm({ name: item.name, description: item.description }) }
  const cancelEdit = () => { setEditing(null); setForm({ name: '', description: '' }) }

  const handleSave = async () => {
    try {
      if (editing && editing.id) await adminService.updateFrontFeature(String(editing.id), form)
      else await adminService.createFrontFeature(form)
      cancelEdit()
      adminService.getFrontFeatures().then(setItems).catch(() => {})
    } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirm_delete'))) return
    try { await adminService.deleteFrontFeature(String(id)); setItems(items.filter((i) => String(i.id) !== id)) } catch { setItems(items.filter((i) => String(i.id) !== id)) }
  }

  const filtered = items.filter((i) => {
    const q = search.toLowerCase()
    return !search || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
  })

  return (
    <div>
      <Helmet><title>{t('admin.nav.features')} - Mobile VCard Link</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.features')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} features</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing({ id: 0 })} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">{t('admin.add')}</button>
        )}
      </div>

      {editing && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editing.id ? 'Edit Feature' : 'Add Feature'}</h2>
          <div className="space-y-4 max-w-lg">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Feature name"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
            <div className="flex gap-3">
              <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Save</button>
              <button onClick={cancelEdit} className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search features..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">{t('admin.no_features')}</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.description}</p>
                </div>
                <div className="ml-4 shrink-0">
                  <ActionDropdown actions={[
                    { label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => startEdit(item) },
                    { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => handleDelete(item.id) },
                  ]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}