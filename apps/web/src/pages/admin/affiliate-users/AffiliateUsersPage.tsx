import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import { rowsOf } from '../../../services/adminList'


export default function AffiliateUsersPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    setLoading(true)
    adminService.getAffiliateUsers()
      .then((res) => setUsers(rowsOf(res)))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !search || (u.user_name || '').toLowerCase().includes(q) || (u.referral_code || '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' && u.status) || (filterStatus === 'inactive' && !u.status)
    return matchSearch && matchStatus
  })

  const activeCount = users.filter((u) => u.status).length
  const totalEarned = users.reduce((s, u) => s + u.total_earned, 0)
  const totalReferred = users.reduce((s, u) => s + u.referred_count, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.affiliate_users')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} affiliates</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Referred</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalReferred}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Earned</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">£{totalEarned.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search affiliates..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No affiliate users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Referral Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Referred</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Earned</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.user_name}</td>
                    <td className="px-4 py-3"><code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-purple-600 dark:text-purple-400 font-mono">{u.referral_code}</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.commission_rate}%</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{u.referred_count}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">£{u.total_earned.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">£{u.balance.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {u.status ? 'Active' : 'Inactive'}
                      </span>
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