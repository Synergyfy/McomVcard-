import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { mockTemplates } from '../../services/mockData'
import PreviewModal from '../../components/common/PreviewModal'
import type { PreviewCardData } from '../../components/common/PreviewModal'

export default function ConsumerCardDesignsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [previewCard, setPreviewCard] = useState<PreviewCardData | null>(null)

  const consumerTemplates = mockTemplates.filter((t) => t.is_consumer)
  const categories = [...new Set(consumerTemplates.map((t) => t.category))]

  const filtered = consumerTemplates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
    return matchSearch && matchCategory
  })

  const openPreview = (template: typeof mockTemplates[0]) => {
    setPreviewCard({
      id: template.id, name: template.name, type: 'Consumer',
      style: template.category, layout: template.bg_style as 'split' | 'centered' | 'header' | 'minimal' | 'bold' | 'diagonal' | undefined,
      primaryColor: template.primary_color,
      secondaryColor: template.secondary_color,
      accentColor: '#FFFFFF',
      businessName: template.category, owner: 'Card Holder', title: template.font_family,
      phone: '+1 (555) 000-0000', email: 'hello@example.com', website: 'example.com',
      logo: template.category?.charAt(0) || 'C',
    })
  }

  const sectionKeys = ['About', 'Contact', 'Website', 'Social Media', 'Products', 'Bookings', 'Gallery', 'Reviews', 'Rewards']

  return (
    <div>
      <Helmet><title>Card Designs - Consumer - MCOM VCard</title></Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Card Designs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Browse available vCard card designs — {consumerTemplates.length} designs</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search designs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              onClick={() => openPreview(t)}>
              <div className="relative h-44 bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${t.primary_color}, ${t.secondary_color})` }}>
                <div className="absolute inset-0 bg-black/10 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.status === 'published' ? 'bg-green-400/20 text-green-100' : 'bg-yellow-400/20 text-yellow-100'}`}>{t.status}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{t.name.replace('vcard', 'Design ')}</h3>
                    <p className="text-white/70 text-xs capitalize">{t.category} · {t.font_family}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium capitalize">{t.button_style} buttons</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t.usage} uses</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sectionKeys.filter((s) => t.sections[s]).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-medium">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: t.primary_color }} />
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm -ml-1.5" style={{ backgroundColor: t.secondary_color }} />
                  <span className="text-[10px] text-gray-400 ml-auto">Created {t.created}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
          </div>
          <p className="text-base font-medium text-gray-900 dark:text-white mb-1">No designs found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      <PreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />
    </div>
  )
}
