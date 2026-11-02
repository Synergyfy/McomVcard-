import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminService } from '../../../services/admin'
import { metaOf, rowsOf } from '../../../services/adminList'
import Pagination from '../../../components/admin/Pagination'
import ActionDropdown from '../../../components/common/ActionDropdown'

interface AdminUserRow {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  status: string
  is_verified: boolean
  created_at: string
  roles: string[]
}

const ROLE_BADGES: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  USER: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  BUSINESS_OWNER: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  STAFF: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
}
const STATUS_BADGES: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  suspended: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  banned: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  deactivated: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
}

function fullName(user: AdminUserRow): string {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
}

export default function UserListPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError('')
      adminService.getUsers({ page, limit: meta.limit, search: search.trim() || undefined, status: status || undefined, sort: 'created_at', order: 'DESC' })
        .then((res) => { setUsers(rowsOf<AdminUserRow>(res)); setMeta(metaOf(res)) })
        .catch((err) => {
          setUsers([])
          setMeta({ total: 0, page: 1, limit: meta.limit, totalPages: 1 })
          setError(err?.response?.data?.message || 'Unable to load users')
        })
        .finally(() => setLoading(false))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [page, search, status, meta.limit])

  useEffect(() => { setPage(1) }, [search, status])

  const stats = useMemo(() => ({
    total: meta.total,
    active: users.filter((u) => u.status === 'active').length,
    suspended: users.filter((u) => u.status === 'suspended' || u.status === 'banned').length,
    roles: new Set(users.flatMap((u) => u.roles)).size,
  }), [users, meta.total])

  const handleStatusChange = async (user: AdminUserRow, nextStatus: string) => {
    try {
      await adminService.updateUser(user.id, { status: nextStatus } as any)
      setUsers((current) => current.map((entry) => entry.id === user.id ? { ...entry, status: nextStatus } : entry))
      toast.success(`User ${nextStatus === 'active' ? 'activated' : nextStatus}`)
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Unable to update user') }
  }

  const handleDelete = async (user: AdminUserRow) => {
    if (!confirm(`Deactivate ${fullName(user)}? They will no longer be able to sign in.`)) return
    try {
      await adminService.deleteUser(user.id)
      setUsers((current) => current.map((entry) => entry.id === user.id ? { ...entry, status: 'deactivated' } : entry))
      toast.success('User deactivated')
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Unable to deactivate user') }
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Users - MCOM VCard Social Bio</title></Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platform accounts — {meta.total} users</p></div>
        <Link to="/admin/users/create" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25">Add User</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Active (page)', value: stats.active, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
          { label: 'Suspended (page)', value: stats.suspended, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
          { label: 'Roles (page)', value: stats.roles, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-transparent`}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <input type="search" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] max-w-xs px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option><option value="deactivated">Deactivated</option>
          </select>
        </div>
        {error && <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <th className="text-left px-4 py-3 font-medium">User</th><th className="text-left px-4 py-3 font-medium">Role</th><th className="text-left px-4 py-3 font-medium">Status</th><th className="text-left px-4 py-3 font-medium hidden md:table-cell">Joined</th><th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Verified</th><th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="px-4 py-12 text-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              : users.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">{search || status ? 'No users match these filters.' : 'No users yet.'}</td></tr>
              : users.map((user) => {
                const name = fullName(user)
                return (
                  <tr key={user.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">{name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div><div><p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p></div></div></td>
                    <td className="px-4 py-3.5"><div className="flex flex-wrap gap-1">{user.roles.length === 0 ? <span className="text-xs text-gray-400">—</span> : user.roles.map((role) => <span key={role} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGES[role] || 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300'}`}>{role}</span>)}</div></td>
                    <td className="px-4 py-3.5"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[user.status] || STATUS_BADGES.deactivated}`}>{user.status}</span></td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3.5 text-sm hidden lg:table-cell"><span className={user.is_verified ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>{user.is_verified ? 'Verified' : 'Unverified'}</span></td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <ActionDropdown actions={[
                        { label: 'Edit user', onClick: () => navigate(`/admin/users/${user.id}/edit`) },
                        { label: user.status === 'active' ? 'Suspend user' : 'Activate user', onClick: () => handleStatusChange(user, user.status === 'active' ? 'suspended' : 'active') },
                        { label: 'Deactivate user', onClick: () => handleDelete(user), destructive: true },
                      ]} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={setPage} label="users" />
      </div>
    </div>
  )
}
