import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/auth'
import InputField from '../../components/auth/InputField'

export default function ChangePasswordSection() {
  const { t } = useTranslation()

  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.current_password) errs.current_password = t('auth.validation.current_password_required')
    if (!form.password) errs.password = t('auth.validation.password_required')
    else if (form.password.length < 8) errs.password = t('auth.validation.password_min')
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = t('auth.validation.password_mismatch')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const res = await authService.changePassword(form)
      setMessage(res.message)
      setForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err: any) {
      setError(err?.response?.data?.message || t('auth.errors.password_change_failed'))
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('auth.change_password')}</h2>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <InputField
          label={t('auth.current_password')}
          type="password"
          placeholder="••••••••"
          value={form.current_password}
          error={errors.current_password}
          onChange={(e) => setForm({ ...form, current_password: e.target.value })}
        />

        <InputField
          label={t('auth.new_password')}
          type="password"
          placeholder="••••••••"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <InputField
          label={t('auth.confirm_new_password')}
          type="password"
          placeholder="••••••••"
          value={form.password_confirmation}
          error={errors.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? t('common.loading') : t('auth.update_password')}
        </button>
      </form>
    </div>
  )
}
