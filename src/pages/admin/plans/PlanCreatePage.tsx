import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import InputField from '../../../components/auth/InputField'
import type { Currency } from '../../../types'
import { mockCurrencies } from '../../../services/mockData'

const featureGroups = [
  {
    label: 'Content & Media',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    features: [
      { key: 'products_services', label: 'Products & Services' },
      { key: 'testimonials', label: 'Testimonials' },
      { key: 'products', label: 'Products Showcase' },
      { key: 'gallery', label: 'Gallery' },
      { key: 'blog', label: 'Blog' },
    ],
  },
  {
    label: 'Customization',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    features: [
      { key: 'hide_branding', label: 'Hide Branding' },
      { key: 'custom_css', label: 'Custom CSS' },
      { key: 'custom_js', label: 'Custom JavaScript' },
      { key: 'custom_fonts', label: 'Custom Fonts' },
    ],
  },
  {
    label: 'Business Tools',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    features: [
      { key: 'appointments', label: 'Appointments' },
      { key: 'enquiry_form', label: 'Enquiry Form' },
      { key: 'password', label: 'Password Protection' },
      { key: 'analytics', label: 'Analytics Dashboard' },
      { key: 'seo', label: 'SEO Tools' },
    ],
  },
  {
    label: 'Marketing & Growth',
    icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z',
    features: [
      { key: 'social_links', label: 'Social Links' },
      { key: 'affiliation', label: 'Affiliate Program' },
      { key: 'custom_qrcode', label: 'Custom QR Code' },
    ],
  },
]

const allFeatureKeys = featureGroups.flatMap((g) => g.features.map((f) => f.key))

export default function PlanCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [form, setForm] = useState({
    name: '', currency_id: 3, price: 0, frequency: 1, is_default: 0,
    trial_days: 0, no_of_vcards: 0, status: 1,
  })
  const [features, setFeatures] = useState<Record<string, boolean>>(
    Object.fromEntries(allFeatureKeys.map((k) => [k, false]))
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    adminService.getAllCurrencies().then(setCurrencies).catch(() => setCurrencies(mockCurrencies))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    setLoading(true)
    try {
      await adminService.createPlan({
        ...form,
        currency_id: Number(form.currency_id),
        plan_feature: Object.fromEntries(
          Object.entries(features).map(([k, v]) => [k, v ? 1 : 0])
        ) as any,
      })
      navigate('/admin/plans')
    } catch (err: any) {
      setServerError(err?.response?.data?.message || t('admin.error_occurred'))
      if (err?.response?.data?.errors) {
        const fe: Record<string, string> = {}
        for (const [k, msgs] of Object.entries(err.response.data.errors))
          fe[k] = (msgs as string[])[0]
        setErrors(fe)
      }
    } finally {
      setLoading(false)
    }
  }

  const currencyIcon = currencies.find((c) => c.id === form.currency_id)?.currency_icon || '£'
  const enabledCount = Object.values(features).filter(Boolean).length

  return (
    <div>
      <Helmet><title>{t('admin.add_plan')} - Mobile VCard Link</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/plans" className="hover:text-orange-600 transition-colors">{t('admin.nav.plans')}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">Create Plan</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('admin.add_plan')}</h1>

            {serverError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{serverError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  Basic Information
                </h3>
                <InputField label={t('admin.name')} value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.currency')}</label>
                    <select value={form.currency_id} onChange={(e) => setForm({ ...form, currency_id: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                      {currencies.map((c) => (
                        <option key={c.id} value={c.id}>{c.currency_name} ({c.currency_icon})</option>
                      ))}
                    </select>
                    {errors.currency_id && <p className="text-xs text-red-500">{errors.currency_id}</p>}
                  </div>
                  <InputField label={`${t('admin.price')} (${currencyIcon})`} type="number" value={String(form.price)} error={errors.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
              </div>

              {/* Billing Settings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  Billing Settings
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.frequency')}</label>
                    <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value={1}>{t('pricing.monthly')}</option>
                      <option value={2}>{t('pricing.yearly')}</option>
                    </select>
                  </div>
                  <InputField label={t('admin.trial_days')} type="number" value={String(form.trial_days)} error={errors.trial_days} onChange={(e) => setForm({ ...form, trial_days: Number(e.target.value) })} />
                </div>
                <div className="mt-3">
                  <InputField label={t('admin.max_vcards')} type="number" value={String(form.no_of_vcards)} error={errors.no_of_vcards} onChange={(e) => setForm({ ...form, no_of_vcards: Number(e.target.value) })} />
                  <p className="text-xs text-gray-400 mt-1">Use -1 for unlimited vCards</p>
                </div>
                <div className="flex gap-6 mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <input type="checkbox" checked={form.is_default === 1} onChange={(e) => setForm({ ...form, is_default: e.target.checked ? 1 : 0 })} className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    {t('admin.default_plan')}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <input type="checkbox" checked={form.status === 1} onChange={(e) => setForm({ ...form, status: e.target.checked ? 1 : 0 })} className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    {t('admin.active')}
                  </label>
                </div>
              </div>

              {/* Feature Groups */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  Plan Features
                  <span className="text-xs font-normal text-gray-400 ml-auto">{enabledCount} of {allFeatureKeys.length} enabled</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featureGroups.map((group) => (
                    <div key={group.label} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={group.icon} />
                        </svg>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{group.label}</h4>
                      </div>
                      <div className="space-y-2">
                        {group.features.map((f) => (
                          <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={features[f.key] || false}
                              onChange={(e) => setFeatures({ ...features, [f.key]: e.target.checked })}
                              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{f.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Create Plan</>
                  )}
                </button>
                <button type="button" onClick={() => navigate('/admin/plans')} className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {t('admin.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Live Preview</h3>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <h2 className="text-xl font-bold mb-1">{form.name || 'Plan Name'}</h2>
                <p className="text-orange-100 text-xs mb-4">
                  {form.frequency <= 1 ? 'Monthly' : 'Yearly'} billing
                  {form.trial_days > 0 && ` · ${form.trial_days}-day trial`}
                </p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-extrabold">{currencyIcon}{form.price || '0'}</span>
                  <span className="text-orange-100 text-sm mb-1">/{form.frequency <= 1 ? 'mo' : 'yr'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-orange-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {enabledCount} features included
                </div>
                {form.no_of_vcards !== 0 && (
                  <div className="flex items-center gap-2 text-xs text-orange-100 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>
                    {form.no_of_vcards === -1 ? 'Unlimited vCards' : `Up to ${form.no_of_vcards} vCards`}
                  </div>
                )}
              </div>
            </div>
            {/* Feature Summary */}
            <div className="mt-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Enabled Features</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(features).filter(([, v]) => v).map(([k]) => (
                  <span key={k} className="px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded text-[11px] font-medium">
                    {featureGroups.flatMap((g) => g.features).find((f) => f.key === k)?.label || k}
                  </span>
                ))}
                {enabledCount === 0 && <span className="text-xs text-gray-400">No features selected</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
