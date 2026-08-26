import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import AuthLayout from '../../components/auth/AuthLayout'
import InputField from '../../components/auth/InputField'
import ConsumerPathNote from '../../components/auth/ConsumerPathNote'
import { useAuth } from '../../contexts/AuthContext'
import { consumerService } from '../../services/consumer'
import { inviteQuery } from '../../utils/inviteContext'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const ctx = inviteQuery(searchParams.get('card'), searchParams.get('business'))

  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.email) errs.email = t('auth.validation.email_required')
    if (!form.password) errs.password = t('auth.validation.password_required')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      await login(form)
      const card = searchParams.get('card')
      if (card) {
        const business = searchParams.get('business') || undefined
        await consumerService.associateCard(card, business)
        const existing = await consumerService.getProfileByEmail(form.email)
        if (existing) {
          navigate('/c/dashboard')
        } else {
          navigate(`/c/setup?card=${encodeURIComponent(card)}&business=${encodeURIComponent(business || '')}`)
        }
      } else {
        navigate('/b/dashboard')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('auth.errors.login_failed')
      setServerError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.login_title')} subtitle={t('auth.login_subtitle')}>
      <Helmet>
        <title>{t('auth.login_title')} - Mobile VCard Link</title>
      </Helmet>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ConsumerPathNote />

        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <InputField
          label={t('auth.email')}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <InputField
          label={t('auth.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
              {showPassword ? (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {t('auth.remember_me')}
          </label>
          <Link to={`/forgot-password${ctx}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            {t('auth.forgot_password')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md hover:shadow-blue-200"
        >
          {loading ? t('common.loading') : t('auth.login_button')}
        </button>
      </form>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-400">Demo Login</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all hover:shadow-md hover:shadow-purple-200"
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => navigate('/b/dashboard')}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all hover:shadow-md hover:shadow-blue-200"
        >
          Business
        </button>
        <button
          type="button"
          onClick={() => navigate('/c/dashboard')}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all hover:shadow-md hover:shadow-emerald-200"
        >
          Consumer
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        {t('auth.no_account')}{' '}
        <Link to={`/register${ctx}`} className="text-blue-600 hover:text-blue-700 font-medium">
          {t('auth.sign_up')}
        </Link>
      </p>
    </AuthLayout>
  )
}
