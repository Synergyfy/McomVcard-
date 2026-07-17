import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'

export default function ConsumerSavedCardsPage() {
  const [cards, setCards] = useState<Array<{ id: number; name: string; business: string; type: string }>>([])
  const [loading, setLoading] = useState(true)

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
                <button onClick={() => handleDelete(card.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
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
