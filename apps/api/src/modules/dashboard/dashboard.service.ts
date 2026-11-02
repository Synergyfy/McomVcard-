import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Business } from '../businesses/entities/business.entity'
import { Share } from '../shares/entities/share.entity'
import { WalletTransaction } from '../finance/entities/wallet-transaction.entity'
import { RewardTransaction } from '../finance/entities/reward-transaction.entity'
import { Appointment } from '../appointments/entities/appointment.entity'
import { Campaign } from '../campaigns/entities/campaign.entity'
import { Review } from '../reviews/entities/review.entity'
import { Card } from '../cards/entities/card.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity'
import { BusinessesService } from '../businesses/businesses.service'
import { CapabilitiesService } from '../capabilities/capabilities.service'
import { CacheService } from '../../lib/cache/cache.service'

const VIEW_EVENTS = ['card_view', 'profile_view', 'view']
const SCAN_EVENTS = ['card_scan', 'qr_scan', 'scan']
const SHARE_EVENTS = ['card_share', 'share']
const RANGE_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }

export interface ReportChartPoint { label: string; value: number }

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Business) private businesses: Repository<Business>,
    @InjectRepository(Share) private shares: Repository<Share>,
    @InjectRepository(WalletTransaction) private walletTx: Repository<WalletTransaction>,
    @InjectRepository(RewardTransaction) private rewardTx: Repository<RewardTransaction>,
    @InjectRepository(Appointment) private appointments: Repository<Appointment>,
    @InjectRepository(Campaign) private campaigns: Repository<Campaign>,
    @InjectRepository(Review) private reviews: Repository<Review>,
    @InjectRepository(Card) private cards: Repository<Card>,
    @InjectRepository(Membership) private memberships: Repository<Membership>,
    @InjectRepository(AnalyticsEvent) private analyticsEvents: Repository<AnalyticsEvent>,
    private readonly businessesService: BusinessesService,
    private readonly capabilities: CapabilitiesService,
    private readonly cache: CacheService,
  ) {}

  async getStatsForUser(userId: string) {
    return this.cache.getOrSet(`dashboard:stats:${userId}`, 30, async () => {
      const business = await this.businesses.findOne({ where: { ownerId: userId } })
      if (!business) {
        return {
          totalCards: 0, totalShares: 0, totalAppointments: 0, pendingAppointments: 0,
          completedAppointments: 0, activeCampaigns: 0, totalReviews: 0, avgRating: 0,
          totalWalletCredits: 0, totalRewardsRedeemed: 0, activeMemberships: 0,
        }
      }
      return this.getStats(business.id, userId)
    })
  }

  async getStats(businessId: string, ownerId?: string) {
    const [
      totalCards, totalShares, totalAppointments, pendingAppointments,
      completedAppointments, activeCampaigns, totalReviews, avgRatingResult,
      walletCredits, rewardsRedeemed, activeMemberships,
    ] = await Promise.all([
      this.cards.count({ where: { business: { id: businessId } } }),
      this.shares.createQueryBuilder('s').innerJoin('s.card', 'c', 'c.business_id = :businessId', { businessId }).getCount(),
      this.appointments.count({ where: { business: { id: businessId } } }),
      this.appointments.count({ where: { business: { id: businessId }, status: 'pending' } }),
      this.appointments.count({ where: { business: { id: businessId }, status: 'completed' } }),
      this.campaigns.count({ where: { business: { id: businessId }, status: 'active' as any } }),
      this.reviews.count({ where: { business: { id: businessId } } }),
      this.reviews.createQueryBuilder('r').select('AVG(r.rating)', 'avg').where('r.business_id = :businessId', { businessId }).getRawOne(),
      ownerId ? this.walletTx.createQueryBuilder('wt').innerJoin('wt.wallet', 'w', 'w.user_id = :ownerId', { ownerId }).where('wt.type = :type', { type: 'CREDIT' }).select('COALESCE(SUM(wt.amount), 0)', 'total').getRawOne() : Promise.resolve({ total: 0 }),
      ownerId ? this.rewardTx.createQueryBuilder('rt').innerJoin('rt.balance', 'rb', 'rb.user_id = :ownerId', { ownerId }).where('rt.type = :type', { type: 'REDEEM' }).select('COALESCE(SUM(rt.amount), 0)', 'total').getRawOne() : Promise.resolve({ total: 0 }),
      ownerId ? this.memberships.count({ where: { user: { id: ownerId }, status: 'active' } }) : Promise.resolve(0),
    ])

    return {
      totalCards, totalShares, totalAppointments, pendingAppointments, completedAppointments,
      activeCampaigns, totalReviews,
      avgRating: avgRatingResult?.avg ? Number(avgRatingResult.avg) : 0,
      totalWalletCredits: walletCredits?.total ? Number(walletCredits.total) : 0,
      totalRewardsRedeemed: rewardsRedeemed?.total ? Number(rewardsRedeemed.total) : 0,
      activeMemberships,
    }
  }

  async getReportsForUser(userId: string, range = '7d') {
    const days = RANGE_DAYS[range] ?? 7
    return this.cache.getOrSet(`dashboard:reports:${userId}:${days}`, 60, async () => {
      const business = await this.businesses.findOne({ where: { ownerId: userId } })
      if (!business) {
        return {
          range,
          metrics: [
            { label: 'Total Views', value: '0', change: '', trend: 'flat' },
            { label: 'QR Scans', value: '0', change: '', trend: 'flat' },
            { label: 'Profile Views', value: '0', change: '', trend: 'flat' },
            { label: 'Customer Activity', value: '0', change: '', trend: 'flat' },
          ],
          dailyViews: this.emptySeries(days), dailyScans: this.emptySeries(days),
          topLocations: [], deviceBreakdown: [], customerActivity: [], membershipUsage: [],
        }
      }

      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      const [stats, events, permissionsResponse, capabilities] = await Promise.all([
        this.getStats(business.id, userId),
        this.analyticsEvents.createQueryBuilder('e')
          .select("DATE_TRUNC('day', e.created_at)", 'day')
          .addSelect('e.event_type', 'eventType')
          .addSelect('COUNT(*)', 'count')
          .where('e.business_id = :businessId', { businessId: business.id })
          .andWhere('e.created_at >= :since', { since })
          .groupBy("DATE_TRUNC('day', e.created_at)")
          .addGroupBy('e.event_type')
          .getRawMany<{ day: Date | string; eventType: string; count: string }>(),
        this.businessesService.getPermissionsForUser(userId),
        this.capabilities.resolveForUser(userId),
      ])

      const permissions = permissionsResponse as {
        limits: { vcards: number | null; business_cards: number | null; friends_family: number | null; qr_routing_rules: number | null }
        allocated: { vcards: number; business_cards: number }
      }

      const viewMap = new Map<string, number>()
      const scanMap = new Map<string, number>()
      const shareMap = new Map<string, number>()
      for (const event of events) {
        const key = this.dayKey(event.day)
        const count = Number(event.count)
        if (VIEW_EVENTS.includes(event.eventType)) viewMap.set(key, (viewMap.get(key) ?? 0) + count)
        if (SCAN_EVENTS.includes(event.eventType)) scanMap.set(key, (scanMap.get(key) ?? 0) + count)
        if (SHARE_EVENTS.includes(event.eventType)) shareMap.set(key, (shareMap.get(key) ?? 0) + count)
      }

      const dailyViews = this.fillSeries(days, viewMap)
      const dailyScans = this.fillSeries(days, scanMap)
      const totalViews = dailyViews.reduce((sum, point) => sum + point.value, 0)
      const totalScans = dailyScans.reduce((sum, point) => sum + point.value, 0)
      const totalShares = Math.max(stats.totalShares, [...shareMap.values()].reduce((a, b) => a + b, 0))
      const toCapabilityLimit = (key: string) => {
        const capability = capabilities.capabilities[key]
        if (!capability) return 'Unlimited'
        if (capability.mode === 'unlimited') return 'Unlimited'
        if (capability.mode === 'disabled') return '0'
        return String(capability.limit ?? 0)
      }

      return {
        range,
        metrics: [
          { label: 'Total Views', value: this.fmt(totalViews), change: '', trend: 'flat' },
          { label: 'QR Scans', value: this.fmt(totalScans), change: '', trend: 'flat' },
          { label: 'Shares', value: this.fmt(totalShares), change: '', trend: 'flat' },
          { label: 'Customer Activity', value: this.fmt(stats.totalAppointments + stats.totalReviews + stats.totalShares), change: '', trend: 'flat' },
        ],
        dailyViews, dailyScans,
        topLocations: (business.locations ?? []).map((location) => ({
          country: [location.city, location.country].filter(Boolean).join(', ') || location.address || 'Location',
          count: 0,
        })),
        deviceBreakdown: [] as { device: string; count: number }[],
        customerActivity: [
          { action: 'QR scans', count: totalScans },
          { action: 'Card shares', count: totalShares },
          { action: 'Appointments', count: stats.totalAppointments },
          { action: 'Reviews', count: stats.totalReviews },
        ],
        membershipUsage: [
          { resource: 'Business VCards', used: permissions.allocated.vcards, limit: toCapabilityLimit('maxVCards') },
          { resource: 'Business Cards', used: permissions.allocated.business_cards, limit: toCapabilityLimit('maxBusinessCards') },
          { resource: 'Friends & Family', used: 0, limit: toCapabilityLimit('maxFriendsFamily') },
          { resource: 'QR routing rules', used: 0, limit: toCapabilityLimit('qrRoutingRules') },
        ],
      }
    })
  }

  async getQrStatsForUser(userId: string, days = 7) {
    return this.cache.getOrSet(`dashboard:qr:${userId}:${days}`, 30, async () => {
      const business = await this.businesses.findOne({ where: { ownerId: userId } })
      if (!business) return { totalScans: 0, todayScans: 0, uniqueScanners: 0, series: this.emptySeries(days), devices: [] }

      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      const events = await this.analyticsEvents.createQueryBuilder('e')
        .select("DATE_TRUNC('day', e.created_at)", 'day')
        .addSelect('COUNT(*)', 'count')
        .where('e.business_id = :businessId', { businessId: business.id })
        .andWhere('e.event_type IN (:...types)', { types: SCAN_EVENTS })
        .andWhere('e.created_at >= :since', { since })
        .groupBy("DATE_TRUNC('day', e.created_at)")
        .orderBy("DATE_TRUNC('day', e.created_at)", 'ASC')
        .getRawMany<{ day: Date | string; count: string }>()

      const map = new Map<string, number>()
      for (const event of events) map.set(this.dayKey(event.day), Number(event.count))
      const series = this.fillSeries(days, map)
      return {
        totalScans: series.reduce((sum, point) => sum + point.value, 0),
        todayScans: map.get(this.dayKey(new Date())) ?? 0,
        uniqueScanners: 0,
        series,
        devices: [] as { label: string; pct: number }[],
      }
    })
  }

  private dayKey(value: Date | string): string {
    return (value instanceof Date ? value : new Date(value)).toISOString().slice(0, 10)
  }

  private fmt(value: number): string { return value.toLocaleString('en-GB') }
  private emptySeries(days: number): ReportChartPoint[] { return this.fillSeries(days, new Map()) }

  private fillSeries(days: number, map: Map<string, number>): ReportChartPoint[] {
    const points: ReportChartPoint[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = this.dayKey(date)
      points.push({
        label: date.toLocaleDateString('en-GB', { weekday: days <= 7 ? 'short' : undefined, day: days > 7 ? 'numeric' : undefined, month: days > 7 ? 'short' : undefined }),
        value: map.get(key) ?? 0,
      })
    }
    return points
  }
}
