import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../../../services/user'
import InputField from '../../../components/auth/InputField'
import type { VCard } from '../../../types'

interface Props { vcard: VCard; onUpdate: (v: VCard) => void }

export default function VCardEditInfoTab({ vcard, onUpdate }: Props) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: vcard.name, url_slug: vcard.url_slug, occupation: vcard.occupation || '',
    description: vcard.description || '', email: vcard.email || '',
    phone: vcard.phone || '', location: vcard.location || '', website: vcard.website || '',
    status: vcard.status,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(''); setError(''); setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      if (fileRef.current?.files?.[0]) fd.append('profile_image', fileRef.current.files[0])
      const updated = await userService.updateVcard(vcard.id, fd)
      onUpdate(updated)
      setMessage(t('user.saved'))
    } catch (err: any) {
      setError(err?.response?.data?.message || t('user.error_occurred'))
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('user.tab_info')}</h2>
      {message && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">{message}</div>}
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
            {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : vcard.profile_image ? <img src={vcard.profile_image} alt="" className="w-full h-full object-cover" /> : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
            {t('user.change_photo')}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            if (e.target.files?.[0]) setPreview(URL.createObjectURL(e.target.files[0]))
          }} />
        </div>
        <InputField label={t('user.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <InputField label={t('user.url_slug')} value={form.url_slug} onChange={(e) => setForm({ ...form, url_slug: e.target.value })} />
        <InputField label={t('user.occupation')} value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">{t('user.description')}</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label={t('user.email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <InputField label={t('user.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label={t('user.location')} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <InputField label={t('user.website')} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={form.status === 1} onChange={(e) => setForm({ ...form, status: e.target.checked ? 1 : 0 })} className="rounded border-gray-300 text-blue-600" />
          {t('user.active')}
        </label>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? t('common.loading') : t('user.save')}
        </button>
      </form>
    </div>
  )
}
