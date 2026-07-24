import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockCardDesigns } from '../../services/mockData'

const MOCK_CLAIMED_CARD_IDS = [5, 6, 7, 8]
const CONSUMER_NAME = 'Alex Morgan'
const CONSUMER_PHONE = '+1 (555) 111-2222'
const CONSUMER_EMAIL = 'alex@morgan.com'

interface ClaimedCardData {
  designId: number
  name: string
  phone: string
  email: string
  title: string
}

const initialClaimedData: Record<number, ClaimedCardData> = {
  5: { designId: 5, name: CONSUMER_NAME, phone: CONSUMER_PHONE, email: CONSUMER_EMAIL, title: 'Nature Lover' },
  6: { designId: 6, name: CONSUMER_NAME, phone: CONSUMER_PHONE, email: CONSUMER_EMAIL, title: 'Minimalist' },
  7: { designId: 7, name: CONSUMER_NAME, phone: CONSUMER_PHONE, email: CONSUMER_EMAIL, title: 'Tech Enthusiast' },
  8: { designId: 8, name: CONSUMER_NAME, phone: CONSUMER_PHONE, email: CONSUMER_EMAIL, title: 'Elegant Style' },
}

export default function ConsumerCardDesignsPage() {
  const navigate = useNavigate()
  const [flipCardId, setFlipCardId] = useState<number | null>(null)
  const [claimedData] = useState<Record<number, ClaimedCardData>>(initialClaimedData)

  const claimedCards = mockCardDesigns.filter((c) => MOCK_CLAIMED_CARD_IDS.includes(c.id))

  return (
    <div>
      <Helmet><title>My Cards - Consumer - MCOM VCard</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Cards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{claimedCards.length} cards claimed</p>
        </div>
        <Link to="/cards?tab=consumer" className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
          Get Card
        </Link>
      </div>

      {claimedCards.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {claimedCards.map((card) => {
            const data = claimedData[card.id]
            const isFlipped = flipCardId === card.id

            return (
              <div key={card.id} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-lg transition-all" style={{ perspective: 1200 }}>
                {/* Flip Card */}
                <div className="relative aspect-[1.7/1] cursor-pointer" onClick={() => setFlipCardId(isFlipped ? null : card.id)} style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s ease', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                  {/* Front */}
                  <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                    <div className="w-full h-full p-4 flex flex-col justify-between relative" style={{ background: `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})` }}>
                      <div className="absolute top-3 right-3 opacity-20 text-white text-3xl font-black">MCOM</div>
                      <div className="z-10">
                        <p className="text-[9px] text-white/60 uppercase tracking-wider mb-1">{card.type}</p>
                        <p className="text-sm font-bold text-white">{card.name}</p>
                        <p className="text-[10px] text-white/70">{card.style} · {card.layout}</p>
                      </div>
                      <div className="z-10 flex items-end justify-between">
                        <div className="flex gap-1">
                          {[card.primaryColor, card.secondaryColor, card.accentColor].map((color, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-white/30" style={{ background: color }} />
                          ))}
                        </div>
                        <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
                          <div className="w-6 h-6 grid grid-cols-3 gap-[1px]">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="bg-white/80 rounded-[1px]" />)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Back — logo + name only */}
                  <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <div className="w-full h-full bg-white dark:bg-gray-900 p-4 flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg font-bold mb-3 shadow">M</div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{data?.name || card.name}</p>
                    </div>
                  </div>
                </div>

                {/* Card Info + Actions */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{card.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setFlipCardId(isFlipped ? null : card.id)} className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" title="Flip Card">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      </button>
                      <button onClick={() => navigate(`/consumer/cards/${card.id}/edit`)} className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" title="Edit Card Details">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2">{card.type} · {card.style} · {card.layout}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">Claimed</span>
                    <span className="text-[10px] text-gray-400">{card.usage} uses</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Cards Yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose a card design to get started</p>
          <Link to="/cards?tab=consumer" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 dark:shadow-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Get Card
          </Link>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/cards?tab=consumer" className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Browse More Card Designs
        </Link>
      </div>
    </div>
  )
}