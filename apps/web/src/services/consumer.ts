import {
  mockConsumers,
  mockNearbyOffers,
  mockExchangeItems,
  mockRedeemItems,
  mockConsumerNotifications,
  type MockConsumer,
  type NearbyOffer,
  type ExchangeItem,
  type ConsumerNotification,
} from './mockData'

const CONSUMER_ID = 1

const ACTIVE_CONSUMER_KEY = 'mcom.consumer.active'

const delay = () => new Promise((r) => setTimeout(r, 200))

function api<T>(data: T): Promise<T> {
  return delay().then(() => Promise.resolve(data))
}

function getActiveConsumerId(): number | null {
  try {
    const raw = localStorage.getItem(ACTIVE_CONSUMER_KEY)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

function setActiveConsumerId(id: number) {
  try {
    localStorage.setItem(ACTIVE_CONSUMER_KEY, String(id))
  } catch {
    /* ignore quota errors */
  }
}

/** The consumer whose dashboard is shown — a locally created profile wins, else the seeded demo consumer. */
function getConsumer(): MockConsumer {
  const activeId = getActiveConsumerId()
  const active = activeId != null ? mockConsumers.find((x) => x.id === activeId) : undefined
  return active || mockConsumers.find((x) => x.id === CONSUMER_ID) || mockConsumers[0]
}

export const consumerService = {
  async getProfile(): Promise<MockConsumer> {
    return api(getConsumer())
  },
  /** New-vs-existing determination: returns the consumer profile matching an email, if one exists. */
  async getProfileByEmail(email: string): Promise<MockConsumer | null> {
    const match = mockConsumers.find((c) => c.email.toLowerCase() === email.toLowerCase())
    return api(match || null)
  },
  /** Creates a brand-new consumer profile (first-time setup) and makes it the active one. */
  async createProfile(data: { name: string; email: string; phone?: string; location?: string }): Promise<MockConsumer> {
    return delay().then(() => {
      const id = Math.max(0, ...mockConsumers.map((c) => c.id)) + 1
      const consumer: MockConsumer = {
        id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        location: data.location || 'London, UK',
        status: 'active',
        joined: 'Just now',
        consumerId: `MC-CNS-${String(id).padStart(6, '0')}`,
        centralUserId: `MCOM-U-${String(id).padStart(6, '0')}`,
        membership: 'Bronze',
        membershipStatus: 'Active',
        vcardStatus: 'Active',
        cardStatus: 'Active',
        additionalEntitlements: 2,
        allocatedAdditionalCards: 0,
        familyAllocations: 2,
        friendAllocations: 0,
        unallocatedEntitlements: 2,
        primaryIssuingBusiness: '',
        primaryIssuingBusinessId: 0,
        businessCount: 0,
        registrationSource: 'Self',
        lastActivityAt: 'Just now',
        allocationType: 'None',
        wallet: { balance: 0, points: 0, cashback: 0, giftCards: 0, coupons: 0, vouchers: 0 },
        stats: { cards: 1, rewards: 0, referrals: 0, scans: 0 },
        savedCards: [],
        rewardHistory: [],
        referrals: [],
        recentActivity: [{ action: 'Completed first-time setup', time: 'Just now', type: 'card' }],
        cardId: `CARD-CNS-${String(id).padStart(6, '0')}`,
        cardTemplate: 'Consumer Card — Bronze',
        cardCreated: 'Just now',
        cardUpdated: 'Just now',
        cardSource: 'Self-Service',
        cardAcquisitionMethod: 'First-Time Setup',
        cardSourcePlatform: '',
        qrStatus: 'Active',
        qrId: `QR-CNS-${String(id).padStart(6, '0')}`,
        qrLastScanned: 'Never',
        qrUpdateFrequency: 'Weekly',
        qrLastContentUpdate: 'Just now',
        eCardStatus: 'Available',
        eCardFaceValue: '£0.00',
        eCardSource: 'Self-Service',
        eCardId: `EC-CNS-${String(id).padStart(6, '0')}`,
        eCardIssueDate: 'Just now',
        eCardExpiryDate: '',
        additionalCards: [],
        shareContent: [],
        cardActivity: [
          { action: 'Consumer profile created', time: 'Just now', type: 'card', actor: data.name, source: 'MCOMVCard', status: 'Successful' },
          { action: 'First-time setup completed', time: 'Just now', type: 'card', actor: data.name, source: 'MCOMVCard', status: 'Successful' },
        ],
      }
      mockConsumers.push(consumer)
      setActiveConsumerId(id)
      return consumer
    })
  },
  async getSavedCards(): Promise<MockConsumer['savedCards']> {
    return api(getConsumer().savedCards || [])
  },
  async getRewardHistory(): Promise<MockConsumer['rewardHistory']> {
    return api(getConsumer().rewardHistory || [])
  },
  async getReferrals(): Promise<MockConsumer['referrals']> {
    return api(getConsumer().referrals || [])
  },
  async getWallet(): Promise<MockConsumer['wallet']> {
    return api(getConsumer().wallet || { balance: 0, points: 0, cashback: 0, giftCards: 0, coupons: 0, vouchers: 0 })
  },
  async getCardBalance(): Promise<number> {
    return api(getConsumer().cardBalance ?? 0)
  },
  async fundCard(amount: number, provider?: string): Promise<number> {
    return delay().then(() => {
      const via = provider ? ` via ${provider === 'paypal' ? 'PayPal' : 'Stripe'}` : ''
      const c = getConsumer()
      c.cardBalance = (c.cardBalance ?? 0) + amount
      c.recentActivity = [
        { action: `Added £${amount.toFixed(2)} to card balance${via}`, time: 'Just now', type: 'card' },
        ...(c.recentActivity || []),
      ]
      c.cardActivity = [
        { action: `Card funded with £${amount.toFixed(2)}${via}`, time: 'Just now', type: 'card', actor: c.name, source: 'MCOM Wallet', status: 'Successful' },
        ...(c.cardActivity || []),
      ]
      return c.cardBalance
    })
  },
  async getStats(): Promise<MockConsumer['stats']> {
    return api(getConsumer().stats || { cards: 0, rewards: 0, referrals: 0, scans: 0 })
  },
  async getRecentActivity(): Promise<MockConsumer['recentActivity']> {
    return api(getConsumer().recentActivity || [])
  },
  async getFamilyCards(): Promise<MockConsumer['additionalCards']> {
    return api(getConsumer().additionalCards || [])
  },
  async getShareContent(): Promise<MockConsumer['shareContent']> {
    return api(getConsumer().shareContent || [])
  },
  async getCardActivity(): Promise<MockConsumer['cardActivity']> {
    return api(getConsumer().cardActivity || [])
  },
  async getNearbyOffers(): Promise<NearbyOffer[]> {
    return api(mockNearbyOffers)
  },
  async getExchangeItems(): Promise<ExchangeItem[]> {
    return api(mockExchangeItems)
  },
  async getRedeemItems(): Promise<ExchangeItem[]> {
    return api(mockRedeemItems)
  },
  async getNotifications(): Promise<ConsumerNotification[]> {
    return api(mockConsumerNotifications)
  },
  async getUnreadNotificationCount(): Promise<number> {
    return api(mockConsumerNotifications.filter((n) => !n.read).length)
  },
  async associateCard(cardId: string, business?: string): Promise<MockConsumer> {
    return delay().then(() => {
      const c = getConsumer()
      const id = Math.max(0, ...(c.savedCards || []).map((s) => s.id)) + 1
      c.savedCards = [
        { id, name: business || cardId, business: business || 'Business', type: 'Membership', source: 'Card Link', editable: true },
        ...(c.savedCards || []),
      ]
      c.recentActivity = [
        { action: `Card added from ${business || cardId}`, time: 'Just now', type: 'card' },
        ...(c.recentActivity || []),
      ]
      c.cardActivity = [
        { action: `Connected to ${business || 'business'} and issued ${cardId}`, time: 'Just now', type: 'card', actor: c.name, source: 'MCOM Central', status: 'Successful' },
        ...(c.cardActivity || []),
      ]
      if (business) {
        c.primaryIssuingBusiness = business
        c.primaryIssuingBusinessId = c.primaryIssuingBusinessId || 0
        c.businessCount = Math.max(1, c.businessCount)
        c.registrationSource = 'Business'
      }
      return c
    })
  },
}