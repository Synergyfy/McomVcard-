import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { userService } from '../../../services/user'
import type { AdminTemplate } from '../../../types'

type Tab = 'claimed' | 'all'

export default function BusinessTemplatesPage() {
  const [tab, setTab] = useState<Tab>('claimed')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [allTemplates, setAllTemplates] = useState<AdminTemplate[]>([])

  useEffect(() => {
    userService.getTemplates()
      .then((templates) => setAllTemplates(templates as unknown as AdminTemplate[]))
      .catch(console.error)
  }, [])

  const published = allTemplates.filter((t) => t.status === 'published')
  const categories = [...new Set(published.map((t) => t.category))]

  const filterTemplates = (list: AdminTemplate[]) =>
    list.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
      return matchSearch && matchCategory
    })

  const displayList = tab === 'claimed' ? filterTemplates(published.slice(0, 0)) : filterTemplates(published)

  return (
    <div>
      <Helmet><title>My Templates - MCOM VCard Social Bio</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VCard Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{published.length} templates available</p>
        </div>
        <Link to="/templates" className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
          Browse All Templates
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('claimed')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'claimed' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          All Templates ({published.length})
        </button>
        <button onClick={() => setTab('all')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          Available ({published.length})
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
            return (
              <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img src={t.template_url} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-gray-700">{t.category}</span>
                  </div>
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
                  </div>
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
