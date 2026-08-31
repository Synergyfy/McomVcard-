import api from './api'
import type { User } from '../types'

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
  allocatedAdditionalCards: number
  familyAllocations: number
  friendAllocations: number
  unallocatedEntitlements: number
  primaryIssuingBusiness: string
  primaryIssuingBusinessId: number
  businessCount: number
  registrationSource: string
  lastActivityAt: string
  allocationType: string
  wallet: { balance: number; points: number; cashback: number; giftCards: number; coupons: number; vouchers: number; pending?: number; locked?: number }
  cardBalance?: number
  stats: { cards: number; rewards: number; referrals: number; scans: number }
  savedCards: { id: string; name: string; business: string; type: string; source?: string; editable?: boolean }[]
  rewardHistory: { id: string; reward: string; points: number; date: string; status: string }[]
  referrals: { name: string; email: string; joined: string; reward: string }[]
  recentActivity: { action: string; time: string; type: string; status?: string; value?: string; source?: string; detailTo?: string }[]
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
}

export interface SavedCard {
  id: string
  name: string
  business: string
  type: string
  source?: string
  editable?: boolean
}

export interface RewardHistoryItem {
  id: string
  reward: string
  points: number
  date: string
  status: string
}

export interface Referral {
  name: string
  email: string
  joined: string
  reward: string
}

export interface Wallet {
  balance: number
  points: number
  cashback: number
  giftCards: number
  coupons: number
  vouchers: number
  pending?: number
  locked?: number
}

export interface Membership {
  id: string
  user_id: number
  membership_tier_id: number
  tier: {
    id: string
    name: string
    discount_type: string
    discount_value: number
  }
  status: string
  started_at: string
  expires_at: string | null
  created_at: string
}

export interface Card {
  id: string
  slug: string
  type: string
  name: string
  category?: string
  status: number
  created_at: string
  updated_at: string
}

function mapUserToConsumerProfile(user: User): ConsumerProfile {
  return {
    id: user.id,
    name: user.name || user.email,
    email: user.email,
    phone: user.phone || '',
    location: '',
    status: user.status as 'active' | 'inactive' | 'suspended',
    joined: user.created_at || '',
    consumerId: '',
    centralUserId: '',
    membership: 'Bronze',
    membershipStatus: 'Active',
    vcardStatus: 'Active',
    cardStatus: 'Active',
    additionalEntitlements: 0,
    allocatedAdditionalCards: 0,
    familyAllocations: 0,
    friendAllocations: 0,
    unallocatedEntitlements: 0,
    primaryIssuingBusiness: '',
    primaryIssuingBusinessId: 0,
    businessCount: 0,
    registrationSource: 'Self',
    lastActivityAt: user.updated_at || '',
    allocationType: 'None',
    wallet: { balance: 0, points: 0, cashback: 0, giftCards: 0, coupons: 0, vouchers: 0 },
    cardBalance: 0,
    stats: { cards: 0, rewards: 0, referrals: 0, scans: 0 },
    savedCards: [],
    rewardHistory: [],
    referrals: [],
    recentActivity: [],
    cardId: '',
    cardTemplate: '',
    cardCreated: '',
    cardUpdated: '',
    cardSource: '',
    cardAcquisitionMethod: '',
    cardSourcePlatform: '',
    qrStatus: '',
    qrId: '',
    qrLastScanned: '',
    qrUpdateFrequency: '',
    qrLastContentUpdate: '',
    eCardStatus: '',
    eCardFaceValue: '',
    eCardSource: '',
    eCardId: '',
    eCardIssueDate: '',
    eCardExpiryDate: '',
    additionalCards: [],
    shareContent: [],
    cardActivity: [],
  }
}

function mapWalletToConsumerWallet(wallet: any): Wallet {
  return {
    balance: wallet.balance || 0,
    points: wallet.reward_balance?.balance || 0,
    cashback: wallet.cashback || 0,
    giftCards: wallet.gift_cards || 0,
    coupons: wallet.coupons || 0,
    vouchers: wallet.vouchers || 0,
    pending: wallet.pending || 0,
    locked: wallet.locked || 0,
  }
}

function mapMembershipToConsumerMembership(membership: Membership): ConsumerProfile['membership'] {
  return membership.tier?.name || 'Bronze'
}

function mapCardsToSavedCards(cards: Card[]): SavedCard[] {
  return cards.map(card => ({
    id: card.id,
    name: card.name || card.slug,
    business: card.category || 'Business',
    type: 'Membership',
    source: 'MCOMVCard',
    editable: true,
  }))
}

function mapRewardTransactionsToHistory(transactions: any[]): RewardHistoryItem[] {
  return transactions.map((t, i) => ({
    id: t.id || String(i + 1),
    reward: t.description || 'Reward',
    points: t.amount || 0,
    date: t.created_at || new Date().toISOString().split('T')[0],
    status: t.status || 'available',
  }))
}

function mapReferralsToConsumerReferrals(referrals: any[]): Referral[] {
  return referrals.map(r => ({
    name: r.user_name || r.name || 'Unknown',
    email: r.user_email || r.email || '',
    joined: r.created_at || r.joined || '',
    reward: r.reward || r.amount || '0 pts',
  }))
}

function mapActivityToConsumerActivity(activities: any[]): ConsumerProfile['recentActivity'] {
  return activities.map(a => ({
    action: a.description || a.action || '',
    time: a.created_at || a.time || '',
    type: a.module || a.type || 'card',
    status: a.status || 'Completed',
    value: a.value,
    source: a.source,
    detailTo: a.detailTo,
  }))
}

export const consumerService = {
  async getProfile(): Promise<ConsumerProfile> {
    const res = await api.get('/users/me')
    return mapUserToConsumerProfile(res.data)
  },

  async getProfileByEmail(_email: string): Promise<ConsumerProfile | null> {
    // TODO: Backend endpoint GET /users/by-email/:email does not exist yet
    // This would require a new endpoint in the users or auth module
    console.warn('getProfileByEmail: Backend endpoint not implemented')
    return null
  },

  async createProfile(data: { name: string; email: string; phone?: string; location?: string }): Promise<ConsumerProfile> {
    const res = await api.post('/register', {
      firstName: data.name.split(' ')[0],
      lastName: data.name.split(' ').slice(1).join(' ') || '',
      email: data.email,
      phone: data.phone,
    })
    return mapUserToConsumerProfile(res.data.user)
  },

  async updateProfile(data: { name?: string; email?: string; phone?: string; location?: string }): Promise<ConsumerProfile> {
    const firstName = data.name?.split(' ')[0]
    const lastName = data.name?.split(' ').slice(1).join(' ') || ''
    const res = await api.patch('/users/me', {
      first_name: firstName,
      last_name: lastName,
      email: data.email,
      phone: data.phone,
    })
    return mapUserToConsumerProfile(res.data)
  },

  async getSavedCards(): Promise<SavedCard[]> {
    const res = await api.get('/users/me/cards')
    return mapCardsToSavedCards(res.data.data || res.data)
  },

  async getRewardHistory(): Promise<RewardHistoryItem[]> {
    const res = await api.get('/rewards/transactions')
    return mapRewardTransactionsToHistory(res.data.data || res.data)
  },

  async getReferrals(): Promise<Referral[]> {
    const res = await api.get('/affiliates/me/referrals')
    return mapReferralsToConsumerReferrals(res.data.data || res.data)
  },

  async getWallet(): Promise<Wallet> {
    const res = await api.get('/wallet')
    return mapWalletToConsumerWallet(res.data.data || res.data)
  },

  async getMembership(): Promise<ConsumerProfile['membership']> {
    const res = await api.get('/memberships')
    const memberships = res.data.data || res.data
    const activeMembership = memberships.find((m: Membership) => m.status === 'active') || memberships[0]
    return activeMembership ? mapMembershipToConsumerMembership(activeMembership) : 'Bronze'
  },

  async getStats(): Promise<ConsumerProfile['stats']> {
    // This would require a new endpoint or aggregation from multiple endpoints
    // For now, return from profile or empty
    const profile = await this.getProfile()
    return profile.stats
  },

  async getRecentActivity(): Promise<ConsumerProfile['recentActivity']> {
    try {
      const res = await api.get('/activity')
      const data = res.data.data || res.data
      return mapActivityToConsumerActivity(Array.isArray(data) ? data : [])
    } catch {
      return []
    }
  },

  async getFamilyCards(): Promise<ConsumerProfile['additionalCards']> {
    // TODO: Backend endpoint for family cards does not exist yet
    // Could use child-cards module
    console.warn('getFamilyCards: Backend endpoint not implemented')
    return []
  },

  async getShareContent(): Promise<ConsumerProfile['shareContent']> {
    // TODO: Backend endpoint for share content does not exist yet
    console.warn('getShareContent: Backend endpoint not implemented')
    return []
  },

  async getCardActivity(): Promise<ConsumerProfile['cardActivity']> {
    // TODO: Backend endpoint for card activity does not exist yet
    console.warn('getCardActivity: Backend endpoint not implemented')
    return []
  },

  async getNearbyOffers(): Promise<any[]> {
    // TODO: Backend endpoint for nearby offers does not exist yet
    console.warn('getNearbyOffers: Backend endpoint not implemented')
    return []
  },

  async getExchangeItems(): Promise<any[]> {
    // TODO: Backend endpoint for exchange items does not exist yet
    console.warn('getExchangeItems: Backend endpoint not implemented')
    return []
  },

  async getRedeemItems(): Promise<any[]> {
    // TODO: Backend endpoint for redeem items does not exist yet
    console.warn('getRedeemItems: Backend endpoint not implemented')
    return []
  },

  async getNotifications(): Promise<any[]> {
    // TODO: Check if notifications module has consumer endpoint
    // Currently using notifications module but need to verify endpoint
    const res = await api.get('/notifications')
    return res.data.data || res.data || []
  },

  async getUnreadNotificationCount(): Promise<number> {
    const notifications = await this.getNotifications()
    return notifications.filter((n: any) => !n.read).length
  },

  async associateCard(cardId: string, business?: string): Promise<ConsumerProfile> {
    // Use the claim template endpoint or card creation
    // POST /cards/claim with template_id and business_id
    const res = await api.post('/cards/claim', {
      template_id: cardId,
      business_id: business, // This might need to be a business ID, not name
    })
    return mapUserToConsumerProfile({ ...res.data.data, ...res.data })
  },

  async getCardBalance(): Promise<number> {
    const wallet = await this.getWallet()
    return wallet.balance
  },

  async fundCard(amount: number, provider?: string): Promise<number> {
    const res = await api.post('/wallet/transactions', {
      type: 'CREDIT',
      amount,
      description: `Card funded via ${provider || 'Stripe'}`,
    })
    return res.data.data?.balance || amount
  },
}