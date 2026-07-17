import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockClaimedCards, mockCardDesigns, mockCardBusinesses } from '../../../services/mockData'
import type { ClaimedCard } from '../../../services/mockData'
import PreviewModal from '../../../components/common/PreviewModal'
import type { PreviewCardData } from '../../../components/common/PreviewModal'

const BUSINESS_ID = 1

export default function BusinessCardsPage() {
  const [tab, setTab] = useState<'claimed' | 'available'>('claimed')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [flipCardId, setFlipCardId] = useState<number | null>(null)
  const [modalCard, setModalCard] = useState<PreviewCardData | null>(null)

  const claimedCards: ClaimedCard[] = mockClaimedCards.filter((c) => c.business_id === BUSINESS_ID)
  const claimedDesignIds = claimedCards.map((c) => c.card_design_id)
  const availableDesigns = mockCardDesigns.filter((d) => !claimedDesignIds.includes(d.id))

  const cardTypes = [...new Set(mockCardDesigns.map((d) => d.type))]

  const enrichedClaimed = claimedCards.map((c) => {
    const design = mockCardDesigns.find((d) => d.id === c.card_design_id)
    const biz = mockCardBusinesses.find((b) => b.cardDesignId === c.card_design_id && b.id === BUSINESS_ID)
    return { ...c, design, biz }
  }).filter((c) => c.design)

  const filteredClaimed = enrichedClaimed.filter((c) => {
    const matchSearch = c.design!.name.toLowerCase().includes(search.toLowerCase()) || (c.biz?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || c.design!.type === typeFilter
    return matchSearch && matchType
  })

  const filteredAvailable = availableDesigns.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.style.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || d.type === typeFilter
    return matchSearch && matchType
  })

  const totalScans = claimedCards.reduce((a, c) => a + c.scans, 0)

  const toPreviewCard = (design: typeof mockCardDesigns[0], biz?: typeof mockCardBusinesses[0]): PreviewCardData => ({
    id: design.id, name: design.name, type: design.type,
    primaryColor: design.primaryColor, secondaryColor: design.secondaryColor,
    accentColor: design.accentColor, category: design.style,
    businessName: biz?.name || design.name, owner: biz?.owner || '', title: design.style,
    phone: biz?.phone || '', email: biz?.email || '', website: '', logo: '',
  })

  return (
    <div>
      <Helmet><title>My Cards - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Cards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{claimedCards.length} claimed cards · {totalScans.toLocaleString()} total scans</p>
        </div>
        <Link to="/cards" className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
          Browse Cards
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-2xl font-bold">{claimedCards.length}</p>
          <p className="text-xs text-blue-100">Claimed Cards</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-2xl font-bold">{totalScans.toLocaleString()}</p>
          <p className="text-xs text-green-100">Total Scans</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-2xl font-bold">{claimedCards.filter((c) => c.active).length}</p>
          <p className="text-xs text-purple-100">Active</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-2xl font-bold">{claimedCards.filter((c) => !c.active).length}</p>
          <p className="text-xs text-orange-100">Inactive</p>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {(['claimed', 'available'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t ? 'bg-orange-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {t === 'claimed' ? `My Cards (${claimedCards.length})` : `Available (${availableDesigns.length})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-48 pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="all">All Types</option>
            {cardTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {tab === 'claimed' ? (
        filteredClaimed.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredClaimed.map((c) => {
              const d = c.design!
              const isFlipped = flipCardId === c.id
              return (
                <div key={c.id} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-lg transition-all" style={{ perspective: 1200 }}>
                  <div className="relative aspect-[1.7/1] cursor-pointer" onClick={() => setFlipCardId(isFlipped ? null : c.id)} style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s ease', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                    {/* Front */}
                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                      <div className="w-full h-full p-4 flex flex-col justify-between relative" style={{ background: `linear-gradient(135deg, ${d.primaryColor}, ${d.secondaryColor})` }}>
                        <div className="absolute top-3 right-3 opacity-20 text-white text-3xl font-black">MCOM</div>
                        <div className="z-10">
                          <p className="text-[9px] text-white/60 uppercase tracking-wider mb-1">{d.type}</p>
                          <p className="text-sm font-bold text-white">{d.name}</p>
                          <p className="text-[10px] text-white/70">{d.style} · {d.layout}</p>
                        </div>
                        <div className="z-10 flex items-end justify-between">
                          <div className="flex gap-1">
                            {[d.primaryColor, d.secondaryColor, d.accentColor].map((color, i) => (
                              <div key={i} className="w-4 h-4 rounded-full border border-white/30" style={{ background: color }} />
                            ))}
                          </div>
                          <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
                            <div className="w-6 h-6 grid grid-cols-3 gap-[1px]">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="bg-white/80 rounded-[1px]" />)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      <div className="w-full h-full bg-white dark:bg-gray-900 p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold mb-2 shadow">M</div>
                        <p className="text-[10px] font-bold text-gray-900 dark:text-white">{d.name}</p>
                        <p className="text-[8px] text-gray-400 mb-1">{d.style} · {d.layout}</p>
                        <div className="flex gap-1.5">
                          {[d.primaryColor, d.secondaryColor, d.accentColor].map((color, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700" style={{ background: color }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{d.name}</span>
                      <div className="flex gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); setModalCard(toPreviewCard(d, c.biz)); }} className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" title="Preview">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setFlipCardId(isFlipped ? null : c.id); }} className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" title="Flip">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mb-2">{d.type} · {d.style}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                      <span className="text-[10px] text-gray-400">{c.scans.toLocaleString()} scans</span>
                    </div>
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                      <button className="flex-1 py-1.5 text-[10px] font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Edit</button>
                      <button className="flex-1 py-1.5 text-[10px] font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">Assign vCard</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No cards found</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Claim a card to get started</p>
          </div>
        )
      ) : (
        filteredAvailable.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAvailable.map((d) => {
              const isFlipped = flipCardId === d.id
              return (
                <div key={d.id} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-lg transition-all" style={{ perspective: 1200 }}>
                  <div className="relative aspect-[1.7/1] cursor-pointer" onClick={() => setFlipCardId(isFlipped ? null : d.id)} style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s ease', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                    {/* Front */}
                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                      <div className="w-full h-full p-4 flex flex-col justify-between relative" style={{ background: `linear-gradient(135deg, ${d.primaryColor}, ${d.secondaryColor})` }}>
                        <div className="absolute top-3 right-3 opacity-20 text-white text-3xl font-black">MCOM</div>
                        <div className="z-10">
                          <p className="text-[9px] text-white/60 uppercase tracking-wider mb-1">{d.type}</p>
                          <p className="text-sm font-bold text-white">{d.name}</p>
                          <p className="text-[10px] text-white/70">{d.style} · {d.layout}</p>
                        </div>
                        <div className="z-10 flex items-end justify-between">
                          <div className="flex gap-1">
                            {[d.primaryColor, d.secondaryColor, d.accentColor].map((color, i) => (
                              <div key={i} className="w-4 h-4 rounded-full border border-white/30" style={{ background: color }} />
                            ))}
                          </div>
                          <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
                            <div className="w-6 h-6 grid grid-cols-3 gap-[1px]">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="bg-white/80 rounded-[1px]" />)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      <div className="w-full h-full bg-white dark:bg-gray-900 p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold mb-2 shadow">M</div>
                        <p className="text-[10px] font-bold text-gray-900 dark:text-white">{d.name}</p>
                        <p className="text-[8px] text-gray-400 mb-1">{d.style} · {d.layout}</p>
                        <div className="flex gap-1.5">
                          {[d.primaryColor, d.secondaryColor, d.accentColor].map((color, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700" style={{ background: color }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{d.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); setModalCard(toPreviewCard(d)); }} className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" title="Preview">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mb-2">{d.type} · {d.style}</p>
                    <Link to="/cards" className="block text-center py-1.5 text-[10px] font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                      Claim Card
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No cards found</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">All available cards have been claimed</p>
          </div>
        )
      )}

      <PreviewModal card={modalCard} onClose={() => setModalCard(null)} />
    </div>
  )
}
