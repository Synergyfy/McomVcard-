import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/auth'

export default function VerifyEmailPage() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [method, setMethod] = useState<'link' | 'token'>('link')

  const handleResend = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (method === 'token') {
        const res = await authService.sendVerificationToken()
        setMessage(res.message)
      } else {
        const res = await authService.resendVerification()
        setMessage(res.message)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || t('auth.errors.verification_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleTokenVerify = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await authService.verifyWithToken(token)
      setMessage(res.message)
    } catch (err: any) {
      setError(err?.response?.data?.message || t('auth.errors.invalid_token'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-gray-100 p-8 text-center">
        <Helmet>
          <title>{t('auth.verify_title')} - Mobile VCard Link</title>
        </Helmet>

        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900">{t('auth.verify_title')}</h1>
        <p className="text-sm text-gray-500 mt-2">
          {t('auth.verify_instructions')}{' '}
          <strong className="text-gray-700">{user?.email}</strong>
        </p>

        {message && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Method toggle */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setMethod('link')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
              method === 'link'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('auth.verify_link_method')}
          </button>
          <button
            onClick={() => setMethod('token')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
              method === 'token'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('auth.verify_token_method')}
          </button>
        </div>

        {method === 'token' && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t('auth.enter_verification_token')}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center tracking-widest"
              maxLength={6}
            />
            <button
              onClick={handleTokenVerify}
              disabled={loading || !token}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('auth.verify')}
            </button>
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={loading}
          className="mt-6 w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? t('common.loading') : t('auth.resend_verification')}
        </button>

        <button
          onClick={logout}
          className="mt-3 w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t('auth.sign_out')}
        </button>
      </div>
    </div>
  )
}
