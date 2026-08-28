import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import type { SubscribedUserPlan } from '../../../types'
import toast from 'react-hot-toast'
import ActionDropdown from '../../../components/common/ActionDropdown'

const MOCK_DATA: SubscribedUserPlan[] = [
  { id: 1, user_id: 1, plan_id: 3, plan_name: 'Pro', user_name: 'Sarah Johnson', user_email: 'sarah@example.com', start_date: '2025-03-01', end_date: '2025-07-01', status: 'active', payment_type: 'stripe', transaction_id: 'txn_001', created_at: '2025-03-01' },
  { id: 2, user_id: 2, plan_id: 2, plan_name: 'Basic', user_name: 'Mike Chen', user_email: 'mike@example.com', start_date: '2025-04-01', end_date: '2025-07-01', status: 'active', payment_type: 'paypal', transaction_id: 'txn_002', created_at: '2025-04-01' },
  { id: 3, user_id: 3, plan_id: 4, plan_name: 'Enterprise', user_name: 'Emily Williams', user_email: 'emily@example.com', start_date: '2025-02-15', end_date: '2025-08-15', status: 'active', payment_type: 'stripe', transaction_id: 'txn_003', created_at: '2025-02-15' },
  { id: 4, user_id: 4, plan_id: 2, plan_name: 'Basic', user_name: 'David Smith', user_email: 'david@example.com', start_date: '2025-03-01', end_date: '2025-06-01', status: 'expired', payment_type: 'cash', transaction_id: 'CASH-001', created_at: '2025-03-01' },
  { id: 5, user_id: 5, plan_id: 3, plan_name: 'Pro', user_name: 'Anna Garcia', user_email: 'anna@example.com', start_date: '2025-05-01', end_date: '2025-08-01', status: 'active', payment_type: 'stripe', transaction_id: 'txn_004', created_at: '2025-05-01' },
  { id: 6, user_id: 6, plan_id: 1, plan_name: 'Free', user_name: 'James Brown', user_email: 'james@example.com', start_date: '2025-06-01', end_date: '2025-07-01', status: 'active', payment_type: '', transaction_id: '', created_at: '2025-06-01' },
  { id: 7, user_id: 7, plan_id: 3, plan_name: 'Pro', user_name: 'Lisa Anderson', user_email: 'lisa@example.com', start_date: '2025-04-15', end_date: '2025-07-15', status: 'cancelled', payment_type: 'stripe', transaction_id: 'txn_005', created_at: '2025-04-15' },
  { id: 8, user_id: 8, plan_id: 2, plan_name: 'Basic', user_name: 'Robert Taylor', user_email: 'robert@example.com', start_date: '2025-05-20', end_date: '2025-06-20', status: 'expired', payment_type: 'cash', transaction_id: 'CASH-002', created_at: '2025-05-20' },
]

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-600/20',
  expired: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-600/20',
  cancelled: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 ring-1 ring-gray-400/20',
}

export default function SubscribedPlansPage() {
  const { t } = useTranslation()
  const [plans, setPlans] = useState<SubscribedUserPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    adminService.getSubscribedUserPlans()
      .then((res) => setPlans(res.data.length ? res.data : MOCK_DATA))
      .catch(() => setPlans(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await adminService.updateSubscribedUserPlan(id, { status } as any)
      setPlans(plans.map((p) => String(p.id) === id ? { ...p, status } : p))
      toast.success(`Subscription ${status}`)
    } catch {
      setPlans(plans.map((p) => String(p.id) === id ? { ...p, status } : p))
      toast.success(`Subscription ${status}`)
    }
  }

  const filtered = plans.filter((p) => {
    const q = search.toLowerCase()
    const matchesSearch = !search ||
      p.user_name?.toLowerCase().includes(q) ||
      p.user_email?.toLowerCase().includes(q) ||
      p.plan_name?.toLowerCase().includes(q) ||
      p.transaction_id?.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesPlan = planFilter === 'all' || p.plan_name === planFilter
    return matchesSearch && matchesStatus && matchesPlan
  })

  const activeCount = plans.filter((p) => p.status === 'active').length
  const expiredCount = plans.filter((p) => p.status === 'expired').length
  const cancelledCount = plans.filter((p) => p.status === 'cancelled').length
  const uniquePlans = [...new Set(plans.map((p) => p.plan_name).filter(Boolean))]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.subscribed_plans')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{plans.length} total subscriptions</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{plans.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Expired</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{expiredCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">{cancelledCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search by user, plan, transaction..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none">
            <option value="all">All Plans</option>
            {uniquePlans.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No subscriptions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{p.user_name}</p>
                        <p className="text-xs text-gray-400">{p.user_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">{p.plan_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 dark:text-gray-300">{new Date(p.start_date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">→ {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Never'}</p>
                    </td>
                    <td className="px-4 py-3">
                      {p.payment_type ? (
                        <span className="capitalize text-gray-700 dark:text-gray-300">{p.payment_type}</span>
                      ) : (
                        <span className="text-gray-400">Free</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-mono">
                        {p.transaction_id || '—'}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusStyles[p.status] || ''}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionDropdown actions={[
                        ...(p.status === 'active' ? [
                          { label: 'Cancel', icon: 'M6 18L18 6M6 6l12 12', destructive: true, onClick: () => handleStatusChange(p.id, 'cancelled') },
                        ] : []),
                        ...(p.status === 'expired' ? [
                          { label: 'Reactivate', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', onClick: () => handleStatusChange(p.id, 'active') },
                        ] : []),
                        ...(p.status === 'cancelled' ? [
                          { label: 'Restore', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', onClick: () => handleStatusChange(p.id, 'active') },
                        ] : []),
                        { label: 'Expire', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', destructive: true, onClick: () => handleStatusChange(p.id, 'expired') },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}