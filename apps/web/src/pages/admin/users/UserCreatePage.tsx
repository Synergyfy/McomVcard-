import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { adminService } from '../../../services/admin'
import toast from 'react-hot-toast'

export default function UserCreatePage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', password_confirmation: '',
    contact: '', location: '', occupation: '', website: '', bio: '',
    is_active: true, is_verified: true, email_verified_at: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match' })
      return
    }
    setLoading(true)
    try {
      await adminService.createUser({
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        phone: form.contact || undefined,
        status: form.is_active ? 'active' : 'inactive',
      })
      toast.success('User created successfully')
      navigate('/admin/users')
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

  const inputClass = (key: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${
      errors[key] ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500'
    } bg-white dark:bg-gray-700 dark:text-white`

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet><title>Add User - Mobile VCard Link</title></Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add User</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create a new user account</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Account Information</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
              <input type="text" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required className={inputClass('first_name')} />
              {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
              <input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} required className={inputClass('last_name')} />
              {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required className={inputClass('email')} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} required className={inputClass('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password *</label>
              <input type={showPassword ? 'text' : 'password'} value={form.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)} required className={inputClass('password_confirmation')} />
              {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Profile Details</h2>
        </div>
        <div className="p-6 space-y-5">
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

        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Account Status</h2>
        </div>
        <div className="px-6 pb-6 pt-4 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</p>
              <p className="text-xs text-gray-400">User can log in and use the platform</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_verified} onChange={(e) => update('is_verified', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified</p>
              <p className="text-xs text-gray-400">Email has been verified</p>
            </div>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3 rounded-b-xl">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button type="button" onClick={() => navigate('/admin/users')} className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}