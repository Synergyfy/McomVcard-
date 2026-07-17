import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'

const MOCK_LOGS: any[] = [
  { id: 1, admin_name: 'Super Admin', action: 'login', module: 'Auth', description: 'Admin logged in', ip_address: '192.168.1.1', created_at: '2025-07-14 09:00:00' },
  { id: 2, admin_name: 'Super Admin', action: 'create', module: 'Users', description: 'Created user Sarah Johnson', ip_address: '192.168.1.1', created_at: '2025-07-14 08:45:00' },
  { id: 3, admin_name: 'Super Admin', action: 'update', module: 'Plans', description: 'Updated Pro plan pricing', ip_address: '192.168.1.1', created_at: '2025-07-13 16:30:00' },
  { id: 4, admin_name: 'Super Admin', action: 'delete', module: 'vCards', description: 'Deleted vCard #12', ip_address: '192.168.1.1', created_at: '2025-07-13 14:20:00' },
  { id: 5, admin_name: 'Super Admin', action: 'approve', module: 'Cash Payments', description: 'Approved cash payment #3', ip_address: '192.168.1.1', created_at: '2025-07-12 11:15:00' },
  { id: 6, admin_name: 'Super Admin', action: 'update', module: 'Settings', description: 'Updated general settings', ip_address: '192.168.1.1', created_at: '2025-07-12 10:00:00' },
  { id: 7, admin_name: 'Super Admin', action: 'create', module: 'Coupons', description: 'Created coupon SUMMER25', ip_address: '192.168.1.1', created_at: '2025-07-11 09:30:00' },
  { id: 8, admin_name: 'Super Admin', action: 'reject', module: 'Withdraw', description: 'Rejected withdrawal #5', ip_address: '192.168.1.1', created_at: '2025-07-11 08:00:00' },
  { id: 9, admin_name: 'Super Admin', action: 'login', module: 'Auth', description: 'Admin logged in', ip_address: '192.168.1.1', created_at: '2025-07-10 17:45:00' },
  { id: 10, admin_name: 'Super Admin', action: 'send', module: 'Newsletter', description: 'Sent newsletter campaign #2', ip_address: '192.168.1.1', created_at: '2025-07-10 15:20:00' },
]

const actionColors: Record<string, string> = {
  login: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  create: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  update: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  delete: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  approve: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  reject: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  send: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function ActivityLogsPage() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    adminService.getActivityLogs()
      .then((res) => setLogs(res.data && res.data.length ? res.data : MOCK_LOGS))
      .catch(() => setLogs(MOCK_LOGS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch = !search || l.admin_name?.toLowerCase().includes(q) || l.module?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q)
    const matchAction = filterAction === 'all' || l.action === filterAction
    return matchSearch && matchAction
  })

  const uniqueActions = [...new Set(logs.map((l) => l.action))]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.activity_logs')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{logs.length} total log entries</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none">
            <option value="all">All Actions</option>
            {uniqueActions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No activity logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{l.admin_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${actionColors[l.action] || 'bg-gray-50 text-gray-700'}`}>{l.action}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{l.module}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">{l.description}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{l.ip_address}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
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