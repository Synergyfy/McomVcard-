import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, QueryFailedError } from 'typeorm'
import { SubscribedPlan } from './entities/subscribed-plan.entity'
import { User } from '../users/entities/user.entity'
import { CreateSubscribedPlanDto, UpdateSubscribedPlanDto } from './dto/subscribed-plan.dto'
import { AdminPaginatedQueryDto, PaginatedResult } from '../admin/dto/admin-paginated-query.dto'
import type { PlanVariantKey } from '../plans/entities/plan.entity'

const DAY_MS = 24 * 60 * 60 * 1000

export interface ActivatePlanInput {
  userId: string
  planId: string
  /** Whole days of access granted by the paid variant (90 / 180 / 365). */
  durationDays: number
  /** MCOM Pay charge id — makes activation idempotent. */
  paymentReference?: string | null
  planName?: string | null
  level?: string | null
  tier?: string | null
  /** Purchased variant, persisted for entitlement/capability resolution. */
  variant?: PlanVariantKey | null
}

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscribedPlan)
    private readonly subscribedPlanRepository: Repository<SubscribedPlan>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(query: AdminPaginatedQueryDto): Promise<PaginatedResult<SubscribedPlan>> {
    const { page = 1, limit = 20, search, status } = query

    const qb = this.subscribedPlanRepository
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.user', 'user')
      .leftJoinAndSelect('sp.plan', 'plan')

    if (status) {
      qb.andWhere('sp.status = :status', { status })
    }

    if (search) {
      qb.andWhere('(user.email ILIKE :search OR plan.name ILIKE :search)', { search: `%${search}%` })
    }

    const [data, total] = await qb
      .orderBy('sp.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<SubscribedPlan> {
    const subscribedPlan = await this.subscribedPlanRepository.findOne({
      where: { id },
      relations: ['user', 'plan'],
    })
    if (!subscribedPlan) {
      throw new NotFoundException('Subscribed plan not found')
    }
    return subscribedPlan
  }

  /** The user's current active, unexpired plan (if any). */
  async findActiveForUser(userId: string): Promise<SubscribedPlan | null> {
    const plans = await this.subscribedPlanRepository.find({
      where: { userId, status: 'active' },
      relations: ['plan'],
      order: { expiresAt: 'DESC' },
    })

    const now = Date.now()
    for (const plan of plans) {
      if (!plan.expiresAt || plan.expiresAt.getTime() > now) return plan
      plan.status = 'expired'
      await this.subscribedPlanRepository.save(plan)
    }

    return null
  }

  /** True when the user has a locally paid, unexpired plan. */
  async hasActivePlan(userId: string): Promise<boolean> {
    return (await this.findActiveForUser(userId)) !== null
  }

  /**
   * Activate (or extend) a paid plan after a successful MCOM Wallet charge.
   *
   * - One active plan per user: any other active plan is expired.
   * - Renewals extend from the current expiry when it is still in the future.
   * - `paymentReference` (the MCOM Pay charge id) makes the call idempotent:
   *   a retried request or a duplicated webhook never extends access twice.
   */
  async activatePlan(input: ActivatePlanInput): Promise<SubscribedPlan> {
    if (!(input.durationDays > 0)) {
      throw new BadRequestException('A positive plan duration is required')
    }

    try {
      return await this.subscribedPlanRepository.manager.transaction(async (manager) => {
        if (input.paymentReference) {
          const already = await manager.findOne(SubscribedPlan, {
            where: { userId: input.userId, paymentReference: input.paymentReference },
          })
          if (already) return already
        }

        const now = new Date()
        const active = await manager.find(SubscribedPlan, {
          where: { userId: input.userId, status: 'active' },
        })
        const target = active.find((plan) => plan.planId === input.planId)

        for (const plan of active) {
          if (target && plan.id === target.id) continue
          await manager.update(
            SubscribedPlan,
            { id: plan.id },
            { status: 'expired', expiresAt: now },
          )
        }

        const base =
          target?.expiresAt && target.expiresAt.getTime() > now.getTime() ? target.expiresAt : now
        const expiresAt = new Date(base.getTime() + input.durationDays * DAY_MS)

        let saved: SubscribedPlan
        if (target) {
          target.status = 'active'
          target.expiresAt = expiresAt
          if (input.variant) target.variant = input.variant
          if (input.paymentReference) target.paymentReference = input.paymentReference
          saved = await manager.save(target)
        } else {
          saved = await manager.save(
            manager.create(SubscribedPlan, {
              userId: input.userId,
              planId: input.planId,
              status: 'active',
              startedAt: now,
              expiresAt,
              variant: input.variant ?? null,
              paymentReference: input.paymentReference ?? null,
            }),
          )
        }

        await manager.update(User, { id: input.userId }, {
          mcomCanAccessVcard: true,
          mcomMembershipStatus: 'active',
          ...(input.level ? { mcomMembershipLevel: input.level } : {}),
          ...(input.tier ? { mcomMembershipTier: input.tier } : {}),
        })

        return saved
      })
    } catch (err) {
      // A concurrent webhook/confirm won the unique payment reference. Replay
      // the winning subscription instead of extending access twice.
      if (
        input.paymentReference &&
        err instanceof QueryFailedError &&
        (err as any)?.driverError?.code === '23505'
      ) {
        const existing = await this.subscribedPlanRepository.findOne({
          where: { userId: input.userId, paymentReference: input.paymentReference },
        })
        if (existing) return existing
      }
      throw err
    }
  }

  /**
   * Cancel a locally paid plan (used when a full MCOM Pay refund is settled).
   * Access is revoked only when no other local plan remains active.
   */
  async cancelPaidPlan(userId: string, planId: string): Promise<void> {
    await this.subscribedPlanRepository.manager.transaction(async (manager) => {
      const now = new Date()
      await manager.update(
        SubscribedPlan,
        { userId, planId, status: 'active' },
        { status: 'cancelled', expiresAt: now },
      )

      const remaining = await manager.find(SubscribedPlan, {
        where: { userId, status: 'active' },
      })
      const stillActive = remaining.some(
        (plan) => !plan.expiresAt || plan.expiresAt.getTime() > now.getTime(),
      )

      await manager.update(User, { id: userId }, {
        mcomCanAccessVcard: stillActive,
        mcomMembershipStatus: stillActive ? 'active' : 'cancelled',
      })
    })
  }

  async create(dto: CreateSubscribedPlanDto): Promise<SubscribedPlan> {
    const subscribedPlan = this.subscribedPlanRepository.create({
      userId: dto.userId,
      planId: dto.planId,
      status: (dto.status as any) ?? 'active',
      startedAt: new Date(dto.startedAt),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    })
    return this.subscribedPlanRepository.save(subscribedPlan)
  }

  async update(id: string, dto: UpdateSubscribedPlanDto): Promise<SubscribedPlan> {
    const subscribedPlan = await this.findOne(id)

    if (dto.status !== undefined) subscribedPlan.status = dto.status as any
    if (dto.expiresAt !== undefined) subscribedPlan.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null

    return this.subscribedPlanRepository.save(subscribedPlan)
  }

  async cancel(id: string): Promise<SubscribedPlan> {
    const subscribedPlan = await this.findOne(id)

    if (subscribedPlan.status === 'cancelled') {
      throw new BadRequestException('Subscription is already cancelled')
    }

    subscribedPlan.status = 'cancelled'
    subscribedPlan.expiresAt = new Date()
    return this.subscribedPlanRepository.save(subscribedPlan)
  }

  async remove(id: string): Promise<void> {
    const subscribedPlan = await this.findOne(id)
    await this.subscribedPlanRepository.remove(subscribedPlan)
  }
}
