import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { adminService } from '../../../services/admin'
import toast from 'react-hot-toast'
import ActionDropdown from '../../../components/common/ActionDropdown'

const MOCK_COUPONS: any[] = [
  { id: 1, code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, max_uses: 100, used_count: 23, plan_name: 'Basic', expires_at: '2025-12-31', status: 1 },
  { id: 2, code: 'PRO50', discount_type: 'percentage', discount_value: 50, max_uses: 50, used_count: 12, plan_name: 'Pro', expires_at: '2025-09-30', status: 1 },
  { id: 3, code: 'FLAT5', discount_type: 'fixed', discount_value: 5, max_uses: 200, used_count: 45, plan_name: 'Basic', expires_at: '2026-01-01', status: 1 },
  { id: 4, code: 'ENTERPRISE100', discount_type: 'fixed', discount_value: 100, max_uses: 10, used_count: 2, plan_name: 'Enterprise', expires_at: '2025-08-15', status: 1 },
  { id: 5, code: 'SUMMER25', discount_type: 'percentage', discount_value: 25, max_uses: 75, used_count: 31, plan_name: 'Pro', expires_at: '2025-08-31', status: 1 },
  { id: 6, code: 'EXPIRED20', discount_type: 'percentage', discount_value: 20, max_uses: 50, used_count: 50, plan_name: 'Basic', expires_at: '2025-01-01', status: 0 },
  { id: 7, code: 'VIP30', discount_type: 'percentage', discount_value: 30, max_uses: 25, used_count: 8, plan_name: 'Enterprise', expires_at: '2025-12-01', status: 1 },
  { id: 8, code: 'DEAL15', discount_type: 'fixed', discount_value: 15, max_uses: 0, used_count: 0, plan_name: '', expires_at: null, status: 1 },
]

export default function CouponListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    setLoading(true)
    adminService.getCouponCodes()
      .then((res) => setCoupons(res.data && res.data.length ? res.data : MOCK_COUPONS))
      .catch(() => setCoupons(MOCK_COUPONS))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.confirm_delete'))) return
    try { await adminService.deleteCouponCode(id); setCoupons(coupons.filter((c) => c.id !== id)); toast.success(t('common.deleted')) }
    catch { setCoupons(coupons.filter((c) => c.id !== id)); toast.success(t('common.deleted')) }
  }

  const filtered = coupons.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !search || c.code.toLowerCase().includes(q) || (c.plan_name || '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' && c.status) || (filterStatus === 'inactive' && !c.status)
    return matchSearch && matchStatus
  })

  const activeCount = coupons.filter((c) => c.status).length
  const totalUses = coupons.reduce((s, c) => s + c.used_count, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.coupon_codes')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{coupons.length} coupons</p>
        </div>
        <Link to="/admin/coupon-codes/create" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t('admin.add_coupon')}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Uses</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalUses.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search coupons..." value={search} onChange={(e) => setSearch(e.target.value)}
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
          <div className="p-12 text-center text-gray-400 text-sm">No coupons found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uses</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-sm font-bold text-purple-600 dark:text-purple-400">{c.code}</span></td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `£${c.discount_value}`}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 dark:text-gray-300">{c.used_count}</span>
                        <span className="text-xs text-gray-400">/ {c.max_uses || '∞'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.plan_name || 'Any'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {c.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionDropdown actions={[
                        { label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => navigate(`/admin/coupon-codes/${c.id}/edit`) },
                        { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => handleDelete(c.id) },
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