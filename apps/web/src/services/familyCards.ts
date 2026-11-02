import api from './api'
import { newIdempotencyKey } from './payments'
import { consumerService } from './consumer'

export interface WishItem {
  id: string
  title: string
  price?: string
  emoji: string
  gradient: string
  image?: string
}

export type MemberKind = 'Family' | 'Friend'

export interface FamilyCardMember {
  id: string
  cardId: string
  name: string
  relationship: string
  kind: MemberKind
  status: 'Active' | 'Suspended'
  phone: string
  email: string
  dob?: string
  avatar: { emoji: string; gradient: string }
  createdAt: string
  lastUsed: string
  rewardBalance: number
  cardBalance: number
  eCardValue: number
  cardType: string
  membership: string
  issuedBy: string
  shareLink: string
  wishlist: WishItem[]
  recentActivity: { action: string; time: string }[]
}

export interface NewFamilyMemberInput {
  name: string
  relationship: string
  kind: MemberKind
  phone: string
  email?: string
  dob?: string
  avatar: { emoji: string; gradient: string }
}

/** Family relationships manage funds; friends receive gifts they control. */
export function kindFromRelationship(relationship: string): MemberKind {
  return relationship.trim().toLowerCase() === 'friend' ? 'Friend' : 'Family'
}

const gradients = [
  'from-pink-400 to-rose-600',
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-purple-400 to-violet-600',
  'from-cyan-400 to-sky-600',
]

const wishGradients = [
  'from-rose-50 to-pink-100 dark:from-rose-500/10 dark:to-pink-500/10',
  'from-indigo-50 to-blue-100 dark:from-indigo-500/10 dark:to-blue-500/10',
  'from-amber-50 to-yellow-100 dark:from-amber-500/10 dark:to-yellow-500/10',
  'from-emerald-50 to-teal-100 dark:from-emerald-500/10 dark:to-teal-500/10',
]

function mapChildCardToMember(card: any): FamilyCardMember {
  const child = card.child || card.user || {}
  const permissions = card.card || card

  return {
    id: card.id,
    cardId: permissions.card_id || permissions.slug || `CARD-FAM-${String(card.id).padStart(6, '0')}`,
    name: child.name || `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unknown',
    relationship: card.relationship || permissions.relationship || 'Family',
    kind: kindFromRelationship(card.relationship || permissions.relationship || 'Family'),
    status: card.can_use_wallet !== false ? 'Active' : 'Suspended',
    phone: child.phone || '',
    email: child.email || '',
    dob: child.dob || undefined,
    avatar: {
      emoji: child.avatar_emoji || '👤',
      gradient: child.avatar_gradient || gradients[0],
    },
    createdAt: card.created_at || new Date().toISOString(),
    lastUsed: card.last_used_at || card.updated_at || '',
    rewardBalance: permissions.reward_balance || 0,
    cardBalance: permissions.wallet_allocation || 0,
    eCardValue: permissions.e_card_value || 0,
    cardType: permissions.card_type || 'Family Card',
    membership: permissions.membership || '',
    issuedBy: permissions.issued_by || '',
    shareLink: permissions.share_link || '',
    wishlist: (card.wishlist?.items || []).map((item: any) => ({
      id: item.id,
      title: item.product?.name || item.name || item.title || '',
      price: item.product?.price ? `£${item.product.price}` : item.price || undefined,
      emoji: item.product?.emoji || item.emoji || '🎁',
      gradient: item.gradient || wishGradients[0],
      image: item.product?.image || item.image || undefined,
    })),
    recentActivity: (card.recent_activity || []).map((a: any) => ({
      action: a.action || a.description || '',
      time: a.time || a.created_at || '',
    })),
  }
}

async function findUserByEmail(email: string): Promise<string> {
  if (!email.trim()) {
    throw new Error('Enter the family member’s email so we can link their MCOM account.')
  }

  // Customers only ever sign in through the Central Hub Solution. We must never
  // create a local password account here — the person needs a Central identity
  // before they can receive a card.
  let existing: { data?: unknown }
  try {
    existing = await api.get(`/users/by-email/${encodeURIComponent(email.trim().toLowerCase())}`)
  } catch {
    throw new Error('No MCOM account was found for that email. Ask them to sign in through the Central Hub Solution first.')
  }

  const body = existing.data as { data?: { id?: string }; id?: string } | undefined
  const user = body?.data || body
  if (user?.id) return user.id
  throw new Error('No MCOM account was found for that email. Ask them to sign in through the Central Hub Solution first.')
}

async function getWishlistForMember(memberId: string): Promise<{ id: string; items: any[] } | null> {
  try {
    const res = await api.get('/wishlists', { params: { name: `Wishlist for ${memberId}` } })
    const wishlists = res.data?.data || res.data
    if (Array.isArray(wishlists) && wishlists.length > 0) {
      const wl = wishlists[0]
      const detail = await api.get(`/wishlists/${wl.id}`)
      return detail.data?.data || detail.data
    }
    return null
  } catch {
    return null
  }
}

export const familyService = {
  async getMembers(): Promise<FamilyCardMember[]> {
    const res = await api.get('/child-cards')
    const cards = res.data?.data || res.data
    return (Array.isArray(cards) ? cards : []).map(mapChildCardToMember)
  },

  async getMember(id: string): Promise<FamilyCardMember | undefined> {
    try {
      const res = await api.get(`/child-cards/${id}`)
      const card = res.data?.data || res.data
      if (!card) return undefined

      const member = mapChildCardToMember(card)
      const wishlist = await getWishlistForMember(id)
      if (wishlist) {
        member.wishlist = (wishlist.items || []).map((item: any) => ({
          id: item.id,
          title: item.product?.name || item.title || '',
          price: item.product?.price ? `£${item.product.price}` : item.price || undefined,
          emoji: item.emoji || '🎁',
          gradient: item.gradient || wishGradients[0],
          image: item.product?.image || item.image || undefined,
        }))
      }
      return member
    } catch {
      return undefined
    }
  },

  async addMember(input: NewFamilyMemberInput): Promise<FamilyCardMember> {
    const childUserId = await findUserByEmail(input.email || '')

    // A family card is shared from the customer's primary card.
    const cards = await consumerService.getSavedCards(1, 1)
    const primaryCard = cards[0]
    if (!primaryCard) {
      throw new Error('You need a card before you can add a family member. Open My Cards to get one first.')
    }

    const res = await api.post('/child-cards', {
      card_id: primaryCard.id,
      child_id: childUserId,
      relationship: input.relationship,
      can_view: true,
      can_use_wallet: true,
      can_manage: false,
      wallet_allocation: 0,
    })
    const card = res.data?.data || res.data

    return mapChildCardToMember({
      ...card,
      child: {
        name: input.name,
        email: input.email || '',
        phone: input.phone,
        dob: input.dob,
        avatar_emoji: input.avatar.emoji,
        avatar_gradient: input.avatar.gradient,
      },
      relationship: input.relationship,
      recent_activity: [{ action: 'Card shared', time: 'Just now' }],
    })
  },

  async updateMember(id: string, patch: Partial<Pick<FamilyCardMember, 'name' | 'relationship' | 'phone' | 'email' | 'dob' | 'avatar'>>): Promise<FamilyCardMember | undefined> {
    try {
      const payload: Record<string, any> = {}
      if (patch.relationship !== undefined) payload.relationship = patch.relationship
      if (patch.name !== undefined) payload.name = patch.name

      const res = await api.patch(`/child-cards/${id}`, payload)
      const card = res.data?.data || res.data
      return card ? mapChildCardToMember(card) : undefined
    } catch {
      return undefined
    }
  },

  async removeMember(id: string): Promise<boolean> {
    try {
      await api.delete(`/child-cards/${id}`)
      return true
    } catch {
      return false
    }
  },

  async fundMember(id: string, amount: number): Promise<{ member: FamilyCardMember; ownerBalance: number } | undefined> {
    try {
      const res = await api.post('/wallet/allocate-to-child', {
        child_card_id: id,
        amount,
        idempotencyKey: newIdempotencyKey(),
      })
      const result = res.data?.data || res.data

      const memberRes = await api.get(`/child-cards/${id}`)
      const card = memberRes.data?.data || memberRes.data

      return {
        member: mapChildCardToMember(card),
        ownerBalance: result.balance ?? result.owner_balance ?? 0,
      }
    } catch (err: any) {
      if (err?.response?.data?.message?.includes('Insufficient')) {
        throw new Error('Insufficient card balance')
      }
      throw err
    }
  },

  /** Send a gift/e-card to a friend — the friend keeps control of their own wallet. */
  async sendGiftCard(id: string, amount: number, _provider?: string): Promise<{ member: FamilyCardMember; ownerBalance: number } | undefined> {
    try {
      const member = await this.getMember(id)
      const recipientUserId = member?.email ? await findUserByEmail(member.email).catch(() => undefined) : undefined

      const res = await api.post('/wallet/transfer', {
        recipient_id: recipientUserId,
        amount,
        description: 'Gift e-card',
        idempotencyKey: newIdempotencyKey(),
      })
      const result = res.data?.data || res.data

      const memberRes = await api.get(`/child-cards/${id}`)
      const card = memberRes.data?.data || memberRes.data

      return {
        member: mapChildCardToMember(card),
        ownerBalance: result.balance ?? result.owner_balance ?? 0,
      }
    } catch (err: any) {
      if (err?.response?.data?.message?.includes('Insufficient')) {
        throw new Error('Insufficient card balance')
      }
      throw err
    }
  },

  async setStatus(id: string, status: 'Active' | 'Suspended'): Promise<FamilyCardMember | undefined> {
    try {
      const res = await api.patch(`/child-cards/${id}`, {
        can_use_wallet: status === 'Active',
      })
      const card = res.data?.data || res.data
      return card ? mapChildCardToMember(card) : undefined
    } catch {
      return undefined
    }
  },

  async addWish(memberId: string, title: string, price?: string, _image?: string): Promise<FamilyCardMember | undefined> {
    try {
      let wishlist = await getWishlistForMember(memberId)
      if (!wishlist) {
        const createRes = await api.post('/wishlists', {
          name: `Wishlist for ${memberId}`,
          is_private: true,
        })
        wishlist = createRes.data?.data || createRes.data
      }

      if (!wishlist) return undefined

      await api.post(`/wishlists/${wishlist.id}/items`, {
        title,
        note: title,
        price: price || undefined,
        emoji: '🎁',
        gradient: wishGradients[0],
      })

      return this.getMember(memberId)
    } catch {
      return undefined
    }
  },

  async updateWish(memberId: string, _wishId: string, _patch: Partial<Pick<WishItem, 'title' | 'price' | 'image'>>): Promise<FamilyCardMember | undefined> {
    // API does not support updating wishlist items — return member as-is
    return this.getMember(memberId)
  },

  async removeWish(memberId: string, wishId: string): Promise<FamilyCardMember | undefined> {
    try {
      const wishlist = await getWishlistForMember(memberId)
      if (wishlist) {
        await api.delete(`/wishlists/${wishlist.id}/items/${wishId}`)
      }
      return this.getMember(memberId)
    } catch {
      return undefined
    }
  },

  getAvatarGradients(): string[] {
    return gradients
  },
}
