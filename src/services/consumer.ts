import { mockConsumers, type MockConsumer } from './mockData'

const CONSUMER_ID = 1

const delay = () => new Promise((r) => setTimeout(r, 200))

function api<T>(data: T): Promise<T> {
  return delay().then(() => Promise.resolve(data))
}

export const consumerService = {
  async getProfile(): Promise<MockConsumer> {
    const c = mockConsumers.find((x) => x.id === CONSUMER_ID)
    return api(c || mockConsumers[0])
  },
  async getSavedCards(): Promise<MockConsumer['savedCards']> {
    const c = mockConsumers.find((x) => x.id === CONSUMER_ID)
    return api(c?.savedCards || [])
  },
  async getRewardHistory(): Promise<MockConsumer['rewardHistory']> {
    const c = mockConsumers.find((x) => x.id === CONSUMER_ID)
    return api(c?.rewardHistory || [])
  },
  async getReferrals(): Promise<MockConsumer['referrals']> {
    const c = mockConsumers.find((x) => x.id === CONSUMER_ID)
    return api(c?.referrals || [])
  },
  async getWallet(): Promise<MockConsumer['wallet']> {
    const c = mockConsumers.find((x) => x.id === CONSUMER_ID)
    return api(c?.wallet || { balance: 0, points: 0, cashback: 0, giftCards: 0, coupons: 0, vouchers: 0 })
  },
  async getStats(): Promise<MockConsumer['stats']> {
    const c = mockConsumers.find((x) => x.id === CONSUMER_ID)
    return api(c?.stats || { cards: 0, rewards: 0, referrals: 0, scans: 0 })
  },
  async getRecentActivity(): Promise<MockConsumer['recentActivity']> {
    const c = mockConsumers.find((x) => x.id === CONSUMER_ID)
    return api(c?.recentActivity || [])
  },
}
