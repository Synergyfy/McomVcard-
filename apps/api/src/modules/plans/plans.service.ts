import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Plan, PlanFeature, PlanRule, PlanTierPricing, PlanTierPricingMap, PricingSections, AnnualDiscount } from './entities/plan.entity'
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto'
import { PlanResponseDto } from './dto/plan-response.dto'

export type PlanLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
export type PlanAudience = 'business' | 'consumer'

const PLAN_LEVELS: PlanLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum']
const PLAN_AUDIENCES: PlanAudience[] = ['business', 'consumer']

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async create(dto: CreatePlanDto): Promise<PlanResponseDto> {
    if (!PLAN_LEVELS.includes(dto.level)) {
      throw new BadRequestException(`Invalid plan level. Must be one of: ${PLAN_LEVELS.join(', ')}`)
    }
    if (!PLAN_AUDIENCES.includes(dto.audience)) {
      throw new BadRequestException(`Invalid audience. Must be one of: ${PLAN_AUDIENCES.join(', ')}`)
    }

    const existing = await this.planRepository.findOne({
      where: { level: dto.level, audience: dto.audience },
    })
    if (existing) {
      throw new BadRequestException(`Plan with level ${dto.level} and audience ${dto.audience} already exists`)
    }

    const plan = this.planRepository.create({
      level: dto.level,
      audience: dto.audience,
      name: dto.name ?? dto.level,
      tagline: dto.tagline ?? '',
      popular: dto.popular ?? false,
      sortOrder: dto.sortOrder ?? PLAN_LEVELS.indexOf(dto.level),
      features: (dto.features ?? []) as PlanFeature[],
      rules: (dto.rules ?? []) as PlanRule[],
      tiers: (dto.tiers ?? this.defaultTiers()) as PlanTierPricingMap,
      sections: (dto.sections ?? this.defaultSections()) as PricingSections,
      annualDiscount: (dto.annualDiscount ?? { type: 'months', value: 2 }) as AnnualDiscount,
      currency: dto.currency ?? 'GBP',
      status: 'active',
    })

    const saved = await this.planRepository.save(plan)
    return PlanResponseDto.fromEntity(saved)
  }

  async findAll(audience?: PlanAudience): Promise<PlanResponseDto[]> {
    const where = audience ? { audience } : {}
    const plans = await this.planRepository.find({
      where,
      order: { audience: 'ASC', sortOrder: 'ASC' },
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
    const plan = await this.planRepository.findOne({ where: { level, audience } })
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

    if (dto.name !== undefined) plan.name = dto.name
    if (dto.tagline !== undefined) plan.tagline = dto.tagline
    if (dto.popular !== undefined) plan.popular = dto.popular
    if (dto.sortOrder !== undefined) plan.sortOrder = dto.sortOrder
    if (dto.features !== undefined) plan.features = dto.features as PlanFeature[]
    if (dto.rules !== undefined) plan.rules = dto.rules as PlanRule[]
    if (dto.tiers !== undefined) plan.tiers = dto.tiers as PlanTierPricingMap
    if (dto.sections !== undefined) plan.sections = dto.sections as PricingSections
    if (dto.annualDiscount !== undefined) plan.annualDiscount = dto.annualDiscount as AnnualDiscount
    if (dto.currency !== undefined) plan.currency = dto.currency
    if (dto.status !== undefined) plan.status = dto.status

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

  async seedDefaults(): Promise<PlanResponseDto[]> {
    const results: PlanResponseDto[] = []

    for (const audience of PLAN_AUDIENCES) {
      for (const level of PLAN_LEVELS) {
        const existing = await this.planRepository.findOne({ where: { level, audience } })
        if (existing) continue

        const plan = this.planRepository.create({
          level,
          audience,
          name: level,
          tagline: this.defaultTagline(level, audience),
          popular: level === 'Gold',
          sortOrder: PLAN_LEVELS.indexOf(level),
          features: this.defaultFeatures(level, audience),
          rules: this.defaultRules(level, audience),
          tiers: this.defaultTiers(level, audience) as PlanTierPricingMap,
          sections: this.defaultSections() as PricingSections,
          annualDiscount: { type: 'months', value: 2 } as AnnualDiscount,
          currency: 'GBP',
          status: 'active',
        })

        const saved = await this.planRepository.save(plan)
        results.push(PlanResponseDto.fromEntity(saved))
      }
    }

    return results
  }

  private defaultTagline(level: PlanLevel, audience: PlanAudience): string {
    const businessTaglines: Record<PlanLevel, string> = {
      Bronze: 'The essential start for small businesses building their digital presence.',
      Silver: 'Mid-tier growth with more cards, consumer VCards and QR power.',
      Gold: 'High-tier access with the full VCard suite and premium QR features.',
      Platinum: 'Enterprise-grade limits, API access and first access to new MCOM features.',
    }
    const consumerTaglines: Record<PlanLevel, string> = {
      Bronze: 'The entry membership for consumers, issued by the businesses they trust.',
      Silver: 'More room for family, friends and the businesses you love.',
      Gold: 'Premium access with guest passes and first-in-line campaigns.',
      Platinum: 'The ultimate consumer membership — VIP support and first access to new MCOM features.',
    }
    return audience === 'business' ? businessTaglines[level] : consumerTaglines[level]
  }

  private defaultFeatures(level: PlanLevel, audience: PlanAudience): PlanFeature[] {
    // Return empty array - admin will configure via UI
    return []
  }

  private defaultRules(level: PlanLevel, audience: PlanAudience): PlanRule[] {
    // Return empty array - admin will configure via UI
    return []
  }

  private defaultTiers(level?: PlanLevel, audience?: PlanAudience): PlanTierPricingMap {
    const baseMonthly = audience === 'business' ? this.businessBaseMonthly(level) : this.consumerBaseMonthly(level)
    const baseAnnual = baseMonthly * 10

    const createTier = (monthly: number, annual: number, trialDays = 14): PlanTierPricing => ({
      monthly,
      quarterly: Math.round(monthly * 2.7),
      semiannual: Math.round(monthly * 5.4),
      annual,
      setupFee: 0,
      trialDays,
      description: '',
      scope: 'All',
    })

    return {
      Normal: createTier(0, 0),
      Pro: createTier(baseMonthly, baseAnnual),
      'Pro+': createTier(baseMonthly * 1.5, baseAnnual * 1.5, 7),
    }
  }

  private businessBaseMonthly(level?: PlanLevel): number {
    const prices: Record<PlanLevel, number> = {
      Bronze: 49,
      Silver: 149,
      Gold: 449,
      Platinum: 1499,
    }
    return prices[level || 'Bronze']
  }

  private consumerBaseMonthly(level?: PlanLevel): number {
    const prices: Record<PlanLevel, number> = {
      Bronze: 9,
      Silver: 19,
      Gold: 29,
      Platinum: 49,
    }
    return prices[level || 'Bronze']
  }

  private defaultSections(): PricingSections {
    return {
      price: { description: 'Prices for the selected tier, per billing cycle. Includes the one-off setup fee and free-trial days.' },
      feature: { description: 'Check-list items shown on the plan cards.' },
      rule: { description: 'Limits enforced across admin setup, business usage and consumer usage, and shown in the public comparison table.' },
    }
  }
}