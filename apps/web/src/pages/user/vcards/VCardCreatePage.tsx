import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function VCardCreatePage() {
  const navigate = useNavigate()
  const profileRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '', url_slug: '', occupation: '', description: '',
  })
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.url_slug.trim()) newErrors.url_slug = 'URL slug is required'
    if (form.url_slug.includes(' ')) newErrors.url_slug = 'No spaces allowed'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setCreatedId(Math.floor(Math.random() * 1000) + 100)
      setSuccess(true)
    }, 800)
  }

  if (success && createdId) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <Helmet><title>vCard Created - MCOM VCard Social Bio</title></Helmet>
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Card Created Successfully!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Your vCard has been created. Now let's set it up with all the details.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/user/vcards/${createdId}/edit`)} className="px-6 py-3 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
            Set Up Your Card
          </button>
          <button onClick={() => navigate('/user/vcards')} className="px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Back to vCards
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Helmet><title>Create vCard - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New vCard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter the basic details to create your vCard</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image</label>
          <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-200 dark:border-gray-600">
            {coverPreview ? (
              <img src={coverPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-xs">Click to upload cover image</p>
              </div>
            )}
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setCoverPreview(URL.createObjectURL(e.target.files[0])) }} />
            <button type="button" onClick={() => coverRef.current?.click()} className="absolute inset-0" />
          </div>
        </div>

        {/* Profile Image */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden shrink-0">
            {profilePreview ? <img src={profilePreview} alt="" className="w-full h-full object-cover" /> : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            )}
          </div>
          <div>
            <button type="button" onClick={() => profileRef.current?.click()} className="px-4 py-2 text-sm font-medium text-orange-600 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
              Upload Profile Photo
            </button>
            <input ref={profileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setProfilePreview(URL.createObjectURL(e.target.files[0])) }} />
            <p className="text-[11px] text-gray-400 mt-1">Square image recommended</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Card Name *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Business Card" className={`w-full px-4 py-2.5 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500`} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* URL Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">URL Slug *</label>
          <div className="flex items-center">
            <span className="px-3 py-2.5 bg-gray-100 dark:bg-gray-600 border border-r-0 border-gray-200 dark:border-gray-600 rounded-l-lg text-xs text-gray-500 shrink-0">vcard.com/</span>
            <input type="text" value={form.url_slug} onChange={(e) => setForm({ ...form, url_slug: e.target.value.replace(/\s/g, '') })} placeholder="my-card" className={`flex-1 px-3 py-2.5 rounded-r-lg border ${errors.url_slug ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500`} />
          </div>
          {errors.url_slug && <p className="text-xs text-red-500 mt-1">{errors.url_slug}</p>}
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Occupation</label>
          <input type="text" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Software Engineer" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Tell people about yourself or your business..." className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
            {loading ? 'Creating...' : 'Create vCard'}
          </button>
          <button type="button" onClick={() => navigate('/user/vcards')} className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
