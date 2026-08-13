import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import AuthLayout from '../../components/auth/AuthLayout'
import InputField from '../../components/auth/InputField'
import { authService } from '../../services/auth'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.email) errs.email = t('auth.validation.email_required')
    if (!form.password) errs.password = t('auth.validation.password_required')
    else if (form.password.length < 8) errs.password = t('auth.validation.password_min')
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = t('auth.validation.password_mismatch')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    const token = searchParams.get('token')
    if (!token) {
      setServerError(t('auth.errors.invalid_reset_token'))
      return
    }
    if (!validate()) return
    setLoading(true)
    try {
      await authService.resetPassword({ ...form, token })
      navigate('/login')
    } catch (err: any) {
      setServerError(err?.response?.data?.message || t('auth.errors.reset_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.reset_title')} subtitle={t('auth.reset_subtitle')}>
      <Helmet>
        <title>{t('auth.reset_title')} - Mobile VCard Link</title>
      </Helmet>

      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <InputField
          label={t('auth.email')}
          type="email"
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
          label={t('auth.new_password')}
          type="password"
          placeholder="••••••••"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        <InputField
          label={t('auth.confirm_new_password')}
          type="password"
          placeholder="••••••••"
          value={form.password_confirmation}
          error={errors.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md hover:shadow-blue-200"
        >
          {loading ? t('common.loading') : t('auth.reset_button')}
        </button>

        <p className="text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            {t('auth.back_to_login')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
