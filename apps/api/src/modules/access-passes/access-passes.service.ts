import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryFailedError, Repository } from 'typeorm'
import { AccessPass } from './entities/access-pass.entity'
import { AccessPassPurchase } from './entities/access-pass-purchase.entity'
import { User } from '../users/entities/user.entity'
import { SubscribedPlan } from '../subscriptions/entities/subscribed-plan.entity'
import { PlanConfiguration, PlanFeature } from '../plans/entities/plan.entity'
import {
  CreateAccessPassDto,
  UpdateAccessPassDto,
} from './dto/access-pass.dto'
import { AccessPassResponseDto } from './dto/access-pass-response.dto'

const DAY_MS = 24 * 60 * 60 * 1000

export interface ActivateAccessPassInput {
  userId: string
  accessPassId: string
  /** MCOM Pay charge id — makes activation idempotent. */
  paymentReference?: string | null
}

/** Expiry timestamp used to compare competing entitlements. */
export function expiryTime(value?: Date | null): number {
  return value ? value.getTime() : Number.POSITIVE_INFINITY
}

@Injectable()
export class AccessPassesService {
  constructor(
    @InjectRepository(AccessPass)
    private readonly accessPassRepository: Repository<AccessPass>,
    @InjectRepository(AccessPassPurchase)
    private readonly purchaseRepository: Repository<AccessPassPurchase>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(SubscribedPlan)
    private readonly subscribedPlansRepository: Repository<SubscribedPlan>,
  ) {}

  async create(dto: CreateAccessPassDto): Promise<AccessPassResponseDto> {
    const name = dto.name?.trim()
    if (!name) {
      throw new BadRequestException('Access pass name is required')
    }
    if (!(dto.durationDays > 0)) {
      throw new BadRequestException('Access pass duration must be at least 1 day')
    }

    const existing = await this.accessPassRepository.findOne({ where: { name } })
    if (existing) {
      throw new BadRequestException(`Access pass with name "${name}" already exists`)
    }

    const pass = this.accessPassRepository.create({
      name,
      description: dto.description?.trim() || null,
      price: dto.price ?? 0,
      durationDays: dto.durationDays,
      currency: dto.currency ?? 'GBP',
      status: dto.status ?? 'active',
      features: (dto.features ?? []) as PlanFeature[],
      configuration: (dto.configuration ?? null) as PlanConfiguration | null,
      stripePriceId: dto.stripePriceId ?? null,
      paypalPlanId: dto.paypalPlanId ?? null,
      popular: dto.popular ?? false,
      sortOrder: dto.sortOrder ?? 0,
    })

    const saved = await this.accessPassRepository.save(pass)
    return AccessPassResponseDto.fromEntity(saved)
  }

  async findAll(status?: string): Promise<AccessPassResponseDto[]> {
    const passes = await this.accessPassRepository.find({
      where: status ? { status } : {},
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    })
    return passes.map(AccessPassResponseDto.fromEntity)
  }

  /** Active passes that can be bought right now. */
  async findPurchasable(): Promise<AccessPassResponseDto[]> {
    return this.findAll('active')
  }

  async findOne(id: string): Promise<AccessPassResponseDto> {
    const pass = await this.accessPassRepository.findOne({ where: { id } })
    if (!pass) {
      throw new NotFoundException('Access pass not found')
    }
    return AccessPassResponseDto.fromEntity(pass)
  }

  async update(id: string, dto: UpdateAccessPassDto): Promise<AccessPassResponseDto> {
    const pass = await this.accessPassRepository.findOne({ where: { id } })
    if (!pass) {
      throw new NotFoundException('Access pass not found')
    }

    if (dto.name !== undefined) {
      const name = dto.name.trim()
      if (!name) throw new BadRequestException('Access pass name cannot be empty')
      if (name !== pass.name) {
        const duplicate = await this.accessPassRepository.findOne({ where: { name } })
        if (duplicate) throw new BadRequestException(`Access pass with name "${name}" already exists`)
      }
      pass.name = name
    }
    if (dto.description !== undefined) pass.description = dto.description?.trim() || null
    if (dto.price !== undefined) pass.price = dto.price
    if (dto.durationDays !== undefined) {
      if (!(dto.durationDays > 0)) {
        throw new BadRequestException('Access pass duration must be at least 1 day')
      }
      pass.durationDays = dto.durationDays
    }
    if (dto.currency !== undefined) pass.currency = dto.currency
    if (dto.status !== undefined) pass.status = dto.status
    if (dto.features !== undefined) pass.features = dto.features as PlanFeature[]
    if (dto.configuration !== undefined) pass.configuration = dto.configuration as PlanConfiguration
    if (dto.stripePriceId !== undefined) pass.stripePriceId = dto.stripePriceId ?? null
    if (dto.paypalPlanId !== undefined) pass.paypalPlanId = dto.paypalPlanId ?? null
    if (dto.popular !== undefined) pass.popular = dto.popular
    if (dto.sortOrder !== undefined) pass.sortOrder = dto.sortOrder

    const saved = await this.accessPassRepository.save(pass)
    return AccessPassResponseDto.fromEntity(saved)
  }

  async remove(id: string): Promise<void> {
    const pass = await this.accessPassRepository.findOne({ where: { id } })
    if (!pass) {
      throw new NotFoundException('Access pass not found')
    }
    await this.accessPassRepository.remove(pass)
  }

  /**
   * The user's active, unexpired access pass (if any). Expired rows are marked
   * so the admin ledger stays accurate.
   */
  async findActivePurchaseForUser(userId: string): Promise<AccessPassPurchase | null> {
    const purchases = await this.purchaseRepository.find({
      where: { userId, status: 'active' },
      relations: ['accessPass'],
      order: { expiresAt: 'DESC' },
    })

    const now = Date.now()
    for (const purchase of purchases) {
      if (purchase.expiresAt.getTime() > now) return purchase
      purchase.status = 'expired'
      await this.purchaseRepository.save(purchase)
    }

    return null
  }

  async hasActiveAccessPass(userId: string): Promise<boolean> {
    return (await this.findActivePurchaseForUser(userId)) !== null
  }

  /**
   * Activate (or extend) an access pass after a successful payment.
   *
   * - One active access pass per user: any other active pass is expired.
   * - Buying the same pass again extends from its current expiry.
   * - `paymentReference` makes the call idempotent.
   */
  async activatePurchase(input: ActivateAccessPassInput): Promise<AccessPassPurchase> {
    const pass = await this.accessPassRepository.findOne({ where: { id: input.accessPassId } })
    if (!pass) {
      throw new NotFoundException('Access pass not found')
    }
    if (pass.status !== 'active') {
      throw new BadRequestException('This access pass is not available for purchase')
    }
    if (!(pass.durationDays > 0)) {
      throw new BadRequestException('A positive access pass duration is required')
    }

    try {
      return await this.purchaseRepository.manager.transaction(async (manager) => {
        if (input.paymentReference) {
          const already = await manager.findOne(AccessPassPurchase, {
            where: { userId: input.userId, paymentReference: input.paymentReference },
          })
          if (already) return already
        }

        const now = new Date()
        const active = await manager.find(AccessPassPurchase, {
          where: { userId: input.userId, status: 'active' },
        })
        const target = active.find((purchase) => purchase.accessPassId === input.accessPassId)

        for (const purchase of active) {
          if (target && purchase.id === target.id) continue
          await manager.update(
            AccessPassPurchase,
            { id: purchase.id },
            { status: 'expired', expiresAt: now },
          )
        }

        const base =
          target?.expiresAt && target.expiresAt.getTime() > now.getTime()
            ? target.expiresAt
            : now
        const expiresAt = new Date(base.getTime() + pass.durationDays * DAY_MS)

        let saved: AccessPassPurchase
        if (target) {
          target.status = 'active'
          target.expiresAt = expiresAt
          if (input.paymentReference) target.paymentReference = input.paymentReference
          saved = await manager.save(target)
        } else {
          saved = await manager.save(
            manager.create(AccessPassPurchase, {
              userId: input.userId,
              accessPassId: pass.id,
              status: 'active',
              startedAt: now,
              expiresAt,
              paymentReference: input.paymentReference ?? null,
            }),
          )
        }

        await manager.update(User, { id: input.userId }, {
          mcomCanAccessVcard: true,
          mcomMembershipStatus: 'active',
          mcomMembershipLevel: pass.name,
        })

        return saved
      })
    } catch (err) {
      if (
        input.paymentReference &&
        err instanceof QueryFailedError &&
        (err as any)?.driverError?.code === '23505'
      ) {
        const existing = await this.purchaseRepository.findOne({
          where: { userId: input.userId, paymentReference: input.paymentReference },
        })
        if (existing) return existing
      }
      throw err
    }
  }

  /**
   * Revoke an access pass (used when a full refund is settled). Access is only
   * removed when the user has no other active local entitlement.
   */
  async cancelPurchase(userId: string, accessPassId: string): Promise<void> {
    await this.purchaseRepository.manager.transaction(async (manager) => {
      const now = new Date()
      await manager.update(
        AccessPassPurchase,
        { userId, accessPassId, status: 'active' },
        { status: 'cancelled', expiresAt: now },
      )

      const remainingPasses = await manager.find(AccessPassPurchase, {
        where: { userId, status: 'active' },
      })
      const remainingPlans = await manager.find(SubscribedPlan, {
        where: { userId, status: 'active' },
      })
      const stillActive =
        remainingPasses.some((purchase) => purchase.expiresAt.getTime() > now.getTime()) ||
        remainingPlans.some((plan) => !plan.expiresAt || plan.expiresAt.getTime() > now.getTime())

      await manager.update(User, { id: userId }, {
        mcomCanAccessVcard: stillActive,
        mcomMembershipStatus: stillActive ? 'active' : 'cancelled',
      })
    })
  }
}
