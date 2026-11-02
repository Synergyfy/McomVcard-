import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  Plan,
  PlanAudience,
  PlanFeature,
  PlanRule,
  PlanTierPricingMap,
  PlanVariants,
} from './entities/plan.entity'
import {
  defaultVariants,
  normalizeVariants,
  variantsFromLegacyTiers,
} from './plan-variants'
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto'
import { PlanResponseDto } from './dto/plan-response.dto'

export type PlanLevel = string
export type { PlanAudience }
export type PlanAccessTier = 'Normal' | 'Pro' | 'Pro+'

const PLAN_AUDIENCES: PlanAudience[] = ['business', 'consumer']

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async create(dto: CreatePlanDto): Promise<PlanResponseDto> {
    const name = dto.name?.trim()
    if (!name) {
      throw new BadRequestException('Plan name is required')
    }
    if (!PLAN_AUDIENCES.includes(dto.audience)) {
      throw new BadRequestException(`Invalid audience. Must be one of: ${PLAN_AUDIENCES.join(', ')}`)
    }

    // Plans are identified by their free-form name. Duplicates are rejected on
    // name only; the legacy `level` label is optional metadata.
    const existing = await this.planRepository.findOne({ where: { name } })
    if (existing) {
      throw new BadRequestException(`Plan with name "${name}" already exists`)
    }

    const variants = this.resolveVariantsForCreate(dto)
    const description = dto.description ?? dto.tagline ?? ''

    const plan = this.planRepository.create({
      level: dto.level?.trim() || null,
      audience: dto.audience,
      name,
      tagline: description,
      popular: dto.popular ?? false,
      sortOrder: dto.sortOrder ?? 0,
      features: (dto.features ?? []) as PlanFeature[],
      rules: (dto.rules ?? []) as PlanRule[],
      tiers: (dto.tiers ?? null) as PlanTierPricingMap | null,
      variants,
      sections: dto.sections ?? null,
      annualDiscount: dto.annualDiscount ?? null,
      currency: dto.currency ?? 'GBP',
      status: dto.status ?? 'active',
      type: dto.type ?? 'STANDARD',
      seasonId: dto.seasonId ?? null,
      configuration: dto.configuration ?? null,
      isDefault: dto.isDefault ?? false,
      stripeMonthlyPriceId: dto.stripeMonthlyPriceId ?? null,
      stripeQuarterlyPriceId: dto.stripeQuarterlyPriceId ?? null,
      stripeAnnualPriceId: dto.stripeAnnualPriceId ?? null,
      paypalMonthlyPlanId: dto.paypalMonthlyPlanId ?? null,
      paypalQuarterlyPlanId: dto.paypalQuarterlyPlanId ?? null,
      paypalAnnualPlanId: dto.paypalAnnualPlanId ?? null,
    })

    const saved = await this.planRepository.save(plan)
    return PlanResponseDto.fromEntity(saved)
  }

  async findAll(audience?: PlanAudience): Promise<PlanResponseDto[]> {
    const where = audience ? { audience } : {}
    const plans = await this.planRepository.find({
      where,
      order: { audience: 'ASC', sortOrder: 'ASC', createdAt: 'ASC' },
    })
    return plans.map(PlanResponseDto.fromEntity)
  }

  async findOne(id: string): Promise<PlanResponseDto> {
    const plan = await this.planRepository.findOne({ where: { id } })
    if (!plan) {
      throw new NotFoundException('Plan not found')
    }
    return PlanResponseDto.fromEntity(plan)
  }

  async findByLevelAndAudience(level: PlanLevel, audience: PlanAudience): Promise<PlanResponseDto> {
    const plan = await this.planRepository.findOne({
      where: { level, audience },
      order: { sortOrder: 'ASC' },
    })
    if (!plan) {
      throw new NotFoundException(`Plan with level ${level} and audience ${audience} not found`)
    }
    return PlanResponseDto.fromEntity(plan)
  }

  async update(id: string, dto: UpdatePlanDto): Promise<PlanResponseDto> {
    const plan = await this.planRepository.findOne({ where: { id } })
    if (!plan) {
      throw new NotFoundException('Plan not found')
    }

    if (dto.name !== undefined) {
      const name = dto.name.trim()
      if (!name) throw new BadRequestException('Plan name cannot be empty')
      if (name !== plan.name) {
        const duplicate = await this.planRepository.findOne({ where: { name } })
        if (duplicate) throw new BadRequestException(`Plan with name "${name}" already exists`)
      }
      plan.name = name
    }
    if (dto.description !== undefined) plan.tagline = dto.description
    else if (dto.tagline !== undefined) plan.tagline = dto.tagline
    if (dto.level !== undefined) plan.level = dto.level?.trim() || null
    if (dto.popular !== undefined) plan.popular = dto.popular
    if (dto.sortOrder !== undefined) plan.sortOrder = dto.sortOrder
    if (dto.features !== undefined) plan.features = dto.features as PlanFeature[]
    if (dto.rules !== undefined) plan.rules = dto.rules as PlanRule[]
    if (dto.tiers !== undefined) plan.tiers = dto.tiers as PlanTierPricingMap
    if (dto.variants !== undefined) {
      plan.variants = normalizeVariants(dto.variants as any)
    } else if (dto.tiers !== undefined) {
      // Legacy client updated the pricing matrix — mirror it into variants.
      plan.variants = variantsFromLegacyTiers(
        dto.tiers as PlanTierPricingMap,
        { quarterly: dto.stripeQuarterlyPriceId, annual: dto.stripeAnnualPriceId },
        { quarterly: dto.paypalQuarterlyPlanId, annual: dto.paypalAnnualPlanId },
      )
    }
    if (dto.sections !== undefined) plan.sections = dto.sections
    if (dto.annualDiscount !== undefined) plan.annualDiscount = dto.annualDiscount
    if (dto.currency !== undefined) plan.currency = dto.currency
    if (dto.status !== undefined) plan.status = dto.status
    if (dto.type !== undefined) plan.type = dto.type
    if (dto.seasonId !== undefined) plan.seasonId = dto.seasonId ?? null
    if (dto.configuration !== undefined) plan.configuration = dto.configuration
    if (dto.isDefault !== undefined) plan.isDefault = dto.isDefault
    if (dto.stripeMonthlyPriceId !== undefined) plan.stripeMonthlyPriceId = dto.stripeMonthlyPriceId ?? null
    if (dto.stripeQuarterlyPriceId !== undefined) plan.stripeQuarterlyPriceId = dto.stripeQuarterlyPriceId ?? null
    if (dto.stripeAnnualPriceId !== undefined) plan.stripeAnnualPriceId = dto.stripeAnnualPriceId ?? null
    if (dto.paypalMonthlyPlanId !== undefined) plan.paypalMonthlyPlanId = dto.paypalMonthlyPlanId ?? null
    if (dto.paypalQuarterlyPlanId !== undefined) plan.paypalQuarterlyPlanId = dto.paypalQuarterlyPlanId ?? null
    if (dto.paypalAnnualPlanId !== undefined) plan.paypalAnnualPlanId = dto.paypalAnnualPlanId ?? null

    const saved = await this.planRepository.save(plan)
    return PlanResponseDto.fromEntity(saved)
  }

  async remove(id: string): Promise<void> {
    const plan = await this.planRepository.findOne({ where: { id } })
    if (!plan) {
      throw new NotFoundException('Plan not found')
    }
    await this.planRepository.remove(plan)
  }

  /**
   * Seed one sample plan per audience. Each ships with the three fixed
   * variants (Standard 90d, Pro 180d, Pro+ 365d) priced at 0 for the admin to
   * configure.
   */
  async seedDefaults(): Promise<PlanResponseDto[]> {
    const results: PlanResponseDto[] = []

    const definitions: Array<{ audience: PlanAudience; name: string; description: string }> = [
      {
        audience: 'business',
        name: 'Business Membership',
        description: 'Configure what a business receives, then price the Standard, Pro and Pro+ variants.',
      },
      {
        audience: 'consumer',
        name: 'Consumer Membership',
        description: 'Configure what a consumer receives, then price the Standard, Pro and Pro+ variants.',
      },
    ]

    for (const definition of definitions) {
      const existing = await this.planRepository.findOne({
        where: { name: definition.name, audience: definition.audience },
      })
      if (existing) continue

      const plan = this.planRepository.create({
        level: null,
        audience: definition.audience,
        name: definition.name,
        tagline: definition.description,
        popular: false,
        sortOrder: 0,
        features: [],
        rules: [],
        tiers: null,
        variants: defaultVariants(),
        sections: null,
        annualDiscount: null,
        currency: 'GBP',
        status: 'active',
        type: 'STANDARD',
        seasonId: null,
        configuration: null,
        isDefault: false,
      })

      const saved = await this.planRepository.save(plan)
      results.push(PlanResponseDto.fromEntity(saved))
    }

    return results
  }

  private resolveVariantsForCreate(dto: CreatePlanDto): PlanVariants {
    if (dto.variants && dto.variants.length > 0) {
      return normalizeVariants(dto.variants as any)
    }
    if (dto.tiers) {
      return variantsFromLegacyTiers(
        dto.tiers as PlanTierPricingMap,
        { quarterly: dto.stripeQuarterlyPriceId, annual: dto.stripeAnnualPriceId },
        { quarterly: dto.paypalQuarterlyPlanId, annual: dto.paypalAnnualPlanId },
      )
    }
    return defaultVariants()
  }
}
