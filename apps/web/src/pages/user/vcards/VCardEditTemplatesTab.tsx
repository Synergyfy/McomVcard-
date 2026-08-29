import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mockTemplates, mockClaimedTemplates } from '../../../services/mockData'
import type { VCard } from '../../../types'

const BUSINESS_ID = '1'

interface Props { vcard: VCard; onUpdate: (v: VCard) => void }

export default function VCardEditTemplatesTab({ vcard, onUpdate }: Props) {
  const [selectedId, setSelectedId] = useState<string>(String(vcard.template_id || 0))
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const claimedIds = mockClaimedTemplates.filter((c) => c.business_id === BUSINESS_ID).map((c) => String(c.template_id))
  const claimedTemplates = mockTemplates.filter((t) => claimedIds.includes(String(t.id)))
  const allPublished = mockTemplates.filter((t) => t.status === 'published')
  const categories = [...new Set(allPublished.map((t) => t.category))]

  const filtered = allPublished.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
    return matchSearch && matchCategory
  })

  const handleSelect = (id: string) => {
    setSelectedId(id)
    onUpdate({ ...vcard, template_id: Number(id) })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">vCard Templates</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Choose a template for your vCard. {claimedTemplates.length} templates are already claimed.</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((t) => {
          const isSelected = selectedId === String(t.id)
          return (
            <button key={t.id} onClick={() => handleSelect(String(t.id))}
              className={`group text-left rounded-xl border-2 overflow-hidden transition-all ${isSelected ? 'border-orange-500 shadow-md ring-2 ring-orange-500/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'}`}>
              <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img src={t.template_url} alt={t.name} className="w-full h-full object-cover group-hover:translate-y-[-52%] transition-transform duration-[8000ms] ease-linear"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                {claimedIds.includes(t.id) && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-green-500 text-white">Claimed</div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{t.name}</p>
                <p className="text-[10px] text-gray-400">{t.category} · {t.font_family}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-5 flex justify-between items-center">
        <Link to="/user/vcards" className="text-xs text-orange-600 hover:text-orange-700 font-medium">Browse more templates</Link>
        <button className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
          Save Template
        </button>
      </div>
    </div>
  )
}
