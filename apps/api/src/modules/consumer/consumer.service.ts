import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { UsersService } from '../users/users.service'
import { User } from '../users/entities/user.entity'
import { randomBytes } from 'crypto'
import { Card, CardAudience, CardProduct, CardType } from '../cards/entities/card.entity'
import { Template } from '../cards/entities/template.entity'
import { ChildCard } from '../child-cards/entities/child-card.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { SubscribedPlan } from '../subscriptions/entities/subscribed-plan.entity'
import { SubscriptionsService } from '../subscriptions/subscriptions.service'
import { PlansService } from '../plans/plans.service'
import { Wallet } from '../finance/entities/wallet.entity'
import { WalletTransaction } from '../finance/entities/wallet-transaction.entity'
import { RewardBalance } from '../finance/entities/reward-balance.entity'
import { RewardTransaction } from '../finance/entities/reward-transaction.entity'
import { CashbackAccount } from '../finance/entities/cashback-account.entity'
import { Voucher } from '../vouchers/entities/voucher.entity'
import { Referral } from '../affiliates/entities/referral.entity'
import { Share } from '../shares/entities/share.entity'
import { Notification } from '../notifications/entities/notification.entity'
import { Appointment } from '../appointments/entities/appointment.entity'
import { Campaign, CampaignStatus } from '../campaigns/entities/campaign.entity'
import { Offer } from '../campaigns/entities/offer.entity'
import { McomWalletService } from '../mcom/mcom-wallet.service'
import { CacheService } from '../../lib/cache/cache.service'
import { MailService } from '../mail/mail.service'
import { ConsumerWishlistItem } from './entities/consumer-wishlist-item.entity'
import {
  ConsumerActivityQueryDto,
  ConsumerClaimCardDto,
  ConsumerNotificationQueryDto,
  ConsumerPageQueryDto,
  ConsumerRewardQueryDto,
} from './dto/consumer-query.dto'
import {
  CreateConsumerWishlistItemDto,
  UpdateConsumerWishlistItemDto,
} from './dto/consumer-wishlist.dto'
import { UpdateConsumerProfileDto } from './dto/update-consumer-profile.dto'

const CACHE_TTL = 30

const iso = (value?: Date | string | null): string => {
  if (!value) return ''
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

const money = (value: unknown): number => Math.round((Number(value) || 0) * 100) / 100

type PageMeta = { page: number; limit: number; total: number; totalPages: number }

export interface ActivityItem {
  id: string
  action: string
  time: string
  type: string
  status: string
  value?: string
  source?: string
  detailTo?: string
}

@Injectable()
export class ConsumerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly plansService: PlansService,
    private readonly mcomWallet: McomWalletService,
    private readonly cache: CacheService,
    private readonly mail: MailService,
    @InjectRepository(Card) private readonly cardsRepo: Repository<Card>,
    @InjectRepository(Template) private readonly templatesRepo: Repository<Template>,
    @InjectRepository(ChildCard) private readonly childCardsRepo: Repository<ChildCard>,
    @InjectRepository(Membership) private readonly membershipsRepo: Repository<Membership>,
    @InjectRepository(SubscribedPlan) private readonly subscribedPlansRepo: Repository<SubscribedPlan>,
    @InjectRepository(Wallet) private readonly walletsRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction) private readonly walletTxRepo: Repository<WalletTransaction>,
    @InjectRepository(RewardBalance) private readonly rewardBalancesRepo: Repository<RewardBalance>,
    @InjectRepository(RewardTransaction) private readonly rewardTxRepo: Repository<RewardTransaction>,
    @InjectRepository(CashbackAccount) private readonly cashbackRepo: Repository<CashbackAccount>,
    @InjectRepository(Voucher) private readonly vouchersRepo: Repository<Voucher>,
    @InjectRepository(Referral) private readonly referralsRepo: Repository<Referral>,
    @InjectRepository(Share) private readonly sharesRepo: Repository<Share>,
    @InjectRepository(Notification) private readonly notificationsRepo: Repository<Notification>,
    @InjectRepository(Appointment) private readonly appointmentsRepo: Repository<Appointment>,
    @InjectRepository(Campaign) private readonly campaignsRepo: Repository<Campaign>,
    @InjectRepository(Offer) private readonly offersRepo: Repository<Offer>,
    @InjectRepository(ConsumerWishlistItem) private readonly wishlistRepo: Repository<ConsumerWishlistItem>,
  ) {}

  async getProfile(userId: string) {
    return this.cache.getOrSet(this.cacheKey(userId, 'profile'), CACHE_TTL, () => this.buildProfile(userId))
  }

  async updateProfile(userId: string, dto: UpdateConsumerProfileDto) {
    const user = await this.requireUser(userId)
    const patch: Partial<User> = {}

    if (dto.first_name !== undefined) patch.firstName = dto.first_name.trim() || null
    if (dto.last_name !== undefined) patch.lastName = dto.last_name.trim() || null
    if (dto.phone !== undefined) patch.phone = dto.phone.trim() || null
    if (dto.address !== undefined) patch.address = dto.address.trim() || null
    if (dto.postcode !== undefined) patch.postcode = dto.postcode.trim() || null
    if (dto.country !== undefined) patch.country = dto.country.trim() || null

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase()
      if (email !== user.email) {
        const existing = await this.usersService.findByEmail(email)
        if (existing && existing.id !== userId) {
          throw new BadRequestException('That email address is already registered')
        }
        patch.email = email
        patch.isVerified = false
        patch.emailVerifiedAt = null
      }
    }

    await this.usersService.update(userId, patch)
    await this.invalidate(userId)
    return this.buildProfile(userId)
  }

  async getAccess(userId: string) {
    const user = await this.requireUser(userId)
    return { allowed: true, profile_type: user.mcomProfileType ?? null, role: user.mcomRole ?? null }
  }

  async getDashboard(userId: string) {
    const cached = await this.cache.get<Record<string, unknown>>(this.cacheKey(userId, 'dashboard'))
    if (cached) return cached

    const profile = await this.buildProfile(userId)
    const offers = await this.getNearbyOffers({ page: 1, limit: 6 } as never)
    const payload = {
      profile,
      wallet: profile.wallet,
      stats: profile.stats,
      saved_cards: profile.savedCards,
      recent_activity: profile.recentActivity.slice(0, 10),
      nearby_offers: offers.items,
      membership: profile.membership,
      membership_status: profile.membershipStatus,
    }

    await this.cache.set(this.cacheKey(userId, 'dashboard'), payload, CACHE_TTL)
    return payload
  }

  async buildProfile(userId: string) {
    const user = await this.requireUser(userId)
    const [cards, childCards, memberships, subscription] = await Promise.all([
      this.cardsRepo.find({
        where: { ownerId: userId },
        relations: { business: true, template: true },
        order: { createdAt: 'DESC' },
      }),
      this.childCardsRepo.find({
        where: [{ childId: userId }, { card: { ownerId: userId } }],
        relations: { card: true, child: true },
      }),
      this.membershipsRepo.find({
        where: { userId },
        relations: { tier: true },
        order: { createdAt: 'DESC' },
      }),
      this.subscriptionsService.findActiveForUser(userId).catch(() => null),
    ])

    const wallet = await this.loadWallet(user)
    const [rewardBalance, referrals, recentActivity] = await Promise.all([
      this.rewardBalancesRepo.findOne({ where: { userId } }),
      this.loadReferrals(userId, 1, 5),
      this.loadActivity(userId, user, 1, 10),
    ])

    const activeMembership = memberships.find((m) => m.status === 'active') ?? memberships[0] ?? null
    const plan = subscription?.plan ?? null
    const planConfig = (plan?.configuration ?? null) as {
      quotas?: Record<string, number | boolean>
      featureFlags?: Record<string, boolean>
    } | null
    const quotas = planConfig?.quotas ?? {}
    const primary = cards[0] ?? null
    const familyMembers = childCards.filter((c) => String(c.relationship ?? '').toLowerCase() !== 'friend')
    const friendMembers = childCards.filter((c) => String(c.relationship ?? '').toLowerCase() === 'friend')

    const quotaNumber = (...keys: string[]) => {
      for (const key of keys) {
        const raw = quotas[key]
        if (typeof raw === 'number' && Number.isFinite(raw)) return raw
      }
      return 0
    }

    const familyQuota = quotaNumber('familyCards', 'family_cards', 'maxFamilyCards')
    const friendQuota = quotaNumber('friendCards', 'friend_cards', 'maxFriendCards')
    const additionalEntitlements = familyQuota + friendQuota

    const membershipName =
      plan?.name ??
      activeMembership?.tier?.name ??
      user.mcomMembershipLevel ??
      (user.mcomMembershipTier ? `MCOM ${user.mcomMembershipTier}` : 'No active plan')
    const membershipStatus =
      subscription?.status ??
      activeMembership?.status ??
      (user.mcomMembershipStatus ? user.mcomMembershipStatus : user.mcomCanAccessVcard ? 'active' : 'inactive')

    const cardId = primary?.slug ?? primary?.urlSlug ?? ''
    const businessName = primary?.business?.name ?? user.companyName ?? ''

    return {
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      email: user.email,
      phone: user.phone ?? '',
      location: [user.address, user.postcode, user.country].filter(Boolean).join(', '),
      status: user.status as 'active' | 'inactive' | 'suspended',
      joined: iso(user.createdAt),
      consumerId: `MC-CNS-${user.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      centralUserId: user.mcomUserId ?? '',
      membership: membershipName,
      membershipStatus: String(membershipStatus).charAt(0).toUpperCase() + String(membershipStatus).slice(1),
      vcardStatus: user.mcomCanAccessVcard ? 'Active' : 'Inactive',
      cardStatus: primary ? String(primary.status).charAt(0).toUpperCase() + String(primary.status).slice(1) : 'No card',
      additionalEntitlements,
      familyCardLimit: familyQuota,
      friendCardLimit: friendQuota,
      allocatedAdditionalCards: childCards.length,
      familyAllocations: familyMembers.length,
      friendAllocations: friendMembers.length,
      unallocatedEntitlements: Math.max(additionalEntitlements - childCards.length, 0),
      primaryIssuingBusiness: businessName,
      primaryIssuingBusinessId: primary?.businessId ?? '',
      businessCount: new Set(cards.map((c) => c.businessId).filter(Boolean)).size,
      registrationSource: user.mcomUserId ? 'MCOM Solutions' : 'MCOMVCard',
      lastActivityAt: iso(user.updatedAt),
      allocationType: childCards.length ? (friendMembers.length ? 'Family & Friends' : 'Family') : 'None',
      wallet,
      cardBalance: money(wallet.cardBalance),
      stats: {
        cards: cards.length,
        rewards: money(rewardBalance?.balance ?? 0),
        referrals: referrals.total,
        scans: cards.reduce((sum, card) => sum + (Number(card.scans) || 0), 0),
      },
      savedCards: cards.map((card) => this.mapCard(card)),
      rewardHistory: [],
      referrals: referrals.items,
      recentActivity: recentActivity.items,
      cardId,
      cardTemplate: primary?.template?.name ?? primary?.name ?? '',
      cardCreated: iso(primary?.createdAt),
      cardUpdated: iso(primary?.updatedAt),
      cardSource: primary?.business ? 'Business' : 'MCOMVCard',
      cardAcquisitionMethod: primary?.businessId ? 'Issued' : 'Self-created',
      cardSourcePlatform: primary?.business?.name ?? '',
      qrStatus: primary ? 'Active' : 'Not issued',
      qrId: primary ? `QR-${primary.id.slice(0, 6).toUpperCase()}` : '',
      qrLastScanned: '',
      qrUpdateFrequency: 'On change',
      qrLastContentUpdate: iso(primary?.updatedAt),
      eCardStatus: wallet.giftCards > 0 ? 'Available' : 'None',
      eCardFaceValue: wallet.giftCards > 0 ? `£${wallet.giftCards.toFixed(2)}` : '',
      eCardSource: '',
      eCardId: '',
      eCardIssueDate: '',
      eCardExpiryDate: '',
      additionalCards: childCards.map((child) => ({
        id: child.id,
        name: [child.child?.firstName, child.child?.lastName].filter(Boolean).join(' ') || child.child?.email || 'Family member',
        relationship: child.relationship ?? 'Family',
        status: child.canUseWallet ? 'Active' : 'Suspended',
        locked: !child.canManage,
        allocatedAt: iso(child.createdAt),
      })),
      shareContent: await this.loadShareContent(userId, cards),
      cardActivity: recentActivity.items.map((item) => ({
        action: item.action,
        time: item.time,
        type: item.type,
        actor: 'You',
        source: item.source ?? 'MCOMVCard',
        status: item.status,
      })),
      membershipHistory: memberships.map((m) => ({
        state: m.tier?.name ?? membershipName,
        date: iso(m.startedAt),
      })),
      plan: plan ? this.mapPlan(plan, subscription) : null,
      expiresAt: subscription?.expiresAt ? iso(subscription.expiresAt) : null,
    }
  }

  /**
   * Add an existing business card (or a published template) to the customer's
   * account. This is the customer-safe alternative to the business-only
   * /cards/claim endpoint and powers invite links (?card=<slug>).
   */
  async claimCard(userId: string, dto: ConsumerClaimCardDto) {
    let source: Card | null = null
    let template: Template | null = null

    if (dto.card_id) {
      source = await this.cardsRepo.findOne({ where: [{ id: dto.card_id }, { slug: dto.card_id }] })
    }

    if (!source && dto.template_id) {
      template = await this.templatesRepo.findOne({ where: { id: dto.template_id } })
      if (!template) template = await this.templatesRepo.findOne({ where: { slug: dto.template_id } })
      if (!template) throw new NotFoundException('Template not found')
    }

    if (!source && !template) throw new NotFoundException('Card not found')

    const templateId = source?.templateId ?? template?.id ?? null
    const businessId = source?.businessId ?? dto.business_id ?? null

    const name = source?.name ?? template?.name ?? 'My MCOM card'
    const where: Record<string, unknown> = { ownerId: userId }
    if (templateId) where.templateId = templateId
    if (businessId) where.businessId = businessId
    if (!templateId && !businessId) where.name = name

    const existing = await this.cardsRepo.findOne({
      where: where as never,
      relations: { business: true, template: true },
    })
    if (existing) return this.mapCard(existing)
    const card = await this.cardsRepo.save(
      this.cardsRepo.create({
        ownerId: userId,
        businessId,
        templateId,
        type: CardType.CONSUMER_STORE_CARD,
        cardProduct: CardProduct.CARD,
        audience: CardAudience.CONSUMER,
        slug: `customer-${randomBytes(5).toString('hex')}`,
        name,
        description: source?.description ?? null,
        category: source?.category ?? template?.category ?? null,
        status: 'active',
        assignedAt: new Date(),
      }),
    )

    await this.invalidate(userId)
    return this.mapCard(await this.cardsRepo.findOne({ where: { id: card.id }, relations: { business: true, template: true } }) as Card)
  }

  async getWallet(userId: string) {
    const user = await this.requireUser(userId)
    return this.loadWallet(user)
  }

  private async loadWallet(user: User) {
    const [localWallet, reward, cashback, vouchers] = await Promise.all([
      this.walletsRepo.findOne({ where: { userId: user.id } }),
      this.rewardBalancesRepo.findOne({ where: { userId: user.id } }),
      this.cashbackRepo.findOne({ where: { userId: user.id } }),
      this.vouchersRepo.count({ where: { assignedToUserId: user.id, status: 'AVAILABLE' } }),
    ])

    let centralBalance = 0
    let centralAvailable = 0
    let centralCurrency = ''

    if (user.mcomUserId && this.mcomWallet.enabled) {
      try {
        const balance = await this.mcomWallet.getBalance(user.mcomUserId)
        centralBalance = money(balance.balance)
        centralAvailable = money(balance.availableBalance)
        centralCurrency = balance.currency || 'MCOM'
      } catch {
        // Central wallet unavailable — fall back to the local ledger.
      }
    }

    const balance = centralBalance || money(localWallet?.balance ?? 0)
    const cardBalance = money(localWallet?.balance ?? 0)

    return {
      balance,
      available: centralBalance ? centralAvailable : balance,
      currency: centralCurrency || localWallet?.currency || 'GBP',
      points: money(reward?.balance ?? 0),
      cashback: money(cashback?.balance ?? 0),
      giftCards: 0,
      coupons: 0,
      vouchers,
      pending: centralBalance ? Math.max(centralBalance - centralAvailable, 0) : 0,
      locked: 0,
      cardBalance,
    }
  }

  async getWalletTransactions(userId: string, query: ConsumerPageQueryDto) {
    const { page, limit } = this.page(query)
    const wallet = await this.walletsRepo.findOne({ where: { userId } })
    if (!wallet) return { items: [], meta: this.meta(page, limit, 0) }

    const [rows, total] = await this.walletTxRepo.findAndCount({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })

    return {
      items: rows.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: money(tx.amount),
        balance_after: money(tx.balanceAfter),
        description: tx.description,
        created_at: iso(tx.createdAt),
      })),
      meta: this.meta(page, limit, total),
    }
  }

  async getCards(userId: string, query: ConsumerPageQueryDto) {
    const { page, limit } = this.page(query)
    const [rows, total] = await this.cardsRepo.findAndCount({
      where: { ownerId: userId },
      relations: { business: true, template: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })

    return { items: rows.map((card) => this.mapCard(card)), meta: this.meta(page, limit, total) }
  }

  private mapCard(card: Card) {
    return {
      id: card.id,
      slug: card.slug,
      name: card.name ?? card.slug,
      business: card.business?.name ?? 'MCOMVCard',
      type: this.cardCategory(card),
      source: card.businessId ? 'Issuing Business' : 'MCOMVCard',
      editable: true,
      status: card.status,
      audience: card.audience,
      template: card.template?.name ?? null,
      views: card.views,
      scans: card.scans,
      shares: card.shares,
      created_at: iso(card.createdAt),
      updated_at: iso(card.updatedAt),
    }
  }

  private cardCategory(card: Card) {
    const type = String(card.type || '').toUpperCase()
    if (type.includes('STORE')) return 'Loyalty'
    if (type.includes('EVENT')) return 'Rewards'
    return 'Membership'
  }

  async getMembership(userId: string) {
    const user = await this.requireUser(userId)
    const [subscription, memberships] = await Promise.all([
      this.subscriptionsService.findActiveForUser(userId).catch(() => null),
      this.membershipsRepo.find({ where: { userId }, relations: { tier: true }, order: { createdAt: 'DESC' } }),
    ])

    return {
      active: subscription ? this.mapPlan(subscription.plan, subscription) : null,
      tier: memberships.find((m) => m.status === 'active')?.tier ?? memberships[0]?.tier ?? null,
      history: memberships.map((m) => ({
        id: m.id,
        state: m.tier?.name ?? user.mcomMembershipLevel ?? 'Membership',
        status: m.status,
        started_at: iso(m.startedAt),
        expires_at: m.expiresAt ? iso(m.expiresAt) : null,
      })),
      central: {
        level: user.mcomMembershipLevel,
        tier: user.mcomMembershipTier,
        status: user.mcomMembershipStatus,
        can_access_vcard: user.mcomCanAccessVcard,
      },
    }
  }

  private mapPlan(plan: SubscribedPlan['plan'], subscription: SubscribedPlan | null) {
    const config = (plan?.configuration ?? null) as {
      quotas?: Record<string, number | boolean>
      featureFlags?: Record<string, boolean>
    } | null

    return {
      id: plan?.id ?? subscription?.planId ?? '',
      name: plan?.name ?? 'MCOM VCard plan',
      level: plan?.level ?? null,
      audience: plan?.audience ?? null,
      status: subscription?.status ?? plan?.status ?? 'active',
      started_at: subscription?.startedAt ? iso(subscription.startedAt) : null,
      expires_at: subscription?.expiresAt ? iso(subscription.expiresAt) : null,
      quotas: config?.quotas ?? {},
      feature_flags: config?.featureFlags ?? {},
      features: Array.isArray(plan?.features) ? plan.features.map((f) => f.text).filter(Boolean) : [],
    }
  }

  async getRewards(userId: string, query: ConsumerRewardQueryDto) {
    const { page, limit } = this.page(query)
    const balance = await this.rewardBalancesRepo.findOne({ where: { userId } })
    if (!balance) return { items: [], meta: this.meta(page, limit, 0), balance: 0 }

    const qb = this.rewardTxRepo
      .createQueryBuilder('tx')
      .where('tx.rewardBalanceId = :balanceId', { balanceId: balance.id })

    const status = query.status && query.status !== 'all' ? query.status : undefined
    if (status === 'available') qb.andWhere('tx.type = :type', { type: 'EARN' })
    if (status === 'redeemed') qb.andWhere('tx.type = :type', { type: 'REDEEM' })
    if (status === 'expired') qb.andWhere('tx.type = :type', { type: 'EXPIRE' })

    const total = await qb.getCount()
    const rows = await qb.orderBy('tx.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getMany()

    return {
      items: rows.map((tx) => ({
        id: tx.id,
        reward: tx.description || `${tx.type} reward points`,
        points: money(tx.amount),
        date: iso(tx.createdAt),
        status: tx.type === 'REDEEM' ? 'redeemed' : tx.type === 'EXPIRE' ? 'expired' : 'available',
        type: tx.type,
        balance_after: money(tx.balanceAfter),
      })),
      meta: this.meta(page, limit, total),
      balance: money(balance.balance),
    }
  }

  async getActivity(userId: string, query: ConsumerActivityQueryDto) {
    const { page, limit } = this.page(query)
    const user = await this.requireUser(userId)
    return this.loadActivity(userId, user, page, limit, query.type)
  }

  private async loadActivity(userId: string, user: User, page: number, limit: number, filter?: string) {
    const activity: ActivityItem[] = []

    const [walletTx, rewardTx, shares, children, memberships, appointments, vouchers] = await Promise.all([
      this.walletTxRepo
        .createQueryBuilder('tx')
        .innerJoin(Wallet, 'w', 'w.id = tx.walletId')
        .where('w.userId = :userId', { userId })
        .orderBy('tx.createdAt', 'DESC')
        .limit(100)
        .getMany()
        .catch(() => []),
      this.rewardTxRepo
        .createQueryBuilder('tx')
        .innerJoin(RewardBalance, 'rb', 'rb.id = tx.rewardBalanceId')
        .where('rb.userId = :userId', { userId })
        .orderBy('tx.createdAt', 'DESC')
        .limit(100)
        .getMany()
        .catch(() => []),
      this.sharesRepo.find({ where: { userId }, relations: { card: true }, order: { createdAt: 'DESC' }, take: 100 }).catch(() => []),
      this.childCardsRepo.find({
        where: [{ childId: userId }, { card: { ownerId: userId } }],
        relations: { child: true },
        order: { createdAt: 'DESC' },
        take: 50,
      }).catch(() => []),
      this.membershipsRepo.find({ where: { userId }, relations: { tier: true }, order: { createdAt: 'DESC' }, take: 50 }).catch(() => []),
      this.appointmentsRepo.find({ where: { customerEmail: user.email }, order: { createdAt: 'DESC' }, take: 100 }).catch(() => []),
      this.vouchersRepo.find({ where: { assignedToUserId: userId }, order: { createdAt: 'DESC' }, take: 100 }).catch(() => []),
    ])

    for (const tx of walletTx) {
      activity.push({
        id: `wallet-${tx.id}`,
        action: tx.description || (tx.type === 'CREDIT' ? 'Wallet credited' : 'Wallet debited'),
        time: iso(tx.createdAt),
        type: tx.type === 'CREDIT' ? 'funding' : 'wallet',
        status: 'Completed',
        value: `${tx.type === 'CREDIT' ? '+' : '−'}${money(tx.amount).toFixed(2)}`,
        source: 'MCOM Wallet',
        detailTo: '/c/wallet',
      })
    }

    for (const tx of rewardTx) {
      activity.push({
        id: `reward-${tx.id}`,
        action: tx.description || `${tx.type} reward points`,
        time: iso(tx.createdAt),
        type: tx.type === 'REDEEM' ? 'reward' : 'earn',
        status: tx.type === 'EXPIRE' ? 'Expired' : 'Completed',
        value: `${tx.type === 'REDEEM' || tx.type === 'EXPIRE' ? '−' : '+'}${money(tx.amount).toFixed(0)} pts`,
        source: 'MCOM Rewards',
        detailTo: '/c/rewards',
      })
    }

    for (const share of shares) {
      activity.push({
        id: `share-${share.id}`,
        action: `Shared ${share.card?.name ?? 'your card'} via ${share.platform}`,
        time: iso(share.createdAt),
        type: 'share',
        status: 'Completed',
        source: 'MCOMVCard',
        detailTo: '/c/cards',
      })
    }

    for (const child of children) {
      activity.push({
        id: `family-${child.id}`,
        action: `Family card linked for ${[child.child?.firstName, child.child?.lastName].filter(Boolean).join(' ') || child.child?.email || 'a family member'}`,
        time: iso(child.createdAt),
        type: 'family',
        status: child.canUseWallet ? 'Active' : 'Suspended',
        source: 'Family',
        detailTo: '/c/family',
      })
    }

    for (const membership of memberships) {
      activity.push({
        id: `membership-${membership.id}`,
        action: `Membership ${membership.status}: ${membership.tier?.name ?? 'MCOM membership'}`,
        time: iso(membership.startedAt),
        type: 'membership',
        status: membership.status,
        source: 'MCOMVCard',
        detailTo: '/c/membership',
      })
    }

    for (const appointment of appointments) {
      activity.push({
        id: `booking-${appointment.id}`,
        action: `Appointment booked for ${appointment.date} at ${appointment.startTime}`,
        time: iso(appointment.createdAt),
        type: 'booking',
        status: appointment.status,
        source: 'Booking',
        detailTo: '/c/bookings',
      })
    }

    for (const voucher of vouchers) {
      activity.push({
        id: `voucher-${voucher.id}`,
        action: `Voucher ${voucher.title}`,
        time: iso(voucher.createdAt),
        type: 'voucher',
        status: voucher.status,
        value: `${money(voucher.value).toFixed(2)} ${voucher.currency}`,
        source: 'Voucher',
        detailTo: '/c/wallet',
      })
    }

    const filtered = filter && filter !== 'all' ? activity.filter((item) => item.type === filter) : activity
    filtered.sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0))

    const total = filtered.length
    const start = (page - 1) * limit
    return { items: filtered.slice(start, start + limit), meta: this.meta(page, limit, total) }
  }

  async getReferrals(userId: string, query: ConsumerPageQueryDto) {
    const { page, limit } = this.page(query)
    return this.loadReferrals(userId, page, limit)
  }

  private async loadReferrals(userId: string, page: number, limit: number) {
    const qb = this.referralsRepo
      .createQueryBuilder('referral')
      .innerJoin('referral.affiliate', 'affiliate')
      .leftJoinAndSelect('referral.referredUser', 'referredUser')
      .where('affiliate.userId = :userId', { userId })

    const total = await qb.getCount()
    const rows = await qb.orderBy('referral.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getMany()

    return {
      items: rows.map((referral) => ({
        id: referral.id,
        name: [referral.referredUser?.firstName, referral.referredUser?.lastName].filter(Boolean).join(' ') || referral.referredUser?.email || 'Friend',
        email: referral.referredUser?.email ?? '',
        joined: iso(referral.createdAt),
        reward: referral.status === 'REWARDED' ? '200 pts' : 'Pending',
        status: referral.status,
        source: referral.source,
      })),
      meta: this.meta(page, limit, total),
      total,
    }
  }

  async inviteReferral(userId: string, email: string) {
    const user = await this.requireUser(userId)
    const trimmed = email.trim().toLowerCase()
    if (trimmed === user.email) throw new BadRequestException('You cannot refer yourself')

    const existing = await this.usersService.findByEmail(trimmed)
    if (existing) throw new BadRequestException('That person already has an MCOM account')

    const inviter = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    await this.mail.sendReferralInvite(trimmed, inviter)
    return { message: 'Invitation sent', email: trimmed }
  }

  async getNotifications(userId: string, query: ConsumerNotificationQueryDto) {
    const { page, limit } = this.page(query)
    const qb = this.notificationsRepo.createQueryBuilder('n').where('n.userId = :userId', { userId })

    if (query.filter === 'unread') qb.andWhere('n.readAt IS NULL')
    if (query.filter === 'read') qb.andWhere('n.readAt IS NOT NULL')

    const total = await qb.getCount()
    const rows = await qb.orderBy('n.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getMany()
    const unread = await this.notificationsRepo.count({ where: { userId, readAt: IsNull() } })

    return { items: rows.map((n) => this.mapNotification(n)), meta: this.meta(page, limit, total), unread }
  }

  async markNotification(userId: string, id: string, read: boolean) {
    const notification = await this.notificationsRepo.findOne({ where: { id, userId } })
    if (!notification) throw new NotFoundException('Notification not found')

    notification.readAt = read ? new Date() : null
    await this.notificationsRepo.save(notification)
    return this.mapNotification(notification)
  }

  async markAllNotificationsRead(userId: string) {
    await this.notificationsRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('read_at IS NULL')
      .execute()

    return { message: 'All notifications marked as read' }
  }

  async removeNotification(userId: string, id: string) {
    const notification = await this.notificationsRepo.findOne({ where: { id, userId } })
    if (!notification) throw new NotFoundException('Notification not found')

    await this.notificationsRepo.delete(id)
    return { message: 'Notification removed' }
  }

  private mapNotification(n: Notification) {
    const type = String(n.type || 'system').toLowerCase()
    const category = ['cashback', 'reward', 'offer', 'voucher', 'family'].includes(type) ? type : 'reward'

    return {
      id: n.id,
      title: n.title,
      message: n.message ?? '',
      time: iso(n.createdAt),
      type: category,
      read: !!n.readAt,
      icon: this.notificationIcon(category),
      color: this.notificationColor(category),
      action: this.notificationAction(category),
    }
  }

  private notificationIcon(type: string) {
    const icons: Record<string, string> = {
      cashback: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      offer: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      voucher: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
      family: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      reward: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    }
    return icons[type] ?? icons.reward
  }

  private notificationColor(type: string) {
    const colors: Record<string, string> = {
      cashback: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      offer: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20',
      voucher: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
      family: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      reward: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    }
    return colors[type] ?? colors.reward
  }

  private notificationAction(type: string) {
    const actions: Record<string, { label: string; to: string }> = {
      cashback: { label: 'View Wallet', to: '/c/wallet' },
      offer: { label: 'View Offers', to: '/c/dashboard' },
      voucher: { label: 'Use Voucher', to: '/c/wallet' },
      family: { label: 'View Family', to: '/c/family' },
      reward: { label: 'View Rewards', to: '/c/rewards' },
    }
    return actions[type] ?? actions.reward
  }

  async getBookings(userId: string, query: ConsumerPageQueryDto) {
    const { page, limit } = this.page(query)
    const user = await this.requireUser(userId)

    const [rows, total] = await this.appointmentsRepo.findAndCount({
      where: { customerEmail: user.email },
      relations: { business: true, service: true },
      order: { date: 'DESC', startTime: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })

    return {
      items: rows.map((appointment) => ({
        id: appointment.id,
        business: appointment.business?.name ?? 'Business',
        business_id: appointment.businessId,
        service: appointment.service?.name ?? 'Appointment',
        date: appointment.date,
        time: appointment.startTime,
        status: appointment.status,
        notes: appointment.notes,
        created_at: iso(appointment.createdAt),
      })),
      meta: this.meta(page, limit, total),
    }
  }

  async getNearbyOffers(query: ConsumerPageQueryDto & { category?: string }) {
    const { page, limit } = this.page(query)
    const now = new Date()

    const qb = this.offersRepo
      .createQueryBuilder('offer')
      .innerJoinAndSelect('offer.campaign', 'campaign')
      .innerJoinAndSelect('offer.business', 'business')
      .where('offer.isActive = :active', { active: true })
      .andWhere('campaign.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere('(campaign.startsAt IS NULL OR campaign.startsAt <= :now)', { now })
      .andWhere('(campaign.endsAt IS NULL OR campaign.endsAt >= :now)', { now })

    if (query.category) {
      qb.andWhere('business.name ILIKE :category', { category: `%${query.category}%` })
    }

    const total = await qb.getCount()
    const rows = await qb.orderBy('offer.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getMany()

    return {
      items: rows.map((offer) => ({
        id: offer.id,
        business: offer.business?.name ?? 'Business',
        category: offer.business?.name ?? 'Offer',
        offer: offer.title,
        description: offer.description ?? '',
        discount:
          offer.discountType === 'PERCENT'
            ? `${offer.discountValue}% off`
            : `${money(offer.discountValue).toFixed(2)} off`,
        discount_type: offer.discountType,
        discount_value: offer.discountValue,
        starts_at: offer.campaign?.startsAt ? iso(offer.campaign.startsAt) : null,
        ends_at: offer.campaign?.endsAt ? iso(offer.campaign.endsAt) : null,
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        gradient: 'from-amber-500 to-orange-600',
      })),
      meta: this.meta(page, limit, total),
    }
  }

  async getExchangeItems(query: ConsumerPageQueryDto) {
    const { page, limit } = this.page(query)

    const qb = this.offersRepo
      .createQueryBuilder('offer')
      .innerJoinAndSelect('offer.business', 'business')
      .where('offer.isActive = :active', { active: true })

    const total = await qb.getCount()
    const rows = await qb.orderBy('offer.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getMany()

    return {
      items: rows.map((offer) => ({
        id: offer.id,
        title: offer.title,
        type: 'Offer',
        business: offer.business?.name ?? 'Business',
        value:
          offer.discountType === 'PERCENT'
            ? `${offer.discountValue}%`
            : `${money(offer.discountValue).toFixed(2)}`,
        expires: offer.updatedAt ? iso(offer.updatedAt) : '',
        icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
      })),
      meta: this.meta(page, limit, total),
    }
  }

  async getRedeemItems(userId: string, query: ConsumerPageQueryDto) {
    const { page, limit } = this.page(query)

    const qb = this.vouchersRepo
      .createQueryBuilder('voucher')
      .where('voucher.assignedToUserId = :userId', { userId })
      .andWhere('voucher.status = :status', { status: 'AVAILABLE' })

    const total = await qb.getCount()
    const rows = await qb.orderBy('voucher.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getMany()

    return {
      items: rows.map((voucher) => ({
        id: voucher.id,
        title: voucher.title,
        type: 'Gift Card',
        business: 'MCOMVCard',
        value: `${money(voucher.value).toFixed(2)} ${voucher.currency}`,
        expires: voucher.expiresAt ? iso(voucher.expiresAt) : '',
        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      })),
      meta: this.meta(page, limit, total),
    }
  }

  async getWishlist(userId: string) {
    const rows = await this.wishlistRepo.find({ where: { userId }, order: { createdAt: 'DESC' } })
    return rows.map((item) => this.mapWish(item))
  }

  async addWish(userId: string, dto: CreateConsumerWishlistItemDto) {
    const saved = await this.wishlistRepo.save(
      this.wishlistRepo.create({
        userId,
        title: dto.title.trim(),
        price: dto.price?.trim() || null,
        image: dto.image || null,
        emoji: dto.emoji || '🎁',
        gradient: dto.gradient || 'from-rose-50 to-pink-100 dark:from-rose-500/10 dark:to-pink-500/10',
      }),
    )
    await this.invalidate(userId)
    return this.mapWish(saved)
  }

  async updateWish(userId: string, id: string, dto: UpdateConsumerWishlistItemDto) {
    const item = await this.wishlistRepo.findOne({ where: { id, userId } })
    if (!item) throw new NotFoundException('Wish list item not found')

    if (dto.title !== undefined) item.title = dto.title.trim()
    if (dto.price !== undefined) item.price = dto.price.trim() || null
    if (dto.image !== undefined) item.image = dto.image || null
    if (dto.emoji !== undefined) item.emoji = dto.emoji || '🎁'
    if (dto.gradient !== undefined) item.gradient = dto.gradient

    const saved = await this.wishlistRepo.save(item)
    await this.invalidate(userId)
    return this.mapWish(saved)
  }

  async removeWish(userId: string, id: string) {
    const item = await this.wishlistRepo.findOne({ where: { id, userId } })
    if (!item) throw new NotFoundException('Wish list item not found')

    await this.wishlistRepo.delete({ id, userId })
    await this.invalidate(userId)
    return { message: 'Wish list item removed' }
  }

  private mapWish(item: ConsumerWishlistItem) {
    return {
      id: item.id,
      title: item.title,
      price: item.price ?? undefined,
      image: item.image ?? undefined,
      emoji: item.emoji,
      gradient: item.gradient,
      created_at: iso(item.createdAt),
    }
  }

  private async loadShareContent(userId: string, cards: Card[]) {
    const shares = await this.sharesRepo.find({
      where: { userId },
      relations: { card: true },
      order: { createdAt: 'DESC' },
      take: 20,
    })

    if (shares.length) {
      return shares.map((share) => ({
        id: share.id,
        title: share.card?.name ?? 'Shared card',
        source: share.platform || 'MCOMVCard',
        status: 'Active',
        availableUntil: '',
      }))
    }

    return cards.slice(0, 5).map((card) => ({
      id: card.id,
      title: card.name ?? card.slug,
      source: card.business?.name ?? 'MCOMVCard',
      status: String(card.status) === 'active' ? 'Active' : 'Inactive',
      availableUntil: '',
    }))
  }

  private async requireUser(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId)
    if (!user) throw new NotFoundException('Customer account not found')
    return user
  }

  async invalidate(userId: string) {
    await Promise.all([
      this.cache.del(this.cacheKey(userId, 'profile')),
      this.cache.del(this.cacheKey(userId, 'dashboard')),
    ])
  }

  private cacheKey(userId: string, suffix: string) {
    return `consumer:${userId}:${suffix}`
  }

  private page(query: ConsumerPageQueryDto) {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
    return { page, limit }
  }

  private meta(page: number, limit: number, total: number): PageMeta {
    return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
  }
}
