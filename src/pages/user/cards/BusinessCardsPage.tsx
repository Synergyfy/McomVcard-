import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MembershipLimitCard } from '../../../components/membership/MembershipLimitCard'
import { loadMembershipPricing } from '../../../services/membershipPricingStore'
import { getRuleValue, parseLimit, getPlanLevelFromName } from '../../../services/membershipEnforcement'
import { mockBusinessProfile } from '../../../services/businessStore'
import { mockClaimedCards } from '../../../services/mockData'
import { CardPreviewModal, buildMockFaces } from '../../../components/admin/CardPreview'
import { MOCK, toRow, type CardRow } from '../../admin/card-management/BusinessCardTemplatesPage'
import { loadCardTemplatesByType } from '../../../services/cardTemplateStore'

const BUSINESS_ID = 1

export default function BusinessCardsPage() {
  const [tab, setTab] = useState<'claimed' | 'available'>('claimed')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [previewFor, setPreviewFor] = useState<{ row: CardRow; faces: never } | null>(null)

  const pricingState = loadMembershipPricing()
  const planLevel = getPlanLevelFromName(mockBusinessProfile.membership)

  /* Business card templates come from Admin's Business Card Templates —
     platform rows + user-created stored rows, exactly as the admin page
     assembles them. Only published templates are available. */
  const storedCards = loadCardTemplatesByType('business')
  const allRows: CardRow[] = [...MOCK, ...storedCards.map(toRow)]
  const availableRows = allRows.filter((r) => r.status === 'Published')
  const availableCategories = [...new Set(availableRows.map((r) => r.category))]

  /* The business's own cards — the ones Admin has assigned to it. */
  const claimedCards = mockClaimedCards.filter((c) => c.business_id === BUSINESS_ID)
  const cardName = (designId: number) => allRows.find((r) => r.id === designId)?.name ?? `Business Card #${designId}`
  const filteredAvailable = availableRows.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || r.category === typeFilter
    return matchSearch && matchType
  })

  const bizCardLimit = parseLimit(getRuleValue(pricingState, planLevel, 'Business Cards'))
  const atLimit = bizCardLimit !== null && bizCardLimit !== Infinity && claimedCards.length >= bizCardLimit

  const totalScans = claimedCards.reduce((a, c) => a + c.scans, 0)

  const openPreview = (row: CardRow) => {
    const stored = storedCards.find(s => s.id === row.id)
    setPreviewFor({
      row,
      faces: stored
        ? (stored.builder.faces as never)
        : buildMockFaces({
            name: row.name,
            templateId: row.templateId,
            cardType: 'business',
            theme: row.theme,
            category: row.category,
            qrPosition: row.qrPosition,
            qrSize: row.qrSize,
            hasSecurity: row.hasSecurity,
            ffIndicator: row.ffIndicator,
            progressDisplay: row.progressDisplay,
          }) as never,
    })
  }

  return (
    <div>
      <Helmet><title>My Cards - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Cards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{claimedCards.length} assigned cards · {totalScans.toLocaleString()} total scans</p>
        </div>
        {atLimit ? (
          <span className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-sm font-semibold cursor-not-allowed" title={`Your ${planLevel} plan allows ${getRuleValue(pricingState, planLevel, 'Business Cards')} Business Cards`}>
            Limit reached
          </span>
        ) : (
          <Link to="/b/cards" className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
            Browse Cards
          </Link>
        )}
      </div>

      <div className="mb-6">
        <MembershipLimitCard label="Business Cards" used={claimedCards.length} planLevel={planLevel} context="business" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-2xl font-bold">{claimedCards.length}</p>
          <p className="text-xs text-blue-100">Assigned Cards</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-2xl font-bold">{totalScans.toLocaleString()}</p>
          <p className="text-xs text-green-100">Total Scans</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-2xl font-bold">{availableRows.length}</p>
          <p className="text-xs text-purple-100">Admin Templates</p>
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
              {t === 'claimed' ? `My Cards (${claimedCards.length})` : `From Admin (${filteredAvailable.length})`}
            </button>
          ))}
        </div>
        {tab === 'available' && (
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-48 pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">All Categories</option>
              {availableCategories.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* My Cards */}
      {tab === 'claimed' ? (
        claimedCards.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {claimedCards.map((c) => (
              <div key={c.id} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-[1.7/1]">
                  <div className="w-full h-full p-4 flex flex-col justify-between relative bg-gradient-to-br from-orange-500 to-orange-600">
                    <div className="absolute top-3 right-3 opacity-20 text-white text-3xl font-black">MCOM</div>
                    <div className="z-10">
                      <p className="text-[9px] text-white/60 uppercase tracking-wider mb-1">{allRows.find((r) => r.id === c.card_design_id)?.category ?? 'Business Card'}</p>
                      <p className="text-sm font-bold text-white">{cardName(c.card_design_id)}</p>
                    </div>
                    <div className="z-10 flex items-end justify-between">
                      <span className="text-[10px] text-white/70">Claimed {new Date(c.claimed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
                        <div className="w-6 h-6 grid grid-cols-3 gap-[1px]">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="bg-white/80 rounded-[1px]" />)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{cardName(c.card_design_id)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                    <span className="text-[10px] text-gray-400">{c.scans.toLocaleString()} scans</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No cards assigned yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cards are assigned by MCOM Admin. Browse the templates Admin has published below.</p>
          </div>
        )
      ) : (
        filteredAvailable.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAvailable.map((row) => (
              <div key={row.id} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-[1.7/1] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="w-4/5 aspect-[85/55] rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 border border-white/20 shadow-lg flex flex-col justify-between p-2.5">
                    <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200 truncate">{row.name}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      </div>
                      <div className="w-5 h-5 grid grid-cols-3 gap-[1px]">
                        {Array.from({ length: 9 }).map((_, i) => <div key={i} className="bg-slate-700/70 dark:bg-slate-200/70 rounded-[1px]" />)}
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-white/90 text-gray-700">{row.category}</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{row.name}</span>
                    <button onClick={() => openPreview(row)} className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shrink-0" title="Preview">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2">{row.templateId} · v{row.version} · {row.businessesUsing.toLocaleString()} businesses</p>
                  <Link to="/b/cards" className="block text-center py-1.5 text-[10px] font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                    Use This Card
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No card templates found</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{search || typeFilter !== 'all' ? 'Try adjusting your search or filters' : 'No Business Card templates have been published yet'}</p>
          </div>
        )
      )}

      {previewFor && (
        <CardPreviewModal
          name={previewFor.row.name}
          templateId={previewFor.row.templateId}
          cardType="business"
          faces={previewFor.faces as never}
          badge={previewFor.row.category}
          onClose={() => setPreviewFor(null)}
        />
      )}
    </div>
  )
}
