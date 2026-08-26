import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../../../services/user'
import InputField from '../../../components/auth/InputField'
import type { SocialLink } from '../../../types'

interface Props { vcardId: number }

export default function VCardEditSocialTab({ vcardId }: Props) {
  const { t } = useTranslation()
  const [links, setLinks] = useState<SocialLink>({} as SocialLink)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    userService.getSocialLinks(vcardId)
      .then(setLinks)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [vcardId])

  const socialFields: { key: keyof SocialLink; label: string }[] = [
    { key: 'whatsapp_number', label: 'WhatsApp Number' },
    { key: 'whatsapp_url', label: 'WhatsApp URL' },
    { key: 'instagram_url', label: 'Instagram' },
    { key: 'facebook_url', label: 'Facebook' },
    { key: 'twitter_url', label: 'Twitter / X' },
    { key: 'linkedin_url', label: 'LinkedIn' },
    { key: 'youtube_url', label: 'YouTube' },
    { key: 'tiktok_url', label: 'TikTok' },
    { key: 'telegram', label: 'Telegram' },
    { key: 'snapchat', label: 'Snapchat' },
    { key: 'website_url', label: 'Website' },
  ]

  const handleSave = async () => {
    setMessage(''); setSaving(true)
    try {
      await userService.updateSocialLinks(vcardId, links)
      setMessage(t('user.saved'))
    } catch {} finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('user.tab_social')}</h2>
      {message && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">{message}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {socialFields.map((field) => (
          <InputField key={field.key} label={field.label} value={(links as any)[field.key] || ''} onChange={(e) => setLinks({ ...links, [field.key]: e.target.value })} />
        ))}
      </div>
      <button onClick={handleSave} disabled={saving} className="mt-4 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
        {saving ? t('common.loading') : t('user.save')}
      </button>
    </div>
  )
}
