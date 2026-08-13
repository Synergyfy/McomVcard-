import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import BusinessVCardWorkspace, { buildPublishedSections } from './BusinessVCardWorkspace'
import {
  loadUserTemplatesByType, archiveUserTemplate, deleteUserTemplate,
  type StoredTemplate, type StoredSection,
} from '../../../services/vcardTemplateStore'
import { ensureStoredTemplate } from '../../../services/vcardTemplateActions'
import { claimedCount } from '../vcard-management/businessVCardData'
import ScrollingVCard from '../../../components/common/ScrollingVCard'
import ActionDropdown from '../../../components/common/ActionDropdown'
import { TemplateActivityModal, TemplateVersionsModal } from '../../../components/admin/TemplateAuditModals'
import TemplateConfirmModal from '../../../components/admin/TemplateConfirmModal'
import {
  BIZ_VCARD_TEMPLATES as MOCK, combineBizTemplates,
  type BizVCardTemplate,
} from '../../../services/vcardTemplateCatalogue'

export { BIZ_VCARD_TEMPLATES as MOCK, toBizTemplate, templateSeason, templateSectors, templateCustomization, type BizVCardTemplate } from '../../../services/vcardTemplateCatalogue'

const CATEGORIES = ['All', 'Restaurant', 'Retail', 'Coach', 'Estate Agent', 'Salon', 'Hotel', 'Medical', 'Professional', 'Charity']
const INDUSTRIES = ['All', 'Professional Services', 'Food & Beverage', 'Retail', 'Healthcare', 'Beauty & Wellness', 'Real Estate', 'Fitness', 'Hospitality', 'Nonprofit', 'Coaching']
const COUNTRIES = ['All', 'Global', 'US', 'UK', 'DE', 'FR', 'ES', 'IT', 'JP', 'AU', 'CA', 'BR', 'MX', 'PT']
const LANGUAGES = ['All', 'English', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic', 'Portuguese', 'Italian', 'Japanese']
const QR_TYPES = ['All', 'Static', 'Dynamic', 'Campaign', 'Seasonal']
const MEMBERSHIP_PLANS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+']
const STATUSES = ['all', 'published', 'draft', 'review', 'archived']

const mostPopular = MOCK.reduce((a, b) => a.businessesUsing > b.businessesUsing ? a : b)

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="h-5 w-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />)}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mb-3" />
        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mb-3" />
        {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-2" />)}
      </div>
    </div>
  )
}

export default function BusinessVCardTemplatesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [industryFilter, setIndustryFilter] = useState('All')
  const [countryFilter, setCountryFilter] = useState('All')
  const [languageFilter, setLanguageFilter] = useState('All')
  const [qrTypeFilter, setQrTypeFilter] = useState('All')
  const [membershipFilter, setMembershipFilter] = useState('All')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [workspaceTemplate, setWorkspaceTemplate] = useState<BizVCardTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<{ name: string; templateId: string; sections: unknown } | null>(null)
  const [activityFor, setActivityFor] = useState<BizVCardTemplate | null>(null)
  const [versionsFor, setVersionsFor] = useState<BizVCardTemplate | null>(null)
  const [deleteFor, setDeleteFor] = useState<BizVCardTemplate | null>(null)
  const [archiveFor, setArchiveFor] = useState<BizVCardTemplate | null>(null)
  const [stored, setStored] = useState<StoredTemplate[]>(() => loadUserTemplatesByType('business'))

  const refresh = () => setStored(loadUserTemplatesByType('business'))

  const all: BizVCardTemplate[] = combineBizTemplates(stored)
  const allStored = stored

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  if (workspaceTemplate) {
    return <BusinessVCardWorkspace template={workspaceTemplate} onBack={() => setWorkspaceTemplate(null)} />
  }

  const isStored = (id: number) => allStored.some(s => s.id === id)

  const filtered = all.filter(t => {
    if (statusFilter !== 'all' && t.status.toLowerCase() !== statusFilter) return false
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false
    if (industryFilter !== 'All' && t.industry !== industryFilter) return false
    if (countryFilter !== 'All' && t.country !== countryFilter && !t.countries.includes(countryFilter)) return false
    if (languageFilter !== 'All' && t.language !== languageFilter && !t.languages.includes(languageFilter)) return false
    if (qrTypeFilter !== 'All' && t.qrType !== qrTypeFilter) return false
    if (membershipFilter !== 'All' && !t.membershipSupport.includes(membershipFilter)) return false

    if (search) {
      const q = search.toLowerCase()
      const matchSearch =
        t.name.toLowerCase().includes(q) ||
        t.templateId.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.industry.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.language.toLowerCase().includes(q) ||
        t.createdBy.toLowerCase().includes(q) ||
        t.brandId.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      if (!matchSearch) return false
    }
    return true
  })

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length
  const toggleAll = () => { setSelectedIds(allSelected ? [] : filtered.map(t => t.id)) }
  const toggleOne = (id: number) => { setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) }

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) { toast.error('Select templates first'); return }
    toast.success(`Bulk ${action}: ${selectedIds.length} templates`)
    setSelectedIds([])
  }

  /* Ensure a template exists as a stored (localStorage) template so every
     row action works on both platform and user-created templates. Platform
     rows keep their templateId so the stored version overrides the mock row. */
  const ensureStored = (t: BizVCardTemplate): StoredTemplate => {
    const s = ensureStoredTemplate(t, 'business', buildPublishedSections(t) as unknown as StoredSection[])
    refresh()
    return s
  }

  const handleDuplicate = (t: BizVCardTemplate) => {
    const s = ensureStored(t)
    navigate(`/admin/vcard-management/template-builder?duplicate=${s.id}`)
  }

  const handleEditBuilder = (t: BizVCardTemplate) => {
    const s = ensureStored(t)
    navigate(`/admin/vcard-management/template-builder?id=${s.id}`)
  }

  const handleArchive = (t: BizVCardTemplate) => {
    setArchiveFor(t)
  }

  const confirmArchive = () => {
    if (!archiveFor) return
    const s = ensureStored(archiveFor)
    archiveUserTemplate(s.id)
    refresh()
    toast.success(`${archiveFor.name} archived`)
    setArchiveFor(null)
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleExport = (t: BizVCardTemplate) => {
    const s = allStored.find(x => x.id === t.id) ?? allStored.find(x => x.templateId === t.templateId)
    const builder = s?.builder ?? {
      templateName: t.name,
      templateCategory: t.category,
      layoutPreset: 'preset-1',
      sections: buildPublishedSections(t) as unknown as StoredSection[],
    }
    const payload = {
      exportedAt: new Date().toISOString(),
      kind: 'Business VCard Template',
      template: {
        id: t.id,
        templateId: t.templateId,
        name: t.name,
        version: t.version,
        description: t.description,
        status: t.status,
        category: t.category,
        industry: t.industry,
        membershipSupport: t.membershipSupport,
        features: t.features,
        builder,
      },
    }
    downloadFile(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `${t.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${t.templateId}.json`)
    toast.success(`${t.name} exported`)
  }

  const exportTemplateList = () => {
    if (filtered.length === 0) { toast.error('No templates to export'); return }
    const headers = ['Template ID', 'Name', 'Version', 'Status', 'Category', 'Industry', 'Businesses', 'Claimed', 'QR Type', 'Updated', 'Updated By']
    const rows = filtered.map(t => [
      t.templateId, t.name, `v${t.version}`, t.status, t.category, t.industry,
      String(t.businessesUsing), String(isStored(t.id) ? 0 : claimedCount(t.id)),
      t.qrType, t.lastUpdated, t.updatedBy,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n')
    downloadFile(new Blob([csv], { type: 'text/csv' }), 'business-vcard-templates.csv')
    toast.success(`Exported ${rows.length} templates`)
  }

  const confirmDelete = () => {
    if (!deleteFor) return
    const s = ensureStored(deleteFor)
    deleteUserTemplate(s.id)
    refresh()
    toast.success(`${deleteFor.name} deleted`)
    setDeleteFor(null)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unable to load templates.</p>
        <p className="text-xs text-gray-400 mb-4">We couldn't retrieve the template list. Please try again.</p>
        <div className="flex gap-2">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Retry</button>
          <button onClick={() => toast.success('Report submitted')} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Report</button>
        </div>
      </div>
    )
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <Helmet><title>Business VCard Templates - VCard Management - MCOM VCard</title></Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Business VCard Templates</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Design master Business VCard experiences â€” commerce and growth tools for businesses across the platform.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/vcard-management/template-builder')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create Template</button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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
            <p className="text-[10px] text-gray-400">Most Popular</p>
            <p className="text-sm font-bold text-purple-600 truncate">{mostPopular.name}</p>
            <p className="text-[9px] text-gray-400">{mostPopular.businessesUsing.toLocaleString()} Businesses</p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] text-gray-400">QR Enabled</p>
            <p className="text-lg font-bold text-indigo-600">{all.filter(t => t.dynamicQr).length}</p>
          </div>
          <div className="p-2.5">
            <p className="text-[10px] text-gray-400">International</p>
            <p className="text-lg font-bold text-rose-600">{all.filter(t => t.international).length}</p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <input type="text" placeholder="Search by Template Name, ID, Category, Industry, Country, Language, Creator, Brand ID, or Tags..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {STATUSES.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                statusFilter === f ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}>{f === 'all' ? 'All Statuses' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {INDUSTRIES.map(i => <option key={i} value={i}>{i === 'All' ? 'All Industries' : i}</option>)}
          </select>
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {COUNTRIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>)}
          </select>
          <select value={languageFilter} onChange={e => setLanguageFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {LANGUAGES.map(l => <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>)}
          </select>
          <select value={qrTypeFilter} onChange={e => setQrTypeFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {QR_TYPES.map(q => <option key={q} value={q}>{q === 'All' ? 'All QR Types' : q}</option>)}
          </select>
          <select value={membershipFilter} onChange={e => setMembershipFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {MEMBERSHIP_PLANS.map(m => <option key={m} value={m}>{m === 'All' ? 'All Memberships' : m}</option>)}
          </select>
          <div className="text-[10px] text-gray-400 flex items-center px-2">
            {filtered.length} template{filtered.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/30 p-3 flex items-center justify-between">
          <span className="text-xs font-medium text-orange-700 dark:text-orange-300">{selectedIds.length} selected</span>
          <div className="flex gap-1.5 flex-wrap">
            {['Publish', 'Archive', 'Duplicate', 'Assign', 'Export', 'Delete', 'Move to Archive', 'Restore'].map(action => (
              <button key={action} onClick={() => handleBulkAction(action.toLowerCase())}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium ${
                  action === 'Delete' ? 'bg-red-500 text-white hover:bg-red-600' :
                  'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                }`}>{action}</button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-2 py-1.5 w-8">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="rounded border-gray-300 dark:border-gray-600 accent-orange-500" />
                </th>
                <th className="text-left px-2 py-1.5 font-medium">Preview</th>
                <th className="text-left px-2 py-1.5 font-medium">Template Name</th>
                <th className="text-left px-2 py-1.5 font-medium">ID</th>
                <th className="text-left px-2 py-1.5 font-medium">Version</th>
                <th className="text-left px-2 py-1.5 font-medium">Status</th>
                <th className="text-left px-2 py-1.5 font-medium">Membership</th>
                <th className="text-right px-2 py-1.5 font-medium">Businesses</th>
                <th className="text-right px-2 py-1.5 font-medium">Claimed</th>
                <th className="text-center px-2 py-1.5 font-medium">QR</th>
                <th className="text-center px-2 py-1.5 font-medium">i18n</th>
                <th className="text-left px-2 py-1.5 font-medium">Last Updated</th>
                <th className="text-left px-2 py-1.5 font-medium">Updated By</th>
                <th className="text-left px-2 py-1.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} onClick={() => setWorkspaceTemplate(t)}
                  className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer">
                  <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleOne(t.id)}
                      className="rounded border-gray-300 dark:border-gray-600 accent-orange-500" />
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-[8px] text-gray-400 font-medium">
                      {t.thumbnail.slice(0, 3)}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-[11px]">{t.name}</span>
                    <div className="flex gap-1 mt-0.5">
                      {t.features.slice(0, 2).map(f => <span key={f} className="px-1 py-0.5 rounded bg-gray-50 dark:bg-gray-700/30 text-gray-400 text-[8px]">{f}</span>)}
                      {t.features.length > 2 && <span className="text-[8px] text-gray-400">+{t.features.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 font-mono text-gray-400">{t.templateId}</td>
                  <td className="px-2 py-1.5 text-gray-500">v{t.version}</td>
                  <td className="px-2 py-1.5">
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                      t.status === 'Published' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' :
                      t.status === 'Draft' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                      t.status === 'Review' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex gap-0.5 flex-wrap max-w-[120px]">
                      {t.membershipSupport.slice(0, 3).map(m => (
                        <span key={m} className="px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[8px] font-medium">
                          {m.split(' ')[0]}
                        </span>
                      ))}
                      {t.membershipSupport.length > 3 && <span className="text-[8px] text-gray-400">+{t.membershipSupport.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300 font-medium">{t.businessesUsing.toLocaleString()}</td>
                  <td className="px-2 py-1.5 text-right">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-600 text-[9px] font-semibold">
                      {isStored(t.id) ? 0 : claimedCount(t.id)} claimed
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {t.dynamicQr
                      ? <span className="text-green-500 font-medium">Yes</span>
                      : <span className="text-gray-300 dark:text-gray-600">No</span>}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {t.international
                      ? <span className="text-indigo-500 font-medium">Yes</span>
                      : <span className="text-gray-300 dark:text-gray-600">No</span>}
                  </td>
                  <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{t.lastUpdated}</td>
                  <td className="px-2 py-1.5 text-gray-500">{t.updatedBy}</td>
                  <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                    <ActionDropdown actions={[
                      { label: 'Open', icon: 'M5 12h14M12 5l7 7-7 7', onClick: () => setWorkspaceTemplate(t) },
                      {
                        label: 'Preview', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
                        onClick: () => {
                          if (isStored(t.id)) {
                            const s = allStored.find(x => x.id === t.id)!
                            setPreviewTemplate({ name: t.name, templateId: t.templateId, sections: s.builder.sections })
                          } else {
                            setPreviewTemplate({ name: t.name, templateId: t.templateId, sections: buildPublishedSections(t) })
                          }
                        },
                      },
                      { label: 'Duplicate', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', onClick: () => handleDuplicate(t) },
                      { label: 'Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', onClick: () => setActivityFor(t) },
                      { label: 'Version History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0zm0 0l2-2m-2 2l2 2', onClick: () => setVersionsFor(t) },
                      { divider: true },
                      { label: 'Edit in Builder', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => handleEditBuilder(t) },
                      { label: 'Assign', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857', onClick: () => navigate('/admin/vcard-management/assignment') },
                      { label: 'Archive', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', onClick: () => handleArchive(t) },
                      { label: 'Export', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', onClick: () => handleExport(t) },
                      { divider: true },
                      {
                        label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true,
                        onClick: () => setDeleteFor(t),
                      },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No Business VCard Templates Found</p>
            <p className="text-xs text-gray-400 mb-4">Try adjusting your search or filter criteria, or create your first template.</p>
            <button onClick={() => navigate('/admin/vcard-management/template-builder')} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create First Template</button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { label: 'Create Template', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', action: () => navigate('/admin/vcard-management/template-builder') },
            { label: 'Assign to Business', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857', action: () => toast.success('Bulk assign dialog opened') },
            { label: 'Manage Dynamic QR', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', action: () => toast.success('Dynamic QR management opened') },
            { label: 'Publish All Drafts', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', action: () => toast.success('All draft templates published') },
            { label: 'Export Template List', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', action: () => exportTemplateList() },
            { label: 'View Archive', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', action: () => toast.success('Navigating to archive') },
            { label: 'View Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', action: () => toast.success('Navigating to activity log') },
          ].map((a) => (
            <button key={a.label} onClick={a.action} className="flex items-center gap-2 px-2 py-2 rounded-lg border border-gray-100 dark:border-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} /></svg>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-scroll preview modal for stored templates */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h4 className="text-xs font-semibold text-gray-800 dark:text-white">{previewTemplate.name} â€” Auto-Scroll Preview</h4>
                <p className="text-[10px] text-gray-400">Scans through the whole card â€” hover to scroll (desktop), tap to scroll or pause (mobile)</p>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" onClick={() => setPreviewTemplate(null)}>
              <div onClick={e => e.stopPropagation()}>
                <ScrollingVCard sections={previewTemplate.sections} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity & Version History modals */}
      {activityFor && (
        <TemplateActivityModal
          template={{ name: activityFor.name, version: activityFor.version, templateId: activityFor.templateId, status: activityFor.status }}
          onClose={() => setActivityFor(null)} />
      )}
      {versionsFor && (
        <TemplateVersionsModal
          template={{ name: versionsFor.name, version: versionsFor.version, templateId: versionsFor.templateId, status: versionsFor.status }}
          onClose={() => setVersionsFor(null)} />
      )}

      {/* Delete / Archive confirmation modals */}
      {deleteFor && (
        <TemplateConfirmModal
          name={deleteFor.name}
          templateIdNum={deleteFor.id}
          status={deleteFor.status}
          usageLabel="Businesses using"
          usageCount={deleteFor.businessesUsing}
          impactLabel="Affected VCards"
          impact={deleteFor.businessesUsing + (deleteFor.status === 'Published' ? 1 : 0)}
          mode="delete"
          onClose={() => setDeleteFor(null)}
          onConfirm={confirmDelete} />
      )}
      {archiveFor && (
        <TemplateConfirmModal
          name={archiveFor.name}
          templateIdNum={archiveFor.id}
          status={archiveFor.status}
          usageLabel="Businesses using"
          usageCount={archiveFor.businessesUsing}
          impactLabel="Affected VCards"
          impact={archiveFor.businessesUsing + (archiveFor.status === 'Published' ? 1 : 0)}
          mode="archive"
          onClose={() => setArchiveFor(null)}
          onConfirm={confirmArchive} />
      )}
    </div>
  )
}
