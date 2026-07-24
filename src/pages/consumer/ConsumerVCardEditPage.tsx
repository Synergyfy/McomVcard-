import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockTemplates } from '../../services/mockData'

const TEMPLATE_COLORS = ['#FF5C00', '#2563EB', '#7C3AED', '#059669', '#DC2626', '#EC4899', '#0891B2', '#F59E0B', '#1E293B', '#18181B']
const FONT_OPTIONS = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Playfair Display', 'Lora', 'DM Sans', 'Space Grotesk']
const BG_STYLES = ['gradient', 'solid', 'pattern', 'minimal']
const BUTTON_STYLES = ['rounded', 'pill', 'square']

export default function ConsumerVCardEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const template = mockTemplates.find((t) => t.id === Number(id)) || mockTemplates[0]

  const [primaryColor, setPrimaryColor] = useState(template.primary_color)
  const [secondaryColor, setSecondaryColor] = useState(template.secondary_color)
  const [fontFamily, setFontFamily] = useState(template.font_family)
  const [bgStyle, setBgStyle] = useState(template.bg_style)
  const [buttonStyle, setButtonStyle] = useState(template.button_style)
  const [logoPosition, setLogoPosition] = useState(template.logo_position)
  const [displayName, setDisplayName] = useState('Alex Morgan')
  const [tagline, setTagline] = useState('Digital Marketing Professional')
  const [phone, setPhone] = useState('+1 (555) 111-2222')
  const [email, setEmail] = useState('alex@morgan.com')
  const [website, setWebsite] = useState('alexmorgan.com')
  const [address, setAddress] = useState('San Francisco, CA')
  const [tab, setTab] = useState<'style' | 'content' | 'sections'>('style')

  const btnRadius = buttonStyle === 'pill' ? '9999px' : buttonStyle === 'square' ? '4px' : '8px'

  const handleSave = () => {
    navigate('/consumer/vcard-templates')
  }

  return (
    <div>
      <Helmet><title>Edit vCard - MCOM VCard</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link to="/consumer/vcard-templates" className="hover:text-orange-600">My vCards</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{template.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit vCard</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/consumer/vcard-templates" className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </Link>
          <button onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Controls ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['style', 'content', 'sections'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-xs font-medium rounded-md transition-all capitalize ${tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'style' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Colors</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Primary Color</label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_COLORS.map((c) => (
                    <button key={c} onClick={() => setPrimaryColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Secondary Color</label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_COLORS.map((c) => (
                    <button key={c} onClick={() => setSecondaryColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${secondaryColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Typography</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Font Family</label>
                <div className="grid grid-cols-2 gap-2">
                  {FONT_OPTIONS.map((f) => (
                    <button key={f} onClick={() => setFontFamily(f)} className={`px-3 py-2 text-xs rounded-lg border transition-all text-left ${fontFamily === f ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-semibold' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`} style={{ fontFamily: f }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Layout</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Background Style</label>
                <div className="flex gap-2">
                  {BG_STYLES.map((s) => (
                    <button key={s} onClick={() => setBgStyle(s)} className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${bgStyle === s ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Button Style</label>
                <div className="flex gap-2">
                  {BUTTON_STYLES.map((s) => (
                    <button key={s} onClick={() => setButtonStyle(s)} className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${buttonStyle === s ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Logo Position</label>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map((p) => (
                    <button key={p} onClick={() => setLogoPosition(p)} className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${logoPosition === p ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'content' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Personal Info</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tagline / Bio</label>
                <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <hr className="border-gray-100 dark:border-gray-700" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact Details</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Website</label>
                <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          )}

          {tab === 'sections' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Toggle Sections</h3>
              {Object.entries(template.sections).map(([key, val]) => (
                <label key={key} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{key}</span>
                  <div className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${val ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${val ? 'translate-x-4' : ''}`} />
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ── Live Preview ── */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="sticky top-6">
            <p className="text-xs text-gray-400 text-center mb-3">Live Preview</p>
            <div className="w-[320px] rounded-[2.5rem] border-[6px] border-gray-900 dark:border-gray-700 shadow-2xl overflow-hidden bg-white">
              <div className="h-7 bg-gray-900 flex items-center justify-between px-5">
                <span className="text-[9px] text-white/70 font-medium">9:41</span>
                <div className="flex gap-1">
                  <div className="w-3 h-2 rounded-sm bg-white/70" />
                  <div className="w-1 h-2 rounded-sm bg-white/70" />
                  <div className="w-3 h-2 rounded-sm bg-white/70" />
                </div>
              </div>

              <div className="min-h-[540px] overflow-hidden" style={{ fontFamily: fontFamily }}>
                <div className="relative h-36" style={{ background: bgStyle === 'gradient' ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` : bgStyle === 'solid' ? primaryColor : bgStyle === 'pattern' ? `linear-gradient(135deg, ${primaryColor}ee, ${secondaryColor}cc)` : `linear-gradient(180deg, ${primaryColor}22, white)` }}>
                  {bgStyle === 'pattern' && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }} />}
                </div>

                <div className={`px-5 -mt-12 ${logoPosition === 'center' ? 'text-center' : logoPosition === 'right' ? 'text-right' : ''}`}>
                  <div className={`w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-bold ${logoPosition === 'center' ? 'mx-auto' : logoPosition === 'right' ? 'ml-auto' : ''}`} style={{ backgroundColor: primaryColor }}>
                    {displayName.charAt(0)}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-gray-900">{displayName}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{tagline}</p>
                </div>

                <div className="px-5 mt-4 flex gap-2">
                  <a href={`tel:${phone}`} className="flex-1 text-center py-2 text-white text-xs font-semibold" style={{ backgroundColor: primaryColor, borderRadius: btnRadius }}>
                    Call
                  </a>
                  <a href={`mailto:${email}`} className="flex-1 text-center py-2 text-white text-xs font-semibold" style={{ backgroundColor: secondaryColor, borderRadius: btnRadius }}>
                    Email
                  </a>
                </div>

                <div className="px-5 mt-4 space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                      <svg className="w-4 h-4" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Phone</p>
                      <p className="text-xs font-medium text-gray-900">{phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                      <svg className="w-4 h-4" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Email</p>
                      <p className="text-xs font-medium text-gray-900">{email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                      <svg className="w-4 h-4" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Website</p>
                      <p className="text-xs font-medium text-gray-900">{website}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                      <svg className="w-4 h-4" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Address</p>
                      <p className="text-xs font-medium text-gray-900">{address}</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 mt-4 flex justify-center gap-3">
                  {['facebook', 'instagram', 'twitter', 'linkedin'].map((s) => (
                    <div key={s} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                      <span className="text-[10px] font-bold uppercase" style={{ color: primaryColor }}>{s.charAt(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="px-5 mt-6 mb-4 text-center">
                  <p className="text-[9px] text-gray-300">Powered by MCOM VCard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
