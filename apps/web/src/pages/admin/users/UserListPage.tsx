import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ActionDropdown from '../../../components/common/ActionDropdown'

interface AdminUser {
  id: number; name: string; email: string; role: string; status: string; lastActive: string; vCardsManaged: number; avatar: string | null
}

const MOCK_USERS: AdminUser[] = [
  { id: 1, name: 'Alex Morgan', email: 'alex@mcom.com', role: 'Super Admin', status: 'active', lastActive: 'Just now', vCardsManaged: 12560, avatar: null },
  { id: 2, name: 'Jordan Lee', email: 'jordan@mcom.com', role: 'Admin', status: 'active', lastActive: '5 min ago', vCardsManaged: 8920, avatar: null },
  { id: 3, name: 'Taylor Reed', email: 'taylor@mcom.com', role: 'Manager', status: 'active', lastActive: '15 min ago', vCardsManaged: 5400, avatar: null },
  { id: 4, name: 'Casey Kim', email: 'casey@mcom.com', role: 'Consultant', status: 'active', lastActive: '1 hour ago', vCardsManaged: 3200, avatar: null },
  { id: 5, name: 'Morgan Chase', email: 'morgan@mcom.com', role: 'Agent', status: 'active', lastActive: '3 hours ago', vCardsManaged: 1800, avatar: null },
  { id: 6, name: 'Riley Cooper', email: 'riley@mcom.com', role: 'Support', status: 'active', lastActive: '5 hours ago', vCardsManaged: 600, avatar: null },
  { id: 7, name: 'Sam Wilson', email: 'sam@mcom.com', role: 'Admin', status: 'suspended', lastActive: '2 days ago', vCardsManaged: 0, avatar: null },
  { id: 8, name: 'Drew Martinez', email: 'drew@mcom.com', role: 'Support', status: 'inactive', lastActive: '1 week ago', vCardsManaged: 0, avatar: null },
]

const ROLE_BADGES: Record<string, string> = {
  'Super Admin': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  Admin: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  Manager: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  Consultant: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  Agent: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
  Support: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
}

export default function UserListPage() {
  const navigate = useNavigate()
  const [users] = useState(MOCK_USERS)
  const [search, setSearch] = useState('')

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Helmet><title>Admin Users - MCOM VCard Social Bio</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Internal team management — {users.length} users</p>
        </div>
        <Link
          to="/admin/users/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Admin User
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Active', value: users.filter((u) => u.status === 'active').length, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
          { label: 'Suspended', value: users.filter((u) => u.status === 'suspended').length, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
          { label: 'Roles', value: new Set(users.map((u) => u.role)).size, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-transparent`}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-xs">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Last Active</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">vCards Managed</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGES[user.role] || ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      user.status === 'active' ? 'text-green-600 dark:text-green-400' :
                      user.status === 'suspended' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'active' ? 'bg-green-500' :
                        user.status === 'suspended' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{user.lastActive}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">{user.vCardsManaged.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <ActionDropdown actions={[
                      { label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => toast.success('Editing user: ' + user.name) },
                      { label: user.status === 'suspended' ? 'Unsuspend' : 'Suspend', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', destructive: user.status !== 'suspended', onClick: () => toast.success(user.status === 'suspended' ? 'Account unsuspended' : 'Account suspended') },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
