import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import type { AboutUs } from '../../../types'

export default function AboutUsListPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<AboutUs[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<AboutUs | null>(null)
  const [form, setForm] = useState({ title: '', description: '', about_url: '' })
  const [message, setMessage] = useState('')

  const fetch = () => {
    setLoading(true)
    adminService.getAboutUs().then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const startEdit = (item: AboutUs) => {
    setEditing(item)
    setForm({ title: item.title, description: item.description, about_url: item.about_url || '' })
  }

  const cancelEdit = () => { setEditing(null); setForm({ title: '', description: '', about_url: '' }) }

  const handleSave = async () => {
    if (!editing) return
    setMessage('')
    try {
      await adminService.updateAboutUs(String(editing.id), form)
      setMessage(t('admin.saved'))
      cancelEdit()
      fetch()
    } catch {}
  }

  return (
    <div>
      <Helmet><title>{t('admin.nav.about_us')} - Mobile VCard Link</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.nav.about_us')}</h1>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">{message}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              {editing?.id === item.id ? (
                <div className="space-y-4 max-w-lg">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('admin.title')} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('admin.description')} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                  <input value={form.about_url} onChange={(e) => setForm({ ...form, about_url: e.target.value })} placeholder={t('admin.url')} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  <div className="flex gap-3">
                    <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">{t('admin.save')}</button>
                    <button onClick={cancelEdit} className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">{t('admin.cancel')}</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    {item.about_url && (
                      <a href={item.about_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-1 inline-block">{item.about_url}</a>
                    )}
                  </div>
                  <button onClick={() => startEdit(item)} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 shrink-0">{t('admin.edit')}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
