import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockCardDesigns } from '../services/mockData'
import PreviewModal from '../components/common/PreviewModal'
import type { PreviewCardData } from '../components/common/PreviewModal'

type Tab = 'all' | 'business' | 'consumer'

export default function CardsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) || 'all'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [search, setSearch] = useState('')
  const [layoutFilter, setLayoutFilter] = useState('all')
  const [previewCard, setPreviewCard] = useState<PreviewCardData | null>(null)

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All Cards', count: mockCardDesigns.length },
    { key: 'business', label: 'Business', count: mockCardDesigns.filter((c) => c.type === 'Business').length },
    { key: 'consumer', label: 'Consumer', count: mockCardDesigns.filter((c) => c.type === 'Consumer').length },
  ]

  const layouts = [...new Set(mockCardDesigns.map((c) => c.layout))]

  const filtered = mockCardDesigns.filter((c) => {
    const matchTab = tab === 'all' || c.type.toLowerCase() === tab
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.style.toLowerCase().includes(search.toLowerCase())
    const matchLayout = layoutFilter === 'all' || c.layout === layoutFilter
    return matchTab && matchSearch && matchLayout
  })

  const openPreview = (c: typeof mockCardDesigns[0]) => {
    setPreviewCard({
      id: c.id, name: c.name, type: c.type as 'Business' | 'Consumer',
      style: c.style, layout: c.layout, primaryColor: c.primaryColor,
      secondaryColor: c.secondaryColor, accentColor: c.accentColor,
      businessName: c.name, owner: 'Business Owner', title: c.style,
      phone: '+1 (555) 000-0000', email: 'hello@business.com', website: 'business.com',
      logo: c.name.charAt(0),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet><title>Card Designs - MCOM VCard Social Bio</title></Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Business Card Designs</h1>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto">Choose from professionally designed card templates. Claim one and make it yours.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearchParams(t.key === 'all' ? {} : { tab: t.key }) }} className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${tab === t.key ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-none' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search card designs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm" />
          </div>
          <select value={layoutFilter} onChange={(e) => setLayoutFilter(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm">
            <option value="all">All Layouts</option>
            {layouts.map((l) => <option key={l} value={l} className="capitalize">{l}</option>)}
          </select>
        </div>

        {/* Card Grid */}
        {filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {filtered.map((c) => (
              <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => openPreview(c)}>
                {/* Card Preview */}
                <div className="relative p-6" style={{ background: `linear-gradient(135deg, ${c.primaryColor}, ${c.secondaryColor})` }}>
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/20 text-white font-medium backdrop-blur-sm">{c.type}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{c.name}</h3>
                  <p className="text-white/60 text-sm">{c.style}</p>
                  <div className="mt-4 flex gap-1.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-1 rounded-full bg-white/30" style={{ width: `${25 + i * 12}%` }} />
                    ))}
                  </div>
                  {/* Hover overlay — eye icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); openPreview(c) }}>
                    <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium capitalize">{c.layout}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{c.usage} businesses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c.primaryColor }} />
                      <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm -ml-1.5" style={{ backgroundColor: c.secondaryColor }} />
                      <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm -ml-1.5" style={{ backgroundColor: c.accentColor }} />
                    </div>
                    <span className="text-[10px] text-gray-400 ml-auto">Created {c.created}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-16 text-center mb-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-white mb-1">No card designs found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <PreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />
    </div>
  )
}
