import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { mockTemplates } from '../../../services/mockData'

const CATEGORIES = [
  'Restaurant', 'Café', 'Barber', 'Beauty Salon', 'Accountant', 'Estate Agent',
  'Solicitor', 'Consultant', 'Coach', 'Retail Store', 'Service Provider',
  'Healthcare', 'Fitness', 'Hotel', 'Events',
]

const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Poppins', 'Montserrat', 'Lora', 'DM Sans', 'Space Grotesk']
const BUTTON_STYLES = ['Rounded Full', 'Rounded LG', 'Rounded MD', 'Square', 'Pill']
const LOGO_POSITIONS = ['Top Center', 'Top Left', 'Top Right', 'Center', 'Bottom Center']
const BG_STYLES = ['Solid', 'Gradient', 'Subtle Pattern', 'Dark', 'Light']

const SECTIONS = [
  'About', 'Contact', 'Website', 'Products', 'Rewards', 'Bookings',
  'Reviews', 'Social Media', 'Gallery', 'Videos', 'Downloads', 'Payments', 'Store Links',
]

const STEPS = ['Basic Info', 'Theme', 'Sections', 'Publish']

const BUTTON_ROUNDING: Record<string, string> = {
  'Rounded Full': 'rounded-full',
  'Rounded LG': 'rounded-lg',
  'Rounded MD': 'rounded-md',
  'Square': 'rounded-none',
  'Pill': 'rounded-full',
}

const bgPreviewStyle = (bgStyle: string, primary: string, secondary: string) => {
  switch (bgStyle) {
    case 'Gradient': return { background: `linear-gradient(135deg, ${primary}22 0%, ${secondary}11 100%)` }
    case 'Dark': return { backgroundColor: secondary, color: '#fff' }
    case 'Light': return { backgroundColor: '#f8fafc', color: '#1e293b' }
    case 'Subtle Pattern': return { background: `repeating-linear-gradient(45deg, ${primary}08 0px, ${primary}08 2px, transparent 2px, transparent 8px)'` }
    default: return { backgroundColor: '#ffffff', color: '#1e293b' }
  }
}

export default function TemplateCreatePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const cloneId = searchParams.get('clone')
  const isClone = Boolean(cloneId)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', category: '', description: '',
    logoPosition: 'Top Center', font: 'Inter', buttonStyle: 'Rounded Full',
    bgStyle: 'Gradient', colorPrimary: '#FF5C00', colorSecondary: '#1E293B',
    sections: Object.fromEntries(SECTIONS.map((s) => [s.toLowerCase().replace(/\s+/g, '_'), true])),
    publishAction: 'draft' as 'draft' | 'publish' | 'archive',
  })

  useEffect(() => {
    const sourceId = id || cloneId
    if (sourceId) {
      const source = mockTemplates.find((t) => t.id === sourceId)
      if (source) {
        const sectionKey = (s: string) => s.toLowerCase().replace(/\s+/g, '_')
        const sections = Object.fromEntries(SECTIONS.map((s) => [sectionKey(s), source.sections[s] ?? false]))
        setForm({
          name: isClone ? `${source.name} (Clone)` : source.name,
          category: source.category,
          description: '',
          logoPosition: source.logo_position.charAt(0).toUpperCase() + source.logo_position.slice(1),
          font: source.font_family,
          buttonStyle: source.button_style.charAt(0).toUpperCase() + source.button_style.slice(1),
          bgStyle: source.bg_style.charAt(0).toUpperCase() + source.bg_style.slice(1),
          colorPrimary: source.primary_color,
          colorSecondary: source.secondary_color,
          sections,
          publishAction: source.status === 'published' ? 'publish' : 'draft',
        })
      }
    }
  }, [id, cloneId, isClone])

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }))
  const toggleSection = (key: string) => setForm((prev) => ({ ...prev, sections: { ...prev.sections, [key]: !prev.sections[key] } }))

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.category
    return true
  }

  const handleSubmit = () => {
    toast.success(isEdit ? 'Template updated successfully' : 'Template created successfully')
    navigate('/admin/templates')
  }

  const enabledSections = SECTIONS.filter((s) => form.sections[s.toLowerCase().replace(/\s+/g, '_')])

  return (
    <div className="space-y-6">
      <Helmet><title>{isEdit ? 'Edit Template' : isClone ? 'Clone Template' : 'Create Template'} - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Template' : isClone ? 'Clone Template' : 'Create Template'}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">4-step template {isEdit ? 'editor' : 'creation'} wizard</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' :
                'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${i <= step ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-12 h-0.5 mx-1 hidden sm:block ${i < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Template Name *</label>
                  <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Coffee Shop Pro" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                  <select value={form.category} onChange={(e) => update('category', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Describe this template..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Preview Image</label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:border-orange-400 transition-colors cursor-pointer">
                    <svg className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Drop template preview here or click to upload</p>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Theme Customization</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Logo Position</label>
                    <select value={form.logoPosition} onChange={(e) => update('logoPosition', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                      {LOGO_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Font Family</label>
                    <select value={form.font} onChange={(e) => update('font', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                      {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Button Style</label>
                    <select value={form.buttonStyle} onChange={(e) => update('buttonStyle', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                      {BUTTON_STYLES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Background Style</label>
                    <select value={form.bgStyle} onChange={(e) => update('bgStyle', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                      {BG_STYLES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={form.colorPrimary} onChange={(e) => update('colorPrimary', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{form.colorPrimary}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={form.colorSecondary} onChange={(e) => update('colorSecondary', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{form.colorSecondary}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Section Visibility</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Toggle which sections are available in this template.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SECTIONS.map((s) => {
                    const key = s.toLowerCase().replace(/\s+/g, '_')
                    return (
                      <label key={s} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-500/30 cursor-pointer transition-all">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s}</span>
                        <div onClick={() => toggleSection(key)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.sections[key] ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.sections[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Publish Template</h2>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Name', form.name],
                      ['Category', form.category],
                      ['Font', form.font],
                      ['Button Style', form.buttonStyle],
                      ['Logo Position', form.logoPosition],
                      ['Background', form.bgStyle],
                      ['Sections Enabled', Object.values(form.sections).filter(Boolean).length + ' / ' + SECTIONS.length],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <span className="text-gray-400 dark:text-gray-500">{label}:</span>{' '}
                        <span className="text-gray-900 dark:text-white font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Choose action</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'draft' as const, label: 'Save as Draft', desc: 'Keep editing later', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'hover:border-gray-400' },
                      { value: 'publish' as const, label: 'Publish', desc: 'Make live immediately', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10' },
                      { value: 'archive' as const, label: 'Archive', desc: 'Save without publishing', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', color: 'hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-500/10' },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => update('publishAction', opt.value)} className={[
                        'flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center',
                        form.publishAction === opt.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-100 dark:border-gray-700 ' + opt.color
                      ].join(' ')}>
                        <svg className={`w-8 h-8 ${form.publishAction === opt.value ? 'text-orange-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={opt.icon} /></svg>
                        <div>
                          <p className={`text-sm font-semibold ${form.publishAction === opt.value ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>{opt.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => step > 0 ? setStep(step - 1) : navigate('/admin/templates')} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()} className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                canNext() ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}>
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all">
                {form.publishAction === 'publish' ? 'Publish Template' : form.publishAction === 'draft' ? 'Save Draft' : 'Archive'}
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live Preview</h3>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{form.category || 'No category'}</span>
              </div>
              <div className="relative mx-auto max-w-[240px]" style={{ fontFamily: form.font }}>
                <div className="rounded-[32px] border-4 border-gray-200 dark:border-gray-600 overflow-hidden shadow-xl">
                  <div className="h-5 bg-gray-200 dark:bg-gray-600 flex items-center justify-center gap-1">
                    <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500" />
                  </div>
                  <div className="px-3 py-4 min-h-[400px]" style={bgPreviewStyle(form.bgStyle, form.colorPrimary, form.colorSecondary)}>
                    <div className="flex flex-col items-center gap-3">
                      {(form.logoPosition === 'Top Center' || form.logoPosition === 'Top Left' || form.logoPosition === 'Top Right') && (
                        <div className={`flex ${form.logoPosition === 'Top Center' ? 'justify-center' : form.logoPosition === 'Top Right' ? 'justify-end' : 'justify-start'} w-full`}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: form.colorPrimary }}>
                            M
                          </div>
                        </div>
                      )}
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md" style={{ backgroundColor: form.colorPrimary }}>
                        JD
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-sm" style={{ color: form.colorSecondary }}>John Doe</h4>
                        <p className="text-[10px] opacity-60" style={{ color: form.colorSecondary }}>Business Owner</p>
                      </div>
                      {(form.logoPosition === 'Center') && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: form.colorPrimary }}>
                          M
                        </div>
                      )}
                      <div className="w-full space-y-1.5 mt-1">
                        {enabledSections.slice(0, 5).map((s) => {
                          const icons: Record<string, string> = {
                            About: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                            Contact: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                            Website: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
                            Products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
                            Rewards: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
                            Bookings: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                            Reviews: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
                          }
                          const icon = icons[s] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                          return (
                            <div key={s} className={`flex items-center gap-2 px-3 py-2 text-[11px] font-medium shadow-sm ${BUTTON_ROUNDING[form.buttonStyle] || 'rounded-lg'}`}
                              style={{
                                backgroundColor: form.colorPrimary,
                                color: '#fff',
                              }}>
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg>
                              {s}
                            </div>
                          )
                        })}
                        {enabledSections.length > 5 && (
                          <div className="text-[10px] text-center opacity-60" style={{ color: form.colorSecondary }}>
                            +{enabledSections.length - 5} more
                          </div>
                        )}
                      </div>
                      {(form.logoPosition === 'Bottom Center') && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: form.colorPrimary }}>
                          M
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
