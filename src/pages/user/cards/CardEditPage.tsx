import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockCardDesigns } from '../../../services/mockData'

const LAYOUTS = ['split', 'centered', 'header', 'minimal', 'bold', 'diagonal'] as const
const COLOR_PRESETS = ['#0F172A', '#D4AF37', '#FFFFFF', '#0D9488', '#F0FDFA', '#DC2626', '#1F2937', '#7C3AED', '#EC4899', '#059669', '#FEF3C7', '#2563EB', '#06B6D4', '#92400E', '#FFFBEB', '#18181B', '#FAFAFA', '#E11D48', '#14B8A6', '#0EA5E9', '#10B981', '#B45309', '#8B5CF6', '#EF4444', '#F59E0B']

export default function CardEditPage() {
  const { id } = useParams()
  const design = mockCardDesigns.find((d) => d.id === Number(id))
  const navigate = useNavigate()

  const [primaryColor, setPrimaryColor] = useState(design?.primaryColor || '#0F172A')
  const [secondaryColor, setSecondaryColor] = useState(design?.secondaryColor || '#D4AF37')
  const [accentColor, setAccentColor] = useState(design?.accentColor || '#FFFFFF')
  const [layout, setLayout] = useState(design?.layout || 'split')
  const [cardName, setCardName] = useState(design?.name || '')

  if (!design) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Card not found</p>
        <Link to="/user/cards" className="text-orange-500 hover:underline mt-2 inline-block">Back to Cards</Link>
      </div>
    )
  }

  const handleSave = () => {
    navigate('/user/cards')
  }

  return (
    <div>
      <Helmet><title>Edit Card - {design.name} - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link to="/user/cards" className="hover:text-orange-600">Cards</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{design.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Card Design</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/user/cards" className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </Link>
          <button onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Card Name</h3>
            <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />

            <hr className="border-gray-100 dark:border-gray-700" />

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Colors</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Primary Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c} onClick={() => setPrimaryColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Secondary Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c} onClick={() => setSecondaryColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${secondaryColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c} onClick={() => setAccentColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Layout</h3>
            <div className="grid grid-cols-3 gap-2">
              {LAYOUTS.map((l) => (
                <button key={l} onClick={() => setLayout(l)} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${layout === l ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="sticky top-6">
            <p className="text-xs text-gray-400 text-center mb-3">Live Preview</p>
            <div className="w-[320px] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="h-44 relative flex flex-col justify-between p-5" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                <div className="absolute top-3 right-3 opacity-20 text-white text-3xl font-black">MCOM</div>
                <div className="z-10">
                  <p className="text-[9px] text-white/60 uppercase tracking-wider mb-1">{design.type}</p>
                  <p className="text-lg font-bold text-white">{cardName || design.name}</p>
                  <p className="text-[10px] text-white/70">{design.style} · {layout}</p>
                </div>
                <div className="z-10 flex items-end justify-between">
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full border border-white/30" style={{ background: primaryColor }} />
                    <div className="w-5 h-5 rounded-full border border-white/30" style={{ background: secondaryColor }} />
                    <div className="w-5 h-5 rounded-full border border-white/30" style={{ background: accentColor }} />
                  </div>
                  <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center">
                    <div className="w-7 h-7 grid grid-cols-3 gap-[1px]">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="bg-white/80 rounded-[1px]" />)}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">M</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">{design.status}</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 py-2 text-center text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: primaryColor }}>Primary</div>
                  <div className="flex-1 py-2 text-center text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: secondaryColor }}>Secondary</div>
                </div>
                <p className="text-[10px] text-gray-400 text-center">{layout} layout · {design.usage.toLocaleString()} uses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}