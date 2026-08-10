import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import QRCode from 'qrcode'
import { mockCardDesigns } from '../../services/mockData'
import { consumerService } from '../../services/consumer'
import CardProtectionPanel from '../../components/consumer/settings/CardProtectionPanel'

const LAYOUTS = ['split', 'centered', 'header', 'minimal', 'bold', 'diagonal'] as const
const COLOR_PRESETS = ['#0F172A', '#D4AF37', '#FFFFFF', '#0D9488', '#F0FDFA', '#DC2626', '#1F2937', '#7C3AED', '#EC4899', '#059669', '#FEF3C7', '#2563EB', '#06B6D4', '#92400E', '#FFFBEB', '#18181B', '#FAFAFA', '#E11D48', '#14B8A6', '#0EA5E9', '#10B981', '#B45309', '#8B5CF6', '#EF4444', '#F59E0B']

const tooltips: Record<string, string> = {
  primaryColor: 'Main background color of the card front',
  secondaryColor: 'Secondary gradient color for the card front',
  accentColor: 'Highlight color for accents and icons',
  layout: 'Choose how content is arranged on the card',
  logo: 'Upload your personal logo or avatar (recommended: 200x200px)',
  name: 'Your full name as it appears on the card',
  title: 'Your role, tagline, or headline',
  phone: 'Contact number for business inquiries',
  email: 'Email address for professional contact',
  description: 'A short bio or description about yourself',
  customFields: 'Add extra fields like social links, address, or website',
}

interface CollapsibleSectionProps {
  title: string
  tooltipKey?: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}

function CollapsibleSection({ title, tooltipKey, open, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="group w-full flex items-center justify-between gap-2 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          {tooltipKey && (
            <span className="relative w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 text-[9px] flex items-center justify-center text-gray-500 cursor-help">
              ?
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-20 hidden group-hover:block pointer-events-none">{tooltips[tooltipKey]}</span>
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}

interface CustomField {
  id: number
  label: string
  value: string
}

export default function ConsumerCardEditPage() {
  const { designId } = useParams()
  const design = mockCardDesigns.find((d) => d.id === Number(designId))
  const navigate = useNavigate()

  const [name, setName] = useState('Your Name')
  const [title, setTitle] = useState('Nature Lover')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('Passionate about connecting people through beautiful card designs.')
  const [primaryColor, setPrimaryColor] = useState(design?.primaryColor || '#0F172A')
  const [secondaryColor, setSecondaryColor] = useState(design?.secondaryColor || '#D4AF37')
  const [accentColor, setAccentColor] = useState(design?.accentColor || '#FFFFFF')
  const [layout, setLayout] = useState(design?.layout || 'split')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: 1, label: 'Website', value: 'mcomvcard.link' },
  ])
  const [nextFieldId, setNextFieldId] = useState(2)
  const [flipped, setFlipped] = useState(false)
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (key: string) => setOpenSection((prev) => (prev === key ? null : key))

  // Card share link + QR
  const [cardId, setCardId] = useState('CARD-CNS-000001')
  const [cardUrl, setCardUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    consumerService.getProfile()
      .then((p) => {
        setCardId(p.cardId || 'CARD-CNS-000001')
        setName(p.name)
        setPhone(p.phone)
        setEmail(p.email)
        setCustomFields((fields) => [
          ...fields.map((f) => (f.label === 'Website' ? { ...f, value: p.cardId ? `mcomvcard.link/c/${p.cardId.toLowerCase()}` : f.value } : f)),
        ])
      })
      .catch(() => { /* keep default */ })
  }, [])

  useEffect(() => {
    setCardUrl(`https://mcomvcard.link/c/${cardId}`)
  }, [cardId])

  useEffect(() => {
    if (!cardUrl) return
    QRCode.toDataURL(cardUrl, { width: 96, margin: 1, errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => { /* ignore render errors */ })
  }, [cardUrl])

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(cardUrl)
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!design) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Card design not found</p>
        <Link to="/consumer/card-designs" className="text-orange-500 hover:underline mt-2 inline-block">Back to My Cards</Link>
      </div>
    )
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setLogoError(null)
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setLogoError('File too large. Max 2MB.')
        return
      }
      if (!file.type.startsWith('image/')) {
        setLogoError('Please upload an image file.')
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addField = () => {
    setCustomFields([...customFields, { id: nextFieldId, label: '', value: '' }])
    setNextFieldId(nextFieldId + 1)
  }

  const removeField = (id: number) => {
    setCustomFields(customFields.filter((f) => f.id !== id))
  }

  const updateField = (id: number, key: 'label' | 'value', val: string) => {
    setCustomFields(customFields.map((f) => f.id === id ? { ...f, [key]: val } : f))
  }

  const handleSave = () => {
    navigate('/consumer/card-designs')
  }

  return (
    <div>
      <Helmet><title>Edit Card - {design.name} - MCOM VCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
        <Link to="/consumer/card-designs" className="hover:text-orange-600">My Cards</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{design.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Card Details</h1>
        <div className="flex gap-2">
          <Link to="/consumer/card-designs" className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </Link>
          <button onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Controls */}
        <div className="lg:col-span-3 space-y-4">
          {/* Basic Info */}
          <CollapsibleSection title="Basic Info" tooltipKey="name" open={openSection === 'basic'} onToggle={() => toggleSection('basic')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                  <div className="relative">
                    <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 text-[7px] flex items-center justify-center text-gray-500 cursor-help" onMouseEnter={() => setTooltip('name')} onMouseLeave={() => setTooltip(null)}>?</span>
                    {tooltip === 'name' && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-10">{tooltips.name}</div>}
                  </div>
                </div>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Title / Tagline</label>
                  <div className="relative">
                    <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 text-[7px] flex items-center justify-center text-gray-500 cursor-help" onMouseEnter={() => setTooltip('title')} onMouseLeave={() => setTooltip(null)}>?</span>
                    {tooltip === 'title' && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-10">{tooltips.title}</div>}
                  </div>
                </div>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Phone</label>
                  <div className="relative">
                    <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 text-[7px] flex items-center justify-center text-gray-500 cursor-help" onMouseEnter={() => setTooltip('phone')} onMouseLeave={() => setTooltip(null)}>?</span>
                    {tooltip === 'phone' && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-10">{tooltips.phone}</div>}
                  </div>
                </div>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Email</label>
                  <div className="relative">
                    <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 text-[7px] flex items-center justify-center text-gray-500 cursor-help" onMouseEnter={() => setTooltip('email')} onMouseLeave={() => setTooltip(null)}>?</span>
                    {tooltip === 'email' && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-10">{tooltips.email}</div>}
                  </div>
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Description / Bio</label>
                <div className="relative">
                  <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 text-[7px] flex items-center justify-center text-gray-500 cursor-help" onMouseEnter={() => setTooltip('description')} onMouseLeave={() => setTooltip(null)}>?</span>
                  {tooltip === 'description' && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-10">{tooltips.description}</div>}
                </div>
              </div>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
            </div>
          </CollapsibleSection>

          {/* Logo Upload */}
          <CollapsibleSection title="Logo / Avatar" tooltipKey="logo" open={openSection === 'logo'} onToggle={() => toggleSection('logo')}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
              </div>
              <label className="relative cursor-pointer">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">Upload Logo</div>
              </label>
              {logoPreview && (
                <button onClick={() => setLogoPreview(null)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
              )}
            </div>
            {logoError && <p className="text-xs text-red-500">{logoError}</p>}
          </CollapsibleSection>

          {/* Custom Fields */}
          <CollapsibleSection title="Custom Fields" tooltipKey="customFields" open={openSection === 'custom'} onToggle={() => toggleSection('custom')}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Social links, website, or any other info.</p>
              <button onClick={addField} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Field
              </button>
            </div>
            {customFields.length ? (
              <div className="space-y-2">
                {customFields.map((f) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <input type="text" placeholder="Label (e.g. Instagram)" value={f.label} onChange={(e) => updateField(f.id, 'label', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-400" />
                    <input type="text" placeholder="Value (e.g. @alex)" value={f.value} onChange={(e) => updateField(f.id, 'value', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-400" />
                    <button onClick={() => removeField(f.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No custom fields yet. Click "Add Field" to add social links, website, or any other info.</p>
            )}
          </CollapsibleSection>

          {/* Colors & Layout */}
          <CollapsibleSection title="Colors & Layout" tooltipKey="primaryColor" open={openSection === 'colors'} onToggle={() => toggleSection('colors')}>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Primary Color</label>
                <div className="relative">
                  <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 text-[7px] flex items-center justify-center text-gray-500 cursor-help" onMouseEnter={() => setTooltip('primaryColor')} onMouseLeave={() => setTooltip(null)}>?</span>
                  {tooltip === 'primaryColor' && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-10">{tooltips.primaryColor}</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c} onClick={() => setPrimaryColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Secondary Color</label>
                <div className="relative">
                  <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 text-[7px] flex items-center justify-center text-gray-500 cursor-help" onMouseEnter={() => setTooltip('secondaryColor')} onMouseLeave={() => setTooltip(null)}>?</span>
                  {tooltip === 'secondaryColor' && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-10">{tooltips.secondaryColor}</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c} onClick={() => setSecondaryColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${secondaryColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Accent Color</label>
                <div className="relative">
                  <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 text-[7px] flex items-center justify-center text-gray-500 cursor-help" onMouseEnter={() => setTooltip('accentColor')} onMouseLeave={() => setTooltip(null)}>?</span>
                  {tooltip === 'accentColor' && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-10">{tooltips.accentColor}</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c} onClick={() => setAccentColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Layout</label>
                <div className="relative">
                  <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 text-[7px] flex items-center justify-center text-gray-500 cursor-help" onMouseEnter={() => setTooltip('layout')} onMouseLeave={() => setTooltip(null)}>?</span>
                  {tooltip === 'layout' && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-10">{tooltips.layout}</div>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {LAYOUTS.map((l) => (
                  <button key={l} onClick={() => setLayout(l)} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${layout === l ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Card Security & Passcode */}
          <CollapsibleSection title="Card Security & Passcode" open={openSection === 'security'} onToggle={() => toggleSection('security')}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              The QR on your card opens your shared card. The balance area is protected by the passcode you set here.
            </p>

            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Card Link</label>
            <div className="flex items-center gap-2 mb-4">
              <input readOnly value={cardUrl} onFocus={(e) => e.target.select()} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <button onClick={copyLink} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30'}`}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <CardProtectionPanel
              cardId={cardId}
              title="Protect My Shared Card"
              description="Require a passcode to view the balance area"
            />
          </CollapsibleSection>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400">Live Preview</p>
              <button onClick={() => setFlipped(!flipped)} className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {flipped ? 'Show Front' : 'Show Back'}
              </button>
            </div>
            <div className="w-full max-w-[320px]">
              {!flipped ? (
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                  <div className="h-44 relative flex flex-col justify-between p-5" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                    <div className="absolute top-3 right-3 opacity-20 text-white text-3xl font-black">MCOM</div>
                    <div className="z-10">
                      {logoPreview && <img src={logoPreview} alt="" className="w-8 h-8 rounded-lg object-cover mb-1 shadow" />}
                      <p className="text-[9px] text-white/60 uppercase tracking-wider mb-1">{design.type}</p>
                      <p className="text-lg font-bold text-white">{name || 'Your Name'}</p>
                      <p className="text-[10px] text-white/70">{title || design.style} · {layout}</p>
                    </div>
                    <div className="z-10 flex items-end justify-between">
                      <div className="flex gap-1">
                        {[primaryColor, secondaryColor, accentColor].map((color, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border border-white/30" style={{ background: color }} />
                        ))}
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-md shrink-0 overflow-hidden">
                        {qrDataUrl ? (
                          <img src={qrDataUrl} alt="Card QR code" className="w-11 h-11 object-contain" />
                        ) : (
                          <div className="w-10 h-10 animate-pulse bg-gray-100" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                        {logoPreview ? <img src={logoPreview} alt="" className="w-full h-full rounded-lg object-cover" /> : 'M'}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">{design.status}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{name || 'Your Name'}</p>
                      <p className="text-[10px] text-gray-500">{title || design.style}</p>
                    </div>
                    {phone && <div className="flex items-center gap-1.5 text-[10px] text-gray-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{phone}</div>}
                    {email && <div className="flex items-center gap-1.5 text-[10px] text-gray-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{email}</div>}
                    {customFields.filter(f => f.label && f.value).map(f => (
                      <div key={f.id} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{f.label}:</span> {f.value}
                      </div>
                    ))}
                    {description && <p className="text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">{description}</p>}
                    <div className="flex gap-2">
                      <div className="flex-1 py-2 text-center text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: primaryColor }}>Primary</div>
                      <div className="flex-1 py-2 text-center text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: secondaryColor }}>Secondary</div>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center">{layout} layout · {design.usage.toLocaleString()} uses</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-[400px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold mb-3 shadow">
                    {logoPreview ? <img src={logoPreview} alt="" className="w-full h-full rounded-xl object-cover" /> : 'M'}
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{name || 'Your Name'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}