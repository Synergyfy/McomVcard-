import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../../../services/user'

interface Props { vcardId: number }

export default function VCardEditPasswordTab({ vcardId }: Props) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)

  const handleSet = async () => {
    if (!password) return
    setMessage(''); setError(''); setLoading(true)
    try {
      await userService.updatePassword(vcardId, password)
      setMessage(t('user.password_set')); setHasPassword(true); setPassword('')
    } catch (err: any) {
      setError(err?.response?.data?.message || t('user.error_occurred'))
    } finally { setLoading(false) }
  }

  const handleRemove = async () => {
    if (!confirm(t('user.confirm_remove_password'))) return
    setLoading(true)
    try { await userService.removePassword(vcardId); setHasPassword(false); setMessage(t('user.password_removed')) } catch {} finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('user.tab_password')}</h2>
      {message && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">{message}</div>}
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}

      <p className="text-sm text-gray-500 mb-4">{t('user.password_help')}</p>
      <div className="flex gap-3 max-w-md">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('user.enter_password')} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        <button onClick={handleSet} disabled={loading || !password} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? t('common.loading') : t('user.set_password')}
        </button>
      </div>
      {hasPassword && (
        <button onClick={handleRemove} className="mt-3 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
          {t('user.remove_password')}
        </button>
      )}
    </div>
  )
}
