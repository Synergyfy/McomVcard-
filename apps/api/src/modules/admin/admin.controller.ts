import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiExtraModels } from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { MoreThanOrEqual, Repository } from 'typeorm'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { CacheService } from '../../lib/cache/cache.service'
import { User } from '../users/entities/user.entity'
import { Business } from '../businesses/entities/business.entity'
import { Card, CardType } from '../cards/entities/card.entity'
import { Template } from '../cards/entities/template.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { ActivityLog } from '../activity/entities/activity-log.entity'

type TrendRow = { day: string; count: string }

@ApiTags('admin')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Business) private businessRepo: Repository<Business>,
    @InjectRepository(Card) private cardRepo: Repository<Card>,
    @InjectRepository(Template) private templateRepo: Repository<Template>,
    @InjectRepository(Membership) private membershipRepo: Repository<Membership>,
    @InjectRepository(ActivityLog) private activityRepo: Repository<ActivityLog>,
    private readonly cache: CacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Admin dashboard health check' })
  @ApiOkResponse({ description: 'Admin API healthy' })
  async healthCheck() {
    return ApiResponse.success({ status: 'ok', message: 'Admin API is operational' }, 'Admin dashboard', 200)
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Admin dashboard stats',
    description: 'Live aggregate counts, recent registrations/activity and 7-day trends. Cached in Redis for 30 seconds.',
  })
  @ApiOkResponse({ description: 'Dashboard stats' })
  async getDashboard() {
    const stats = await this.cache.getOrSet('admin:dashboard', 30, () => this.buildDashboard())
    return ApiResponse.success(stats, 'Dashboard stats retrieved', 200)
  }

  private async buildDashboard() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const cardTypes = {
      businessVcard: CardType.BUSINESS_VCARD,
      businessCard: CardType.BUSINESS_CARD,
      consumerVcard: CardType.CONSUMER_VCARD,
      consumerCard: CardType.CONSUMER_STORE_CARD,
    } as const

    const [
      totalUsers,
      totalBusinesses,
      totalCards,
      totalTemplates,
      activeMemberships,
      newUsers,
      newBusinesses,
      bizVcards,
      bizCards,
      conVcards,
      conCards,
      activeBizVcards,
      activeBizCards,
      activeConVcards,
      activeConCards,
      pendingBizVcards,
      pendingBizCards,
      pendingConVcards,
      pendingConCards,
    ] = await Promise.all([
      this.userRepo.count(),
      this.businessRepo.count(),
      this.cardRepo.count(),
      this.templateRepo.count(),
      this.membershipRepo.count({ where: { status: 'active' } }),
      this.userRepo.count({ where: { createdAt: MoreThanOrEqual(sevenDaysAgo) } }),
      this.businessRepo.count({ where: { createdAt: MoreThanOrEqual(sevenDaysAgo) } }),
      this.cardRepo.count({ where: { type: cardTypes.businessVcard } }),
      this.cardRepo.count({ where: { type: cardTypes.businessCard } }),
      this.cardRepo.count({ where: { type: cardTypes.consumerVcard } }),
      this.cardRepo.count({ where: { type: cardTypes.consumerCard } }),
      this.cardRepo.count({ where: { type: cardTypes.businessVcard, status: 'active' } }),
      this.cardRepo.count({ where: { type: cardTypes.businessCard, status: 'active' } }),
      this.cardRepo.count({ where: { type: cardTypes.consumerVcard, status: 'active' } }),
      this.cardRepo.count({ where: { type: cardTypes.consumerCard, status: 'active' } }),
      this.cardRepo.count({ where: { type: cardTypes.businessVcard, status: 'pending' } }),
      this.cardRepo.count({ where: { type: cardTypes.businessCard, status: 'pending' } }),
      this.cardRepo.count({ where: { type: cardTypes.consumerVcard, status: 'pending' } }),
      this.cardRepo.count({ where: { type: cardTypes.consumerCard, status: 'pending' } }),
    ])

    const [recentUsers, recentBusinesses, recentActivity, registrationTrend, cardTrend] = await Promise.all([
      this.userRepo.find({ order: { createdAt: 'DESC' }, take: 5, select: ['id', 'firstName', 'lastName', 'email', 'createdAt'] }),
      this.businessRepo.find({ order: { createdAt: 'DESC' }, take: 5, select: ['id', 'name', 'slug', 'createdAt'] }),
      this.activityRepo.find({ order: { createdAt: 'DESC' }, take: 12, relations: { business: true, user: true } }),
      this.registrationTrend(sevenDaysAgo),
      this.cardTrend(sevenDaysAgo),
    ])

    const dayLabels = this.lastSevenDays()
    const userTrendByDay = this.indexTrend(registrationTrend.users)
    const businessTrendByDay = this.indexTrend(registrationTrend.businesses)
    const cardTrendByDay = this.indexCardTrend(cardTrend)

    const activity = recentActivity.map((entry) => ({
      type: entry.type,
      name: entry.user
        ? [entry.user.firstName, entry.user.lastName].filter(Boolean).join(' ') || entry.user.email
        : entry.business?.name ?? 'Platform',
      action: entry.title,
      detail: entry.description ?? '',
      time: entry.createdAt,
    }))

    return {
      total_users: totalUsers,
      total_businesses: totalBusinesses,
      total_cards: totalCards,
      total_templates: totalTemplates,
      businesses: totalBusinesses,
      consumers: totalUsers,
      totalVCards: bizVcards + conVcards,
      totalCards: bizCards + conCards,
      activeVCards: activeBizVcards + activeConVcards,
      activeCards: activeBizCards + activeConCards,
      pendingVCards: pendingBizVcards + pendingConVcards,
      pendingCards: pendingBizCards + pendingConCards,
      activeMemberships,
      newBusinesses,
      newConsumers: newUsers,
      businessVCards: { total: bizVcards, active: activeBizVcards, pending: pendingBizVcards },
      consumerVCards: { total: conVcards, active: activeConVcards, pending: pendingConVcards },
      businessCards: { total: bizCards, active: activeBizCards, pending: pendingBizCards },
      consumerCards: { total: conCards, active: activeConCards, pending: pendingConCards },
      additionalEntitlements: { available: 0, allocated: 0, active: 0, pending: 0 },
      regTrend: dayLabels.map((day) => ({
        period: day.label,
        businesses: businessTrendByDay.get(day.key) ?? 0,
        consumers: userTrendByDay.get(day.key) ?? 0,
      })),
      cardGrowth: dayLabels.map((day) => ({
        period: day.label,
        bizVcards: cardTrendByDay.get(`${day.key}:${cardTypes.businessVcard}`) ?? 0,
        bizCards: cardTrendByDay.get(`${day.key}:${cardTypes.businessCard}`) ?? 0,
        conVcards: cardTrendByDay.get(`${day.key}:${cardTypes.consumerVcard}`) ?? 0,
        conCards: cardTrendByDay.get(`${day.key}:${cardTypes.consumerCard}`) ?? 0,
      })),
      recent_users: recentUsers.map((u) => ({
        id: u.id,
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
        email: u.email,
        created_at: u.createdAt,
      })),
      recent_businesses: recentBusinesses.map((b) => ({ id: b.id, name: b.name, slug: b.slug, created_at: b.createdAt })),
      recentConsumers: recentUsers.map((u) => ({
        id: u.id,
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
        membership: u.mcomMembershipLevel ?? '—',
        vcard: '—',
        card: '—',
        additional: '—',
        status: u.status,
        registered: u.createdAt,
      })),
      businessActivity: activity.filter((a) => a.type === 'business'),
      consumerActivity: activity.filter((a) => a.type === 'consumer' || a.type === 'user'),
      vcardActivity: activity.filter((a) => a.type === 'vcard' || a.type === 'card'),
      cardActivity: activity.filter((a) => a.type === 'card'),
      membershipActivity: activity.filter((a) => a.type === 'membership'),
      integrations: [
        { name: 'MCOM Solutions Central Auth', status: process.env.MCOM_SOLUTIONS_URL ? 'connected' : 'not-configured' },
        { name: 'Resend transactional email', status: process.env.RESEND_API_KEY ? 'connected' : 'not-configured' },
        { name: 'Redis response cache', status: this.cache.isRedisConnected() ? 'connected' : 'in-memory' },
      ],
    }
  }

  private async registrationTrend(since: Date) {
    const [users, businesses] = await Promise.all([
      this.userRepo
        .createQueryBuilder('u')
        .select("to_char(date_trunc('day', u.createdAt), 'YYYY-MM-DD')", 'day')
        .addSelect('COUNT(*)', 'count')
        .where('u.createdAt >= :since', { since })
        .groupBy("date_trunc('day', u.createdAt)")
        .getRawMany<TrendRow>(),
      this.businessRepo
        .createQueryBuilder('b')
        .select("to_char(date_trunc('day', b.createdAt), 'YYYY-MM-DD')", 'day')
        .addSelect('COUNT(*)', 'count')
        .where('b.createdAt >= :since', { since })
        .groupBy("date_trunc('day', b.createdAt)")
        .getRawMany<TrendRow>(),
    ])
    return { users, businesses }
  }

  private async cardTrend(since: Date) {
    return this.cardRepo
      .createQueryBuilder('c')
      .select("to_char(date_trunc('day', c.createdAt), 'YYYY-MM-DD')", 'day')
      .addSelect('c.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('c.createdAt >= :since', { since })
      .groupBy("date_trunc('day', c.createdAt)")
      .addGroupBy('c.type')
      .getRawMany<TrendRow & { type: string }>()
  }

  private indexTrend(rows: TrendRow[]): Map<string, number> {
    return new Map(rows.map((row) => [row.day, Number(row.count)]))
  }

  private indexCardTrend(rows: Array<TrendRow & { type: string }>): Map<string, number> {
    return new Map(rows.map((row) => [`${row.day}:${row.type}`, Number(row.count)]))
  }

  private lastSevenDays(): Array<{ key: string; label: string }> {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (6 - index))
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-GB', { weekday: 'short' })
      return { key, label }
    })
  }
}
