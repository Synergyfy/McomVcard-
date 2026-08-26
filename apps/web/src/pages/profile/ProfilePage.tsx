import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/auth'
import InputField from '../../components/auth/InputField'
import ChangePasswordSection from './ChangePasswordSection'

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, updateUser } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contact: user?.contact || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email, contact: user.contact || '' })
    }
  }, [user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)
    try {
      const updated = await authService.updateProfile({
        name: form.name,
        email: form.email,
        contact: form.contact || undefined,
        profile_image: fileRef.current?.files?.[0] || null,
      })
      updateUser(updated)
      setMessage(t('auth.profile_updated'))
    } catch (err: any) {
      setError(err?.response?.data?.message || t('auth.errors.update_failed'))
      if (err?.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {}
        for (const [key, msgs] of Object.entries(err.response.data.errors)) {
          fieldErrors[key] = (msgs as string[])[0]
        }
        setErrors(fieldErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = async (lang: string) => {
    try {
      await authService.updateLanguage(lang)
      i18n.changeLanguage(lang)
      if (user) updateUser({ ...user, language: lang as any })
    } catch {
      // silently fail
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>{t('auth.profile_title')} - Mobile VCard Link</title>
      </Helmet>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('auth.profile_title')}</h1>

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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('auth.profile_info')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover" />
              ) : user?.profile_image ? (
                <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {t('auth.change_photo')}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          <InputField
            label={t('auth.name')}
            type="text"
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <InputField
            label={t('auth.email')}
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <InputField
            label={t('auth.contact')}
            type="text"
            value={form.contact}
            error={errors.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder="+1 234 567 8900"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? t('common.loading') : t('auth.save_changes')}
          </button>
        </form>
      </div>

      <ChangePasswordSection />

      {/* Language preference */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('auth.preferred_language')}</h2>
        <select
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="pt">Português</option>
          <option value="ru">Русский</option>
          <option value="tr">Türkçe</option>
          <option value="zh">中文</option>
        </select>
      </div>
    </div>
  )
}
