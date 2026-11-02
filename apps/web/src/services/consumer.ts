import api from './api'
import type { User } from '../types'

export interface ConsumerWallet {
  balance: number
  available: number
  currency: string
  points: number
  cashback: number
  giftCards: number
  coupons: number
  vouchers: number
  pending: number
  locked: number
  cardBalance: number
}

export interface SavedCard {
  id: string
  slug: string
  name: string
  business: string
  type: string
  source: string
  editable: boolean
  status: string
  audience?: string
  template?: string | null
  views?: number
  scans?: number
  shares?: number
  created_at: string
  updated_at: string
}

export interface RewardHistoryItem {
  id: string
  reward: string
  points: number
  date: string
  status: string
  type?: string
  balance_after?: number
}

export interface Referral {
  id: string
  name: string
  email: string
  joined: string
  reward: string
  status?: string
  source?: string
}

export interface ExchangeItem {
  id: string
  title: string
  type: string
  business: string
  value: string
  expires: string
  icon: string
  color: string
}

export interface NearbyOffer {
  id: string
  business: string
  category: string
  offer: string
  description?: string
  discount: string
  discount_type?: string
  discount_value?: number
  starts_at?: string | null
  ends_at?: string | null
  icon: string
  gradient: string
  distance?: string
}

export interface ConsumerNotification {
  id: string
  title: string
  message: string
  time: string
  type: 'cashback' | 'reward' | 'offer' | 'voucher' | 'family'
  read: boolean
  icon: string
  color: string
  action: { label: string; to: string }
}

export interface ConsumerBooking {
  id: string
  business: string
  business_id: string
  service: string
  date: string
  time: string
  status: string
  notes: string | null
  created_at: string
}

export interface ConsumerActivityItem {
  id?: string
  action: string
  time: string
  type: string
  status?: string
  value?: string
  source?: string
  detailTo?: string
}

export interface ConsumerPlan {
  id: string
  name: string
  level: string | null
  audience: string | null
  status: string
  started_at: string | null
  expires_at: string | null
  quotas: Record<string, number | boolean>
  feature_flags: Record<string, boolean>
  features: string[]
}

export interface ConsumerMembershipInfo {
  active: ConsumerPlan | null
  tier: { id: string; name: string; discount_type?: string; discount_value?: number } | null
  history: { id: string; state: string; status: string; started_at: string; expires_at: string | null }[]
  central: { level: string | null; tier: string | null; status: string | null; can_access_vcard: boolean }
}

export interface ConsumerWishItem {
  id: string
  title: string
  price?: string
  image?: string
  emoji: string
  gradient: string
  created_at: string
}

export interface ConsumerProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  status: 'active' | 'inactive' | 'suspended'
  joined: string
  consumerId: string
  centralUserId: string
  membership: string
  membershipStatus: string
  vcardStatus: string
  cardStatus: string
  additionalEntitlements: number
  familyCardLimit: number
  friendCardLimit: number
  allocatedAdditionalCards: number
  familyAllocations: number
  friendAllocations: number
  unallocatedEntitlements: number
  primaryIssuingBusiness: string
  primaryIssuingBusinessId: string
  businessCount: number
  registrationSource: string
  lastActivityAt: string
  allocationType: string
  wallet: ConsumerWallet
  cardBalance: number
  stats: { cards: number; rewards: number; referrals: number; scans: number }
  savedCards: SavedCard[]
  rewardHistory: RewardHistoryItem[]
  referrals: Referral[]
  recentActivity: ConsumerActivityItem[]
  cardId: string
  cardTemplate: string
  cardCreated: string
  cardUpdated: string
  cardSource: string
  cardAcquisitionMethod: string
  cardSourcePlatform: string
  qrStatus: string
  qrId: string
  qrLastScanned: string
  qrUpdateFrequency: string
  qrLastContentUpdate: string
  eCardStatus: string
  eCardFaceValue: string
  eCardSource: string
  eCardId: string
  eCardIssueDate: string
  eCardExpiryDate: string
  additionalCards: { id: string; name: string; relationship: string; status: string; locked: boolean; allocatedAt: string }[]
  shareContent: { id: string; title: string; source: string; status: string; availableUntil: string }[]
  cardActivity: { action: string; time: string; type: string; actor: string; source: string; status: string }[]
  membershipHistory?: { state: string; date: string }[]
  plan?: ConsumerPlan | null
  expiresAt?: string | null
  /** Live card sections shown on the public shared card. */
  sharedSections?: { id: string; name: string; schema_id: string; enabled: boolean; sort_order?: number; content: Record<string, unknown> }[]
}

export interface Paginated<T> {
  items: T[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

function unwrap<T>(response: { data: unknown }): T {
  const body = response.data as { data?: T } | T
  return (body && typeof body === 'object' && 'data' in (body as Record<string, unknown>)
    ? (body as { data: T }).data
    : body) as T
}

export const consumerService = {
  async getProfile(): Promise<ConsumerProfile> {
    const res = await api.get('/consumer/profile')
    return unwrap<ConsumerProfile>(res)
  },

  async getDashboard(): Promise<{
    profile: ConsumerProfile
    wallet: ConsumerWallet
    stats: ConsumerProfile['stats']
    saved_cards: SavedCard[]
    recent_activity: ConsumerActivityItem[]
    nearby_offers: NearbyOffer[]
    membership: string
    membership_status: string
  }> {
    const res = await api.get('/consumer/dashboard')
    return unwrap(res)
  },

  async getProfileByEmail(_email: string): Promise<ConsumerProfile | null> {
    try {
      return await this.getProfile()
    } catch {
      return null
    }
  },

  async createProfile(data: { name: string; email?: string; phone?: string; location?: string }): Promise<ConsumerProfile> {
    // The account already exists (Central SSO JIT-provisions it). Setup only
    // completes the editable customer profile fields.
    return this.updateProfile(data)
  },

  async updateProfile(data: { name?: string; email?: string; phone?: string; location?: string }): Promise<ConsumerProfile> {
    const parts = (data.name || '').trim().split(/\s+/)
    const payload: Record<string, string> = {}
    if (data.name !== undefined) {
      payload.first_name = parts[0] || ''
      payload.last_name = parts.slice(1).join(' ')
    }
    if (data.email !== undefined) payload.email = data.email
    if (data.phone !== undefined) payload.phone = data.phone
    if (data.location !== undefined) payload.address = data.location

    const res = await api.patch('/consumer/profile', payload)
    return unwrap<ConsumerProfile>(res)
  },

  async getSavedCards(page = 1, limit = 100): Promise<SavedCard[]> {
    const res = await api.get('/consumer/cards', { params: { page, limit } })
    return unwrap<Paginated<SavedCard>>(res).items
  },

  async getRewardHistory(page = 1, limit = 100, status?: string): Promise<RewardHistoryItem[]> {
    const res = await api.get('/consumer/rewards', { params: { page, limit, status } })
    return unwrap<Paginated<RewardHistoryItem>>(res).items
  },

  async getReferrals(page = 1, limit = 100): Promise<Referral[]> {
    const res = await api.get('/consumer/referrals', { params: { page, limit } })
    return unwrap<Paginated<Referral>>(res).items
  },

  async inviteReferral(email: string): Promise<{ message: string; email: string }> {
    const res = await api.post('/consumer/referrals/invite', { email })
    return unwrap<{ message: string; email: string }>(res)
  },

  async getWallet(): Promise<ConsumerWallet> {
    const res = await api.get('/consumer/wallet')
    return unwrap<ConsumerWallet>(res)
  },

  async getWalletTransactions(page = 1, limit = 20) {
    const res = await api.get('/consumer/wallet/transactions', { params: { page, limit } })
    return unwrap<Paginated<{
      id: string
      type: 'CREDIT' | 'DEBIT'
      amount: number
      balance_after: number
      description: string | null
      created_at: string
    }>>(res)
  },

  async getMembership(): Promise<ConsumerMembershipInfo> {
    const res = await api.get('/consumer/membership')
    return unwrap<ConsumerMembershipInfo>(res)
  },

  async getStats(): Promise<ConsumerProfile['stats']> {
    const profile = await this.getProfile()
    return profile.stats
  },

  async getRecentActivity(filter = 'all', page = 1, limit = 100): Promise<ConsumerActivityItem[]> {
    const res = await api.get('/consumer/activity', { params: { page, limit, type: filter } })
    return unwrap<Paginated<ConsumerActivityItem>>(res).items
  },

  async getFamilyCards(): Promise<ConsumerProfile['additionalCards']> {
    const profile = await this.getProfile()
    return profile.additionalCards
  },

  async getShareContent(): Promise<ConsumerProfile['shareContent']> {
    const profile = await this.getProfile()
    return profile.shareContent
  },

  async getCardActivity(): Promise<ConsumerProfile['cardActivity']> {
    const profile = await this.getProfile()
    return profile.cardActivity
  },

  async getNearbyOffers(page = 1, limit = 20, category?: string): Promise<NearbyOffer[]> {
    const res = await api.get('/consumer/offers', { params: { page, limit, category } })
    return unwrap<Paginated<NearbyOffer>>(res).items
  },

  async getExchangeItems(page = 1, limit = 100): Promise<ExchangeItem[]> {
    const res = await api.get('/consumer/exchange-items', { params: { page, limit } })
    return unwrap<Paginated<ExchangeItem>>(res).items
  },

  async getRedeemItems(page = 1, limit = 100): Promise<ExchangeItem[]> {
    const res = await api.get('/consumer/redeem-items', { params: { page, limit } })
    return unwrap<Paginated<ExchangeItem>>(res).items
  },

  async getNotifications(page = 1, limit = 100, filter: 'all' | 'unread' | 'read' = 'all'): Promise<{
    items: ConsumerNotification[]
    unread: number
  }> {
    const res = await api.get('/consumer/notifications', { params: { page, limit, filter } })
    const body = unwrap<{ items: ConsumerNotification[]; unread: number }>(res)
    return { items: body.items || [], unread: body.unread || 0 }
  },

  async getUnreadNotificationCount(): Promise<number> {
    const { unread } = await this.getNotifications(1, 1, 'unread')
    return unread
  },

  async markNotification(id: string, read: boolean): Promise<ConsumerNotification> {
    const res = await api.patch(`/consumer/notifications/${id}`, { read })
    return unwrap<ConsumerNotification>(res)
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    const res = await api.patch('/consumer/notifications/read-all')
    return unwrap<{ message: string }>(res)
  },

  async dismissNotification(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/consumer/notifications/${id}`)
    return unwrap<{ message: string }>(res)
  },

  async getBookings(page = 1, limit = 100): Promise<Paginated<ConsumerBooking>> {
    const res = await api.get('/consumer/bookings', { params: { page, limit } })
    return unwrap<Paginated<ConsumerBooking>>(res)
  },

  async getWishlist(): Promise<ConsumerWishItem[]> {
    const res = await api.get('/consumer/wishlist')
    return unwrap<ConsumerWishItem[]>(res)
  },

  async addWish(data: { title: string; price?: string; image?: string; emoji?: string; gradient?: string }): Promise<ConsumerWishItem> {
    const res = await api.post('/consumer/wishlist', data)
    return unwrap<ConsumerWishItem>(res)
  },

  async updateWish(id: string, data: { title?: string; price?: string; image?: string; emoji?: string; gradient?: string }): Promise<ConsumerWishItem> {
    const res = await api.patch(`/consumer/wishlist/${id}`, data)
    return unwrap<ConsumerWishItem>(res)
  },

  async removeWish(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/consumer/wishlist/${id}`)
    return unwrap<{ message: string }>(res)
  },

  async associateCard(cardId: string, business?: string): Promise<SavedCard> {
    const res = await api.post('/consumer/cards/claim', {
      card_id: cardId,
      business_id: business,
    })
    return unwrap<SavedCard>(res)
  },

  async getCardBalance(): Promise<number> {
    const wallet = await this.getWallet()
    return wallet.cardBalance
  },
}

/** @deprecated kept for callers that imported the old user-shaped helper. */
export type { User }
