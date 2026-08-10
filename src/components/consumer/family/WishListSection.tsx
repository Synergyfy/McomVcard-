import { useState } from 'react'
import { familyService } from '../../../services/familyCards'
import type { FamilyCardMember } from '../../../services/familyCards'

interface WishListSectionProps {
    member: FamilyCardMember
    onUpdated: (member: FamilyCardMember) => void
}

export default function WishListSection({ member, onUpdated }: WishListSectionProps) {
    const [adding, setAdding] = useState(false)
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [working, setWorking] = useState(false)

    const handleAdd = async () => {
        if (title.trim() === '' || working) return
        setWorking(true)
        const updated = await familyService.addWish(member.id, title.trim(), price.trim() || undefined)
        if (updated) onUpdated(updated)
        setTitle('')
        setPrice('')
        setAdding(false)
        setWorking(false)
    }

    const handleRemove = async (wishId: number) => {
        if (working) return
        setWorking(true)
        const updated = await familyService.removeWish(member.id, wishId)
        if (updated) onUpdated(updated)
        setWorking(false)
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Wish List</h2>
                {!adding && (
                    <button
                        onClick={() => setAdding(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-accent-500 min-h-[44px] px-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                    </button>
                )}
            </div>

            {adding && (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-4 bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-3">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What do they want? e.g. Nike Trainers"
                            className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                        />
                        <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Price (optional)"
                            className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAdding(false)}
                                className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300 active:scale-[0.98] transition-transform"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={title.trim() === '' || working}
                                className="flex-1 h-11 rounded-xl bg-accent-500 text-white font-bold disabled:opacity-40 active:scale-[0.98] transition-transform"
                            >
                                {working ? 'Adding…' : 'Add Wish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {member.wishlist.length === 0 && !adding ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center">
                    <p className="text-3xl mb-2">🎁</p>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No wishes yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add their favourite things to surprise them.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {member.wishlist.map((wish) => (
                        <div key={wish.id} className={`rounded-2xl p-4 bg-gradient-to-br ${wish.gradient} border border-black/5 dark:border-white/10 relative`}>
                            <button
                                onClick={() => handleRemove(wish.id)}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/10 dark:bg-black/30 flex items-center justify-center text-gray-500 dark:text-white/70"
                                aria-label={`Remove ${wish.title}`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="text-3xl mb-2">{wish.emoji}</div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{wish.title}</p>
                            {wish.price && <p className="text-xs font-semibold text-accent-600 dark:text-accent-400 mt-0.5">{wish.price}</p>}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
