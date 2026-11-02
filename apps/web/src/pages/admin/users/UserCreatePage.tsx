import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { adminService } from '../../../services/admin'
import InfoTooltip from '../../../components/common/InfoTooltip'
import toast from 'react-hot-toast'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function UserCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', password_confirmation: '',
    contact: '', location: '', occupation: '', website: '', is_active: true, is_verified: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.first_name.trim()) next.first_name = 'First name is required'
    if (!form.last_name.trim()) next.last_name = 'Last name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!emailRe.test(form.email.trim())) next.email = 'Enter a valid email address'
    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters'
    if (form.password !== form.password_confirmation) next.password_confirmation = 'Passwords do not match'
    if (form.website && !/^https?:\/\/.+/i.test(form.website)) next.website = 'Website must start with http:// or https://'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await adminService.createUser({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        password_confirmation: form.password_confirmation,
        phone: form.contact || undefined,
        job_title: form.occupation || undefined,
        address: form.location || undefined,
        company_website: form.website || undefined,
        status: form.is_active ? 'active' : 'suspended',
        is_verified: form.is_verified,
      } as any)
      toast.success('User created successfully')
      navigate('/admin/users')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'An error occurred')
      if (err?.response?.data?.errors) {
        const fe: Record<string, string> = {}
        for (const [k, msgs] of Object.entries(err.response.data.errors)) fe[k] = (msgs as string[])[0]
        setErrors(fe)
      }
    } finally { setLoading(false) }
  }

  const inputClass = (key: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${errors[key] ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500'} bg-white dark:bg-gray-700 dark:text-white`

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet><title>Add User - Mobile VCard Link</title></Helmet>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add User</h1><p className="text-sm text-gray-500 mt-0.5">Create a new user account</p></div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700"><h2 className="font-semibold text-gray-900 dark:text-white">Account Information</h2></div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *<InfoTooltip text="The user's given name, used on cards and in transactional email greetings." /></label><input type="text" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} className={inputClass('first_name')} />{errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}</div>
            <div><label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *<InfoTooltip text="The user's family name. Optional but recommended for display." /></label><input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} className={inputClass('last_name')} />{errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}</div>
          </div>
          <div><label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *<InfoTooltip text="Unique sign-in address. Transactional email is delivered to this address via Resend." /></label><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass('email')} />{errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *<InfoTooltip text="At least 8 characters. The password is hashed on the server and never returned by the API." /></label><div className="relative"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} className={inputClass('password')} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{showPassword ? 'Hide' : 'Show'}</button></div>{errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}</div>
            <div><label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password *<InfoTooltip text="Re-enter the same password to prevent typos." /></label><input type={showPassword ? 'text' : 'password'} value={form.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)} className={inputClass('password_confirmation')} />{errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}</div>
          </div>
        </div>
        <div className="px-6 py-5 border-t border-b border-gray-100 dark:border-gray-700"><h2 className="font-semibold text-gray-900 dark:text-white">Profile Details</h2></div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone<InfoTooltip text="Optional contact number stored on the user profile." /></label><input type="text" value={form.contact} onChange={(e) => update('contact', e.target.value)} className={inputClass('contact')} /></div>
            <div><label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location<InfoTooltip text="Optional postal address used by local discovery features." /></label><input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} className={inputClass('location')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation<InfoTooltip text="Optional job title shown on the user's VCard." /></label><input type="text" value={form.occupation} onChange={(e) => update('occupation', e.target.value)} className={inputClass('occupation')} /></div>
            <div><label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website<InfoTooltip text="Optional website URL. Must include http:// or https://." /></label><input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} className={inputClass('website')} />{errors.website && <p className="text-xs text-red-500 mt-1">{errors.website}</p>}</div>
          </div>
        </div>
        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-700"><h2 className="font-semibold text-gray-900 dark:text-white">Account Status</h2></div>
        <div className="px-6 pb-6 pt-4 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" /><div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</p><p className="text-xs text-gray-400">User can log in and use the platform</p></div></label>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.is_verified} onChange={(e) => update('is_verified', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" /><div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified</p><p className="text-xs text-gray-400">Email has been verified</p></div></label>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3 rounded-b-xl">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create User'}</button>
          <button type="button" onClick={() => navigate('/admin/users')} className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
        </div>
      </form>
    </div>
  )
}
