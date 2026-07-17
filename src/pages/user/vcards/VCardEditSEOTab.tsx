import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../../../services/user'
import InputField from '../../../components/auth/InputField'
import type { VCardSEO } from '../../../types'

interface Props { vcardId: number }

export default function VCardEditSEOTab({ vcardId }: Props) {
  const { t } = useTranslation()
  const [seo, setSeo] = useState<VCardSEO>({} as VCardSEO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    userService.getSEO(vcardId).then(setSeo).catch(() => {}).finally(() => setLoading(false))
  }, [vcardId])

  const handleSave = async () => {
    setMessage(''); setSaving(true)
    try { await userService.updateSEO(vcardId, seo); setMessage(t('user.saved')) } catch {} finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('user.tab_seo')}</h2>
      {message && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">{message}</div>}
      <div className="space-y-4 max-w-2xl">
        <InputField label={t('user.site_title')} value={seo.site_title || ''} onChange={(e) => setSeo({ ...seo, site_title: e.target.value })} />
        <InputField label={t('user.home_title')} value={seo.home_title || ''} onChange={(e) => setSeo({ ...seo, home_title: e.target.value })} />
        <InputField label={t('user.meta_keyword')} value={seo.meta_keyword || ''} onChange={(e) => setSeo({ ...seo, meta_keyword: e.target.value })} />
        <InputField label={t('user.meta_description')} value={seo.meta_description || ''} onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })} />
        <InputField label={t('user.google_analytics')} value={seo.google_analytics || ''} onChange={(e) => setSeo({ ...seo, google_analytics: e.target.value })} />
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? t('common.loading') : t('user.save')}
        </button>
      </div>
    </div>
  )
}
