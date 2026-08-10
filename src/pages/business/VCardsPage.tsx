import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import Badge from '../../components/business/primitives/Badge'
import EmptyState from '../../components/business/states/EmptyState'
import ActionDropdown from '../../components/common/ActionDropdown'
import ScrollingVCard, { type ScrollingVCardHandle } from '../../components/common/ScrollingVCard'
import { getBusinessPermissions, getVCardById, getAllAssignedVCards, mockBusinessProfile } from '../../services/businessStore'
import { getVCardEditorContent, buildBusinessCentres } from '../../services/businessVCardEditorStore'
import { loadUserTemplatesByType, type StoredSection } from '../../services/vcardTemplateStore'
import { MOCK, toBizTemplate, templateSeason, templateSectors, templateCustomization, type BizVCardTemplate } from '../admin/card-management/BusinessVCardTemplatesPage'
import { buildPublishedSections } from '../admin/card-management/BusinessVCardWorkspace'
import ClaimTemplateModal from './vcard/ClaimTemplateModal'

const STATUSES = ['all', 'active', 'needs_update', 'locked']
const TYPES = ['All', 'Business VCard', 'Retail VCard', 'Seasonal VCard', 'International VCard']

/* Portrait phone-like thumb that represents the long scrolling VCard. */
function VCardThumb({ gradient }: { gradient: string }) {
    return (
        <div className={`w-9 h-14 rounded-md bg-gradient-to-br ${gradient} relative overflow-hidden shadow-sm shrink-0`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute left-1 right-1 top-1.5 space-y-0.5">
                <div className="h-0.5 w-4/5 rounded bg-white/70" />
                <div className="h-0.5 w-3/5 rounded bg-white/40" />
            </div>
            <div className="absolute left-1 right-1 bottom-1 space-y-0.5">
                <div className="h-1 rounded bg-white/30" />
                <div className="h-1 rounded bg-white/20" />
                <div className="h-1 rounded bg-white/15" />
            </div>
        </div>
    )
}

export default function VCardsPage() {
    const navigate = useNavigate()
    const perms = getBusinessPermissions()
    const limit = perms.limits.businessVCards

    const [mainTab, setMainTab] = useState<'vcards' | 'templates'>('vcards')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('All')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [previewId, setPreviewId] = useState<number | null>(null)
    const [claimTemplate, setClaimTemplate] = useState<BizVCardTemplate | null>(null)
    const [scrollActive, setScrollActive] = useState(false)
    const scrollRef = useRef<ScrollingVCardHandle>(null)

    const all = useMemo(() => getAllAssignedVCards(), [])
    const used = all.length
    const remaining = limit === null || limit === Infinity ? 'Unlimited' : Math.max(0, limit - used)

    const filtered = useMemo(() => {
        return all.filter(v => {
            if (statusFilter !== 'all' && v.status !== statusFilter) return false
            if (typeFilter !== 'All' && v.type !== typeFilter) return false
            if (search) {
                const q = search.toLowerCase()
                const match =
                    v.name.toLowerCase().includes(q) ||
                    v.type.toLowerCase().includes(q) ||
                    v.category.toLowerCase().includes(q) ||
                    v.urlSlug.toLowerCase().includes(q) ||
                    v.sections.some(s => s.toLowerCase().includes(q))
                if (!match) return false
            }
            return true
        })
    }, [all, search, statusFilter, typeFilter])

    /* ── Templates available to claim from Admin ── */
    const stored = loadUserTemplatesByType('business')
    const allTemplates: BizVCardTemplate[] = [
        ...MOCK.filter(m => !stored.some(s => s.templateId === m.templateId)),
        ...stored.map(toBizTemplate),
    ]
    const businessPlanNames = [mockBusinessProfile.membership]
    const isEligible = (t: BizVCardTemplate) =>
        t.membershipSupport.some(m => businessPlanNames.some(b => m.toLowerCase().startsWith(b.toLowerCase())))
    const publishedTemplates = useMemo(() => allTemplates.filter(t => t.status === 'Published'), [allTemplates])
    const availableTemplates = useMemo(() => publishedTemplates.filter(isEligible), [publishedTemplates])

    const categories = [...new Set(publishedTemplates.map((t) => t.category))]

    const filteredTemplates = useMemo(() => publishedTemplates.filter((t) => {
        const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
        const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
        return matchSearch && matchCategory
    }), [publishedTemplates, search, categoryFilter])

    const sectionsFor = (t: BizVCardTemplate) => {
        const s = stored.find(x => x.id === t.id) ?? stored.find(x => x.templateId === t.templateId)
        return s ? (s.builder.sections as unknown as StoredSection[]) : (buildPublishedSections(t) as unknown as StoredSection[])
    }

    const allSelected = filtered.length > 0 && selectedIds.length === filtered.length
    const toggleAll = () => setSelectedIds(allSelected ? [] : filtered.map(v => v.id))
    const toggleOne = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

    const handleBulkAction = (action: string) => {
        if (selectedIds.length === 0) { toast.error('Select VCards first'); return }
        toast.success(`Bulk ${action}: ${selectedIds.length} VCards`)
        setSelectedIds([])
    }

    const totals = {
        views: all.reduce((s, v) => s + v.views, 0),
        scans: all.reduce((s, v) => s + v.scans, 0),
        shares: all.reduce((s, v) => s + v.shares, 0),
    }

    const previewVCard = previewId !== null ? getVCardById(previewId) : undefined
    const atLimit = limit !== null && limit !== Infinity && used >= limit

    return (
        <div className="space-y-6">
            <Helmet><title>My Business VCards - MCOMVCard</title></Helmet>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-orange-600">Business Dashboard</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            <h1 className="text-sm font-bold text-gray-900 dark:text-white">My Business VCards</h1>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Long-scrolling digital profiles assigned to your business by Admin — or claim one from the template library. Structure is fixed; you can edit approved content.</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                            <span>{used} assigned · {remaining} remaining</span>
                            <span>·</span>
                            <span>{perms.planLevel} {perms.tier} plan</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setMainTab('templates')}
                        className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shrink-0"
                    >
                        Claim a Template
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Total VCards</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{all.length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Active</p>
                        <p className="text-lg font-bold text-green-600">{all.filter(v => v.status === 'active').length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Needs Update</p>
                        <p className="text-lg font-bold text-amber-600">{all.filter(v => v.status === 'needs_update').length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Locked</p>
                        <p className="text-lg font-bold text-gray-400">{all.filter(v => v.status === 'locked').length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Total Views</p>
                        <p className="text-lg font-bold text-blue-600">{totals.views.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Total Scans</p>
                        <p className="text-lg font-bold text-indigo-600">{totals.scans.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Total Shares</p>
                        <p className="text-lg font-bold text-purple-600">{totals.shares.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Allocation</p>
                        <p className="text-lg font-bold text-orange-600">{used} / {limit === null || limit === Infinity ? '∞' : limit}</p>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {([
                    { key: 'vcards' as const, label: 'My VCards', count: all.length },
                    { key: 'templates' as const, label: 'My Templates', count: availableTemplates.length },
                ]).map((t) => (
                    <button key={t.key} onClick={() => setMainTab(t.key)}
                        className={`px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all -mb-px ${mainTab === t.key ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border border-gray-200 dark:border-gray-700 border-b-white dark:border-b-gray-800' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        {t.label} ({t.count})
                    </button>
                ))}
            </div>

            {mainTab === 'templates' ? (
                /* ════ TAB: My Templates — claim an Admin template ════ */
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" /></svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-orange-700 dark:text-orange-300">
                                <span className="font-semibold">Templates published by your Admin.</span> Claim one to add it to your VCards — you'll be able to edit only the fields your Admin allows before it's added.
                            </p>
                        </div>
                        {atLimit && (
                            <span className="ml-auto shrink-0 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 text-[9px] font-semibold">Allocation full</span>
                        )}
                    </div>

                    {/* How the template system works */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">How the template system works</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { step: '1', who: 'Admin creates', items: ['Template', 'Components', 'Membership rules', 'Season', 'Available customization', 'Available actions'] },
                                { step: '2', who: 'Business receives', items: ['Membership', 'Eligible template', 'Limited customization', 'Publish'] },
                                { step: '3', who: 'Consumer receives', items: ['Finished VCard / Card', 'Share', 'Exchange', 'Redeem'] },
                            ].map((s) => (
                                <div key={s.step} className="rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">{s.step}</span>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{s.who}</p>
                                    </div>
                                    <ul className="space-y-1">
                                        {s.items.map((i) => (
                                            <li key={i} className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-500" />
                                                {i}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
                                <option value="all">All Categories</option>
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {filteredTemplates.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredTemplates.map((t) => (
                                <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                                    <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                                        <ScrollingVCard sections={sectionsFor(t)} centres={buildBusinessCentres(sectionsFor(t) as never)} heightClass="h-[300px]" widthClass="w-[170px]" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-gray-700">{t.category}</span>
                                        </div>
                                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button onClick={() => setClaimTemplate(t)} disabled={atLimit}
                                                className="flex-1 text-center py-2 rounded-lg text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                                {atLimit ? 'Allocation full' : 'Claim & Use Template'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t.name}</h3>
                                        <p className="text-[10px] text-gray-400 line-clamp-2 mb-2">{t.description}</p>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            {isEligible(t) ? (
                                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-semibold">Available to you</span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-semibold">Upgrade required</span>
                                            )}
                                            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9px] font-medium">Customization · {templateCustomization(t)}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {t.features.slice(0, 3).map((f) => (
                                                <span key={f} className="px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] font-medium">{f}</span>
                                            ))}
                                            {t.features.length > 3 && <span className="text-[9px] text-gray-400">+{t.features.length - 3}</span>}
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-[9px] uppercase tracking-wide text-gray-400 font-bold mb-1">Suitable sectors</p>
                                            <div className="flex flex-wrap gap-1">
                                                {templateSectors(t).slice(0, 3).map((s) => (
                                                    <span key={s} className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-medium">{s}</span>
                                                ))}
                                                {templateSectors(t).length > 3 && <span className="text-[9px] text-gray-400">+{templateSectors(t).length - 3}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400">
                                            <span>{t.businessesUsing.toLocaleString()} businesses using</span>
                                            <span>v{t.version}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-medium">Season · {templateSeason(t)}</span>
                                            <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[9px] font-medium">{t.membershipSupport.slice(0, 2).join(', ')}{t.membershipSupport.length > 2 ? ' +' : ''} plans</span>
                                        </div>
                                        <button
                                            onClick={() => isEligible(t) ? setClaimTemplate(t) : navigate('/business/membership/plans')}
                                            disabled={atLimit && isEligible(t)}
                                            className={`mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                                                isEligible(t)
                                                    ? atLimit
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                                        : 'bg-orange-500 text-white hover:bg-orange-600'
                                                    : 'border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                            }`}
                                        >
                                            {!isEligible(t) ? 'Upgrade to use' : atLimit ? 'Allocation full' : 'Claim & Use Template'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
                            <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" /></svg>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No templates found</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{search || categoryFilter !== 'all' ? 'Try adjusting your search or filters' : 'No Business VCard templates are available for your plan yet'}</p>
                        </div>
                    )}
                </div>
            ) : (
                /* ════ TAB: My VCards — assigned list ════ */
                <>
                    {/* Search + Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by VCard name, type, category, URL slug or section..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {STATUSES.map(f => (
                                <button key={f} onClick={() => setStatusFilter(f)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                                        statusFilter === f ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                                    }`}>
                                    {f === 'all' ? 'All Statuses' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                                className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
                            </select>
                            <div className="text-[10px] text-gray-400 flex items-center px-2">
                                {filtered.length} VCard{filtered.length !== 1 ? 's' : ''} found
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/30 p-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-orange-700 dark:text-orange-300">{selectedIds.length} selected</span>
                            <div className="flex gap-1.5 flex-wrap">
                                {['Export', 'Request Update', 'Report'].map(action => (
                                    <button key={action} onClick={() => handleBulkAction(action.toLowerCase())}
                                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50">
                                        {action}
                                    </button>
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
                                        <th className="text-left px-2 py-1.5 font-medium">VCard</th>
                                        <th className="text-left px-2 py-1.5 font-medium">Type</th>
                                        <th className="text-left px-2 py-1.5 font-medium">Status</th>
                                        <th className="text-left px-2 py-1.5 font-medium">Sections</th>
                                        <th className="text-right px-2 py-1.5 font-medium">Views</th>
                                        <th className="text-right px-2 py-1.5 font-medium">Scans</th>
                                        <th className="text-right px-2 py-1.5 font-medium">Shares</th>
                                        <th className="text-left px-2 py-1.5 font-medium">URL Slug</th>
                                        <th className="text-left px-2 py-1.5 font-medium">Last Admin Update</th>
                                        <th className="text-left px-2 py-1.5 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(v => (
                                        <tr key={v.id} onClick={() => navigate(`/business/vcards/${v.id}`)}
                                            className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer">
                                            <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox" checked={selectedIds.includes(v.id)} onChange={() => toggleOne(v.id)}
                                                    className="rounded border-gray-300 dark:border-gray-600 accent-orange-500" />
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <VCardThumb gradient={v.previewGradient} />
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <span className="font-medium text-gray-700 dark:text-gray-300 text-[11px]">{v.name}</span>
                                                <div className="text-[9px] text-gray-400 mt-0.5">{v.category}</div>
                                            </td>
                                            <td className="px-2 py-1.5 text-gray-500">{v.type}</td>
                                            <td className="px-2 py-1.5"><Badge status={v.status} /></td>
                                            <td className="px-2 py-1.5">
                                                <div className="flex gap-0.5 flex-wrap max-w-[180px]">
                                                    {v.sections.slice(0, 3).map(s => (
                                                        <span key={s} className="px-1 py-0.5 rounded bg-gray-50 dark:bg-gray-700/30 text-gray-400 text-[8px]">{s}</span>
                                                    ))}
                                                    {v.sections.length > 3 && <span className="text-[8px] text-gray-400">+{v.sections.length - 3}</span>}
                                                </div>
                                            </td>
                                            <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300 font-medium">{v.views.toLocaleString()}</td>
                                            <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300 font-medium">{v.scans.toLocaleString()}</td>
                                            <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300 font-medium">{v.shares.toLocaleString()}</td>
                                            <td className="px-2 py-1.5 font-mono text-gray-400">/{v.urlSlug}</td>
                                            <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{v.lastAdminUpdate}</td>
                                            <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                                                <ActionDropdown actions={[
                                                    { label: 'Open', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', onClick: () => navigate(`/business/vcards/${v.id}`) },
                                                    { label: 'Preview', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01', onClick: () => setPreviewId(v.id) },
                                                    { label: 'Edit Content', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => navigate(`/business/vcards/${v.id}/edit`) },
                                                ]} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {filtered.length === 0 && !all.length && (
                            <EmptyState title="No VCards assigned" message="Your Admin has not assigned any VCards to your business yet. Claim one from the My Templates tab or contact your Admin." />
                        )}
                        {filtered.length === 0 && all.length > 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No VCards match your filters</p>
                                <p className="text-xs text-gray-400 mb-4">Try adjusting your search or filter criteria.</p>
                                <button onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('All') }}
                                    className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Clear Filters</button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Preview modal */}
            {previewVCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewId(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{previewVCard.name} — Live Preview</h4>
                                <p className="text-[10px] text-gray-400">Exactly how the long scrolling VCard renders on your business profile.</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => scrollRef.current?.toggle()} className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-medium hover:bg-gray-200">
                                    {scrollActive ? 'Pause' : 'Resume'}
                                </button>
                                <button onClick={() => setPreviewId(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-start justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 py-8">
                            <ScrollingVCard ref={scrollRef} sections={getVCardEditorContent(previewVCard.id)} centres={buildBusinessCentres(getVCardEditorContent(previewVCard.id))} heightClass="h-[62vh]" widthClass="w-[280px] sm:w-[300px]" onStateChange={setScrollActive} />
                        </div>
                        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-[10px] text-gray-400">{previewVCard.sections.length} sections · {previewVCard.views.toLocaleString()} views</span>
                            <button onClick={() => navigate(`/business/vcards/${previewVCard.id}/edit`)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Edit Content</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Claim & Customise modal */}
            {claimTemplate && (
                <ClaimTemplateModal
                    template={claimTemplate}
                    onClose={() => setClaimTemplate(null)}
                    onClaimed={(id) => {
                        setClaimTemplate(null)
                        navigate(`/business/vcards/${id}`)
                    }}
                />
            )}
        </div>
    )
}
