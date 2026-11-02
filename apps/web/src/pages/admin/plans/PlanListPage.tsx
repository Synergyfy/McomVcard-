import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import ActionDropdown from '../../../components/common/ActionDropdown'
import { plansService, type Plan, type PlanPayload } from '../../../services/plans'

function currencySymbol(currency?: string): string {
  return currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'
}

export default function PlanListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [audience, setAudience] = useState<'all' | 'business' | 'consumer'>('all')
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    plansService
      .list()
      .then(setPlans)
      .catch(() => setError('Could not load plans. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirm_delete'))) return
    try {
      await plansService.remove(id)
      setPlans((current) => current.filter((plan) => plan.id !== id))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not delete the plan.')
    }
  }

  const handleToggleStatus = async (plan: Plan) => {
    const nextStatus = plan.status === 'active' ? 'inactive' : 'active'
    try {
      const updated = await plansService.update(plan.id, { status: nextStatus })
      setPlans((current) => current.map((item) => (item.id === plan.id ? updated : item)))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not update the plan.')
    }
  }

  const handleDuplicate = async (plan: Plan) => {
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
      setPlans((current) => [...current, created])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not duplicate the plan.')
    }
  }

  const filtered = plans.filter((plan) => {
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      plan.name.toLowerCase().includes(q) ||
      (plan.description ?? '').toLowerCase().includes(q)
    const matchAudience = audience === 'all' || plan.audience === audience
    return matchSearch && matchAudience
  })

  const activeCount = plans.filter((plan) => plan.status === 'active').length
  const businessCount = plans.filter((plan) => plan.audience === 'business').length
  const consumerCount = plans.filter((plan) => plan.audience === 'consumer').length

  return (
    <div>
      <Helmet><title>{t('admin.nav.plans')} - Mobile VCard Link</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.plans')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create any plan, then price its Standard, Pro and Pro+ variants.</p>
        </div>
        <Link
          to="/admin/plans/create"
          className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t('admin.add_plan')}
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total plans</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{plans.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Business / Consumer</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{businessCount} / {consumerCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as typeof audience)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none"
          >
            <option value="all">All audiences</option>
            <option value="business">Business</option>
            <option value="consumer">Consumer</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">{t('admin.no_plans')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Variants</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Audience</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((plan) => {
                  const symbol = currencySymbol(plan.currency)
                  return (
                    <tr
                      key={plan.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/plans/${plan.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {plan.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{plan.name}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-1 max-w-[260px]">
                              {plan.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(plan.variants ?? []).map((variant) => (
                            <span
                              key={variant.key}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                            >
                              {variant.name}: {symbol}{variant.price} / {variant.durationDays}d
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{plan.audience}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          plan.status === 'active'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {plan.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <ActionDropdown
                          actions={[
                            { label: 'View', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', onClick: () => navigate(`/admin/plans/${plan.id}`) },
                            { label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => navigate(`/admin/plans/${plan.id}/edit`) },
                            { label: 'Duplicate', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', onClick: () => handleDuplicate(plan) },
                            { divider: true },
                            { label: plan.status === 'active' ? 'Deactivate' : 'Activate', icon: plan.status === 'active' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', onClick: () => handleToggleStatus(plan) },
                            { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => handleDelete(plan.id) },
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
