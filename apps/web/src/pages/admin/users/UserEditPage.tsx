import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { adminService } from '../../../services/admin'
import toast from 'react-hot-toast'

const MOCK_SUBSCRIPTIONS = [
  { id: 1, plan_name: 'Pro', status: 'active', start_date: '2025-03-01', end_date: '2025-07-01', payment_type: 'stripe' },
  { id: 2, plan_name: 'Free', status: 'expired', start_date: '2025-01-01', end_date: '2025-03-01', payment_type: '' },
]

const MOCK_VCARDS = [
  { id: 1, name: 'Business Card', url_slug: 'sarah-business', status: 1, created_at: '2025-03-15' },
  { id: 2, name: 'Personal Card', url_slug: 'sarah-personal', status: 1, created_at: '2025-04-01' },
]

const MOCK_ACTIVITY = [
  { action: 'Logged in', time: '2 hours ago' },
  { action: 'Updated profile', time: '1 day ago' },
  { action: 'Created new vCard', time: '3 days ago' },
  { action: 'Subscribed to Pro plan', time: '1 week ago' },
]

export default function UserEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', contact: '', location: '', occupation: '',
    website: '', bio: '', is_active: true, is_verified: true,
  })
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'edit' | 'password' | 'subscriptions' | 'vcards' | 'activity'>('edit')

  const userName = `${form.first_name} ${form.last_name}`.trim() || 'Loading...'
  const initial = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  useEffect(() => {
    if (!id) return
    adminService.getUser(id as string)
      .then((u: any) => {
        setForm({
          first_name: u.first_name || '', last_name: u.last_name || '',
          email: u.email, contact: u.phone || u.contact || '', location: u.location || '',
          occupation: u.occupation || '', website: u.website || '', bio: u.description || '',
          is_active: u.status === 'active' || u.is_active, is_verified: u.is_verified,
        })
      })
      .catch(() => navigate('/admin/users'))
      .finally(() => setFetching(false))
  }, [id])

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await adminService.updateUser(id as string, {
        first_name: form.first_name || undefined, last_name: form.last_name || undefined,
        email: form.email, phone: form.contact || undefined,
        status: form.is_active ? 'active' : 'inactive',
      })
      toast.success('User updated successfully')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'An error occurred'
      toast.error(msg)
      if (err?.response?.data?.errors) {
        const fe: Record<string, string> = {}
        for (const [k, msgs] of Object.entries(err.response.data.errors))
          fe[k] = (msgs as string[])[0]
        setErrors(fe)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await adminService.updateUser(id as string, { password: newPassword, password_confirmation: newPassword } as any)
      toast.success('Password changed successfully')
      setNewPassword('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error changing password')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  const tabs = [
    { key: 'edit' as const, label: 'Edit Profile' },
    { key: 'password' as const, label: 'Password' },
    { key: 'subscriptions' as const, label: 'Subscriptions' },
    { key: 'vcards' as const, label: 'vCards' },
    { key: 'activity' as const, label: 'Activity' },
  ]

  const inputClass = (key: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${
      errors[key] ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500'
    } bg-white dark:bg-gray-700 dark:text-white`

  return (
    <div className="max-w-4xl mx-auto">
      <Helmet><title>Edit User - Mobile VCard Link</title></Helmet>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/users')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">{initial}</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userName}</h1>
            <p className="text-sm text-gray-500">{form.email}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'edit' && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Profile Information</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input type="text" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} className={inputClass('first_name')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} className={inputClass('last_name')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass('email')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input type="text" value={form.contact} onChange={(e) => update('contact', e.target.value)} className={inputClass('contact')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} className={inputClass('location')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation</label>
                <input type="text" value={form.occupation} onChange={(e) => update('occupation', e.target.value)} className={inputClass('occupation')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} className={inputClass('website')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} rows={3} className={inputClass('bio')} />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_verified} onChange={(e) => update('is_verified', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Verified</span>
            </label>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3 rounded-b-xl">
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <div className="relative">
                <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className={inputClass('password')} />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button type="button" onClick={handlePasswordChange} disabled={loading || !newPassword} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Subscription History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Start</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">End</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {MOCK_SUBSCRIPTIONS.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{sub.plan_name}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        sub.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-50 text-gray-500'
                      }`}>{sub.status}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{sub.start_date}</td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{sub.end_date}</td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{sub.payment_type || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'vcards' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">User vCards</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {MOCK_VCARDS.map((vc) => (
                  <tr key={vc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{vc.name}</td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">/{vc.url_slug}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${vc.status ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700'}`}>
                        {vc.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{vc.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {MOCK_ACTIVITY.map((a, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{a.action}</p>
                <p className="text-xs text-gray-400">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}