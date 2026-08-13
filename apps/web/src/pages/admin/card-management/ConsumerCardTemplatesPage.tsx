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

interface CardRow {
  id: number
  name: string
  templateId: string
  version: string
  membership: string
  cardType: string
  status: string
  consumersUsing: number
  isDefault: boolean
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

const MOCK: CardRow[] = [
  { id: 1, name: 'Bronze Consumer Card', templateId: 'CCT-000001', version: '1.2', membership: 'Bronze', cardType: 'Standard', status: 'Published', consumersUsing: 892, isDefault: true, lastUpdated: '1 day ago', updatedBy: 'Admin', qrPosition: 'Bottom Center', qrSize: 'Medium', hasSecurity: true, ffIndicator: 'Numeric Badge', progressDisplay: 'Progress Bar', theme: 'Bronze', isStored: false },
  { id: 2, name: 'Silver Rewards Card', templateId: 'CCT-000002', version: '2.1', membership: 'Silver', cardType: 'Standard', status: 'Published', consumersUsing: 678, isDefault: true, lastUpdated: '3 days ago', updatedBy: 'Admin', qrPosition: 'Bottom Center', qrSize: 'Medium', hasSecurity: true, ffIndicator: 'Progress Indicator', progressDisplay: 'Circular Progress', theme: 'Silver', isStored: false },
  { id: 3, name: 'Gold Premium Card', templateId: 'CCT-000003', version: '3.0', membership: 'Gold', cardType: 'Premium', status: 'Published', consumersUsing: 534, isDefault: true, lastUpdated: '5 days ago', updatedBy: 'Admin', qrPosition: 'Top Right', qrSize: 'Large', hasSecurity: true, ffIndicator: 'Card Stack Icon', progressDisplay: 'Milestone Badges', theme: 'Gold', isStored: false },
  { id: 4, name: 'Platinum Elite Card', templateId: 'CCT-000004', version: '2.4', membership: 'Platinum', cardType: 'Premium', status: 'Published', consumersUsing: 345, isDefault: true, lastUpdated: '1 week ago', updatedBy: 'Admin', qrPosition: 'Bottom Center', qrSize: 'Large', hasSecurity: true, ffIndicator: 'Numeric Badge', progressDisplay: 'Percentage', theme: 'Platinum', isStored: false },
  { id: 5, name: 'Bronze Pro Card', templateId: 'CCT-000005', version: '1.0', membership: 'Bronze Pro', cardType: 'Standard', status: 'Published', consumersUsing: 423, isDefault: true, lastUpdated: '1 week ago', updatedBy: 'Template Designer', qrPosition: 'Top Left', qrSize: 'Small', hasSecurity: false, ffIndicator: 'Hidden Until Allocated', progressDisplay: 'Progress Bar', theme: 'Bronze Pro', isStored: false },
  { id: 6, name: 'Silver Pro Card', templateId: 'CCT-000006', version: '1.5', membership: 'Silver Pro', cardType: 'Standard', status: 'Published', consumersUsing: 312, isDefault: true, lastUpdated: '2 weeks ago', updatedBy: 'Admin', qrPosition: 'Bottom Center', qrSize: 'Medium', hasSecurity: true, ffIndicator: 'Numeric Badge', progressDisplay: 'Progress Bar', theme: 'Silver Pro', isStored: false },
  { id: 7, name: 'Gold Pro Elite Card', templateId: 'CCT-000007', version: '1.2', membership: 'Gold Pro', cardType: 'Premium', status: 'Published', consumersUsing: 267, isDefault: true, lastUpdated: '2 weeks ago', updatedBy: 'Template Designer', qrPosition: 'Custom', qrSize: 'Large', hasSecurity: true, ffIndicator: 'Card Stack Icon', progressDisplay: 'Milestone Badges', theme: 'Gold Pro', isStored: false },
  { id: 8, name: 'Platinum Pro Card', templateId: 'CCT-000008', version: '2.0', membership: 'Platinum Pro', cardType: 'VIP', status: 'Published', consumersUsing: 189, isDefault: true, lastUpdated: '3 weeks ago', updatedBy: 'Admin', qrPosition: 'Bottom Center', qrSize: 'Large', hasSecurity: true, ffIndicator: 'Numeric Badge', progressDisplay: 'Circular Progress', theme: 'Platinum Pro', isStored: false },
  { id: 9, name: 'Bronze Pro+ Card', templateId: 'CCT-000009', version: '1.0', membership: 'Bronze Pro+', cardType: 'Premium', status: 'Draft', consumersUsing: 0, isDefault: true, lastUpdated: '4 days ago', updatedBy: 'Admin', qrPosition: 'Bottom Center', qrSize: 'Medium', hasSecurity: false, ffIndicator: 'Numeric Badge', progressDisplay: 'Progress Bar', theme: 'Bronze Pro+', isStored: false },
  { id: 10, name: 'Gold Pro+ Premium Card', templateId: 'CCT-000010', version: '0.9', membership: 'Gold Pro+', cardType: 'VIP', status: 'Draft', consumersUsing: 0, isDefault: false, lastUpdated: '5 days ago', updatedBy: 'Template Designer', qrPosition: 'Top Right', qrSize: 'Large', hasSecurity: true, ffIndicator: 'Card Stack Icon', progressDisplay: 'Milestone Badges', theme: 'Gold Pro+', isStored: false },
  { id: 11, name: 'Platinum Pro+ Card', templateId: 'CCT-000011', version: '1.0', membership: 'Platinum Pro+', cardType: 'VIP', status: 'Published', consumersUsing: 98, isDefault: true, lastUpdated: '2 weeks ago', updatedBy: 'Admin', qrPosition: 'Custom', qrSize: 'Extra Large', hasSecurity: true, ffIndicator: 'Numeric Badge', progressDisplay: 'Circular Progress', theme: 'Platinum Pro+', isStored: false },
  { id: 12, name: 'Summer Campaign Card', templateId: 'CCT-000012', version: '1.0', membership: 'Gold', cardType: 'Campaign', status: 'Published', consumersUsing: 234, isDefault: false, lastUpdated: '1 day ago', updatedBy: 'Admin', qrPosition: 'Bottom Center', qrSize: 'Medium', hasSecurity: false, ffIndicator: 'Hidden Until Allocated', progressDisplay: 'None', theme: 'Summer', isStored: false },
  { id: 13, name: 'Holiday Limited Edition', templateId: 'CCT-000013', version: '1.0', membership: 'Platinum', cardType: 'Limited Edition', status: 'Published', consumersUsing: 67, isDefault: false, lastUpdated: '3 days ago', updatedBy: 'Admin', qrPosition: 'Top Left', qrSize: 'Small', hasSecurity: true, ffIndicator: 'Numeric Badge', progressDisplay: 'Percentage', theme: 'Holiday', isStored: false },
  { id: 14, name: 'Legacy Consumer Card', templateId: 'CCT-000014', version: '0.5', membership: 'Bronze', cardType: 'Standard', status: 'Archived', consumersUsing: 45, isDefault: false, lastUpdated: '1 month ago', updatedBy: 'Admin', qrPosition: 'Bottom Center', qrSize: 'Small', hasSecurity: false, ffIndicator: 'None', progressDisplay: 'None', theme: 'Legacy', isStored: false },
  { id: 15, name: 'Christmas Seasonal Card', templateId: 'CCT-000015', version: '1.0', membership: 'Silver', cardType: 'Seasonal', status: 'Draft', consumersUsing: 0, isDefault: false, lastUpdated: '1 week ago', updatedBy: 'Template Designer', qrPosition: 'Bottom Center', qrSize: 'Medium', hasSecurity: false, ffIndicator: 'Progress Indicator', progressDisplay: 'None', theme: 'Christmas', isStored: false },
]

const STATUSES = ['all', 'published', 'draft', 'archived']
const MEMBERSHIPS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']

function toRow(t: StoredCardTemplate): CardRow {
  return {
    id: t.id,
    name: t.name,
    templateId: t.templateId,
    version: t.version.replace(/^v/i, ''),
    membership: t.category,
    cardType: t.category,
    status: t.status,
    consumersUsing: t.status === 'Published' ? 1 : 0,
    isDefault: false,
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

export default function ConsumerCardTemplatesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [membershipFilter, setMembershipFilter] = useState('All')
  const [selected, setSelected] = useState<CardRow | null>(null)
  const [activityFor, setActivityFor] = useState<CardRow | null>(null)
  const [versionsFor, setVersionsFor] = useState<CardRow | null>(null)
  const [previewFor, setPreviewFor] = useState<{ row: CardRow; faces: CardFaces } | null>(null)
  const [stored, setStored] = useState<StoredCardTemplate[]>(() => loadCardTemplatesByType('consumer'))

  const refresh = () => setStored(loadCardTemplatesByType('consumer'))
  const all: CardRow[] = [...MOCK, ...stored.map(toRow)]

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const filtered = all.filter(t => {
    if (statusFilter !== 'all' && t.status.toLowerCase() !== statusFilter) return false
    if (membershipFilter !== 'All' && t.membership !== membershipFilter && t.cardType !== membershipFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.name.toLowerCase().includes(q) && !t.templateId.toLowerCase().includes(q) && !t.membership.toLowerCase().includes(q) && !t.version.toLowerCase().includes(q)) return false
    }
    return true
  })

  const openBuilder = (t: CardRow, mode: 'edit' | 'duplicate') => {
    if (t.isStored) {
      const q = mode === 'duplicate' ? `duplicate=${t.id}` : `id=${t.id}`
      navigate(`/admin/card-management/consumer-card-template-builder?${q}`)
    } else {
      toast.success(`${mode === 'duplicate' ? 'Duplicating' : 'Editing'} ${t.name}`)
    }
  }

  const openPreview = (t: CardRow) => {
    const storedRow = t.isStored ? getCardTemplate(t.id) : undefined
    setPreviewFor({ row: t, faces: storedRow ? storedRow.builder.faces : buildMockFaces({
      name: t.name,
      templateId: t.templateId,
      cardType: 'consumer',
      theme: t.theme,
      membership: t.membership,
      category: t.cardType,
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unable to load Consumer Card templates.</p>
        <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Retry</button>
      </div>
    )
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-5">
      <Helmet><title>Consumer Card Templates - Card Management - MCOM VCard</title></Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin/card-management/consumer-card-templates" className="text-[10px] text-orange-600 hover:underline">Card Management</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Consumer Card Templates</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Print-ready membership and rewards cards (85 × 55 mm) for consumers — created in the Card Template Builder.</p>
          </div>
          <button onClick={() => navigate('/admin/card-management/consumer-card-template-builder')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create Template</button>
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
            <p className="text-[10px] text-gray-400">Default Templates</p>
            <p className="text-lg font-bold text-purple-600">{all.filter(t => t.isDefault).length}</p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] text-gray-400">Consumers Using</p>
            <p className="text-lg font-bold text-blue-600">{all.reduce((s, t) => s + t.consumersUsing, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input type="text" placeholder="Search by Template Name, ID, Membership, or Version..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
          <select value={membershipFilter} onChange={e => setMembershipFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {MEMBERSHIPS.map(m => <option key={m} value={m}>{m === 'All' ? 'All Memberships' : m}</option>)}
          </select>
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-2 py-1.5 font-medium">Template</th>
                  <th className="text-left px-2 py-1.5 font-medium">ID</th>
                  <th className="text-left px-2 py-1.5 font-medium">Membership</th>
                  <th className="text-left px-2 py-1.5 font-medium">Type</th>
                  <th className="text-left px-2 py-1.5 font-medium">Status</th>
                  <th className="text-right px-2 py-1.5 font-medium">Consumers</th>
                  <th className="text-center px-2 py-1.5 font-medium">Default</th>
                  <th className="text-left px-2 py-1.5 font-medium">Updated</th>
                  <th className="text-left px-2 py-1.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} onClick={() => setSelected(t)}
                    className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer ${selected?.id === t.id ? 'bg-orange-50/50 dark:bg-orange-500/5' : ''}`}>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-5 rounded bg-gradient-to-br ${t.theme === 'Bronze' ? 'from-amber-700 to-amber-500' : t.theme === 'Silver' ? 'from-gray-400 to-gray-300' : t.theme === 'Gold' || t.theme === 'Gold Pro' ? 'from-yellow-500 to-amber-400' : t.theme === 'Platinum' || t.theme === 'Platinum Pro' || t.theme === 'Platinum Pro+' ? 'from-indigo-500 to-purple-400' : 'from-orange-400 to-pink-500'} flex items-center justify-center text-white text-[7px] font-bold shrink-0`}>
                          {t.membership.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300 text-[11px]">{t.name}</span>
                          <div className="text-[9px] text-gray-400">v{t.version}{t.isStored && <span className="ml-1 px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">User-created</span>}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 font-mono text-gray-400">{t.templateId}</td>
                    <td className="px-2 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                        t.membership.includes('Platinum') ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' :
                        t.membership.includes('Gold') ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                        t.membership.includes('Silver') ? 'bg-gray-100 dark:bg-gray-700 text-gray-600' :
                        'bg-orange-50 dark:bg-orange-500/10 text-orange-600'
                      }`}>{t.membership}</span>
                    </td>
                    <td className="px-2 py-1.5 text-gray-500">{t.cardType}</td>
                    <td className="px-2 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${t.status === 'Published' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : t.status === 'Draft' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{t.status}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300 font-medium">{t.consumersUsing.toLocaleString()}</td>
                    <td className="px-2 py-1.5 text-center">
                      {t.isDefault ? <span className="text-green-500 font-medium">Yes</span> : <span className="text-gray-300 dark:text-gray-600">No</span>}
                    </td>
                    <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{t.lastUpdated}</td>
                    <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button onClick={() => openPreview(t)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-medium hover:bg-gray-200">Preview</button>
                        <button onClick={() => setSelected(t)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-medium hover:bg-gray-200">View</button>
                        <button onClick={() => openBuilder(t, 'edit')} className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 text-[9px] font-medium hover:bg-orange-100">Edit</button>
                        <button onClick={() => setActivityFor(t)} title="Activity"
                          className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        <button onClick={() => setVersionsFor(t)} title="Version History"
                          className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0zm0 0l2-2m-2 2l2 2" /></svg>
                        </button>
                        <div className="relative group">
                          <button className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-medium hover:bg-gray-200">More</button>
                          <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg py-1 hidden group-hover:block">
                            <button onClick={() => openPreview(t)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">Preview</button>
                            <button onClick={() => openBuilder(t, 'duplicate')} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">Duplicate</button>
                            <button onClick={() => navigate(`/admin/card-management/consumer-card-template-builder?tab=assignment`)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">Assignment</button>
                            <button onClick={() => handleArchive(t)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">Archive</button>
                            <button onClick={() => handleDelete(t)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 text-left">Delete</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No Consumer Card templates found.</p>
              <p className="text-xs text-gray-400 mb-4">Create your first Consumer Card template to begin issuing consumer cards.</p>
              <button onClick={() => navigate('/admin/card-management/consumer-card-template-builder')} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create First Template</button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Card Details</h4>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="p-3 space-y-3">
                <div className="w-full h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <div className="w-32 h-16 rounded-lg bg-white dark:bg-gray-800 shadow flex items-center justify-center overflow-hidden">
                    <div className="text-center px-2">
                      <div className={`w-8 h-1.5 rounded mx-auto mb-1 ${selected.theme === 'Bronze' ? 'bg-amber-500' : selected.theme === 'Silver' ? 'bg-gray-400' : selected.theme === 'Gold' ? 'bg-yellow-500' : 'bg-indigo-500'}`} />
                      <p className="text-[8px] font-bold text-gray-700 dark:text-gray-300 truncate">{selected.membership}</p>
                      <p className="text-[6px] text-gray-400">85 × 55 mm</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700/50 text-[10px]">
                  {[
                    { label: 'Template ID', value: selected.templateId },
                    { label: 'Version', value: `v${selected.version}` },
                    { label: 'Membership', value: selected.membership },
                    { label: 'Card Type', value: selected.cardType },
                    { label: 'Status', value: selected.status },
                    { label: 'Consumers Using', value: selected.consumersUsing.toLocaleString() },
                    { label: 'Default Template', value: selected.isDefault ? 'Yes' : 'No' },
                    { label: 'QR Position', value: selected.qrPosition },
                    { label: 'QR Size', value: selected.qrSize },
                    { label: 'Security', value: selected.hasSecurity ? 'Enabled' : 'Disabled' },
                    { label: 'F&F Indicator', value: selected.ffIndicator },
                    { label: 'Progress Display', value: selected.progressDisplay },
                    { label: 'Updated', value: selected.lastUpdated },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between py-1">
                      <span className="text-gray-400">{r.label}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-right">{r.value}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={() => openPreview(selected)} className="px-2 py-1.5 rounded bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Preview</button>
                  <button onClick={() => openBuilder(selected, 'edit')} className="px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Edit Card</button>
                  <button onClick={() => navigate(`/admin/card-management/consumer-card-template-builder?tab=assignment`)} className="px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Assignment</button>
                  <button onClick={() => setActivityFor(selected)} className="px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Activity</button>
                  <button onClick={() => setVersionsFor(selected)} className="px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Versions</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center h-full py-12">
              <div className="text-center px-4">
                <svg className="w-8 h-8 text-gray-200 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-[10px] text-gray-400">Select a card template to view details</p>
              </div>
            </div>
          )}
        </div>
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
          cardType="consumer"
          faces={previewFor.faces}
          badge={previewFor.row.membership}
          onEdit={() => openBuilder(previewFor.row, 'edit')}
          onClose={() => setPreviewFor(null)}
        />
      )}
    </div>
  )
}
