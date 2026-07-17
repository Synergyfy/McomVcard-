import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../../../services/user'
import type { VCardCustomization } from '../../../types'

interface Props { vcardId: number }

export default function VCardEditCustomizationTab({ vcardId }: Props) {
  const { t } = useTranslation()
  const [data, setData] = useState<VCardCustomization>({} as VCardCustomization)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    userService.getCustomization(vcardId).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [vcardId])

  const handleSave = async () => {
    setMessage(''); setSaving(true)
    try { await userService.updateCustomization(vcardId, data); setMessage(t('user.saved')) } catch {} finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('user.tab_customization')}</h2>
      {message && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">{message}</div>}
      <div className="space-y-4 max-w-2xl">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">{t('user.custom_css')}</label>
          <textarea value={data.custom_css || ''} onChange={(e) => setData({ ...data, custom_css: e.target.value })} rows={6} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-none" placeholder="/* Add custom CSS here */" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">{t('user.custom_js')}</label>
          <textarea value={data.custom_js || ''} onChange={(e) => setData({ ...data, custom_js: e.target.value })} rows={6} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-none" placeholder="// Add custom JS here" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">{t('user.custom_fonts')}</label>
          <input value={data.custom_fonts || ''} onChange={(e) => setData({ ...data, custom_fonts: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="https://fonts.googleapis.com/..." />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">{t('user.font_family')}</label>
          <input value={data.font_family || ''} onChange={(e) => setData({ ...data, font_family: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Arial, sans-serif" />
        </div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? t('common.loading') : t('user.save')}
        </button>
      </div>
    </div>
  )
}
