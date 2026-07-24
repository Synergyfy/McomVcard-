import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'

export default function ConsumerSavedCardsPage() {
  const [cards, setCards] = useState<Array<{ id: number; name: string; business: string; type: string }>>([])
  const [loading, setLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-toggle')) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    consumerService.getSavedCards().then(setCards).finally(() => setLoading(false))
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Remove this card?')) setCards(cards.filter((c) => c.id !== id))
  }

  const typeColors: Record<string, string> = {
    Loyalty: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    Membership: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    Rewards: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    Business: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    Appointment: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
  }

  return (
    <div>
      <Helmet><title>Saved Cards - Consumer - MCOM VCard</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Cards</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cards.length} cards saved</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                  {card.business.charAt(0)}
                </div>
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === card.id ? null : card.id); }} className="dropdown-toggle p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                  </button>
                  {openDropdownId === card.id && (
                    <div className="dropdown-menu absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View Details
                      </button>
                      <hr className="my-1 border-gray-100 dark:border-gray-700" />
                      <button onClick={() => { setOpenDropdownId(null); handleDelete(card.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{card.business}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Saved as "{card.name}"</p>
              <div className="flex items-center justify-between mt-3">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${typeColors[card.type] || 'bg-gray-50 text-gray-600'}`}>
                  {card.type}
                </span>
                <button className="text-xs text-orange-600 hover:text-orange-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Tap to Use</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}