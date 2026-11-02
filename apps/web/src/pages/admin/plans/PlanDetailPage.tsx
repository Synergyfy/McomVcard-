import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { plansService, type Plan, type PlanPayload, type PlanVariantKey } from '../../../services/plans'
import { PLAN_CAPABILITY_LABELS } from '../../../services/planCapabilitySchema'

const VARIANT_ORDER: PlanVariantKey[] = ['standard', 'pro', 'pro_plus']

function capabilityLabel(key: string): string {
  return PLAN_CAPABILITY_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()).trim()
}

function quotaLabel(value: number | boolean): string {
  if (value === -1 || value === true) return 'Unlimited'
  if (value === false || value === 0) return 'Disabled'
  return String(value)
}

function currencySymbol(currency?: string): string {
  return currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'
}

function durationLabel(days: number): string {
  if (days >= 365 && days % 365 === 0) return days === 365 ? '1 year' : `${days / 365} years`
  return `${days} days`
}

export default function PlanDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    plansService
      .get(id)
      .then(setPlan)
      .catch(() => navigate('/admin/plans'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleToggleStatus = async () => {
    if (!plan) return
    try {
      const updated = await plansService.update(plan.id, {
        status: plan.status === 'active' ? 'inactive' : 'active',
      })
      setPlan(updated)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not update the plan.')
    }
  }

  const handleDuplicate = async () => {
    if (!plan) return
    const payload: PlanPayload = {
      name: `${plan.name} (Copy)`,
      description: plan.description,
      audience: plan.audience,
      level: plan.level ?? undefined,
      popular: false,
      isDefault: false,
      currency: plan.currency,
      status: 'inactive',
      type: plan.type,
      features: plan.features,
      rules: plan.rules,
      configuration: plan.configuration ?? undefined,
      variants: plan.variants.map((variant) => ({
        key: variant.key,
        price: variant.price,
        description: variant.description,
        features: variant.features ?? undefined,
        rules: variant.rules ?? undefined,
        configuration: variant.configuration ?? undefined,
        stripePriceId: variant.stripePriceId ?? undefined,
        paypalPlanId: variant.paypalPlanId ?? undefined,
        isActive: variant.isActive,
      })),
    }

    try {
      const created = await plansService.create(payload)
      navigate(`/admin/plans/${created.id}/edit`)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not duplicate the plan.')
    }
  }

  const handleDelete = async () => {
    if (!plan || !confirm(t('admin.confirm_delete'))) return
    try {
      await plansService.remove(plan.id)
      navigate('/admin/plans')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not delete the plan.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!plan) return null

  const symbol = currencySymbol(plan.currency)
  const orderedVariants = [...(plan.variants ?? [])].sort(
    (a, b) => VARIANT_ORDER.indexOf(a.key) - VARIANT_ORDER.indexOf(b.key),
  )
  const ruleLabels = plan.rules ?? []

  return (
    <div className="max-w-5xl">
      <Helmet><title>{plan.name} - Plans - Mobile VCard Link</title></Helmet>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/plans" className="hover:text-orange-600 transition-colors">{t('admin.nav.plans')}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">{plan.name}</span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{plan.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${plan.status === 'active' ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}>
                  {plan.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white capitalize">
                  {plan.audience}
                </span>
                {plan.isDefault && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">Default</span>
                )}
              </div>
              <p className="text-orange-100 text-sm max-w-2xl">{plan.description || 'No description'}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/admin/plans/${plan.id}/edit`}
                className="px-3 py-2 rounded-lg bg-white text-orange-600 text-xs font-bold hover:bg-orange-50 transition-colors"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDuplicate}
                className="px-3 py-2 rounded-lg bg-white/15 text-white text-xs font-bold hover:bg-white/25 transition-colors"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {orderedVariants.map((variant) => (
          <div key={variant.key} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{variant.name}</p>
                <p className="text-[11px] text-gray-400">{durationLabel(variant.durationDays)}</p>
              </div>
              {!variant.isActive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">Inactive</span>
              )}
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-3">
              {symbol}{variant.price.toLocaleString()}
            </p>
            <div className="mt-2 space-y-1 text-[11px] text-gray-500">
              {variant.description && <p className="text-gray-600 dark:text-gray-400">{variant.description}</p>}
            </div>
            {variant.configuration && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-[11px] text-gray-500 space-y-1">
                {Object.entries(variant.configuration.quotas ?? {}).map(([key, value]) => (
                  <div key={`q-${key}`} className="flex justify-between gap-2">
                    <span>{capabilityLabel(key)}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{quotaLabel(value)}</span>
                  </div>
                ))}
                {Object.entries(variant.configuration.featureFlags ?? {}).map(([key, value]) => (
                  <div key={`f-${key}`} className="flex justify-between gap-2">
                    <span>{capabilityLabel(key)}</span>
                    <span className={`font-medium ${value ? 'text-green-600' : 'text-gray-400'}`}>{value ? 'On' : 'Off'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Included features</h2>
          {(plan.features ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No features configured.</p>
          ) : (
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={`${feature.text}-${index}`} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>
                    {feature.text}
                    {feature.description && <span className="block text-[11px] text-gray-400">{feature.description}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Limits per variant</h2>
          {ruleLabels.length === 0 ? (
            <p className="text-sm text-gray-400">No limits configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="py-2 text-left font-semibold text-gray-500">Limit</th>
                    {VARIANT_ORDER.map((key) => (
                      <th key={key} className="py-2 text-left font-semibold text-gray-500 capitalize">{key.replace('_', ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ruleLabels.map((rule) => (
                    <tr key={rule.label} className="border-b border-gray-50 dark:border-gray-700/50">
                      <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                        {rule.label}
                        {rule.description && <span className="block text-[10px] text-gray-400">{rule.description}</span>}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">{rule.values?.Standard ?? rule.values?.Normal ?? '—'}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">{rule.values?.Pro ?? '—'}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">{rule.values?.['Pro+'] ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {plan.configuration && (
        <section className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Base entitlements</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-xs">
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Quotas</p>
              {Object.keys(plan.configuration.quotas ?? {}).length === 0 ? (
                <p className="text-gray-400">None</p>
              ) : (
                Object.entries(plan.configuration.quotas ?? {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50">
                    <span className="text-gray-500">{capabilityLabel(key)}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{quotaLabel(value)}</span>
                  </div>
                ))
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Feature flags</p>
              {Object.keys(plan.configuration.featureFlags ?? {}).length === 0 ? (
                <p className="text-gray-400">None</p>
              ) : (
                Object.entries(plan.configuration.featureFlags ?? {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50">
                    <span className="text-gray-500">{capabilityLabel(key)}</span>
                    <span className={`font-medium ${value ? 'text-green-600' : 'text-gray-400'}`}>{value ? 'On' : 'Off'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleStatus}
          className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {plan.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-5 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          Delete plan
        </button>
      </div>
    </div>
  )
}
