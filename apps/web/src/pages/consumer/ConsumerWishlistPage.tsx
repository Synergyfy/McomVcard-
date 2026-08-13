import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { consumerWishlistService } from '../../services/consumerWishlist'
import type { WishItem } from '../../services/familyCards'
import ErrorState from '../../components/common/ErrorState'

export default function ConsumerWishlistPage() {
    const [wishlist, setWishlist] = useState<WishItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [adding, setAdding] = useState(false)
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [image, setImage] = useState('')
    const [working, setWorking] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const load = () => {
        setLoading(true)
        setError(false)
        consumerWishlistService.getWishlist()
            .then(setWishlist)
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const readFile = (file: File) => {
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setImage(String(reader.result || ''))
        reader.readAsDataURL(file)
    }

    const handleAdd = async () => {
        if (title.trim() === '' || working) return
        setWorking(true)
        const updated = await consumerWishlistService.addWish(title.trim(), price.trim() || undefined, image || undefined)
        setWishlist(updated)
        setTitle('')
        setPrice('')
        setImage('')
        setAdding(false)
        setWorking(false)
    }

    const handleRemove = async (wishId: number) => {
        if (working) return
        setWorking(true)
        const updated = await consumerWishlistService.removeWish(wishId)
        setWishlist(updated)
        setWorking(false)
    }

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    if (error) {
        return (
            <div className="space-y-4 pb-2">
                <Helmet><title>My Wishlist - Consumer - MCOM VCard</title></Helmet>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">The things you're saving up for</p>
                </div>
                <div className="lg:max-w-2xl">
                    <ErrorState title="We couldn't load your wishlist" message="Please try again in a moment." onRetry={load} />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 pb-2">
            <Helmet><title>My Wishlist - Consumer - MCOM VCard</title></Helmet>

            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
                </div>
                {!adding && (
                    <button
                        onClick={() => setAdding(true)}
                        className="flex items-center gap-1.5 px-4 h-11 rounded-2xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-500/25 active:scale-[0.97] transition-transform shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                    </button>
                )}
            </div>

            {adding && (
                <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                    <div className="space-y-3">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What do you want? e.g. Nike Trainers"
                            className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                        />
                        <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Price (optional)"
                            className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                        />
                        <div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => readFile(e.target.files?.[0] as File)}
                                className="hidden"
                            />
                            {image ? (
                                <div className="relative h-44 rounded-xl overflow-hidden">
                                    <img src={image} alt="Wish preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => { setImage(''); if (fileRef.current) fileRef.current.value = '' }}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                                        aria-label="Remove image"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full h-28 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-gray-500"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs font-medium">Add a photo (optional)</span>
                                </button>
                            )}
                        </div>
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
                                className="flex-1 h-11 rounded-xl bg-orange-500 text-white font-bold disabled:opacity-40 active:scale-[0.98] transition-transform"
                            >
                                {working ? 'Adding…' : 'Add Wish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {wishlist.length === 0 && !adding ? (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
                    <p className="text-4xl mb-3">🎁</p>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No wishes yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add the things you're saving up for — family and friends can see them.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {wishlist.map((wish) => (
                        <div key={wish.id} className={`rounded-2xl overflow-hidden bg-gradient-to-br ${wish.gradient} border border-gray-100 dark:border-gray-800 relative shadow-sm`}>
                            {wish.image && (
                                <div className="h-32">
                                    <img src={wish.image} alt={wish.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-4">
                                {!wish.image && <div className="text-3xl mb-2">{wish.emoji}</div>}
                                <button
                                    onClick={() => handleRemove(wish.id)}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/10 dark:bg-black/30 flex items-center justify-center text-gray-500 dark:text-white/70"
                                    aria-label={`Remove ${wish.title}`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{wish.title}</p>
                                {wish.price && <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-0.5">{wish.price}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Link
                to="/c/wallet"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Back to Wallet
            </Link>
        </div>
    )
}
