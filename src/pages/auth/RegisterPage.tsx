import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import AuthLayout from '../../components/auth/AuthLayout'
import InputField from '../../components/auth/InputField'
import SocialLoginButtons from '../../components/auth/SocialLoginButtons'
import { useAuth } from '../../contexts/AuthContext'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register } = useAuth()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    referral_code: searchParams.get('ref') || '',
    accept_terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.first_name.trim()) errs.first_name = t('auth.validation.first_name_required')
    if (!form.last_name.trim()) errs.last_name = t('auth.validation.last_name_required')
    if (!form.email) errs.email = t('auth.validation.email_required')
    if (!form.password) errs.password = t('auth.validation.password_required')
    else if (form.password.length < 8) errs.password = t('auth.validation.password_min')
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = t('auth.validation.password_mismatch')
    if (!form.accept_terms) errs.accept_terms = t('auth.validation.accept_terms')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      await register({
        name: `${form.first_name} ${form.last_name}`.trim(),
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        referral_code: form.referral_code || undefined,
      })
      navigate('/verify-email')
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('auth.errors.register_failed')
      setServerError(msg)
      if (err?.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {}
        for (const [key, msgs] of Object.entries(err.response.data.errors)) {
          fieldErrors[key] = (msgs as string[])[0]
        }
        setErrors((prev) => ({ ...prev, ...fieldErrors }))
      }
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )

  return (
    <AuthLayout title={t('auth.register_title')} subtitle={t('auth.register_subtitle')}>
      <Helmet>
        <title>{t('auth.register_title')} - Mobile VCard Link</title>
      </Helmet>

      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label={t('auth.first_name')}
            type="text"
            placeholder={t('auth.first_name_placeholder')}
            value={form.first_name}
            error={errors.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <InputField
            label={t('auth.last_name')}
            type="text"
            placeholder={t('auth.last_name_placeholder')}
            value={form.last_name}
            error={errors.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        </div>

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
              <EyeIcon open={showPassword} />
            </button>
          }
        />

        <InputField
          label={t('auth.confirm_password')}
          type={showConfirm ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.password_confirmation}
          error={errors.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          rightIcon={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
              <EyeIcon open={showConfirm} />
            </button>
          }
        />

        {form.referral_code && (
          <InputField
            label={t('auth.referral_code')}
            type="text"
            value={form.referral_code}
            error={errors.referral_code}
            onChange={(e) => setForm({ ...form, referral_code: e.target.value })}
          />
        )}

        <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={form.accept_terms}
            onChange={(e) => setForm({ ...form, accept_terms: e.target.checked })}
            className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            {t('auth.accept_terms')}{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">
              {t('auth.terms_of_service')}
            </Link>{' '}
            {t('auth.and')}{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
              {t('auth.privacy_policy')}
            </Link>
          </span>
        </label>
        {errors.accept_terms && <p className="text-xs text-red-500">{errors.accept_terms}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md hover:shadow-blue-200"
        >
          {loading ? t('common.loading') : t('auth.register_button')}
        </button>
      </form>

      <div className="mt-6">
        <SocialLoginButtons />
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        {t('auth.has_account')}{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          {t('auth.login')}
        </Link>
      </p>
    </AuthLayout>
  )
}
