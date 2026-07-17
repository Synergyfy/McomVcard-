import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const PREDEFINED_ROLES = [
  {
    name: 'Super Admin',
    guard: 'web',
    color: 'purple',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    description: 'Full system access to all modules and settings.',
    userCount: 1,
    users: [
      { id: 1, name: 'Super Admin', email: 'admin@mobilevcardlink.com', status: 'active', lastActive: '2 min ago', vcards: 0 },
    ],
    permissions: [
      'All — full system access',
      'Manage admins, users, roles, permissions',
      'Create/edit/delete plans, templates, coupons',
      'View all vCards, payments, analytics',
      'Modify system settings, CMS content, translations',
    ],
  },
  {
    name: 'Admin',
    guard: 'web',
    color: 'blue',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    description: 'Manage users, content, and day-to-day operations.',
    userCount: 3,
    users: [
      { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'active', lastActive: '15 min ago', vcards: 3 },
      { id: 3, name: 'Mike Chen', email: 'mike@example.com', status: 'active', lastActive: '1 hour ago', vcards: 2 },
      { id: 4, name: 'Emily Williams', email: 'emily@example.com', status: 'inactive', lastActive: '3 days ago', vcards: 1 },
    ],
    permissions: [
      'Manage users and their vCards',
      'View and manage enquiries, subscribers',
      'Access dashboard and reports',
      'Manage testimonials, features, about us',
      'Cannot modify system settings or plans',
    ],
  },
  {
    name: 'Manager',
    guard: 'web',
    color: 'cyan',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    description: 'Oversee teams, review campaigns, approve content, and manage daily operations.',
    userCount: 8,
    users: [
      { id: 5, name: 'David Park', email: 'david@example.com', status: 'active', lastActive: '10 min ago', vcards: 1 },
      { id: 6, name: 'Maria Silva', email: 'maria@example.com', status: 'active', lastActive: '45 min ago', vcards: 2 },
    ],
    permissions: [
      'View dashboard and team performance',
      'Approve/reject campaigns and content',
      'Manage team member vCards',
      'View analytics and reports',
      'Cannot modify system settings',
    ],
  },
  {
    name: 'Consultant',
    guard: 'web',
    color: 'indigo',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    description: 'Analyze campaign performance, provide recommendations, and optimize strategies.',
    userCount: 5,
    users: [
      { id: 7, name: 'Tom Baker', email: 'tom@example.com', status: 'active', lastActive: '1 hour ago', vcards: 0 },
      { id: 8, name: 'Jenna Lee', email: 'jenna@example.com', status: 'active', lastActive: '3 hours ago', vcards: 1 },
    ],
    permissions: [
      'View all analytics and reports',
      'Access campaign data and insights',
      'Provide optimization recommendations',
      'View consumer behavior trends',
      'Cannot edit or create campaigns',
    ],
  },
  {
    name: 'Agent',
    guard: 'web',
    color: 'orange',
    icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-6 6h.01m6 0h.01M12 17l-2-4h4l-2 4z',
    description: 'Field agents managing QR codes, NFC tags, and on-site activations.',
    userCount: 15,
    users: [
      { id: 9, name: 'Kevin Ross', email: 'kevin@example.com', status: 'active', lastActive: '20 min ago', vcards: 1 },
      { id: 10, name: 'Nina Patel', email: 'nina@example.com', status: 'active', lastActive: '2 hours ago', vcards: 0 },
    ],
    permissions: [
      'Manage QR codes and NFC tags',
      'View assigned vCards and campaigns',
      'Process print orders',
      'Scan and verify NFC cards',
      'Read-only access to analytics',
    ],
  },
  {
    name: 'Support',
    guard: 'web',
    color: 'teal',
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    description: 'Handle customer support tickets, enquiries, and user assistance.',
    userCount: 6,
    users: [
      { id: 11, name: 'Sofia Reyes', email: 'sofia@example.com', status: 'active', lastActive: '5 min ago', vcards: 0 },
      { id: 12, name: 'Liam O\'Brien', email: 'liam@example.com', status: 'active', lastActive: '1 hour ago', vcards: 1 },
    ],
    permissions: [
      'View and respond to support tickets',
      'View user accounts and vCards',
      'Reset user passwords',
      'Access knowledge base and FAQs',
      'Cannot modify plans or settings',
    ],
  },
  {
    name: 'Business Owner',
    guard: 'web',
    color: 'emerald',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    description: 'Create and manage personal vCards and subscriptions.',
    userCount: 246,
    users: [
      { id: 13, name: 'Anna Garcia', email: 'anna@example.com', status: 'active', lastActive: '5 min ago', vcards: 2 },
      { id: 14, name: 'James Brown', email: 'james@example.com', status: 'active', lastActive: '30 min ago', vcards: 1 },
    ],
    permissions: [
      'Create and manage own vCards',
      'Access own analytics and appointments',
      'Subscribe to plans and manage billing',
      'Manage own gallery, services, blog',
      'Cannot access other users data',
    ],
  },
  {
    name: 'Affiliate',
    guard: 'web',
    color: 'amber',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    description: 'Refer users and earn commissions on subscriptions.',
    userCount: 58,
    users: [
      { id: 15, name: 'Carlos Rivera', email: 'carlos@example.com', status: 'active', lastActive: '1 day ago', vcards: 1 },
      { id: 16, name: 'Priya Patel', email: 'priya@example.com', status: 'active', lastActive: '3 hours ago', vcards: 0 },
    ],
    permissions: [
      'Access affiliate dashboard',
      'View referral links and commissions',
      'Request withdrawals',
      'View own affiliate statistics',
      'Cannot access other users or admin panel',
    ],
  },
]

const allPermissions = [
  { group: 'Dashboard', perms: [{ name: 'View Dashboard', roles: ['Super Admin', 'Admin', 'Manager'] }, { name: 'View Reports', roles: ['Super Admin', 'Admin', 'Manager', 'Consultant'] }, { name: 'Export Data', roles: ['Super Admin', 'Manager'] }] },
  { group: 'Users', perms: [{ name: 'View Users', roles: ['Super Admin', 'Admin', 'Manager', 'Support'] }, { name: 'Create Users', roles: ['Super Admin', 'Admin'] }, { name: 'Edit Users', roles: ['Super Admin', 'Admin'] }, { name: 'Delete Users', roles: ['Super Admin'] }, { name: 'Impersonate', roles: ['Super Admin'] }] },
  { group: 'vCards', perms: [{ name: 'View All vCards', roles: ['Super Admin', 'Admin', 'Support'] }, { name: 'Delete Any vCard', roles: ['Super Admin'] }, { name: 'Manage Templates', roles: ['Super Admin'] }, { name: 'Own vCards', roles: ['Business Owner', 'Manager', 'Agent'] }] },
  { group: 'Campaigns', perms: [{ name: 'View Campaigns', roles: ['Super Admin', 'Admin', 'Manager', 'Consultant'] }, { name: 'Create Campaigns', roles: ['Super Admin', 'Admin', 'Manager'] }, { name: 'Approve Campaigns', roles: ['Super Admin', 'Manager'] }, { name: 'View Insights', roles: ['Super Admin', 'Admin', 'Manager', 'Consultant'] }] },
  { group: 'QR & NFC', perms: [{ name: 'Manage QR Codes', roles: ['Super Admin', 'Admin', 'Agent'] }, { name: 'Manage NFC Cards', roles: ['Super Admin', 'Admin', 'Agent'] }, { name: 'Process Print Orders', roles: ['Super Admin', 'Agent'] }] },
  { group: 'Support', perms: [{ name: 'View Tickets', roles: ['Super Admin', 'Admin', 'Support'] }, { name: 'Respond to Tickets', roles: ['Super Admin', 'Admin', 'Support'] }, { name: 'Manage Knowledge Base', roles: ['Super Admin', 'Admin', 'Support'] }] },
  { group: 'Wallet & Finance', perms: [{ name: 'View Wallet', roles: ['Super Admin', 'Admin'] }, { name: 'Manage Transactions', roles: ['Super Admin'] }, { name: 'Approve Withdrawals', roles: ['Super Admin'] }] },
  { group: 'Plans & Finance', perms: [{ name: 'View Plans', roles: ['Super Admin', 'Admin'] }, { name: 'Create/Edit Plans', roles: ['Super Admin'] }, { name: 'Delete Plans', roles: ['Super Admin'] }, { name: 'View Payments', roles: ['Super Admin'] }, { name: 'Manage Coupons', roles: ['Super Admin'] }] },
  { group: 'Content', perms: [{ name: 'Manage Front CMS', roles: ['Super Admin', 'Admin'] }, { name: 'Manage Testimonials', roles: ['Super Admin', 'Admin'] }, { name: 'Manage Features', roles: ['Super Admin', 'Admin'] }, { name: 'Manage About Us', roles: ['Super Admin', 'Admin'] }, { name: 'Manage FAQs', roles: ['Super Admin', 'Admin', 'Support'] }] },
  { group: 'System', perms: [{ name: 'View Settings', roles: ['Super Admin'] }, { name: 'Edit Settings', roles: ['Super Admin'] }, { name: 'Manage Languages', roles: ['Super Admin'] }, { name: 'View Activity Logs', roles: ['Super Admin'] }, { name: 'Clear Cache', roles: ['Super Admin'] }] },
  { group: 'Marketing', perms: [{ name: 'View Enquiries', roles: ['Super Admin', 'Admin', 'Support'] }, { name: 'Manage Subscribers', roles: ['Super Admin', 'Admin'] }, { name: 'Send Newsletters', roles: ['Super Admin', 'Manager'] }] },
  { group: 'Affiliates', perms: [{ name: 'View Affiliates', roles: ['Super Admin'] }, { name: 'View Transactions', roles: ['Super Admin'] }, { name: 'Approve Withdrawals', roles: ['Super Admin'] }] },
]

const roleColors: Record<string, { bg: string, text: string, ring: string, dot: string }> = {
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', ring: 'ring-purple-600/20', dot: 'bg-purple-500' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', ring: 'ring-blue-600/20', dot: 'bg-blue-500' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', ring: 'ring-cyan-600/20', dot: 'bg-cyan-500' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', ring: 'ring-indigo-600/20', dot: 'bg-indigo-500' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', ring: 'ring-orange-600/20', dot: 'bg-orange-500' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-400', ring: 'ring-teal-600/20', dot: 'bg-teal-500' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', ring: 'ring-emerald-600/20', dot: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', ring: 'ring-amber-600/20', dot: 'bg-amber-500' },
}

export default function RoleListPage() {
  const { t } = useTranslation()
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [viewingRole, setViewingRole] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', guard: 'web', description: '' })

  const role = PREDEFINED_ROLES.find((r) => r.name === viewingRole)
  const colors = role ? roleColors[role.color] : roleColors.purple

  const handleCreateRole = () => {
    if (!newRole.name.trim()) return
    toast.success(`Role "${newRole.name}" created successfully`)
    setShowCreateModal(false)
    setNewRole({ name: '', guard: 'web', description: '' })
  }

  return (
    <div>
      <Helmet><title>{t('admin.nav.roles')} - Mobile VCard Link</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage access control and permissions for different user types.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 shadow-sm shadow-orange-200 dark:shadow-none flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Role
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                <input type="text" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g., Editor" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guard</label>
                <select value={newRole.guard} onChange={(e) => setNewRole({ ...newRole, guard: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="web">Web</option>
                  <option value="api">API</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Describe this role..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Cancel</button>
              <button onClick={handleCreateRole} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600">Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {PREDEFINED_ROLES.map((role) => {
          const c = roleColors[role.color]
          return (
            <div key={role.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                      <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={role.icon} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{role.guard}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text} ring-1 ${c.ring}`}>
                    {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{role.description}</p>
              </div>
              <div className="px-6 py-4 space-y-2">
                {role.permissions.map((perm, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{perm}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <button onClick={() => setViewingRole(role.name)} className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  View {role.userCount} Users
                </button>
                <Link to={`/admin/users?role=${role.name.toLowerCase().replace(' ', '-')}`} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  Manage →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {viewingRole && role && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setViewingRole(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={role.icon} />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{role.name} Users</h2>
                  <p className="text-xs text-gray-400">{role.users.length} shown · {role.userCount} total</p>
                </div>
              </div>
              <button onClick={() => setViewingRole(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {role.users.map((user) => (
                  <div key={user.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${role.color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-indigo-500' : role.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' : role.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : role.color === 'cyan' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : role.color === 'indigo' ? 'bg-gradient-to-br from-indigo-400 to-purple-500' : role.color === 'orange' ? 'bg-gradient-to-br from-orange-400 to-red-500' : role.color === 'teal' ? 'bg-gradient-to-br from-teal-400 to-green-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                        {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{user.vcards} vCards</span>
                      <span className={`flex items-center gap-1 ${user.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        {user.lastActive}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <Link to="/admin/users" className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400">
                View all users →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Full Permissions Matrix</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Expand each group to see which roles have access to each permission.</p>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {allPermissions.map((group) => {
            const allRoleNames = [...new Set(group.perms.flatMap((p) => p.roles))]
            return (
              <div key={group.group}>
                <button
                  onClick={() => setExpandedGroup(expandedGroup === group.group ? null : group.group)}
                  className="w-full px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{group.group}</span>
                    <div className="flex gap-1">
                      {allRoleNames.map((rn) => {
                        const r = PREDEFINED_ROLES.find((pr) => pr.name === rn)
                        const rc = r ? roleColors[r.color] : roleColors.blue
                        return <span key={rn} className={`text-[10px] px-1.5 py-0.5 rounded ${rc.bg} ${rc.text}`}>{rn === 'Super Admin' ? 'SA' : rn === 'Business Owner' ? 'BO' : rn === 'Consultant' ? 'Con' : rn === 'Manager' ? 'Mgr' : rn === 'Agent' ? 'Agt' : rn === 'Support' ? 'Sup' : rn.slice(0, 2)}</span>
                      })}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedGroup === group.group ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedGroup === group.group && (
                  <div className="px-6 pb-4">
                    <div className="flex flex-col gap-2">
                      {group.perms.map((perm) => (
                        <div key={perm.name} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{perm.name}</span>
                          <div className="flex gap-1.5">
                            {PREDEFINED_ROLES.map((r) => {
                              const hasAccess = perm.roles.includes(r.name)
                              const rc = roleColors[r.color]
                              return (
                                <span key={r.name} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${hasAccess ? `${rc.bg} ${rc.text}` : 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800'}`}>
                                  {hasAccess ? '✓' : '—'}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-gray-400">
                      {PREDEFINED_ROLES.map((r) => (
                        <span key={r.name} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${roleColors[r.color].dot}`} />
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
