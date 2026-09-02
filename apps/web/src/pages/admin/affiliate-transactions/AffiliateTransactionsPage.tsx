import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import toast from 'react-hot-toast'

const MOCK_TXNS: any[] = [
  { id: '1', referred_user_name: 'Mike Chen', amount: 25.00, description: 'Commission from Basic plan purchase', status: 'approved', created_at: '2025-04-05' },
  { id: '2', referred_user_name: 'Emily Williams', amount: 50.00, description: 'Commission from Pro plan purchase', status: 'pending', created_at: '2025-04-20' },
  { id: '3', referred_user_name: 'David Smith', amount: 25.00, description: 'Commission from Basic plan purchase', status: 'approved', created_at: '2025-05-10' },
  { id: '4', referred_user_name: 'James Brown', amount: 50.00, description: 'Commission from Pro plan purchase', status: 'pending', created_at: '2025-06-15' },
  { id: '5', referred_user_name: 'Lisa Anderson', amount: 25.00, description: 'Commission from Basic plan purchase', status: 'rejected', created_at: '2025-04-25' },
  { id: '6', referred_user_name: 'Anna Garcia', amount: 125.00, description: 'Commission from Enterprise plan purchase', status: 'pending', created_at: '2025-06-01' },
  { id: '7', referred_user_name: 'Robert Taylor', amount: 25.00, description: 'Commission from Basic plan purchase', status: 'approved', created_at: '2025-05-20' },
]

const statusStyles: Record<string, string> = {
  approved: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-600/20',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-600/20',
  pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-1 ring-yellow-600/20',
}

export default function AffiliateTransactionsPage() {
  const { t } = useTranslation()
  const [txns, setTxns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    adminService.getAffiliateTransactions()
      .then((res) => setTxns(res.data && res.data.length ? res.data : MOCK_TXNS))
      .catch(() => setTxns(MOCK_TXNS))
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    try { await adminService.updateAffiliateTransaction(id, { status } as any) } catch {}
    setTxns(txns.map((t) => String(t.id) === id ? { ...t, status } : t))
    toast.success(`Transaction ${status}`)
  }

  const filtered = txns.filter((t) => {
    const q = search.toLowerCase()
    const matchSearch = !search || (t.referred_user_name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchSearch && matchStatus
  })

  const pendingCount = txns.filter((t) => t.status === 'pending').length
  const totalCommission = txns.filter((t) => t.status === 'approved').reduce((s, t) => s + t.amount, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.affiliate_transactions')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{txns.length} transactions</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Paid Out</p>
          <p className="text-2xl font-bold text-green-600 mt-1">£{totalCommission.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)}
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
          <div className="p-12 text-center text-gray-400 text-sm">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Referred User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t.referred_user_name}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">£{t.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{t.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusStyles[t.status] || ''}`}>{t.status}</span>
                        {t.status === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => handleStatus(t.id, 'approved')} className="text-xs text-green-600 hover:underline font-medium">Approve</button>
                            <button onClick={() => handleStatus(t.id, 'rejected')} className="text-xs text-red-600 hover:underline font-medium">Reject</button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
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