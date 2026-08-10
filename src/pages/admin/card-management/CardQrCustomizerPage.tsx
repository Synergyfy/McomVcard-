import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import QrCodeSvg, { qrToPng } from '../../../components/admin/QrCodeSvg'
import { getCardTemplate, upsertCardTemplate } from '../../../services/cardTemplateStore'
import { DEFAULT_QR_CUSTOMIZATION } from '../../../services/qrCustomizerStore'

const COLOR_PRESETS = ['#111827', '#1e3a8a', '#4338ca', '#7c3aed', '#be185d', '#dc2626', '#ea580c', '#d97706', '#059669', '#0d9488', '#0891b2', '#2563eb']
const BG_PRESETS = ['#ffffff', '#f3f4f6', '#fef3c7', '#fce7f3', '#ecfdf5', '#eff6ff', '#000000']

const SHAPES = [
  { id: 'square', name: 'Square', desc: 'Sharp clean squares' },
  { id: 'rounded', name: 'Rounded', desc: 'Soft rounded corners' },
  { id: 'dots', name: 'Dots', desc: 'Circular data modules' },
  { id: 'diamond', name: 'Diamond', desc: 'Rotated 45° modules' },
  { id: 'leaf', name: 'Leaf', desc: 'Organic rounded dots' },
]

function ColorPicker({ label, value, onChange, presets }: {
  label: string
  value: string
  onChange: (v: string) => void
  presets: string[]
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        <label className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer overflow-hidden relative shrink-0">
          <span className="absolute inset-0" style={{ background: value }} />
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
        </label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="w-24 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        {presets.map(p => (
          <button key={p} type="button" onClick={() => onChange(p)}
            className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 ${value.toLowerCase() === p.toLowerCase() ? 'border-orange-500 scale-110' : 'border-white dark:border-gray-600 shadow-sm'}`}
            style={{ background: p }} title={p} />
        ))}
      </div>
    </div>
  )
}

function LogoPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Logo in the middle</label>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-contain" />
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          )}
        </div>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Paste image URL…"
          className="flex-1 min-w-0 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
        <button type="button" onClick={() => { const el = document.querySelector<HTMLInputElement>('#card-qr-logo-file'); el?.click() }}
          className="shrink-0 px-2.5 py-2 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Upload</button>
      </div>
    </div>
  )
}

export default function CardQrCustomizerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = Number(searchParams.get('id') ?? 0)
  const template = getCardTemplate(id)
  const qr = template?.builder.faces.front.find(s => s.schemaId === 'qr')

  const [cfg, setCfg] = useState({
    qrType: qr?.values.qrType || DEFAULT_QR_CUSTOMIZATION.qrType,
    url: qr?.values.url || '',
    qrDynamic: qr?.values.qrDynamic === '' ? '' : 'true',
    qrColor: qr?.values.qrColor || DEFAULT_QR_CUSTOMIZATION.qrColor,
    qrBgColor: qr?.values.qrBgColor || DEFAULT_QR_CUSTOMIZATION.qrBgColor,
    qrLogo: qr?.values.qrLogo || '',
    qrStyle: qr?.values.qrStyle || DEFAULT_QR_CUSTOMIZATION.qrStyle,
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const set = (k: 'qrType' | 'url' | 'qrDynamic' | 'qrColor' | 'qrBgColor' | 'qrLogo' | 'qrStyle', v: string) =>
    setCfg(prev => ({ ...prev, [k]: v }))

  const handleDownload = async () => {
    if (!cfg.url.trim()) { toast.error('Enter a destination link'); return }
    setDownloading(true)
    try {
      const url = await qrToPng(cfg.url || 'https://vcard.mcom/b/this-card', {
        fg: cfg.qrColor,
        bg: cfg.qrBgColor,
        style: cfg.qrStyle,
        logo: cfg.qrLogo,
        scale: 14,
      })
      const a = document.createElement('a')
      a.href = url
      a.download = 'qr-code.png'
      a.click()
      toast.success('QR code downloaded')
    } catch {
      toast.error('Could not export the QR code')
    } finally {
      setDownloading(false)
    }
  }

  const handleSave = () => {
    if (!template || !qr) return
    if (!cfg.url.trim()) { toast.error('Enter a destination link'); return }
    setSaving(true)
    setTimeout(() => {
      upsertCardTemplate({
        ...template,
        builder: {
          ...template.builder,
          faces: {
            ...template.builder.faces,
            front: template.builder.faces.front.map(s => (
              s.schemaId === 'qr'
                ? { ...s, values: { ...s.values, qrType: cfg.qrType, url: cfg.url, qrDynamic: cfg.qrDynamic, qrColor: cfg.qrColor, qrBgColor: cfg.qrBgColor, qrLogo: cfg.qrLogo, qrStyle: cfg.qrStyle } }
                : s
            )),
          },
        },
      })
      setSaving(false)
      setSaved(true)
      toast.success('QR code customized and saved')
    }, 500)
  }

  const goBack = () => navigate(`/admin/card-management/card-template-builder?id=${id}&tab=content`)

  if (!template || !qr) {
    return (
      <div className="space-y-4">
        <Helmet><title>QR Customizer - Card Management - MCOM VCard</title></Helmet>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card template or QR section not found.</p>
          <Link to="/admin/card-management/business-card-templates" className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Back to Card Templates</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Helmet><title>QR Customizer - Card Management - MCOM VCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/admin/card-management" className="hover:text-orange-600">Card Management</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <Link to={`/admin/card-management/card-template-builder?id=${id}&tab=content`} className="hover:text-orange-600">{template.name}</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">QR Customizer</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">QR Code Customizer</h2>
            <p className="text-[10px] text-gray-400">Control the link and design the QR for this card — logo, colors and shape.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goBack}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Template Builder
          </button>
          <button onClick={handleDownload} disabled={downloading}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-1.5 disabled:opacity-50">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {downloading ? 'Exporting…' : 'Download PNG'}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 inline-flex items-center gap-1.5">
            {saving ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Saving…
              </>
            ) : 'Save'}
          </button>
        </div>
      </div>

      {/* Success banner after save */}
      {saved && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">QR code saved</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Your customization is ready to use in the card template builder.</p>
            </div>
          </div>
          <button onClick={goBack}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1.5">
            Go back to the card template builder →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 sticky top-4">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3 flex items-center justify-between">
              Live preview
              <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600">Updates as you type</span>
            </h4>
            <div className="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-8 flex items-center justify-center min-h-[320px]">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-xl">
                <QrCodeSvg value={cfg.url} fg={cfg.qrColor} bg={cfg.qrBgColor} style={cfg.qrStyle} logo={cfg.qrLogo} sizeClass="w-44 h-44" />
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[9px] text-gray-400">
              <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Ready to scan — point a phone camera at the code to open <span className="text-gray-500 truncate">{cfg.url}</span>
            </p>
            <div className="mt-2 space-y-2 text-[10px]">
              <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-400">Routes to</span>
                <span className="font-medium text-gray-700 dark:text-gray-200 max-w-[70%] truncate">{cfg.qrType} — {cfg.url}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-400">Style</span>
                <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">{cfg.qrStyle}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-400">Logo</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{cfg.qrLogo ? 'Added' : 'None'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Dynamic</span>
                <span className={`font-medium ${cfg.qrDynamic === 'true' ? 'text-emerald-600' : 'text-gray-400'}`}>{cfg.qrDynamic === 'true' ? 'On — link can change later' : 'Off'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="lg:col-span-3 space-y-4">
          {/* Link control */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Where it goes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">What the QR does</label>
                <select value={cfg.qrType} onChange={e => set('qrType', e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {['Open this VCard', 'Business Profile', 'Campaign', 'Membership Page', 'Custom Link', 'Download vCard'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Destination link</label>
                <input type="text" value={cfg.url} onChange={e => set('url', e.target.value)} placeholder="https://…"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between bg-orange-50/60 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-lg px-3 py-2.5">
              <div>
                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">Dynamic content</p>
                <p className="text-[9px] text-gray-400">Update the destination later without reprinting the card.</p>
              </div>
              <button type="button" onClick={() => set('qrDynamic', cfg.qrDynamic === 'true' ? '' : 'true')}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${cfg.qrDynamic === 'true' ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${cfg.qrDynamic === 'true' ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Shape */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              QR shape
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SHAPES.map(s => {
                const active = cfg.qrStyle === s.id
                return (
                  <button key={s.id} onClick={() => set('qrStyle', s.id)}
                    className={`p-2.5 rounded-xl border text-center transition-colors ${active ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-200 dark:border-gray-600 hover:border-orange-300'}`}>
                    <div className="flex justify-center mb-1.5">
                      <QrCodeSvg value={cfg.url || 'https://vcard.mcom/b/this-card'} fg="#111827" bg="#ffffff" style={s.id} sizeClass="w-10 h-10" />
                    </div>
                    <p className={`text-[10px] font-semibold ${active ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-200'}`}>{s.name}</p>
                    <p className="text-[8px] text-gray-400 leading-tight">{s.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              Colors
            </h4>
            <div className="space-y-3">
              <ColorPicker label="QR color" value={cfg.qrColor} onChange={v => set('qrColor', v)} presets={COLOR_PRESETS} />
              <ColorPicker label="Background color" value={cfg.qrBgColor} onChange={v => set('qrBgColor', v)} presets={BG_PRESETS} />
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Logo
            </h4>
            <LogoPicker value={cfg.qrLogo} onChange={v => set('qrLogo', v)} />
            <input id="card-qr-logo-file" type="file" accept="image/*" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => { set('qrLogo', String(reader.result)); toast.success('Logo added') }
                reader.readAsDataURL(file)
                e.target.value = ''
              }} />
            <p className="text-[8px] text-gray-400 mt-1.5">The logo sits in the center of the QR. Tip: use a small, simple logo so the code stays scannable.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
