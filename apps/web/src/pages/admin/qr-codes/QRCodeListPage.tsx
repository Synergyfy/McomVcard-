import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import StatsCard from '../../../components/admin/StatsCard'
import InputField from '../../../components/auth/InputField'

const MOCK = [
  { id: 1, name: 'GreenLeaf QR', type: 'Card QR', business: 'GreenLeaf Coffee', scans: 1280, status: 'active', created: 'Jan 2026' },
  { id: 2, name: 'Summer Campaign QR', type: 'Campaign QR', business: 'TechVision Inc', scans: 4500, status: 'active', created: 'Mar 2026' },
  { id: 3, name: 'Reward Redemption', type: 'Reward QR', business: 'Pizza Roma', scans: 890, status: 'active', created: 'Apr 2026' },
  { id: 4, name: 'Event Check-in', type: 'Event QR', business: 'Coastal Realty', scans: 2100, status: 'active', created: 'May 2026' },
  { id: 5, name: 'Booking QR', type: 'Booking QR', business: 'FitLife Studio', scans: 560, status: 'inactive', created: 'Feb 2026' },
  { id: 6, name: 'Store Link QR', type: 'Store QR', business: 'Bloom Beauty Salon', scans: 340, status: 'active', created: 'Jun 2026' },
]

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) => (
  <label className="flex items-center gap-2.5 cursor-pointer">
    <div className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </div>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
)

export default function QRCodeListPage() {
  const [data] = useState(MOCK)
  const [settings, setSettings] = useState({ default_size: 300, foreground_color: '#000000', background_color: '#FFFFFF', error_correction: 'M', default_format: 'png', include_logo: true, logo_size: 60, corner_style: 'square' })
  const [saving, setSaving] = useState(false)

  const handleQrSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)
    toast.success('QR settings saved')
  }

  return (
    <div className="space-y-6">
      <Helmet><title>QR Codes - MCOM VCard Social Bio</title></Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Codes</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">QR code management across the platform — {data.length} codes</p></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total QR Codes" value={data.length} color="blue" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>} />
        <StatsCard title="Active" value={data.filter((q) => q.status === 'active').length} color="green" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatsCard title="Total Scans" value={data.reduce((s, q) => s + q.scans, 0).toLocaleString()} color="purple" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
        <StatsCard title="Avg Scans/Code" value={Math.round(data.reduce((s, q) => s + q.scans, 0) / data.length).toLocaleString()} color="orange" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead><tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Type</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Business</th>
            <th className="text-left px-4 py-3 font-medium">Scans</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {data.map((q) => (
              <tr key={q.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{q.name}</td>
                <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">{q.type}</td>
                <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{q.business}</td>
                <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">{q.scans.toLocaleString()}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${q.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${q.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {q.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button onClick={() => toast.success('QR code downloaded')} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors" title="Download">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 max-w-3xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">QR Settings</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleQrSave() }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Default Size (px)" type="number" value={String(settings.default_size)} onChange={(e) => setSettings({ ...settings, default_size: Number(e.target.value) })} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Format</label>
              <select value={settings.default_format} onChange={(e) => setSettings({ ...settings, default_format: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foreground Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={settings.foreground_color} onChange={(e) => setSettings({ ...settings, foreground_color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                <input type="text" value={settings.foreground_color} onChange={(e) => setSettings({ ...settings, foreground_color: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={settings.background_color} onChange={(e) => setSettings({ ...settings, background_color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                <input type="text" value={settings.background_color} onChange={(e) => setSettings({ ...settings, background_color: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Error Correction</label>
              <select value={settings.error_correction} onChange={(e) => setSettings({ ...settings, error_correction: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="L">Low (L)</option>
                <option value="M">Medium (M)</option>
                <option value="Q">Quartile (Q)</option>
                <option value="H">High (H)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Corner Style</label>
              <select value={settings.corner_style} onChange={(e) => setSettings({ ...settings, corner_style: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
                <option value="circle">Circle</option>
              </select>
            </div>
          </div>
          <Toggle checked={settings.include_logo} onChange={(v) => setSettings({ ...settings, include_logo: v })} label="Include logo in QR codes" />
          <InputField label="Logo Size (%)" type="number" value={String(settings.logo_size)} onChange={(e) => setSettings({ ...settings, logo_size: Number(e.target.value) })} />
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 shadow-sm shadow-orange-200 dark:shadow-none">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
