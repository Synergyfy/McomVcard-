import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import AuthLayout from '../../components/auth/AuthLayout'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { loginWithMcom } = useAuth()

  const [mcomLoading, setMcomLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleMcomLogin = async () => {
    setMcomLoading(true)
    setServerError('')
    try {
      await loginWithMcom({
        card: searchParams.get('card') || undefined,
        business: searchParams.get('business') || undefined,
      })
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('auth.errors.login_failed')
      setServerError(msg)
      setMcomLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.login_title')} subtitle={t('auth.login_subtitle')}>
      <Helmet>
        <title>{t('auth.login_title')} - Mobile VCard Link</title>
      </Helmet>

      {serverError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 mb-6">
          {serverError}
        </div>
      )}

      <button
        type="button"
        onClick={handleMcomLogin}
        disabled={mcomLoading}
        className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-base font-bold rounded-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md hover:shadow-blue-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        {mcomLoading ? t('common.loading') : t('auth.login_with_mcom')}
      </button>

      <p className="text-center text-sm text-gray-500 mt-6">
        {t('auth.no_account')}{' '}
        <button
          onClick={() => loginWithMcom({ card: searchParams.get('card') || undefined, business: searchParams.get('business') || undefined })}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {t('auth.sign_up')}
        </button>
      </p>
    </AuthLayout>
  )
}
