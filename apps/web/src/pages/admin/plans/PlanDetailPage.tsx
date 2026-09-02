import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import type { Plan } from '../../../types'

const featureGroups = [
  {
    label: 'Content & Media',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    features: ['products_services', 'testimonials', 'products', 'gallery', 'blog'],
  },
  {
    label: 'Customization',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    features: ['hide_branding', 'custom_css', 'custom_js', 'custom_fonts'],
  },
  {
    label: 'Business Tools',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    features: ['appointments', 'enquiry_form', 'password', 'analytics', 'seo'],
  },
  {
    label: 'Marketing & Growth',
    icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z',
    features: ['social_links', 'affiliation', 'custom_qrcode'],
  },
]

const allFeatures: Record<string, string> = {
  products_services: 'Products & Services',
  testimonials: 'Testimonials',
  hide_branding: 'Hide Branding',
  enquiry_form: 'Enquiry Form',
  social_links: 'Social Links',
  password: 'Password Protection',
  custom_css: 'Custom CSS',
  custom_js: 'Custom JavaScript',
  custom_fonts: 'Custom Fonts',
  products: 'Products Showcase',
  appointments: 'Appointments',
  gallery: 'Gallery',
  analytics: 'Analytics Dashboard',
  seo: 'SEO Tools',
  blog: 'Blog',
  affiliation: 'Affiliate Program',
  custom_qrcode: 'Custom QR Code',
}

export default function PlanDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!id) return
    adminService.getPlan(String(id))
      .then(setPlan)
      .catch(() => navigate('/admin/plans'))
      .finally(() => setLoading(false))
  }, [id])

  const handleToggleStatus = async () => {
    if (!plan) return
    setToggling(true)
    try {
      await adminService.updatePlan(String(plan.id), { ...plan, status: plan.status ? 0 : 1 })
      setPlan({ ...plan, status: plan.status ? 0 : 1 })
      t(plan.status === 0 ? 'admin.plan_activated' : 'admin.plan_deactivated')
    } catch { /* ignore */ }
    setToggling(false)
  }

  const handleDuplicate = async () => {
    if (!plan) return
    try {
      const newPlan = await adminService.createPlan({
        ...plan,
        id: undefined,
        name: `${plan.name} (Copy)`,
        is_default: 0,
        status: 0,
      })
      navigate(`/admin/plans/${newPlan.id}/edit`)
    } catch { /* ignore */ }
  }

  const handleDelete = async () => {
    if (!plan || !confirm(t('admin.confirm_delete'))) return
    try {
      await adminService.deletePlan(String(plan.id))
      navigate('/admin/plans')
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!plan) return null

  const currencyIcon = plan.currency?.currency_icon || '£'
  const enabledFeatures = plan.plan_feature
    ? Object.entries(plan.plan_feature).filter(([k, v]) => k !== 'id' && k !== 'plan_id' && v === 1).map(([k]) => k)
    : []
  const totalFeatures = Object.keys(allFeatures).length
  const enabledCount = enabledFeatures.length

  return (
    <div className="max-w-4xl">
      <Helmet><title>{plan.name} - Plans - Mobile VCard Link</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/plans" className="hover:text-orange-600 transition-colors">{t('admin.nav.plans')}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">{plan.name}</span>
      </div>

      {/* Plan Header Card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{plan.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${plan.status ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}>
                  {plan.status ? 'Active' : 'Inactive'}
                </span>
                {plan.is_default === 1 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">Default</span>
                )}
              </div>
              <p className="text-orange-100 text-sm">
                {plan.frequency <= 1 ? 'Monthly' : 'Yearly'} billing · {plan.no_of_vcards === -1 ? 'Unlimited vCards' : `Up to ${plan.no_of_vcards} vCards`}
                {plan.trial_days > 0 && ` · ${plan.trial_days}-day free trial`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-extrabold">{currencyIcon}{plan.price}</div>
              <p className="text-orange-100 text-sm">/{plan.frequency <= 1 ? 'month' : 'year'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Features Enabled</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{enabledCount}/{totalFeatures}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Max vCards</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{plan.no_of_vcards === -1 ? '∞' : plan.no_of_vcards}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Trial Period</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{plan.trial_days > 0 ? `${plan.trial_days}d` : 'None'}</p>
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Feature Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featureGroups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={group.icon} />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{group.label}</h3>
              </div>
              <div className="space-y-2 ml-10">
                {group.features.map((fk) => {
                  const enabled = enabledFeatures.includes(fk)
                  return (
                    <div key={fk} className="flex items-center gap-2.5">
                      {enabled ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      <span className={`text-sm ${enabled ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                        {allFeatures[fk] || fk}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to={`/admin/plans/${plan.id}/edit`}
          className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Edit Plan
        </Link>
        <button
          onClick={handleDuplicate}
          className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          Duplicate
        </button>
        <button
          onClick={handleToggleStatus}
          disabled={toggling}
          className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            plan.status
              ? 'border border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20'
              : 'border border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20'
          }`}
        >
          {plan.status ? (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>Deactivate</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Activate</>
          )}
        </button>
        <button
          onClick={handleDelete}
          className="px-5 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 ml-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Delete
        </button>
      </div>
    </div>
  )
}
