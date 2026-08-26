import axios from 'axios'
import { tokenStore } from './tokenStore'

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Business ──

export interface BusinessCategory {
  id: string
  name: string
  description: string | null
}

export interface BusinessLocation {
  id: string
  business_id: string
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
}

export interface BusinessHour {
  id: string
  business_id: string
  day_of_week: number
  opens_at: string | null
  closes_at: string | null
  is_closed: boolean
}

export interface Brand {
  id: string
  business_id: string
  name: string
  description: string | null
  logo_url: string | null
}

export interface Business {
  id: string
  owner_id: string
  category_id: string | null
  category: BusinessCategory | null
  name: string
  slug: string
  description: string | null
  email: string | null
  phone: string | null
  website: string | null
  status: string
  locations: BusinessLocation[]
  hours: BusinessHour[]
  brands: Brand[]
  created_at: string
  updated_at: string
}

// ── Notification ──

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

// ── Wallet ──

export interface Wallet {
  id: string
  user_id: string
  balance: number
  currency: string
  status: string
  created_at: string
  updated_at?: string
}

export interface WalletTransaction {
  id: string
  wallet_id: string
  type: string
  amount: number
  balance_after: number
  description: string | null
  created_at: string
}

// ── Membership ──

export interface MembershipTierSummary {
  id: string
  name: string
  discount_type: string
  discount_value: number
}

export interface Membership {
  id: string
  user_id: string
  membership_tier_id: string
  tier: MembershipTierSummary
  status: string
  started_at: string
  expires_at: string | null
  created_at: string
}

// ── Dashboard Stats ──

export interface DashboardStats {
  totalCards: number
  totalShares: number
  totalAppointments: number
  pendingAppointments: number
  completedAppointments: number
  activeCampaigns: number
  totalReviews: number
  avgRating: number
  totalWalletCredits: number
  totalRewardsRedeemed: number
  activeMemberships: number
}

// ── Activity ──

export interface ActivityItem {
  id: string
  business_id: string
  user_id: string | null
  type: string
  title: string
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// ── Analytics ──

export interface AnalyticsOverview {
  [eventType: string]: number
}

// ── Customers ──

export interface Customer {
  name: string
  email: string
  phone: string | null
  userId: string | null
  status: 'active' | 'new' | 'at-risk'
  tier: string | null
  memberSince: string | null
  firstActivity: string
  lastActivity: string
  totalAppointments: number
  totalReviews: number
  totalShares: number
  totalNotes?: number
}

// ── Customer Detail ──

export interface CustomerMembershipInfo {
  tier: string | null
  status: string
  startedAt: string
  expiresAt: string | null
}

export interface CustomerAppointmentItem {
  id: string
  service: string | null
  date: string
  start_time: string
  end_time: string
  status: string
  created_at: string
}

export interface CustomerReviewItem {
  id: string
  rating: number
  comment: string | null
  status: string
  created_at: string
}

export interface CustomerShareItem {
  id: string
  platform: string
  created_at: string
}

export interface CustomerActivityItem {
  id: string
  type: string
  title: string
  description: string | null
  created_at: string
}

export interface CustomerNoteItem {
  id: string
  customer_email: string
  note: string
  author_id: string | null
  author_name: string | null
  created_at: string
  updated_at: string
}

export interface CustomerDetail {
  customer: Customer
  membership: CustomerMembershipInfo | null
  appointments: CustomerAppointmentItem[]
  reviews: CustomerReviewItem[]
  shares: CustomerShareItem[]
  activity: CustomerActivityItem[]
  notes: CustomerNoteItem[]
}

// ── Rewards ──

export interface RewardBalance {
  id: string
  user_id: string
  balance: number
  status: string
  created_at: string
  updated_at?: string
}

export interface RewardTransaction {
  id: string
  reward_balance_id: string
  type: 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST'
  amount: number
  balance_after: number
  description: string | null
  created_at: string
}

// ── Campaigns / Offers / Coupons ──

export interface CampaignTemplate {
  id: string
  name: string
  type: string
  description: string | null
  suggested_reward: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  business_id: string
  season_id: string | null
  name: string
  type: string
  status: 'draft' | 'active' | 'paused' | 'ended'
  description: string | null
  budget: number | null
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
  offers?: Offer[]
}

export interface Offer {
  id: string
  campaign_id: string
  business_id: string
  title: string
  description: string | null
  discount_type: 'PERCENT' | 'FIXED'
  discount_value: number
  is_active: boolean
  created_at: string
  updated_at: string
  coupons?: Coupon[]
}

export interface Coupon {
  id: string
  offer_id: string
  business_id: string
  code: string
  discount_type: 'PERCENT' | 'FIXED'
  discount_value: number
  max_uses: number
  used_count: number
  expires_at: string | null
  status: 'draft' | 'active' | 'expired'
  created_at: string
  updated_at: string
}

// ── Gift Cards ──

export interface GiftCard {
  id: string
  business_id: string
  title: string
  value: number
  price: number
  status: 'active' | 'paused'
  sold: number
  created_at: string
  updated_at: string
}

// ── Cashback Programs ──

export interface CashbackProgram {
  id: string
  business_id: string
  title: string
  rate: number
  status: 'active' | 'off'
  earned: number
  created_at: string
  updated_at: string
}

// ── VCard (Card) ──

export interface VCardProfile {
  id: string
  card_id: string
  display_name: string
  bio: string | null
  job_title: string | null
  email: string | null
  phone: string | null
  avatar: string | null
  cover_image: string | null
  location: string | null
  website: string | null
}

export interface VCardCustomization {
  id: string
  card_id: string
  logo: string | null
  hero_image: string | null
  primary_color: string | null
  secondary_color: string | null
  font: string | null
  layout: string | null
  configuration: Record<string, unknown> | null
}

export interface VCardSocialLink {
  id: string
  card_id: string
  platform: string
  url: string
  display_order: number
  is_active: boolean
}

export interface VCardAccess {
  id: string
  card_id: string
  is_enabled: boolean
  hint: string | null
  protected_section_ids: string[] | null
  access_expiry: string
  expires_at: string | null
}

export interface VCardSection {
  id: string
  card_id: string
  schema_id: string
  name: string
  locked: boolean
  enabled: boolean
  sort_order: number
  content: Record<string, unknown>
}

export interface VCardCentreControl {
  id: string
  card_id: string
  centre_id: string
  enabled: boolean
  edit_allowed: boolean
  settings: Record<string, unknown>
}

export interface VCard {
  id: string
  owner_id: string
  business_id: string | null
  template_id: string | null
  type: string
  slug: string
  status: string
  name: string | null
  description: string | null
  category: string | null
  url_slug: string | null
  views: number
  scans: number
  shares: number
  assigned_at: string | null
  last_admin_update: string | null
  profile: VCardProfile | null
  customization: VCardCustomization | null
  social_links: VCardSocialLink[]
  access: VCardAccess | null
  sections: VCardSection[]
  centre_controls: VCardCentreControl[]
  template: Template | null
  created_at: string
  updated_at: string
}

export interface VCardStats {
  card_id: string
  views: number
  scans: number
  shares: number
  events: Record<string, number>
}

export interface Template {
  id: string
  name: string
  slug: string
  path: string | null
  preview_url: string | null
  category: string | null
  status: string
  is_business: boolean
  is_consumer: boolean
  font_family: string | null
  primary_color: string | null
  secondary_color: string | null
  button_style: string | null
  logo_position: string | null
  bg_style: string | null
  sections: Record<string, boolean> | null
  usage: number
  fields: TemplateField[]
}

export interface TemplateField {
  id: string
  field_key: string
  label: string
  field_type: string
  is_editable: boolean
  is_required: boolean
  display_order: number
  options: Record<string, unknown> | null
}

// ── Business Permissions ──

export interface BusinessPermissions {
  business: { id: string; name: string } | null
  has_membership: boolean
  tier_name: string | null
  plan_level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  plan_tier: 'Normal' | 'Pro' | 'Pro+'
  limits: {
    vcards: number | null
    business_cards: number | null
    friends_family: number | null
    qr_routing_rules: number | null
  }
  allocated: {
    vcards: number
    business_cards: number
  }
  remaining: {
    vcards: number | null
    business_cards: number | null
  }
}

// ── API Service ──

export const businessService = {
  async getMyBusinesses(): Promise<Business[]> {
    const res = await api.get('/users/me/businesses')
    return res.data.data
  },

  async getBusiness(id: string): Promise<Business> {
    const res = await api.get(`/businesses/${id}`)
    return res.data.data
  },

  async getBusinessBySlug(slug: string): Promise<Business> {
    const res = await api.get(`/businesses/by-slug/${slug}`)
    return res.data.data
  },

  async getCategories(): Promise<BusinessCategory[]> {
    const res = await api.get('/business-categories')
    return res.data.data
  },

  // ── Notifications ──

  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const params = unreadOnly ? { unread: 'true' } : {}
    const res = await api.get('/notifications', { params })
    return res.data.data
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get('/notifications/unread-count')
    return res.data.data.unread_count
  },

  // ── Wallet ──

  async getWallet(): Promise<Wallet | null> {
    try {
      const res = await api.get('/wallet')
      return res.data.data
    } catch {
      return null
    }
  },

  async getWalletTransactions(): Promise<WalletTransaction[]> {
    try {
      const res = await api.get('/wallet/transactions')
      return res.data.data
    } catch {
      return []
    }
  },

  // ── Membership ──

  async getMyMemberships(): Promise<Membership[]> {
    try {
      const res = await api.get('/memberships')
      return res.data.data
    } catch {
      return []
    }
  },

  // ── Dashboard Stats ──

  async getDashboardStats(): Promise<DashboardStats | null> {
    try {
      const res = await api.get('/dashboard/stats')
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  // ── Activity Feed ──

  async getActivity(limit = 20, offset = 0): Promise<{ items: ActivityItem[]; total: number }> {
    try {
      const res = await api.get('/activity', { params: { limit, offset } })
      return res.data.data ?? res.data
    } catch {
      return { items: [], total: 0 }
    }
  },

  // ── Analytics ──

  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    try {
      const res = await api.get('/analytics/overview')
      return res.data.data ?? res.data
    } catch {
      return {}
    }
  },

  // ── Customers ──

  async getCustomers(limit = 50, offset = 0): Promise<{ items: Customer[]; total: number }> {
    try {
      const res = await api.get('/customers', { params: { limit, offset } })
      return res.data.data ?? res.data
    } catch {
      return { items: [], total: 0 }
    }
  },

  async getCustomerDetail(email: string): Promise<CustomerDetail | null> {
    try {
      const res = await api.get(`/customers/${encodeURIComponent(email)}/detail`)
      return res.data.data ?? res.data
    } catch (err: unknown) {
      // 404 = customer genuinely not found; surface null so the page can show its not-found state
      if (err && typeof err === 'object' && 'response' in err) {
        const status = (err as { response?: { status?: number } }).response?.status
        if (status === 404) return null
      }
      throw err
    }
  },

  async getCustomerNotes(email: string): Promise<{ items: CustomerNoteItem[]; total: number }> {
    try {
      const res = await api.get(`/customers/${encodeURIComponent(email)}/notes`)
      return res.data.data ?? res.data
    } catch {
      return { items: [], total: 0 }
    }
  },

  async createCustomerNote(email: string, note: string): Promise<CustomerNoteItem | null> {
    try {
      const res = await api.post(`/customers/${encodeURIComponent(email)}/notes`, { note })
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async updateCustomerNote(noteId: string, note: string): Promise<CustomerNoteItem | null> {
    try {
      const res = await api.patch(`/customers/notes/${noteId}`, { note })
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async deleteCustomerNote(noteId: string): Promise<boolean> {
    try {
      await api.delete(`/customers/notes/${noteId}`)
      return true
    } catch {
      return false
    }
  },

  // ── VCards (Cards) ──

  async getMyVCards(): Promise<VCard[]> {
    try {
      const res = await api.get('/users/me/cards')
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async getVCardsByBusiness(businessId: string): Promise<VCard[]> {
    try {
      const res = await api.get(`/businesses/${businessId}/cards`)
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async getVCard(cardId: string): Promise<VCard | null> {
    try {
      const res = await api.get(`/cards/${cardId}`)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async getVCardStats(cardId: string): Promise<VCardStats | null> {
    try {
      const res = await api.get(`/cards/${cardId}/stats`)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async getVCardSections(cardId: string): Promise<VCardSection[]> {
    try {
      const res = await api.get(`/cards/${cardId}/sections`)
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async upsertVCardSections(cardId: string, sections: { schema_id: string; name?: string; locked?: boolean; enabled?: boolean; sort_order?: number; content?: Record<string, unknown> }[]): Promise<VCardSection[]> {
    try {
      const res = await api.patch(`/cards/${cardId}/sections`, sections)
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async getVCardCentreControls(cardId: string): Promise<VCardCentreControl[]> {
    try {
      const res = await api.get(`/cards/${cardId}/centre-controls`)
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async upsertVCardCentreControls(cardId: string, controls: { centre_id: string; enabled?: boolean; edit_allowed?: boolean; settings?: Record<string, unknown> }[]): Promise<VCardCentreControl[]> {
    try {
      const res = await api.patch(`/cards/${cardId}/centre-controls`, controls)
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async updateCard(cardId: string, dto: { slug?: string; type?: string; template_id?: string | null; business_id?: string | null; name?: string; description?: string; category?: string; status?: string }): Promise<VCard | null> {
    try {
      const res = await api.patch(`/cards/${cardId}`, dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async trackCardEvent(slug: string, event: 'view' | 'scan' | 'share'): Promise<void> {
    try {
      await api.post(`/cards/public/${encodeURIComponent(slug)}/track`, { event })
    } catch {
      // tracking is best-effort — never block the UI
    }
  },

  async applyTemplate(cardId: string, templateId: string): Promise<VCard | null> {
    try {
      const res = await api.post(`/cards/${cardId}/apply-template`, { template_id: templateId })
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async duplicateCard(cardId: string): Promise<VCard | null> {
    try {
      const res = await api.post(`/cards/${cardId}/duplicate`)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async getBusinessPermissions(): Promise<BusinessPermissions | null> {
    try {
      const res = await api.get('/users/me/business-permissions')
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async getCardAccess(cardId: string): Promise<VCardAccess | null> {
    try {
      const res = await api.get(`/cards/${cardId}/access`)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async createCardAccess(cardId: string, dto: { is_enabled?: boolean; password?: string; hint?: string; protected_section_ids?: string[] }): Promise<VCardAccess | null> {
    try {
      const res = await api.post(`/cards/${cardId}/access`, dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async updateCardAccess(accessId: string, dto: { is_enabled?: boolean; password?: string; hint?: string; protected_section_ids?: string[] }): Promise<VCardAccess | null> {
    try {
      const res = await api.patch(`/card-access/${accessId}`, dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async claimTemplate(businessId: string, templateId: string, customSlug?: string): Promise<VCard | null> {
    try {
      const res = await api.post('/cards/claim', { business_id: businessId, template_id: templateId, custom_slug: customSlug })
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async listTemplates(): Promise<Template[]> {
    try {
      const res = await api.get('/templates')
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  // ── Rewards ──

  async getRewardBalance(): Promise<RewardBalance | null> {
    try {
      const res = await api.get('/rewards/balance')
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async createRewardBalance(): Promise<RewardBalance | null> {
    try {
      const res = await api.post('/rewards/balance')
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async getRewardTransactions(): Promise<RewardTransaction[]> {
    try {
      const res = await api.get('/rewards/transactions')
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async createRewardTransaction(dto: { type: 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST'; amount: number; description?: string }): Promise<RewardTransaction | null> {
    try {
      const res = await api.post('/rewards/transactions', dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  // ── Campaigns ──

  async getCampaignTemplates(): Promise<CampaignTemplate[]> {
    try {
      const res = await api.get('/campaigns/templates')
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async getCampaigns(): Promise<Campaign[]> {
    try {
      const res = await api.get('/campaigns')
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async createCampaign(dto: { business_id: string; name: string; type?: string; description?: string; budget?: number; starts_at?: string; ends_at?: string }): Promise<Campaign | null> {
    try {
      const res = await api.post('/campaigns', dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async updateCampaign(id: string, dto: { name?: string; type?: string; status?: string; description?: string; budget?: number }): Promise<Campaign | null> {
    try {
      const res = await api.patch(`/campaigns/${id}`, dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async deleteCampaign(id: string): Promise<boolean> {
    try {
      await api.delete(`/campaigns/${id}`)
      return true
    } catch {
      return false
    }
  },

  // ── Offers ──

  async listOffers(campaignId: string): Promise<Offer[]> {
    try {
      const res = await api.get(`/campaigns/${campaignId}/offers`)
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async createOffer(campaignId: string, dto: { title: string; description?: string; discount_type: string; discount_value: number }): Promise<Offer | null> {
    try {
      const res = await api.post(`/campaigns/${campaignId}/offers`, dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  // ── Coupons ──

  async listCoupons(offerId: string): Promise<Coupon[]> {
    try {
      const res = await api.get(`/campaigns/offers/${offerId}/coupons`)
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async createCoupon(offerId: string, dto: { code: string; discount_type: string; discount_value: number; max_uses?: number; expires_at?: string }): Promise<Coupon | null> {
    try {
      const res = await api.post(`/campaigns/offers/${offerId}/coupons`, dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async updateCoupon(couponId: string, dto: { code?: string; discount_type?: string; discount_value?: number; max_uses?: number; expires_at?: string; status?: string }): Promise<Coupon | null> {
    try {
      const res = await api.patch(`/campaigns/coupons/${couponId}`, dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  // ── Gift Cards ──

  async getGiftCards(): Promise<GiftCard[]> {
    try {
      const res = await api.get('/gift-cards')
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async createGiftCard(dto: { business_id: string; title: string; value: number; price: number }): Promise<GiftCard | null> {
    try {
      const res = await api.post('/gift-cards', dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async updateGiftCard(id: string, dto: { title?: string; value?: number; price?: number; status?: string }): Promise<GiftCard | null> {
    try {
      const res = await api.patch(`/gift-cards/${id}`, dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async deleteGiftCard(id: string): Promise<boolean> {
    try {
      await api.delete(`/gift-cards/${id}`)
      return true
    } catch {
      return false
    }
  },

  // ── Cashback Programs ──

  async getCashbackPrograms(): Promise<CashbackProgram[]> {
    try {
      const res = await api.get('/cashback-programs')
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async createCashbackProgram(dto: { business_id: string; title: string; rate: number }): Promise<CashbackProgram | null> {
    try {
      const res = await api.post('/cashback-programs', dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async updateCashbackProgram(id: string, dto: { title?: string; rate?: number; status?: string }): Promise<CashbackProgram | null> {
    try {
      const res = await api.patch(`/cashback-programs/${id}`, dto)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  async deleteCashbackProgram(id: string): Promise<boolean> {
    try {
      await api.delete(`/cashback-programs/${id}`)
      return true
    } catch {
      return false
    }
  },
}
