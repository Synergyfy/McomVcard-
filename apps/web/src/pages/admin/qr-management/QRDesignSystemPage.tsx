import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface TemplateData {
  id: number; name: string; category: string; assignedTo: string; status: string; version: number; createdBy: string; lastUpdated: string; defaultTemplate: boolean; brandLogo: string; primaryColor: string; secondaryColor: string; background: string; qrModuleStyle: string; eyePatternStyle: string; cornerStyle: string; errorCorrection: string; quietZone: string; margin: string; border: string; padding: string; frameStyle: string; ctaText: string; icon: string; businessUsage: number; consumerUsage: number; campaignUsage: number; nfcUsage: number; complianceScore: number;
}

const TEMPLATES: TemplateData[] = [
  { id: 1, name: 'Standard Business QR', category: 'Business', assignedTo: '12 Businesses', status: 'Published', version: 3, createdBy: 'Admin', lastUpdated: '2026-07-28', defaultTemplate: true, brandLogo: 'Centre Logo', primaryColor: '#1E3A5F', secondaryColor: '#3B82F6', background: 'White', qrModuleStyle: 'Rounded', eyePatternStyle: 'Standard', cornerStyle: 'Rounded', errorCorrection: 'M', quietZone: '4', margin: '2mm', border: 'None', padding: '4mm', frameStyle: 'Scan Me', ctaText: 'Scan to View My Digital Card', icon: 'Card', businessUsage: 12, consumerUsage: 0, campaignUsage: 3, nfcUsage: 2, complianceScore: 98 },
  { id: 2, name: 'Premium Consumer QR', category: 'Consumer', assignedTo: '8 Businesses', status: 'Published', version: 2, createdBy: 'Brand Manager', lastUpdated: '2026-07-25', defaultTemplate: true, brandLogo: 'Centre Logo', primaryColor: '#7C3AED', secondaryColor: '#A78BFA', background: 'White', qrModuleStyle: 'Rounded', eyePatternStyle: 'Standard', cornerStyle: 'Rounded', errorCorrection: 'H', quietZone: '4', margin: '2mm', border: 'None', padding: '4mm', frameStyle: 'Tap Here', ctaText: 'Tap to Connect', icon: 'Phone', businessUsage: 0, consumerUsage: 8, campaignUsage: 0, nfcUsage: 1, complianceScore: 95 },
  { id: 3, name: 'Campaign Bright', category: 'Campaign', assignedTo: '5 Campaigns', status: 'Published', version: 2, createdBy: 'Marketing', lastUpdated: '2026-07-22', defaultTemplate: true, brandLogo: 'Centre Logo', primaryColor: '#DC2626', secondaryColor: '#F97316', background: 'Brand Background', qrModuleStyle: 'Rounded', eyePatternStyle: 'Bold', cornerStyle: 'Rounded', errorCorrection: 'H', quietZone: '4', margin: '3mm', border: 'Thin', padding: '4mm', frameStyle: 'Scan Me', ctaText: 'Scan for Exclusive Offers', icon: 'Gift', businessUsage: 0, consumerUsage: 0, campaignUsage: 5, nfcUsage: 0, complianceScore: 92 },
  { id: 4, name: 'NFC Standard', category: 'NFC', assignedTo: '3 Businesses', status: 'Published', version: 1, createdBy: 'Admin', lastUpdated: '2026-07-20', defaultTemplate: true, brandLogo: 'Corner Logo', primaryColor: '#047857', secondaryColor: '#10B981', background: 'White', qrModuleStyle: 'Square', eyePatternStyle: 'Standard', cornerStyle: 'Square', errorCorrection: 'M', quietZone: '2', margin: '1mm', border: 'None', padding: '2mm', frameStyle: 'Tap Here', ctaText: 'Tap to Connect', icon: 'Phone', businessUsage: 0, consumerUsage: 0, campaignUsage: 0, nfcUsage: 3, complianceScore: 90 },
  { id: 5, name: 'Universal Minimal', category: 'Universal', assignedTo: '4 Businesses, 2 Consumers', status: 'Published', version: 3, createdBy: 'Brand Manager', lastUpdated: '2026-07-18', defaultTemplate: false, brandLogo: 'No Logo', primaryColor: '#000000', secondaryColor: '#6B7280', background: 'White', qrModuleStyle: 'Square', eyePatternStyle: 'Minimal', cornerStyle: 'Square', errorCorrection: 'M', quietZone: '4', margin: '2mm', border: 'None', padding: '4mm', frameStyle: 'None', ctaText: '', icon: 'None', businessUsage: 4, consumerUsage: 2, campaignUsage: 1, nfcUsage: 0, complianceScore: 85 },
  { id: 6, name: 'Event Dynamic', category: 'Event', assignedTo: '2 Events', status: 'Published', version: 2, createdBy: 'Marketing', lastUpdated: '2026-07-15', defaultTemplate: false, brandLogo: 'Centre Logo', primaryColor: '#6B21A8', secondaryColor: '#D946EF', background: 'Transparent', qrModuleStyle: 'Rounded', eyePatternStyle: 'Bold', cornerStyle: 'Rounded', errorCorrection: 'H', quietZone: '4', margin: '2mm', border: 'Thick', padding: '4mm', frameStyle: 'Scan Me', ctaText: 'Join Our Community', icon: 'Calendar', businessUsage: 0, consumerUsage: 0, campaignUsage: 0, nfcUsage: 0, complianceScore: 88 },
  { id: 7, name: 'Product Label QR', category: 'Product', assignedTo: '3 Products', status: 'Published', version: 1, createdBy: 'Operations', lastUpdated: '2026-07-12', defaultTemplate: false, brandLogo: 'Centre Logo', primaryColor: '#92400E', secondaryColor: '#D97706', background: 'White', qrModuleStyle: 'Rounded', eyePatternStyle: 'Standard', cornerStyle: 'Rounded', errorCorrection: 'M', quietZone: '3', margin: '1mm', border: 'Thin', padding: '3mm', frameStyle: 'Scan Me', ctaText: 'Learn More', icon: 'Shopping Bag', businessUsage: 0, consumerUsage: 0, campaignUsage: 0, nfcUsage: 0, complianceScore: 93 },
  { id: 8, name: 'Service Booking QR', category: 'Service', assignedTo: '4 Services', status: 'Published', version: 2, createdBy: 'Operations', lastUpdated: '2026-07-10', defaultTemplate: false, brandLogo: 'Centre Logo', primaryColor: '#065F46', secondaryColor: '#34D399', background: 'White', qrModuleStyle: 'Rounded', eyePatternStyle: 'Standard', cornerStyle: 'Rounded', errorCorrection: 'M', quietZone: '4', margin: '2mm', border: 'None', padding: '4mm', frameStyle: 'Scan Me', ctaText: 'Book Now', icon: 'Calendar', businessUsage: 0, consumerUsage: 0, campaignUsage: 0, nfcUsage: 0, complianceScore: 91 },
  { id: 9, name: 'Luxury Gold Edition', category: 'Business', assignedTo: '1 Business', status: 'Draft', version: 1, createdBy: 'Brand Manager', lastUpdated: '2026-07-30', defaultTemplate: false, brandLogo: 'Centre Logo', primaryColor: '#B45309', secondaryColor: '#F59E0B', background: 'Brand Background', qrModuleStyle: 'Rounded', eyePatternStyle: 'Bold', cornerStyle: 'Rounded', errorCorrection: 'H', quietZone: '4', margin: '3mm', border: 'Thick', padding: '5mm', frameStyle: 'Scan Me', ctaText: 'Experience Luxury', icon: 'Card', businessUsage: 0, consumerUsage: 0, campaignUsage: 0, nfcUsage: 0, complianceScore: 75 },
  { id: 10, name: 'Legacy Blue Theme', category: 'Universal', assignedTo: '0', status: 'Deprecated', version: 1, createdBy: 'Admin', lastUpdated: '2026-06-01', defaultTemplate: false, brandLogo: 'Centre Logo', primaryColor: '#2563EB', secondaryColor: '#93C5FD', background: 'White', qrModuleStyle: 'Square', eyePatternStyle: 'Standard', cornerStyle: 'Square', errorCorrection: 'M', quietZone: '4', margin: '2mm', border: 'None', padding: '4mm', frameStyle: 'Scan Me', ctaText: 'Scan Me', icon: 'None', businessUsage: 0, consumerUsage: 0, campaignUsage: 0, nfcUsage: 0, complianceScore: 60 },
  { id: 11, name: 'NFC Premium Plus', category: 'NFC', assignedTo: '1 Business', status: 'Draft', version: 1, createdBy: 'Admin', lastUpdated: '2026-07-29', defaultTemplate: false, brandLogo: 'Centre Logo', primaryColor: '#0F766E', secondaryColor: '#2DD4BF', background: 'White', qrModuleStyle: 'Rounded', eyePatternStyle: 'Standard', cornerStyle: 'Rounded', errorCorrection: 'M', quietZone: '4', margin: '2mm', border: 'None', padding: '4mm', frameStyle: 'Tap Here', ctaText: 'Tap & Connect', icon: 'Phone', businessUsage: 0, consumerUsage: 0, campaignUsage: 0, nfcUsage: 0, complianceScore: 82 },
  { id: 12, name: 'Summer Campaign Pro', category: 'Campaign', assignedTo: '0', status: 'Draft', version: 1, createdBy: 'Marketing', lastUpdated: '2026-07-30', defaultTemplate: false, brandLogo: 'Centre Logo', primaryColor: '#EA580C', secondaryColor: '#FBBF24', background: 'Brand Background', qrModuleStyle: 'Rounded', eyePatternStyle: 'Bold', cornerStyle: 'Rounded', errorCorrection: 'H', quietZone: '4', margin: '3mm', border: 'Thin', padding: '4mm', frameStyle: 'Scan Me', ctaText: 'Get Summer Deals', icon: 'Gift', businessUsage: 0, consumerUsage: 0, campaignUsage: 0, nfcUsage: 0, complianceScore: 0 },
]

const CATEGORIES = ['All', 'Business', 'Consumer', 'Campaign', 'Event', 'Product', 'Service', 'NFC', 'Universal']
const STATUSES = ['All', 'Draft', 'Published', 'Deprecated', 'Archived']
const OUTPUT_FORMATS = ['PNG', 'SVG', 'PDF', 'EPS', 'Print Ready PDF']
const PRINT_PRESETS = ['Business Card', 'Flyer', 'Poster', 'Table Tent', 'Roll-up Banner', 'NFC Card', 'Sticker', 'Product Label']
const DIGITAL_PRESETS = ['Website', 'Email Signature', 'WhatsApp', 'Social Media', 'Presentation']

const tabs = ['overview', 'brand', 'appearance', 'frames-cta', 'output', 'assignment', 'preview', 'versions', 'activity']
const tabLabels = ['Overview', 'Brand Identity', 'QR Appearance', 'Frames & CTA', 'Output Formats', 'Assignment Rules', 'Preview', 'Version History', 'Activity']

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    'Business': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Consumer': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
    'Campaign': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Event': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600',
    'Product': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Service': 'bg-teal-50 dark:bg-teal-500/10 text-teal-600',
    'NFC': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600',
    'Universal': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600',
  }
  return <span className={"px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[cat] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-600')}>{cat}</span>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Published': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Draft': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Deprecated': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Archived': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600',
  }
  const dots: Record<string, string> = { 'Published': 'bg-green-500', 'Draft': 'bg-gray-400', 'Deprecated': 'bg-amber-500', 'Archived': 'bg-gray-400' }
  return (
    <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[status] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-600')}>
      <span className={"w-1.5 h-1.5 rounded-full " + (dots[status] || 'bg-gray-400')} />{status}
    </span>
  )
}

function BrandPresetCard({ name, colors, logo, onSelect }: { name: string; colors: string[]; logo: string; onSelect: () => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-teal-500 cursor-pointer transition-colors" onClick={onSelect}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[8px] text-gray-400">{logo}</div>
        <span className="text-xs font-medium text-gray-900 dark:text-white">{name}</span>
      </div>
      <div className="flex gap-1">{colors.map((c, i) => <div key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c }} title={c} />)}</div>
    </div>
  )
}

export default function QRDesignSystemPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState('overview')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const filtered = useMemo(() => {
    return TEMPLATES.filter(t => {
      if (search) { const s = search.toLowerCase(); if (!t.name.toLowerCase().includes(s) && !t.category.toLowerCase().includes(s) && !t.createdBy.toLowerCase().includes(s)) return false }
      if (filterCat !== 'All' && t.category !== filterCat) return false
      if (filterStatus !== 'All' && t.status !== filterStatus) return false
      return true
    })
  }, [search, filterCat, filterStatus])

  const tmpl = selectedId !== null ? TEMPLATES.find(x => String(x.id) === selectedId)! : null

  function handleAction(msg: string) { toast.success(msg) }
  function toggleSelect(id: number) { setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next }) }
  function toggleSelectAll() { if (selectedIds.size === filtered.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filtered.map(x => x.id))) }

  const totalTemplates = TEMPLATES.length
  const published = TEMPLATES.filter(x => x.status === 'Published').length
  const draft = TEMPLATES.filter(x => x.status === 'Draft').length
  const archived = TEMPLATES.filter(x => x.status === 'Archived').length
  const activeTemplates = TEMPLATES.filter(x => x.assignedTo !== '0').length
  const defaultTemplates = TEMPLATES.filter(x => x.defaultTemplate).length
  const businessTemplates = TEMPLATES.filter(x => x.category === 'Business').length
  const consumerTemplates = TEMPLATES.filter(x => x.category === 'Consumer').length
  const campaignTemplates = TEMPLATES.filter(x => x.category === 'Campaign').length
  const nfcTemplates = TEMPLATES.filter(x => x.category === 'NFC').length
  const avgCompliance = Math.round(TEMPLATES.reduce((s, t) => s + t.complianceScore, 0) / TEMPLATES.length)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-8 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to load QR Design System</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The QR Rendering Engine could not be reached.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 800) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Retry</button>
          <Link to="/admin/system-status" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</Link>
        </div>
      </div>
    )
  }

  if (!tmpl && selectedId === null) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">QR Design System</h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create, manage, publish, and distribute reusable QR design templates — visual identity, separate from routing.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction('Creating design template...')} className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600">Create Design Template</button>
              <button onClick={() => handleAction('Importing template...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Import</button>
              <button onClick={() => handleAction('Exporting template...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
              <button onClick={() => handleAction('Duplicating template...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Duplicate</button>
              <button onClick={() => handleAction('Opening brand assets...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Brand Assets</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Total</p><p className="text-sm font-bold text-gray-900 dark:text-white">{totalTemplates}</p><p className="text-[9px] text-gray-400">{published} Published · {draft} Draft · {archived} Archived</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Active</p><p className="text-sm font-bold text-green-600">{activeTemplates}</p><p className="text-[9px] text-gray-400">Assigned across platform</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Default</p><p className="text-sm font-bold text-blue-600">{defaultTemplates}</p><p className="text-[9px] text-gray-400">Set as defaults</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Business</p><p className="text-sm font-bold text-blue-600">{businessTemplates}</p><p className="text-[9px] text-gray-400">Assigned to Business QR</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Consumer</p><p className="text-sm font-bold text-purple-600">{consumerTemplates}</p><p className="text-[9px] text-gray-400">Assigned to Consumer QR</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Campaign</p><p className="text-sm font-bold text-amber-600">{campaignTemplates}</p><p className="text-[9px] text-gray-400">Assigned to Campaign QR</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">NFC</p><p className="text-sm font-bold text-cyan-600">{nfcTemplates}</p><p className="text-[9px] text-gray-400">Assigned to NFC Cards</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Compliance</p><p className="text-sm font-bold text-teal-600">{avgCompliance}%</p><p className="text-[9px] text-gray-400">Avg brand compliance</p></div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search template name, category, creator..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500" />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-500/20 p-3 flex items-center justify-between">
            <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">{selectedIds.size} templates selected</span>
            <div className="flex gap-2">
              {['Publish', 'Archive', 'Export', 'Assign', 'Update Branding', 'Apply Version', 'Generate Assets'].map(a => (
                <button key={a} onClick={() => handleAction(a + ' selected templates')} className="px-2 py-1 bg-white dark:bg-gray-700 border border-purple-200 dark:border-purple-500/20 rounded text-[10px] text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10">{a}</button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-2 pl-3 w-8"><input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300" /></th>
                <th className="text-left py-2 font-medium text-gray-400">Template</th>
                <th className="text-left py-2 font-medium text-gray-400">Category</th>
                <th className="text-left py-2 font-medium text-gray-400">Assigned To</th>
                <th className="text-left py-2 font-medium text-gray-400">Status</th>
                <th className="text-left py-2 font-medium text-gray-400">Version</th>
                <th className="text-left py-2 font-medium text-gray-400">Created By</th>
                <th className="text-left py-2 font-medium text-gray-400">Updated</th>
                <th className="text-left py-2 font-medium text-gray-400">Compliance</th>
                <th className="text-left py-2 font-medium text-gray-400">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className={'border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer ' + (selectedId === t.id ? 'bg-purple-50 dark:bg-purple-500/5' : '')} onClick={() => setSelectedId(t.id)}>
                    <td className="py-2 pl-3"><input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggleSelect(t.id)} onClick={e => e.stopPropagation()} className="rounded border-gray-300" /></td>
                    <td className="py-2"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: t.primaryColor }} /><span className="font-medium text-gray-900 dark:text-white">{t.name}</span>{t.defaultTemplate && <span className="px-1 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded text-[8px] font-medium">Default</span>}</div></td>
                    <td className="py-2"><CategoryBadge cat={t.category} /></td>
                    <td className="py-2 text-gray-500">{t.assignedTo}</td>
                    <td className="py-2"><StatusBadge status={t.status} /></td>
                    <td className="py-2 font-mono text-gray-500">v{t.version}</td>
                    <td className="py-2 text-gray-500">{t.createdBy}</td>
                    <td className="py-2 text-gray-400">{t.lastUpdated}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: t.complianceScore + '%' }} /></div>
                        <span className={'text-[10px] font-medium ' + (t.complianceScore >= 90 ? 'text-green-600' : t.complianceScore >= 70 ? 'text-amber-600' : 'text-red-600')}>{t.complianceScore}%</span>
                      </div>
                    </td>
                    <td className="py-2"><div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleAction('Viewing ' + t.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">View</button>
                      <button onClick={() => handleAction('Editing ' + t.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Edit</button>
                      <button onClick={() => handleAction('Duplicating ' + t.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Dup</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-8"><p className="text-sm text-gray-400">No templates match your filters.</p></div>}
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Brand Presets</h4>
          <div className="grid grid-cols-4 gap-3">
            <BrandPresetCard name="MCOM Standard" colors={['#1E3A5F', '#3B82F6', '#FFFFFF']} logo="MCOM" onSelect={() => handleAction('Selected MCOM Standard preset')} />
            <BrandPresetCard name="Luxury Gold" colors={['#B45309', '#F59E0B', '#FFF7ED']} logo="Gold" onSelect={() => handleAction('Selected Luxury Gold preset')} />
            <BrandPresetCard name="Eco Green" colors={['#065F46', '#34D399', '#ECFDF5']} logo="Eco" onSelect={() => handleAction('Selected Eco Green preset')} />
            <BrandPresetCard name="Vibrant" colors={['#7C3AED', '#D946EF', '#F5F3FF']} logo="Vibe" onSelect={() => handleAction('Selected Vibrant preset')} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border-2" style={{ backgroundColor: tmpl!.primaryColor, borderColor: tmpl!.primaryColor }} />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{tmpl!.name}</h1>
              <p className="text-xs text-gray-500">v{tmpl!.version} · <CategoryBadge cat={tmpl!.category} /> · <StatusBadge status={tmpl!.status} /></p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleAction('Previewing ' + tmpl!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
          <button onClick={() => handleAction('Publishing ' + tmpl!.name)} className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-medium hover:bg-purple-600">{tmpl!.status === 'Published' ? 'Unpublish' : tmpl!.status === 'Draft' ? 'Publish' : 'Restore'}</button>
          <button onClick={() => handleAction('Archiving ' + tmpl!.name)} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Archive</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setWorkspaceTab(t)} className={'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ' + (workspaceTab === t ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>{tabLabels[i]}</button>
        ))}
      </div>

      {workspaceTab === 'overview' && tmpl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Template Information</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Name</span><span className="text-gray-900 dark:text-white font-medium">{tmpl.name}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Category</span><CategoryBadge cat={tmpl.category} /></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Version</span><span className="font-mono text-gray-900 dark:text-white">v{tmpl.version}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Status</span><StatusBadge status={tmpl.status} /></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Default</span><span className={tmpl.defaultTemplate ? 'text-green-600 font-medium' : 'text-gray-400'}>{tmpl.defaultTemplate ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-500">Compliance</span><span className={'font-medium ' + (tmpl.complianceScore >= 90 ? 'text-green-600' : tmpl.complianceScore >= 70 ? 'text-amber-600' : 'text-red-600')}>{tmpl.complianceScore}%</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Usage Summary</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Businesses</p><p className="text-sm font-bold text-gray-900 dark:text-white">{tmpl.businessUsage}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Consumers</p><p className="text-sm font-bold text-gray-900 dark:text-white">{tmpl.consumerUsage}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Campaigns</p><p className="text-sm font-bold text-gray-900 dark:text-white">{tmpl.campaignUsage}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">NFC Cards</p><p className="text-sm font-bold text-gray-900 dark:text-white">{tmpl.nfcUsage}</p></div>
            </div>
          </div>
        </div>
      )}

      {workspaceTab === 'brand' && tmpl && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Brand Identity</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-3 text-xs max-w-md">
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Brand Logo</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.brandLogo}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Primary Colour</span><div className="flex items-center gap-2"><span className="w-4 h-4 rounded border" style={{ backgroundColor: tmpl.primaryColor }} /><span>{tmpl.primaryColor}</span></div></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Secondary Colour</span><div className="flex items-center gap-2"><span className="w-4 h-4 rounded border" style={{ backgroundColor: tmpl.secondaryColor }} /><span>{tmpl.secondaryColor}</span></div></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Background</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.background}</span></div>
            </div>
            <div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 border-2 border-dashed border-gray-200 dark:border-gray-600" style={{ backgroundColor: tmpl.background === 'White' ? '#FFFFFF' : tmpl.background === 'Transparent' ? '#F9FAFB' : tmpl.primaryColor + '15' }}>
                <div className="flex items-center justify-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg" style={{ backgroundColor: tmpl.primaryColor }}>
                    {tmpl.brandLogo === 'Centre Logo' || tmpl.brandLogo === 'Corner Logo' ? 'M' : ''}
                  </div>
                  <div className="w-24 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2">
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill={tmpl.primaryColor}><path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm6-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm10-4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-4 0h-2v2h2v-2zm4-8h2v-2h-2v2z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2"><span className="text-xs font-medium text-gray-700 dark:text-gray-300">Safe Contrast Validator</span><span className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 rounded text-[10px] font-medium">Pass</span></div>
            <p className="text-[10px] text-gray-500 mt-1">Colours maintain sufficient contrast for reliable QR scanning.</p>
          </div>
          <button onClick={() => handleAction('Editing brand identity for ' + tmpl.name)} className="px-3 py-1.5 bg-purple-500 text-white rounded text-xs font-medium hover:bg-purple-600">Edit Brand Identity</button>
        </div>
      )}

      {workspaceTab === 'appearance' && tmpl && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">QR Appearance</h4>
          <div className="space-y-3 text-xs max-w-md">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Module Style</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.qrModuleStyle}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Eye Pattern</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.eyePatternStyle}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Corner Style</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.cornerStyle}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Error Correction</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.errorCorrection}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Quiet Zone</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.quietZone} modules</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Margin</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.margin}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Border</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.border}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Padding</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.padding}</span></div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-3 border border-amber-200 dark:border-amber-500/20">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mb-1">Coming Soon — Advanced Appearance</p>
            <p className="text-[9px] text-amber-600 dark:text-amber-500/70">Animated QR, gradient support, and decorative patterns are planned for future releases.</p>
          </div>
          <button onClick={() => handleAction('Editing appearance for ' + tmpl.name)} className="px-3 py-1.5 bg-purple-500 text-white rounded text-xs font-medium hover:bg-purple-600">Edit Appearance</button>
        </div>
      )}

      {workspaceTab === 'frames-cta' && tmpl && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Frames & Call to Action</h4>
          <div className="space-y-3 text-xs max-w-md">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Frame Style</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.frameStyle}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">CTA Text</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.ctaText || 'None'}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Icon</span><span className="font-medium text-gray-900 dark:text-white">{tmpl.icon}</span></div>
          </div>
          <div className="flex gap-2">
            <select className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Scan Me</option><option>Tap Here</option><option>View My Card</option><option>Connect With Us</option><option>Join Our Community</option><option>Book Now</option>
            </select>
            <select className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Phone</option><option>Card</option><option>Gift</option><option>Shopping Bag</option><option>Calendar</option><option>None</option>
            </select>
          </div>
          <button onClick={() => handleAction('Updating frame/CTA for ' + tmpl.name)} className="px-3 py-1.5 bg-purple-500 text-white rounded text-xs font-medium hover:bg-purple-600">Update Frame & CTA</button>
        </div>
      )}

      {workspaceTab === 'output' && tmpl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Output Formats</h4>
            <div className="flex flex-wrap gap-2">
              {OUTPUT_FORMATS.map(f => <span key={f} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 cursor-pointer transition-colors">{f}</span>)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Print Presets</h4>
            <div className="flex flex-wrap gap-2">
              {PRINT_PRESETS.map(p => <span key={p} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 cursor-pointer transition-colors">{p}</span>)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Digital Presets</h4>
            <div className="flex flex-wrap gap-2">
              {DIGITAL_PRESETS.map(d => <span key={d} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 cursor-pointer transition-colors">{d}</span>)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col justify-center">
            <button onClick={() => handleAction('Generating print assets for ' + tmpl.name)} className="px-3 py-1.5 bg-purple-500 text-white rounded text-xs font-medium hover:bg-purple-600 self-start">Generate Print Assets</button>
          </div>
        </div>
      )}

      {workspaceTab === 'assignment' && tmpl && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Assignment Rules</h4>
          <div className="space-y-2">
            {['Business VCards', 'Business Cards', 'Consumer VCards', 'Consumer Cards', 'Campaign QR Codes', 'Product QR Codes', 'Event QR Codes', 'NFC Cards'].map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <span className="text-sm text-gray-700 dark:text-gray-300">{a}</span>
                <span className={'px-2 py-0.5 rounded text-[10px] font-medium ' + (i < 3 ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : i < 6 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{i < 3 ? 'Assigned' : i < 6 ? 'Optional' : 'Not Assigned'}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2"><span className="text-xs font-medium text-gray-700 dark:text-gray-300">Set as default for:</span>
            <select className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Business VCard QR</option><option>Business Card QR</option><option>Consumer VCard QR</option><option>Consumer Card QR</option><option>Campaign QR</option>
            </select>
          </div>
          <button onClick={() => handleAction('Saving assignment rules for ' + tmpl.name)} className="px-3 py-1.5 bg-purple-500 text-white rounded text-xs font-medium hover:bg-purple-600">Save Assignment Rules</button>
        </div>
      )}

      {workspaceTab === 'preview' && tmpl && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col items-center">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 self-start">Desktop Preview</h4>
            <div className="w-48 h-48 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-4 shadow-sm" style={{ backgroundColor: tmpl.background === 'White' ? '#FFF' : tmpl.background === 'Transparent' ? '#F9FAFB' : tmpl.primaryColor + '15' }}>
              <div className="w-full h-full flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 24 24" fill={tmpl.primaryColor}><path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm6-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm10-4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-4 0h-2v2h2v-2zm4-8h2v-2h-2v2z"/></svg>
                {tmpl.brandLogo === 'Centre Logo' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-6 h-6 rounded" style={{ backgroundColor: tmpl.primaryColor }} /></div>}
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Desktop · 250x250px</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col items-center">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 self-start">Mobile Preview</h4>
            <div className="w-36 h-36 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-3 shadow-sm" style={{ backgroundColor: tmpl.background === 'White' ? '#FFF' : tmpl.background === 'Transparent' ? '#F9FAFB' : tmpl.primaryColor + '15' }}>
              <div className="w-full h-full flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 24 24" fill={tmpl.primaryColor}><path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm6-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm10-4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-4 0h-2v2h2v-2zm4-8h2v-2h-2v2z"/></svg>
                {tmpl.brandLogo === 'Centre Logo' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 rounded" style={{ backgroundColor: tmpl.primaryColor }} /></div>}
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Mobile · 180x180px</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col items-center">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 self-start">Print Preview (Card)</h4>
            <div className="w-40 h-24 bg-white border border-gray-200 rounded flex items-center justify-center p-2 shadow-sm" style={{ backgroundColor: tmpl.background === 'White' ? '#FFF' : tmpl.background === 'Transparent' ? '#F9FAFB' : tmpl.primaryColor + '15' }}>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center"><svg className="w-full h-full" viewBox="0 0 24 24" fill={tmpl.primaryColor}><path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm6-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm10-4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-4 0h-2v2h2v-2zm4-8h2v-2h-2v2z"/></svg></div>
                <div className="text-[8px] text-gray-500 max-w-[80px]">{tmpl.ctaText || 'Scan Me'}</div>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">85.6 × 54mm (Standard)</p>
          </div>
        </div>
      )}

      {workspaceTab === 'versions' && tmpl && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Version History</h4><button onClick={() => handleAction('Exporting version history')} className="text-[10px] text-purple-600 hover:underline">Export</button></div>
          {[
            { v: tmpl.version, date: tmpl.lastUpdated, by: tmpl.createdBy, changes: 'Latest update' },
            { v: tmpl.version - 1, date: '2026-07-01', by: tmpl.createdBy, changes: 'CTA text updated' },
            { v: 1, date: '2026-06-01', by: tmpl.createdBy, changes: 'Template created' },
          ].map((v, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs">
              <span className="font-mono text-purple-600 shrink-0">v{v.v}</span>
              <div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium text-gray-900 dark:text-white">{v.by}</span><span className="text-gray-400">{v.date}</span></div><p className="text-gray-500">{v.changes}</p></div>
              <div className="flex gap-1"><button onClick={() => handleAction('Comparing v' + v.v)} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-100">Compare</button><button onClick={() => handleAction('Restoring v' + v.v)} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-100">Restore</button></div>
            </div>
          ))}
        </div>
      )}

      {workspaceTab === 'activity' && tmpl && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity Timeline</h4>
          <div className="relative pl-6">
            {[
              { action: 'Template Viewed', detail: 'Admin viewed template details', date: '2026-07-30 09:15' },
              { action: 'Template Updated', detail: 'Appearance settings modified', date: tmpl.lastUpdated + ' 14:30' },
              { action: 'Assigned to QR Code', detail: 'Linked to Business VCard QR', date: '2026-07-20 11:00' },
              { action: 'Template Published', detail: 'Made available across platform', date: '2026-07-01 09:00' },
              { action: 'Template Created', detail: 'Created by ' + tmpl.createdBy, date: '2026-06-01 09:00' },
            ].map((a, i) => (
              <div key={i} className="relative pb-4 last:pb-0">
                {i < 4 && <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />}
                <div className="flex items-start gap-3">
                  <div className="absolute left-[-6px] w-3 h-3 rounded-full bg-purple-500 border-2 border-white dark:border-gray-800 mt-0.5" />
                  <div className="text-xs ml-4"><p className="font-medium text-gray-900 dark:text-white">{a.action}</p><p className="text-gray-500">{a.detail}</p><p className="text-[10px] text-gray-400 mt-0.5">{a.date}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
