import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getCardTemplate, loadCardTemplatesByType, archiveCardTemplate, deleteCardTemplate,
  type StoredCardTemplate, type CardFaces,
} from '../../../services/cardTemplateStore'
import { TemplateActivityModal, TemplateVersionsModal } from '../../../components/admin/TemplateAuditModals'
import { CardPreviewModal, buildMockFaces } from '../../../components/admin/CardPreview'
import ActionDropdown from '../../../components/common/ActionDropdown'

export interface CardRow {
  id: number
  name: string
  templateId: string
  version: string
  category: string
  status: string
  businessesUsing: number
  cardsIssued: number
  lastUpdated: string
  updatedBy: string
  qrPosition: string
  qrSize: string
  hasSecurity: boolean
  ffIndicator: string
  progressDisplay: string
  theme: string
  isStored: boolean
}

export const MOCK: CardRow[] = [
  { id: 1, name: 'Standard Business Card', templateId: 'BCT-000001', version: '2.4', category: 'General', status: 'Published', businessesUsing: 534, cardsIssued: 12400, lastUpdated: '2 hours ago', updatedBy: 'Admin', qrPosition: 'Bottom Right', qrSize: 'Medium', hasSecurity: true, ffIndicator: 'None', progressDisplay: 'None', theme: 'Standard', isStored: false },
  { id: 2, name: 'Gold Premium Card', templateId: 'BCT-000002', version: '1.8', category: 'General', status: 'Published', businessesUsing: 423, cardsIssued: 9800, lastUpdated: '6 hours ago', updatedBy: 'Admin', qrPosition: 'Bottom Right', qrSize: 'Large', hasSecurity: true, ffIndicator: 'None', progressDisplay: 'None', theme: 'Gold', isStored: false },
  { id: 3, name: 'Compact Networking Card', templateId: 'BCT-000003', version: '3.1', category: 'Technology', status: 'Published', businessesUsing: 321, cardsIssued: 7600, lastUpdated: '1 day ago', updatedBy: 'Template Designer', qrPosition: 'Top Right', qrSize: 'Medium', hasSecurity: false, ffIndicator: 'None', progressDisplay: 'None', theme: 'Technology', isStored: false },
  { id: 4, name: 'Modern Café Card', templateId: 'BCT-000004', version: '2.0', category: 'Café', status: 'Published', businessesUsing: 287, cardsIssued: 5400, lastUpdated: '2 days ago', updatedBy: 'Admin', qrPosition: 'Bottom Center', qrSize: 'Medium', hasSecurity: false, ffIndicator: 'None', progressDisplay: 'None', theme: 'Café', isStored: false },
  { id: 5, name: 'Luxury Hotel Card', templateId: 'BCT-000005', version: '1.2', category: 'Hotel', status: 'Draft', businessesUsing: 0, cardsIssued: 0, lastUpdated: '3 days ago', updatedBy: 'Admin', qrPosition: 'Bottom Right', qrSize: 'Large', hasSecurity: true, ffIndicator: 'None', progressDisplay: 'None', theme: 'Hotel', isStored: false },
  { id: 6, name: 'Fitness Trainer Card', templateId: 'BCT-000006', version: '1.5', category: 'Fitness', status: 'Published', businessesUsing: 198, cardsIssued: 3200, lastUpdated: '4 days ago', updatedBy: 'Template Designer', qrPosition: 'Top Left', qrSize: 'Small', hasSecurity: false, ffIndicator: 'None', progressDisplay: 'None', theme: 'Fitness', isStored: false },
  { id: 7, name: 'Real Estate Agent Card', templateId: 'BCT-000007', version: '2.2', category: 'Real Estate', status: 'Published', businessesUsing: 445, cardsIssued: 8900, lastUpdated: '5 days ago', updatedBy: 'Admin', qrPosition: 'Bottom Right', qrSize: 'Medium', hasSecurity: true, ffIndicator: 'None', progressDisplay: 'None', theme: 'Real Estate', isStored: false },
  { id: 8, name: 'Barber Shop Card', templateId: 'BCT-000008', version: '0.9', category: 'Barber', status: 'Draft', businessesUsing: 0, cardsIssued: 0, lastUpdated: '1 week ago', updatedBy: 'Admin', qrPosition: 'Center', qrSize: 'Medium', hasSecurity: false, ffIndicator: 'None', progressDisplay: 'None', theme: 'Barber', isStored: false },
  { id: 9, name: 'Consultant Business Card', templateId: 'BCT-000009', version: '3.4', category: 'Consultant', status: 'Published', businessesUsing: 678, cardsIssued: 15300, lastUpdated: '1 week ago', updatedBy: 'Admin', qrPosition: 'Bottom Right', qrSize: 'Large', hasSecurity: true, ffIndicator: 'None', progressDisplay: 'None', theme: 'Consultant', isStored: false },
  { id: 10, name: 'Retail Store Card', templateId: 'BCT-000010', version: '1.7', category: 'Retail', status: 'Published', businessesUsing: 267, cardsIssued: 6100, lastUpdated: '2 weeks ago', updatedBy: 'Template Designer', qrPosition: 'Top Right', qrSize: 'Medium', hasSecurity: false, ffIndicator: 'None', progressDisplay: 'None', theme: 'Retail', isStored: false },
  { id: 11, name: 'Legal Professional Card', templateId: 'BCT-000011', version: '2.0', category: 'Legal', status: 'Published', businessesUsing: 156, cardsIssued: 2900, lastUpdated: '2 weeks ago', updatedBy: 'Admin', qrPosition: 'Bottom Right', qrSize: 'Medium', hasSecurity: true, ffIndicator: 'None', progressDisplay: 'None', theme: 'Legal', isStored: false },
  { id: 12, name: 'Agency Partner Card', templateId: 'BCT-000012', version: '1.1', category: 'General', status: 'Archived', businessesUsing: 89, cardsIssued: 1400, lastUpdated: '1 month ago', updatedBy: 'Admin', qrPosition: 'Bottom Right', qrSize: 'Small', hasSecurity: false, ffIndicator: 'None', progressDisplay: 'None', theme: 'General', isStored: false },
]

const STATUSES = ['all', 'published', 'draft', 'archived']

export function toRow(t: StoredCardTemplate): CardRow {
  return {
    id: t.id,
    name: t.name,
    templateId: t.templateId,
    version: t.version.replace(/^v/i, ''),
    category: t.category,
    status: t.status,
    businessesUsing: t.status === 'Published' ? 1 : 0,
    cardsIssued: 0,
    lastUpdated: t.lastUpdated,
    updatedBy: t.updatedBy,
    qrPosition: t.qrPosition,
    qrSize: t.qrSize,
    hasSecurity: t.hasSecurity,
    ffIndicator: t.ffIndicator,
    progressDisplay: t.progressDisplay,
    theme: t.theme,
    isStored: true,
  }
}

export function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-700 dark:text-gray-300 text-right">{value}</span>
    </div>
  )
}

/* Warning shown before editing a live card template in the builder. */
export function EditCardWarningModal({ row, onClose, onConfirm }: {
  row: CardRow
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b flex items-center gap-3 border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">Edit "{row.name}"?</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">This card is in active use — editing creates a new version.</p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-2.5 text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{row.businessesUsing.toLocaleString()}</p>
              <p className="text-[9px] text-gray-400">Businesses using</p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-2.5 text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{row.cardsIssued.toLocaleString()}</p>
              <p className="text-[9px] text-gray-400">Cards issued</p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-2.5 text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{row.status}</p>
              <p className="text-[9px] text-gray-400">Current status</p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-3.5 space-y-2">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              What happens when you edit
            </p>
            <ul className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>The card opens in the Card Template Builder as a <span className="font-semibold">new version</span> of this template.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Businesses already using the card keep their current design until you <span className="font-semibold">publish</span> the new version.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Published changes apply to all {row.businessesUsing.toLocaleString()} businesses and their issued cards.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>QR codes and public links keep pointing at this template — they will reflect the new design once published.</li>
            </ul>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button onClick={onConfirm} className="px-3.5 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shadow-sm">Continue to Builder</button>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="h-5 w-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />)}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mb-3" />
        {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-2" />)}
      </div>
    </div>
  )
}

export default function BusinessCardTemplatesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editFor, setEditFor] = useState<CardRow | null>(null)
  const [activityFor, setActivityFor] = useState<CardRow | null>(null)
  const [versionsFor, setVersionsFor] = useState<CardRow | null>(null)
  const [previewFor, setPreviewFor] = useState<{ row: CardRow; faces: CardFaces } | null>(null)
  const [stored, setStored] = useState<StoredCardTemplate[]>(() => loadCardTemplatesByType('business'))

  const refresh = () => setStored(loadCardTemplatesByType('business'))
  const all: CardRow[] = [...MOCK, ...stored.map(toRow)]

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const filtered = all.filter(t => {
    if (statusFilter !== 'all' && t.status.toLowerCase() !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.name.toLowerCase().includes(q) && !t.templateId.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false
    }
    return true
  })

  const openBuilder = (t: CardRow, mode: 'edit' | 'duplicate') => {
    if (mode === 'edit') { requestEdit(t); return }
    if (t.isStored) {
      navigate(`/admin/card-management/card-template-builder?type=business&duplicate=${t.id}`)
    } else {
      toast.success(`Duplicating ${t.name}`)
    }
  }

  const openDetail = (t: CardRow) => {
    navigate(`/admin/card-management/business-card-templates/${t.id}`)
  }

  const requestEdit = (t: CardRow) => setEditFor(t)

  const confirmEdit = () => {
    if (!editFor) return
    if (editFor.isStored) {
      navigate(`/admin/card-management/card-template-builder?type=business&id=${editFor.id}`)
    } else {
      toast.success(`Editing ${editFor.name}`)
    }
    setEditFor(null)
  }

  const openPreview = (t: CardRow) => {
    const storedRow = t.isStored ? getCardTemplate(t.id) : undefined
    setPreviewFor({ row: t, faces: storedRow ? storedRow.builder.faces : buildMockFaces({
      name: t.name,
      templateId: t.templateId,
      cardType: 'business',
      theme: t.theme,
      category: t.category,
      qrPosition: t.qrPosition,
      qrSize: t.qrSize,
      hasSecurity: t.hasSecurity,
      ffIndicator: t.ffIndicator,
      progressDisplay: t.progressDisplay,
    }) })
  }

  const handleArchive = (t: CardRow) => {
    if (t.isStored) { archiveCardTemplate(t.id); refresh() }
    toast.success(`${t.name} archived`)
  }

  const handleDelete = (t: CardRow) => {
    if (!t.isStored) { toast.error('Only user-created card templates can be deleted'); return }
    if (window.confirm(`Delete "${t.name}"? This cannot be undone.`)) {
      deleteCardTemplate(t.id); refresh(); toast.success(`${t.name} deleted`)
    }
  }

  const handleExport = (t: CardRow) => {
    toast.success(`Exporting ${t.name} (front & back print files)`)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unable to load Business Card templates.</p>
        <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Retry</button>
      </div>
    )
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-5">
      <Helmet><title>Business Card Templates - Card Management - MCOM VCard</title></Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin/card-management/business-card-templates" className="text-[10px] text-orange-600 hover:underline">Card Management</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Business Card Templates</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Lightweight print-ready networking cards (85 × 55 mm) for businesses — created in the Card Template Builder.</p>
          </div>
          <button onClick={() => navigate('/admin/card-management/card-template-builder?type=business')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create Template</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-2.5">
            <p className="text-[10px] text-gray-400">Total Templates</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{all.length}</p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] text-gray-400">Published</p>
            <p className="text-lg font-bold text-green-600">{all.filter(t => t.status === 'Published').length}</p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] text-gray-400">Draft</p>
            <p className="text-lg font-bold text-amber-600">{all.filter(t => t.status === 'Draft').length}</p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] text-gray-400">Archived</p>
            <p className="text-lg font-bold text-gray-400">{all.filter(t => t.status === 'Archived').length}</p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] text-gray-400">Businesses Using</p>
            <p className="text-lg font-bold text-blue-600">{all.reduce((s, t) => s + t.businessesUsing, 0).toLocaleString()}</p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] text-gray-400">Cards Issued</p>
            <p className="text-lg font-bold text-purple-600">{all.reduce((s, t) => s + t.cardsIssued, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input type="text" placeholder="Search by Template Name, ID, or Category..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
          <div className="text-[10px] text-gray-400 flex items-center px-2">{filtered.length} template{filtered.length !== 1 ? 's' : ''} found</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${statusFilter === f ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 hover:bg-gray-100'}`}>{f === 'all' ? 'All Statuses' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Table + Detail */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-2 py-1.5 font-medium">Template</th>
                  <th className="text-left px-2 py-1.5 font-medium">ID</th>
                  <th className="text-left px-2 py-1.5 font-medium">Category</th>
                  <th className="text-left px-2 py-1.5 font-medium">Status</th>
                  <th className="text-right px-2 py-1.5 font-medium">Businesses</th>
                  <th className="text-right px-2 py-1.5 font-medium">Cards Issued</th>
                  <th className="text-left px-2 py-1.5 font-medium">Updated</th>
                  <th className="text-left px-2 py-1.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} onClick={() => openDetail(t)}
                    className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer">
                    <td className="px-2 py-1.5">
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-[11px]">{t.name}</span>
                      <div className="text-[9px] text-gray-400">v{t.version}{t.isStored && <span className="ml-1 px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">User-created</span>}</div>
                    </td>
                    <td className="px-2 py-1.5 font-mono text-gray-400">{t.templateId}</td>
                    <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-[9px] font-medium">{t.category}</span></td>
                    <td className="px-2 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${t.status === 'Published' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : t.status === 'Draft' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{t.status}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300 font-medium">{t.businessesUsing.toLocaleString()}</td>
                    <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{t.cardsIssued.toLocaleString()}</td>
                    <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{t.lastUpdated}</td>
                    <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                      <ActionDropdown actions={[
                        { label: 'Preview', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', onClick: () => openPreview(t) },
                        { label: 'View Details', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', onClick: () => openDetail(t) },
                        { label: 'Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', onClick: () => setActivityFor(t) },
                        { label: 'Version History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0zm0 0l2-2m-2 2l2 2', onClick: () => setVersionsFor(t) },
                        { divider: true },
                        { label: 'Edit in Builder', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => openBuilder(t, 'edit') },
                        { label: 'Duplicate', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', onClick: () => openBuilder(t, 'duplicate') },
                        { label: 'Assignment', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857', onClick: () => navigate(`/admin/card-management/card-template-builder?tab=assignment&type=business`) },
                        { label: 'Export', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', onClick: () => handleExport(t) },
                        { divider: true },
                        { label: 'Archive', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', onClick: () => handleArchive(t) },
                        { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => handleDelete(t) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No Business Card templates found.</p>
              <p className="text-xs text-gray-400 mb-4">Create your first Business Card template to begin issuing business cards.</p>
              <button onClick={() => navigate('/admin/card-management/card-template-builder?type=business')} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create First Template</button>
            </div>
          )}
        </div>

      {activityFor && (
        <TemplateActivityModal
          template={{ name: activityFor.name, version: activityFor.version, templateId: activityFor.templateId, status: activityFor.status }}
          onClose={() => setActivityFor(null)}
        />
      )}
      {versionsFor && (
        <TemplateVersionsModal
          template={{ name: versionsFor.name, version: versionsFor.version, templateId: versionsFor.templateId, status: versionsFor.status }}
          onClose={() => setVersionsFor(null)}
        />
      )}
      {previewFor && (
        <CardPreviewModal
          name={previewFor.row.name}
          templateId={previewFor.row.templateId}
          cardType="business"
          faces={previewFor.faces}
          badge={previewFor.row.category}
          onEdit={() => openBuilder(previewFor.row, 'edit')}
          onClose={() => setPreviewFor(null)}
        />
      )}
      {editFor && (
        <EditCardWarningModal
          row={editFor}
          onClose={() => setEditFor(null)}
          onConfirm={confirmEdit}
        />
      )}
    </div>
  )
}
