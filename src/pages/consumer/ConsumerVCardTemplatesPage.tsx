import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { mockTemplates } from '../../services/mockData'
import PreviewModal from '../../components/common/PreviewModal'
import type { PreviewCardData } from '../../components/common/PreviewModal'

export default function ConsumerVCardTemplatesPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [previewCard, setPreviewCard] = useState<PreviewCardData | null>(null)

  const consumerTemplates = mockTemplates.filter((t) => t.is_consumer && t.status === 'published')
  const categories = [...new Set(consumerTemplates.map((t) => t.category))]

  const filtered = consumerTemplates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
    return matchSearch && matchCategory
  })

  const openPreview = (template: typeof mockTemplates[0]) => {
    setPreviewCard({
      id: template.id, name: template.name, type: 'Template',
      style: template.category, primaryColor: template.primary_color,
      secondaryColor: template.secondary_color, category: template.category,
      templateUrl: template.template_url, logo: template.category?.charAt(0) || 'T',
      businessName: template.category, title: template.font_family,
    })
  }

  return (
    <div>
      <Helmet><title>vCard Templates - Consumer - MCOM VCard</title></Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">vCard Templates</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Browse and preview vCard templates — {consumerTemplates.length} templates</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((template) => (
            <div key={template.id} className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer"
              onClick={() => openPreview(template)}>
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-gray-700">
                <img
                  src={template.template_url}
                  alt={template.name}
                  className="w-full transition-transform duration-[8000ms] ease-linear group-hover:translate-y-[-52%]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect fill="#f3f4f6" width="400" height="600"/><text fill="#9ca3af" font-family="Arial" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">${template.name}</text></svg>`)}`
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  onClick={(e) => { e.stopPropagation(); openPreview(template) }}>
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>
                </div>
              </div>
              <div className="py-4 px-4 text-center">
                <span className="text-gray-700 dark:text-gray-200 font-medium text-sm capitalize">{template.category}</span>
                <p className="text-xs text-gray-400 mt-0.5">{template.font_family} · {template.usage} uses</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
          </div>
          <p className="text-base font-medium text-gray-900 dark:text-white mb-1">No templates found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      <PreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />
    </div>
  )
}
