import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

export default function Newsletter() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      await api.post('/email-sub', { email })
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">{t('newsletter.title')}</h2>
        <p className="text-blue-100 mb-8 max-w-lg mx-auto">{t('newsletter.subtitle')}</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletter.email')}
            className="flex-1 px-4 py-3 rounded-lg border-0 outline-none text-gray-900"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-70"
          >
            {status === 'loading' ? '...' : t('newsletter.subscribe')}
          </button>
        </form>
        {status === 'success' && (
          <p className="text-green-200 mt-4">{t('newsletter.success')}</p>
        )}
        {status === 'error' && (
          <p className="text-red-300 mt-4">{t('newsletter.error')}</p>
        )}
      </div>
    </section>
  )
}
