import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { businessService, type GiftCard } from '../../../services/businessApi'

export default function GiftCardsPage() {
    const [cards, setCards] = useState<GiftCard[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const data = await businessService.getGiftCards()
                if (!cancelled) setCards(data)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const handleToggle = async (g: GiftCard) => {
        const newStatus = g.status === 'active' ? 'paused' : 'active'
        const updated = await businessService.updateGiftCard(g.id, { status: newStatus })
        if (!updated) {
            toast.error('Could not update gift card')
            return
        }
        setCards((prev) => prev.map((x) => x.id === g.id ? { ...x, status: newStatus as GiftCard['status'] } : x))
        toast.success(`Gift card ${newStatus === 'active' ? 'resumed' : 'paused'}`)
    }

    return (
        <div className="space-y-6 animate-fadeIn max-w-lg">
            <Helmet><title>Gift Cards - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gift Cards</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pre-loaded value cards your customers can buy.</p>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
            ) : cards.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No gift cards yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {cards.map((g) => (
                        <div key={g.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <p className="text-2xl font-bold">£{g.value}</p>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${g.status === 'active' ? 'bg-white/20' : 'bg-white/10 text-white/70'}`}>
                                        {g.status === 'active' ? 'Active' : 'Paused'}
                                    </span>
                                </div>
                                <p className="text-xs text-white/80 mt-1">{g.title}</p>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>Price</span>
                                    <span className="font-bold text-gray-900 dark:text-white">£{g.price}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                    <span>Sold</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{g.sold} cards</span>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => handleToggle(g)}
                                        className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-amber-500 text-white text-xs font-bold"
                                    >
                                        {g.status === 'active' ? 'Pause' : 'Resume'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
