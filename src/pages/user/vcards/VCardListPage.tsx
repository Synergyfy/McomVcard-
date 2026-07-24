import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockTemplates, mockClaimedTemplates, mockVcards } from '../../../services/mockData'
import type { AdminTemplate, VCard } from '../../../types'
import VCardPreviewModal from '../../../components/common/VCardPreviewModal'

const BUSINESS_ID = 1

type MainTab = 'vcards' | 'templates'

export default function VCardListPage() {
  const [mainTab, setMainTab] = useState<MainTab>('vcards')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [previewVcard, setPreviewVcard] = useState<VCard | null>(null)

  /* ── data ── */
  const myVcards = mockVcards.filter((v) => v.user_id === BUSINESS_ID)
  const claimedIds = mockClaimedTemplates.filter((c) => c.business_id === BUSINESS_ID).map((c) => c.template_id)

  const claimedTemplates: (AdminTemplate & { views: number; shares: number; customized: boolean; claimed_at: string })[] = mockTemplates
    .filter((t) => claimedIds.includes(t.id))
    .map((t) => {
      const c = mockClaimedTemplates.find((cl) => cl.business_id === BUSINESS_ID && cl.template_id === t.id)!
      return { ...t, views: c.views, shares: c.shares, customized: c.customized, claimed_at: c.claimed_at }
    })

  const categories = [...new Set(mockTemplates.filter((t) => t.status === 'published').map((t) => t.category))]

  const filteredClaimed = claimedTemplates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
    return matchSearch && matchCategory
  })

  return (
    <div>
      <Helmet><title>My vCards - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My vCards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {myVcards.length} vCards · {claimedTemplates.length} templates claimed
          </p>
        </div>
        <Link to="/templates" className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
          Get Template
        </Link>
      </div>

      {/* ── Main Tabs ── */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-0">
        {([
          { key: 'vcards' as const, label: 'My vCards', count: myVcards.length },
          { key: 'templates' as const, label: 'My Templates', count: claimedTemplates.length },
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
            {myVcards.map((v) => {
              const tpl = mockTemplates.find((t) => t.id === v.template_id)
              return (
                <div key={v.id} className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                  <Link to={`/user/vcards/${v.id}/edit`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0">
                      {v.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{v.name}</p>
                      <p className="text-xs text-gray-400 truncate">/{v.url_slug} · {v.occupation || 'No occupation'}</p>
                      {tpl && <p className="text-[10px] text-gray-400 mt-0.5">Template: {tpl.category}</p>}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${v.status ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {v.status ? 'Active' : 'Inactive'}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setPreviewVcard(v); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Preview">
                      <svg className="w-4 h-4 text-gray-400 hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <Link to={`/user/vcards/${v.id}/edit`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Edit">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No vCards yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Choose a template and create your first vCard</p>
            <Link to="/user/vcards/create" className="inline-block px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              Create vCard
            </Link>
          </div>
        )
      )}

      {/* ════════════════════════════════════════════════════
          TAB 2: My Templates (claimed only)
         ════════════════════════════════════════════════════ */}
      {mainTab === 'templates' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search my templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {filteredClaimed.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredClaimed.map((t) => (
                <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img src={t.template_url} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-gray-700">{t.category}</span>
                    </div>
                    {t.customized && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500 text-white">Customized</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex gap-2">
                        <Link to={`/user/vcards/create?template=${t.id}`} className="flex-1 text-center py-2 bg-white rounded-lg text-xs font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
                          Use Template
                        </Link>
                        <Link to={`/user/templates/${t.id}/customize`} className="flex-1 text-center py-2 bg-orange-500 rounded-lg text-xs font-semibold text-white hover:bg-orange-600 transition-colors">
                          Customize
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{t.usage?.toLocaleString()} businesses using</span>
                      <span className="text-[10px] text-gray-400">Claimed {t.claimed_at}</span>
                    </div>
                    <div className="flex gap-3 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                      <span>{t.views.toLocaleString()} views</span>
                      <span>{t.shares} shares</span>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{search || categoryFilter !== 'all' ? 'Try adjusting your search or filters' : 'Claim a template to get started'}</p>
              {!search && categoryFilter === 'all' && (
                <Link to="/templates" className="inline-block px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                  Browse Templates
                </Link>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/templates" className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Browse More Templates
            </Link>
          </div>
        </>
      )}

      <VCardPreviewModal vcard={previewVcard} onClose={() => setPreviewVcard(null)} />
    </div>
  )
}