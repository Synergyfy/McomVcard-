import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import type { Plan } from '../../../types'
import ActionDropdown from '../../../components/common/ActionDropdown'

export default function PlanListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterFreq, setFilterFreq] = useState<'all' | 'monthly' | 'yearly'>('all')

  useEffect(() => {
    setLoading(true)
    adminService.getPlans()
      .then((res) => {
        const data = res.data
        setPlans(data && data.length ? data : [])
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirm_delete'))) return
    try { await adminService.deletePlan(String(id)); setPlans(plans.filter((p) => String(p.id) !== id)) } catch { setPlans(plans.filter((p) => String(p.id) !== id)) }
  }

  const handleDuplicate = async (plan: Plan) => {
    try {
      const newPlan = await adminService.createPlan({
        ...plan,
        id: undefined,
        name: `${plan.name} (Copy)`,
        is_default: 0,
        status: 0,
      })
      setPlans([...plans, newPlan])
    } catch { /* ignore */ }
  }

  const handleToggleStatus = async (plan: Plan) => {
    try {
      await adminService.updatePlan(plan.id, { ...plan, status: plan.status ? 0 : 1 })
      setPlans(plans.map((p) => p.id === plan.id ? { ...p, status: p.status ? 0 : 1 } : p))
    } catch { /* ignore */ }
  }

  const filtered = plans.filter((p) => {
    const q = search.toLowerCase()
    const currencyIcon = p.currency?.currency_icon || '£'
    const matchSearch = !search || p.name.toLowerCase().includes(q) || `${currencyIcon}${p.price}`.includes(q)
    const matchFreq = filterFreq === 'all' || (filterFreq === 'monthly' && p.frequency <= 1) || (filterFreq === 'yearly' && p.frequency > 1)
    return matchSearch && matchFreq
  })

  const activeCount = plans.filter((p) => p.status).length
  const monthlyCount = plans.filter((p) => p.frequency <= 1).length
  const avgPrice = plans.length ? (plans.reduce((s, p) => s + p.price, 0) / plans.length).toFixed(2) : '0'

  return (
    <div>
      <Helmet><title>{t('admin.nav.plans')} - Mobile VCard Link</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.plans')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{plans.length} total plans</p>
        </div>
        <Link to="/admin/plans/create" className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t('admin.add_plan')}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active Plans</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Monthly</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{monthlyCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Price</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">£{avgPrice}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search plans..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <select value={filterFreq} onChange={(e) => setFilterFreq(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none">
            <option value="all">All</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Max vCards</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Features</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((p) => {
                  const currencyIcon = p.currency?.currency_icon || '£'
                  const featureCount = p.plan_feature
                    ? Object.entries(p.plan_feature).filter(([k, v]) => k !== 'id' && k !== 'plan_id' && v === 1).length
                    : 0
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/plans/${p.id}`)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                            {p.is_default === 1 && <span className="text-[10px] text-orange-500 font-medium">DEFAULT</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{currencyIcon}{p.price}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          {p.frequency <= 1 ? 'Monthly' : 'Yearly'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.no_of_vcards === -1 ? 'Unlimited' : p.no_of_vcards}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(featureCount / 17) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{featureCount}/17</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {p.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <ActionDropdown actions={[
                          { label: 'View', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', onClick: () => navigate(`/admin/plans/${p.id}`) },
                          { label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => navigate(`/admin/plans/${p.id}/edit`) },
                          { label: 'Duplicate', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', onClick: () => handleDuplicate(p) },
                          { divider: true },
                          { label: p.status ? 'Deactivate' : 'Activate', icon: p.status ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', onClick: () => handleToggleStatus(p) },
                          { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => handleDelete(p.id) },
                        ]} />
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
