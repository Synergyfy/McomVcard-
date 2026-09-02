import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { userService } from '../../../services/user'
import type { VCard } from '../../../types'
import VCardPreviewModal from '../../../components/common/VCardPreviewModal'
import { MembershipLimitCard } from '../../../components/membership/MembershipLimitCard'
import { loadMembershipPricing } from '../../../services/membershipPricingStore'
import { getRuleValue, parseLimit, getPlanLevelFromName } from '../../../services/membershipEnforcement'
import { mockBusinessProfile } from '../../../services/businessStore'
import ScrollingVCard from '../../../components/common/ScrollingVCard'
import { MOCK, toBizTemplate, type BizVCardTemplate } from '../../admin/card-management/BusinessVCardTemplatesPage'
import { buildPublishedSections } from '../../admin/card-management/BusinessVCardWorkspace'
import { loadUserTemplatesByType, type StoredSection } from '../../../services/vcardTemplateStore'

type MainTab = 'vcards' | 'templates'

export default function VCardListPage() {
  const [mainTab, setMainTab] = useState<MainTab>('vcards')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [previewVcard, setPreviewVcard] = useState<VCard | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<BizVCardTemplate | null>(null)
  const [myVcards, setMyVcards] = useState<VCard[]>([])

  useEffect(() => {
    userService.getVcards().then(setMyVcards).catch(console.error)
  }, [])

  /* ── data ── */
  const pricingState = loadMembershipPricing()
  const planLevel = getPlanLevelFromName(mockBusinessProfile.membership)
  const bizVCardLimit = parseLimit(getRuleValue(pricingState, planLevel, 'Business VCards'))
  const atBizVCardLimit = bizVCardLimit !== null && bizVCardLimit !== Infinity && myVcards.length >= bizVCardLimit

  /* Templates come from Admin's Business VCard Templates — platform + user-created,
     exactly as the admin management page assembles them. Only published ones are
     available to the business, and only for the plans Admin granted access to. */
  const stored = loadUserTemplatesByType('business')
  const allTemplates: BizVCardTemplate[] = [
    ...MOCK.filter(m => !stored.some(s => s.templateId === m.templateId)),
    ...stored.map(toBizTemplate),
  ]

  const businessPlanNames = [mockBusinessProfile.membership]
  const availableTemplates = allTemplates.filter((t) => {
    if (t.status !== 'Published') return false
    if (!t.membershipSupport.some(m => businessPlanNames.some(b => m.toLowerCase().startsWith(b.toLowerCase())))) return false
    return true
  })

  const categories = [...new Set(availableTemplates.map((t) => t.category))]

  const filteredTemplates = availableTemplates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
    return matchSearch && matchCategory
  })

  /* Build the phone sections for a template the same way the admin workspace
     does — stored builder data wins, otherwise synthesized from metadata. */
  const sectionsFor = (t: BizVCardTemplate) => {
    const s = stored.find(x => x.id === t.id) ?? stored.find(x => x.templateId === t.templateId)
    return s ? (s.builder.sections as unknown as StoredSection[]) : (buildPublishedSections(t) as unknown as StoredSection[])
  }

  return (
    <div>
      <Helmet><title>My vCards - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My vCards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {myVcards.length} vCards · {availableTemplates.length} templates available from MCOM
          </p>
        </div>
        {atBizVCardLimit ? (
          <span className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-sm font-semibold cursor-not-allowed" title={`Your ${planLevel} plan allows ${getRuleValue(pricingState, planLevel, 'Business VCards')} Business VCards`}>
            Limit reached
          </span>
        ) : (
          <Link to="/b/vcards" className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
            Get Template
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <MembershipLimitCard label="Business VCards" used={myVcards.length} planLevel={planLevel} context="business" />
        <MembershipLimitCard label="Business Cards" used={0} planLevel={planLevel} context="business" />
      </div>

      {/* ── Main Tabs ── */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-0">
        {([
          { key: 'vcards' as const, label: 'My vCards', count: myVcards.length },
          { key: 'templates' as const, label: 'My Templates', count: availableTemplates.length },
        ]).map((t) => (
          <button key={t.key} onClick={() => setMainTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all -mb-px ${mainTab === t.key ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border border-gray-200 dark:border-gray-700 border-b-white dark:border-b-gray-800' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          TAB 1: My vCards
         ════════════════════════════════════════════════════ */}
      {mainTab === 'vcards' && (
        myVcards.length ? (
          <div className="space-y-3">
            {myVcards.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                <Link to={`/b/vcards`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0">
                    {v.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{v.name}</p>
                    <p className="text-xs text-gray-400 truncate">/{v.url_slug} · {v.occupation || 'No occupation'}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${v.status ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {v.status ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); setPreviewVcard(v); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Preview">
                    <svg className="w-4 h-4 text-gray-400 hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No vCards yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Choose a template and create your first vCard</p>
            <Link to="/b/vcards" className="inline-block px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              Get Template
            </Link>
          </div>
        )
      )}

      {/* ════════════════════════════════════════════════════
          TAB 2: My Templates — from Admin's Business VCard Templates
         ════════════════════════════════════════════════════ */}
      {mainTab === 'templates' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {filteredTemplates.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTemplates.map((t) => (
                <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <ScrollingVCard sections={sectionsFor(t)} heightClass="h-[300px]" widthClass="w-[170px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-gray-700">{t.category}</span>
                    </div>
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => setPreviewTemplate(t)} className="flex-1 text-center py-2 bg-white rounded-lg text-xs font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
                        Preview
                      </button>
                      <Link to="/b/vcards" className="flex-1 text-center py-2 bg-orange-500 rounded-lg text-xs font-semibold text-white hover:bg-orange-600 transition-colors">
                        Use Template
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t.name}</h3>
                    <p className="text-[10px] text-gray-400 line-clamp-2 mb-2">{t.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.features.slice(0, 3).map((f) => (
                        <span key={f} className="px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] font-medium">{f}</span>
                      ))}
                      {t.features.length > 3 && <span className="text-[9px] text-gray-400">+{t.features.length - 3}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400">
                      <span>{t.businessesUsing.toLocaleString()} businesses using</span>
                      <span>v{t.version}</span>
                    </div>
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
        </>
      )}

      <VCardPreviewModal vcard={previewVcard} onClose={() => setPreviewVcard(null)} />

      {/* Full phone preview modal — rendered like the admin template builder */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{previewTemplate.name}</h4>
                <p className="text-[10px] text-gray-400">{previewTemplate.templateId} · v{previewTemplate.version} · {previewTemplate.category}</p>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
              <ScrollingVCard sections={sectionsFor(previewTemplate)} />
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
              <button onClick={() => setPreviewTemplate(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
              <Link to="/b/vcards" onClick={() => setPreviewTemplate(null)} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Use This Template</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
