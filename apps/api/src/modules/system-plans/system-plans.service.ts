import { Injectable } from '@nestjs/common'
import { PlansService } from '../plans/plans.service'
import { PlanResponseDto } from '../plans/dto/plan-response.dto'
import {
  CreateSystemPlanDto,
  UpdateSystemPlanDto,
  SystemPlanResponseDto,
} from './dto/system-plan.dto'
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanLevel,
  PlanAudience,
  PlanTiersDto,
} from '../plans/dto/plan.dto'

/**
 * Bridges the flat MCOM Solutions connector contract (`ExternalPlan`) and
 * Vcard's rich plan model (level x audience x Normal/Pro/Pro+ tiers).
 *
 * Mapping rules:
 * - Connector plans live on the `business` audience.
 * - The plan `level` is inferred from the name (Bronze/Silver/Gold/Platinum,
 *   default Gold) so central keeps a single price field.
 * - The flat monthly/quarterly/annual price is applied to all three Vcard
 *   access tiers; `trialDuration` becomes each tier's `trialDays`.
 * - Read responses surface the **Pro** tier as the canonical price.
 */
@Injectable()
export class SystemPlansService {
  private static readonly AUDIENCE: PlanAudience = 'business'
  private static readonly LEVELS: PlanLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum']

  constructor(private readonly plansService: PlansService) {}

  async create(dto: CreateSystemPlanDto): Promise<SystemPlanResponseDto> {
    const plan = await this.plansService.create(this.toCreatePlanDto(dto))
    return this.toExternalPlan(plan)
  }

  async findAll(): Promise<SystemPlanResponseDto[]> {
    const plans = await this.plansService.findAll(SystemPlansService.AUDIENCE)
    return plans.map((plan) => this.toExternalPlan(plan))
  }

  async findOne(id: string): Promise<SystemPlanResponseDto> {
    const plan = await this.plansService.findOne(id)
    return this.toExternalPlan(plan)
  }

  async update(id: string, dto: UpdateSystemPlanDto): Promise<SystemPlanResponseDto> {
    const current = await this.plansService.findOne(id)
    const update = await this.toUpdatePlanDto(dto, current)
    const plan = await this.plansService.update(id, update)
    return this.toExternalPlan(plan)
  }

  async remove(id: string): Promise<void> {
    await this.plansService.remove(id)
  }

  // ── write mapping ─────────────────────────────────────────────────────────

  private toCreatePlanDto(dto: CreateSystemPlanDto): CreatePlanDto {
    const monthly = dto.monthlyPrice ?? 0
    const trialDays = this.resolveTrialDays(dto)
    const tier = (trial: number) => ({
      monthly,
      quarterly: dto.quarterlyPrice ?? Math.round(monthly * 2.7),
      semiannual: Math.round(monthly * 5.4),
      annual: dto.annualPrice ?? Math.round(monthly * 10),
      setupFee: 0,
      trialDays: trial,
      description: '',
      scope: 'All' as const,
    })

    return {
      level: this.inferLevel(dto.name),
      audience: SystemPlansService.AUDIENCE,
      name: dto.name,
      tagline: dto.description ?? undefined,
      features: (dto.features ?? []).map((text) => ({ text, description: '', scope: 'All' as const })),
      tiers: { Normal: tier(trialDays), Pro: tier(trialDays), 'Pro+': tier(trialDays) },
      configuration: dto.configuration ?? undefined,
      isDefault: dto.isDefault ?? false,
      stripeMonthlyPriceId: dto.stripeMonthlyPriceId,
      stripeQuarterlyPriceId: dto.stripeQuarterlyPriceId,
      stripeAnnualPriceId: dto.stripeAnnualPriceId,
      paypalMonthlyPlanId: dto.paypalMonthlyPlanId,
      paypalQuarterlyPlanId: dto.paypalQuarterlyPlanId,
      paypalAnnualPlanId: dto.paypalAnnualPlanId,
    }
  }

  private async toUpdatePlanDto(
    dto: UpdateSystemPlanDto,
    current: PlanResponseDto,
  ): Promise<UpdatePlanDto> {
    const update: UpdatePlanDto = {}

    if (dto.name !== undefined) update.name = dto.name
    if (dto.description !== undefined) update.tagline = dto.description
    if (dto.features !== undefined) {
      update.features = dto.features.map((text) => ({ text, description: '', scope: 'All' as const }))
    }
    if (dto.configuration !== undefined) update.configuration = dto.configuration
    if (dto.isActive !== undefined) update.status = dto.isActive ? 'active' : 'inactive'
    if (dto.isDefault !== undefined) update.isDefault = dto.isDefault

    const hasPricing =
      dto.monthlyPrice !== undefined ||
      dto.quarterlyPrice !== undefined ||
      dto.annualPrice !== undefined ||
      dto.trialDuration !== undefined

    if (hasPricing) {
      const monthly = dto.monthlyPrice ?? current.tiers.Pro.monthly
      const trial = dto.trialDuration ?? current.tiers.Pro.trialDays
      const patchTier = (t: PlanResponseDto['tiers']['Pro']) => ({
        ...t,
        monthly,
        quarterly: dto.quarterlyPrice ?? t.quarterly,
        annual: dto.annualPrice ?? t.annual,
        trialDays: trial,
      })
      update.tiers = {
        Normal: patchTier(current.tiers.Normal),
        Pro: patchTier(current.tiers.Pro),
        'Pro+': patchTier(current.tiers['Pro+']),
      } as PlanTiersDto
    }

    if (dto.stripeMonthlyPriceId !== undefined) update.stripeMonthlyPriceId = dto.stripeMonthlyPriceId
    if (dto.stripeQuarterlyPriceId !== undefined) update.stripeQuarterlyPriceId = dto.stripeQuarterlyPriceId
    if (dto.stripeAnnualPriceId !== undefined) update.stripeAnnualPriceId = dto.stripeAnnualPriceId
    if (dto.paypalMonthlyPlanId !== undefined) update.paypalMonthlyPlanId = dto.paypalMonthlyPlanId
    if (dto.paypalQuarterlyPlanId !== undefined) update.paypalQuarterlyPlanId = dto.paypalQuarterlyPlanId
    if (dto.paypalAnnualPlanId !== undefined) update.paypalAnnualPlanId = dto.paypalAnnualPlanId

    return update
  }

  // ── read mapping ──────────────────────────────────────────────────────────

  private toExternalPlan(plan: PlanResponseDto): SystemPlanResponseDto {
    const pro = plan.tiers?.Pro
    return {
      id: plan.id,
      name: plan.name ?? plan.level,
      description: plan.tagline ?? undefined,
      monthlyPrice: pro?.monthly ?? undefined,
      quarterlyPrice: pro?.quarterly ?? undefined,
      annualPrice: pro?.annual ?? undefined,
      features: (plan.features ?? []).map((f) => f.text),
      configuration: plan.configuration ?? undefined,
      isActive: plan.status === 'active',
      isDefault: plan.isDefault,
      type: 'STANDARD',
      trialDuration: pro?.trialDays ?? undefined,
      stripeMonthlyPriceId: plan.stripeMonthlyPriceId ?? undefined,
      stripeQuarterlyPriceId: plan.stripeQuarterlyPriceId ?? undefined,
      stripeAnnualPriceId: plan.stripeAnnualPriceId ?? undefined,
      paypalMonthlyPlanId: plan.paypalMonthlyPlanId ?? undefined,
      paypalQuarterlyPlanId: plan.paypalQuarterlyPlanId ?? undefined,
      paypalAnnualPlanId: plan.paypalAnnualPlanId ?? undefined,
      created_at: plan.createdAt?.toISOString(),
      updated_at: plan.updatedAt?.toISOString(),
    }
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private inferLevel(name: string): PlanLevel {
    const match = SystemPlansService.LEVELS.find(
      (level) => level.toLowerCase() === (name || '').trim().toLowerCase(),
    )
    return match ?? 'Gold'
  }

  private resolveTrialDays(dto: { type?: string; trialDuration?: number }): number {
    if (dto.trialDuration !== undefined && dto.trialDuration > 0) return dto.trialDuration
    if (dto.type === 'TRIAL') return 14
    return 0
  }
}