import { consumerService, type ConsumerWishItem } from './consumer'
import type { WishItem } from './familyCards'

/* Consumer's own free-form wish list, backed by /api/consumer/wishlist. */

function toWishItem(item: ConsumerWishItem): WishItem {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    emoji: item.emoji,
    gradient: item.gradient,
    image: item.image,
  }
}

export const consumerWishlistService = {
  async getWishlist(): Promise<WishItem[]> {
    const items = await consumerService.getWishlist()
    return items.map(toWishItem)
  },

  async addWish(title: string, price?: string, image?: string): Promise<WishItem[]> {
    await consumerService.addWish({ title, price, image })
    return this.getWishlist()
  },

  async updateWish(wishId: string, patch: Partial<Pick<WishItem, 'title' | 'price' | 'image'>>): Promise<WishItem[]> {
    await consumerService.updateWish(wishId, patch)
    return this.getWishlist()
  },

  async removeWish(wishId: string): Promise<WishItem[]> {
    await consumerService.removeWish(wishId)
    return this.getWishlist()
  },
}
