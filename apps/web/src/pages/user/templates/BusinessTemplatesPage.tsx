import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockTemplates, mockClaimedTemplates } from '../../../services/mockData'
import type { AdminTemplate } from '../../../types'

const BUSINESS_ID = 1

type Tab = 'claimed' | 'all'

export default function BusinessTemplatesPage() {
  const [tab, setTab] = useState<Tab>('claimed')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const claimedIds = mockClaimedTemplates.filter((c) => c.business_id === BUSINESS_ID).map((c) => c.template_id)

  const claimedTemplates: (AdminTemplate & { views: number; shares: number; customized: boolean; claimed_at: string })[] = mockTemplates
    .filter((t) => claimedIds.includes(t.id))
    .map((t) => {
      const c = mockClaimedTemplates.find((cl) => cl.business_id === BUSINESS_ID && cl.template_id === t.id)!
      return { ...t, views: c.views, shares: c.shares, customized: c.customized, claimed_at: c.claimed_at }
    })

  const allTemplates = mockTemplates.filter((t) => t.status === 'published' && !claimedIds.includes(t.id))

  const categories = [...new Set(mockTemplates.filter((t) => t.status === 'published').map((t) => t.category))]

  const filterTemplates = (list: AdminTemplate[]) =>
    list.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
      return matchSearch && matchCategory
    })

  const displayList = tab === 'claimed' ? filterTemplates(claimedTemplates) : filterTemplates(allTemplates)

  return (
    <div>
      <Helmet><title>My Templates - MCOM VCard Social Bio</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VCard Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{claimedTemplates.length} templates claimed · {allTemplates.length} available</p>
        </div>
        <Link to="/templates" className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
          Browse All Templates
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('claimed')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'claimed' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          My Claimed ({claimedTemplates.length})
        </button>
        <button onClick={() => setTab('all')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          Available ({allTemplates.length})
        </button>
      </div>

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

      {/* Template Grid */}
      {displayList.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayList.map((t) => {
            const isClaimed = claimedIds.includes(t.id)
            const claimed = claimedTemplates.find((c) => c.id === t.id)
            return (
              <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img src={t.template_url} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-gray-700">{t.category}</span>
                  </div>
                  {isClaimed && claimed?.customized && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500 text-white">Customized</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex gap-2">
                      {isClaimed ? (
                        <>
                          <Link to={`/user/vcards/create?template=${t.id}`} className="flex-1 text-center py-2 bg-white rounded-lg text-xs font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
                            Use Template
                          </Link>
                          <Link to={`/user/templates/${t.id}/customize`} className="flex-1 text-center py-2 bg-orange-500 rounded-lg text-xs font-semibold text-white hover:bg-orange-600 transition-colors">
                            Customize
                          </Link>
                        </>
                      ) : (
                        <button className="flex-1 py-2 bg-orange-500 rounded-lg text-xs font-semibold text-white hover:bg-orange-600 transition-colors">
                          Claim Template
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{t.usage?.toLocaleString()} businesses using</span>
                    {isClaimed && claimed && (
                      <span className="text-[10px] text-gray-400">Claimed {claimed.claimed_at}</span>
                    )}
                  </div>
                  {isClaimed && claimed && (
                    <div className="flex gap-3 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                      <span>{claimed.views.toLocaleString()} views</span>
                      <span>{claimed.shares} shares</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No templates found</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{tab === 'claimed' ? 'Claim a template to get started' : 'Try adjusting your filters'}</p>
        </div>
      )}
    </div>
  )
}
