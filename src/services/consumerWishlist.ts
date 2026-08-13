import type { WishItem } from './familyCards'

/* ------------------------------------------------------------------ */
/*  Consumer wishlist — the consumer's own wish list (separate from    */
/*  family & friends wish lists). Persisted in localStorage.           */
/* ------------------------------------------------------------------ */

const KEY = 'mcom.consumer.wishlist'

const delay = () => new Promise((r) => setTimeout(r, 200))

const wishGradients = [
  'from-rose-50 to-pink-100 dark:from-rose-500/10 dark:to-pink-500/10',
  'from-indigo-50 to-blue-100 dark:from-indigo-500/10 dark:to-blue-500/10',
  'from-amber-50 to-yellow-100 dark:from-amber-500/10 dark:to-yellow-500/10',
  'from-emerald-50 to-teal-100 dark:from-emerald-500/10 dark:to-teal-500/10',
]

let nextWishId = 1
let wishlist: WishItem[] = seed()

function seed(): WishItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        nextWishId = Math.max(0, ...parsed.map((w: WishItem) => Number(w.id) || 0)) + 1
        return parsed
      }
    }
  } catch {
    /* ignore corrupt data */
  }
  return [
    { id: nextWishId++, title: 'Nike Trainers', price: '£89', emoji: '👟', gradient: wishGradients[0] },
    { id: nextWishId++, title: 'Noise-Cancelling Headphones', price: '£249', emoji: '🎧', gradient: wishGradients[1] },
    { id: nextWishId++, title: 'Espresso Machine', price: '£329', emoji: '☕', gradient: wishGradients[2] },
  ]
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(wishlist))
  } catch {
    /* ignore quota errors */
  }
}

export const consumerWishlistService = {
  async getWishlist(): Promise<WishItem[]> {
    return delay().then(() => wishlist.map((w) => ({ ...w })))
  },
  async addWish(title: string, price?: string, image?: string): Promise<WishItem[]> {
    return delay().then(() => {
      const item: WishItem = {
        id: nextWishId++,
        title,
        price: price || undefined,
        emoji: '🎁',
        gradient: wishGradients[wishlist.length % wishGradients.length],
        image: image || undefined,
      }
      wishlist = [...wishlist, item]
      persist()
      return wishlist.map((w) => ({ ...w }))
    })
  },
  async updateWish(wishId: number, patch: Partial<Pick<WishItem, 'title' | 'price' | 'image'>>): Promise<WishItem[]> {
    return delay().then(() => {
      wishlist = wishlist.map((w) => (w.id === wishId ? { ...w, ...patch } : w))
      persist()
      return wishlist.map((w) => ({ ...w }))
    })
  },
  async removeWish(wishId: number): Promise<WishItem[]> {
    return delay().then(() => {
      wishlist = wishlist.filter((w) => w.id !== wishId)
      persist()
      return wishlist.map((w) => ({ ...w }))
    })
  },
}
