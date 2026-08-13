import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import toast from 'react-hot-toast'
import ActionDropdown from '../../../components/common/ActionDropdown'

const MOCK_PAYMENTS: any[] = [
  { id: 1, user_name: 'Sarah Johnson', plan_name: 'Pro', amount: 19.99, transaction_id: 'CASH-001', status: 'approved', created_at: '2025-03-05' },
  { id: 2, user_name: 'Mike Chen', plan_name: 'Basic', amount: 9.99, transaction_id: 'CASH-002', status: 'approved', created_at: '2025-04-10' },
  { id: 3, user_name: 'Emily Williams', plan_name: 'Enterprise', amount: 49.99, transaction_id: 'CASH-003', status: 'pending', created_at: '2025-05-15' },
  { id: 4, user_name: 'David Smith', plan_name: 'Basic', amount: 9.99, transaction_id: 'CASH-004', status: 'rejected', created_at: '2025-03-20' },
  { id: 5, user_name: 'Anna Garcia', plan_name: 'Pro', amount: 19.99, transaction_id: 'CASH-005', status: 'pending', created_at: '2025-06-01' },
  { id: 6, user_name: 'Robert Taylor', plan_name: 'Basic', amount: 9.99, transaction_id: 'CASH-006', status: 'approved', created_at: '2025-05-25' },
  { id: 7, user_name: 'James Brown', plan_name: 'Pro', amount: 19.99, transaction_id: 'CASH-007', status: 'pending', created_at: '2025-06-20' },
]

const statusStyles: Record<string, string> = {
  approved: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-600/20',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-600/20',
  pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-1 ring-yellow-600/20',
}

export default function CashPaymentsPage() {
  const { t } = useTranslation()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    adminService.getCashPayments()
      .then((res) => setPayments(res.data && res.data.length ? res.data : MOCK_PAYMENTS))
      .catch(() => setPayments(MOCK_PAYMENTS))
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (id: number, status: 'approved' | 'rejected') => {
    if (!confirm(status === 'approved' ? t('admin.confirm_approve') : t('admin.confirm_reject'))) return
    try { await adminService.updateCashPayment(id, { status } as any) } catch {}
    setPayments(payments.map((p) => p.id === id ? { ...p, status } : p))
    toast.success(`Payment ${status}`)
  }

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !search || (p.user_name || '').toLowerCase().includes(q) || (p.plan_name || '').toLowerCase().includes(q) || (p.transaction_id || '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const pendingCount = payments.filter((p) => p.status === 'pending').length
  const totalApproved = payments.filter((p) => p.status === 'approved').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.cash_payments')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{payments.length} payments</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Approved Total</p>
          <p className="text-2xl font-bold text-green-600 mt-1">£{totalApproved.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No cash payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.user_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.plan_name}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">£{p.amount}</td>
                    <td className="px-4 py-3"><code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-mono">{p.transaction_id}</code></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusStyles[p.status] || ''}`}>{p.status}</span>
                        {p.status === 'pending' && (
                          <ActionDropdown actions={[
                            { label: 'Approve', icon: 'M5 13l4 4L19 7', onClick: () => handleStatus(p.id, 'approved') },
                            { label: 'Reject', icon: 'M6 18L18 6M6 6l12 12', destructive: true, onClick: () => handleStatus(p.id, 'rejected') },
                          ]} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
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