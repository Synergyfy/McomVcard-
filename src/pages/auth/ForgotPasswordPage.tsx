import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import AuthLayout from '../../components/auth/AuthLayout'
import InputField from '../../components/auth/InputField'
import { authService } from '../../services/auth'
import { inviteQuery } from '../../utils/inviteContext'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const ctx = inviteQuery(searchParams.get('card'), searchParams.get('business'))
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email) {
      setError(t('auth.validation.email_required'))
      return
    }
    setLoading(true)
    try {
      const res = await authService.forgotPassword({ email })
      setMessage(res.message)
    } catch (err: any) {
      setError(err?.response?.data?.message || t('auth.errors.reset_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.forgot_title')} subtitle={t('auth.forgot_subtitle')}>
      <Helmet>
        <title>{t('auth.forgot_title')} - Mobile VCard Link</title>
      </Helmet>

      {message ? (
        <div className="text-center space-y-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
            {message}
          </div>
          <Link to={`/login${ctx}`} className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium">
            {t('auth.back_to_login')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}

          <p className="text-sm text-gray-500">{t('auth.forgot_instructions')}</p>

          <InputField
            label={t('auth.email')}
            type="email"
            placeholder="you@example.com"
            value={email}
            error={error}
            onChange={(e) => setEmail(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md hover:shadow-blue-200"
          >
            {loading ? t('common.loading') : t('auth.send_reset_link')}
          </button>

          <p className="text-center">
            <Link to={`/login${ctx}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t('auth.back_to_login')}
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
