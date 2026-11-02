import { Injectable } from '@nestjs/common'
import { PlansService } from '../plans/plans.service'
import { PlanResponseDto, PlanVariantResponseDto } from '../plans/dto/plan-response.dto'
import {
  CreateSystemPlanDto,
  UpdateSystemPlanDto,
  SystemPlanResponseDto,
  SystemPlanVariantDto,
} from './dto/system-plan.dto'
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanAudience,
  PlanType,
} from '../plans/dto/plan.dto'
import { PLAN_VARIANT_KEYS, mergeConfiguration, normalizeVariants } from '../plans/plan-variants'
import type { PlanVariantKey } from '../plans/entities/plan.entity'

/**
 * Bridges the flat MCOM Solutions connector contract (`ExternalPlan`) and
 * Vcard's plan model.
 *
 * Vcard plans are free-form by name and always expose three fixed variants:
 * Standard (90 days), Pro (180 days) and Pro+ (365 days). The connector's flat
 * price fields map directly onto them:
 *
 *   monthlyPrice  -> Standard
 *   quarterlyPrice -> Pro
 *   annualPrice   -> Pro+
 *
 * This matches Central's Generic Connector `ExternalPlanVariant` mapping
 * (monthlyPrice = Standard, quarterlyPrice = Pro, annualPrice = Pro+).
 * A `variants` array is also accepted/returned so the Central console can
 * configure each variant's price, features and entitlements directly.
 */
@Injectable()
export class SystemPlansService {
  private static readonly AUDIENCE: PlanAudience = 'business'

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
    const update = this.toUpdatePlanDto(dto, current)
    const plan = await this.plansService.update(id, update)
    return this.toExternalPlan(plan)
  }

  async remove(id: string): Promise<void> {
    await this.plansService.remove(id)
  }

  // ── write mapping ─────────────────────────────────────────────────────────

  private toCreatePlanDto(dto: CreateSystemPlanDto): CreatePlanDto {
    return {
      // Any free-form name is accepted; no level is inferred or required.
      name: dto.name,
      description: dto.description,
      audience: SystemPlansService.AUDIENCE,
      type: (dto.type as PlanType) ?? 'STANDARD',
      seasonId: dto.seasonId,
      features: (dto.features ?? []).map((text) => ({ text, description: '', scope: 'All' as const })),
      configuration: dto.configuration,
      variants: dto.variants?.length
        ? this.variantsFromCanonical(dto.variants)
        : this.variantsFromPricing(dto),
      isDefault: dto.isDefault ?? false,
      status: dto.isActive === false ? 'inactive' : 'active',
    }
  }

  private toUpdatePlanDto(
    dto: UpdateSystemPlanDto,
    current: PlanResponseDto,
  ): UpdatePlanDto {
    const update: UpdatePlanDto = {}

    if (dto.name !== undefined) update.name = dto.name
    if (dto.description !== undefined) update.description = dto.description
    if (dto.features !== undefined) {
      update.features = dto.features.map((text) => ({ text, description: '', scope: 'All' as const }))
    }
    if (dto.configuration !== undefined) update.configuration = dto.configuration
    if (dto.isActive !== undefined) update.status = dto.isActive ? 'active' : 'inactive'
    if (dto.isDefault !== undefined) update.isDefault = dto.isDefault
    if (dto.type !== undefined) update.type = dto.type as PlanType
    if (dto.seasonId !== undefined) update.seasonId = dto.seasonId

    if (dto.variants !== undefined) {
      update.variants = this.variantsFromCanonical(dto.variants, current)
    } else {
      const hasPricing =
        dto.monthlyPrice !== undefined ||
        dto.quarterlyPrice !== undefined ||
        dto.semiannualPrice !== undefined ||
        dto.annualPrice !== undefined ||
        dto.stripeMonthlyPriceId !== undefined ||
        dto.stripeQuarterlyPriceId !== undefined ||
        dto.stripeSemiannualPriceId !== undefined ||
        dto.stripeAnnualPriceId !== undefined ||
        dto.paypalMonthlyPlanId !== undefined ||
        dto.paypalQuarterlyPlanId !== undefined ||
        dto.paypalSemiannualPlanId !== undefined ||
        dto.paypalAnnualPlanId !== undefined

      if (hasPricing) {
        update.variants = this.variantsFromPricing(dto, current)
      }
    }

    return update
  }

  /** Map Central's canonical `ExternalPlanVariant[]` onto our variant model. */
  private variantsFromCanonical(
    canonical: SystemPlanVariantDto[],
    current?: PlanResponseDto,
  ) {
    const existing = (key: PlanVariantKey): PlanVariantResponseDto | undefined =>
      current?.variants?.find((variant) => variant.key === key)

    const incomingByKey = new Map<PlanVariantKey, SystemPlanVariantDto>()
    for (const variant of canonical) {
      incomingByKey.set(this.variantKey(variant.tier), variant)
    }

    const normalized = normalizeVariants(
      PLAN_VARIANT_KEYS.map((key) => {
        const base = existing(key)
        const incoming = incomingByKey.get(key)

        return {
          key,
          price: incoming?.price ?? base?.price ?? 0,
          description:
            incoming?.tierLevel?.name && incoming.tierLevel.name !== key
              ? `${incoming.tierLevel.name} access`
              : base?.description,
          features:
            incoming?.features && incoming.features.length > 0
              ? incoming.features.map((text) => ({ text, description: '', scope: 'All' as const }))
              : (base?.features as any) ?? undefined,
          configuration: (incoming?.configuration as any) ?? (base?.configuration as any) ?? undefined,
          stripePriceId: incoming?.stripePriceId ?? base?.stripePriceId ?? undefined,
          paypalPlanId: incoming?.paypalPlanId ?? base?.paypalPlanId ?? undefined,
          isActive: incoming?.isActive ?? base?.isActive ?? true,
        }
      }),
    )

    return PLAN_VARIANT_KEYS.map((key) => this.toVariantDto(normalized[key]))
  }

  /**
   * Build the three variants from the connector's flat price fields:
   * monthly -> Standard, quarterly -> Pro, annual -> Pro+.
   */
  private variantsFromPricing(
    dto: {
      monthlyPrice?: number
      quarterlyPrice?: number
      semiannualPrice?: number
      annualPrice?: number
      stripeMonthlyPriceId?: string
      stripeQuarterlyPriceId?: string
      stripeSemiannualPriceId?: string
      stripeAnnualPriceId?: string
      paypalMonthlyPlanId?: string
      paypalQuarterlyPlanId?: string
      paypalSemiannualPlanId?: string
      paypalAnnualPlanId?: string
    },
    current?: PlanResponseDto,
  ) {
    const existing = (key: PlanVariantKey): PlanVariantResponseDto | undefined =>
      current?.variants?.find((variant) => variant.key === key)

    const standardExisting = existing('standard')
    const proExisting = existing('pro')
    const proPlusExisting = existing('pro_plus')

    // Direct mapping: monthly -> Standard, quarterly -> Pro, annual -> Pro+.
    // When a higher cycle is omitted, derive it from the lower one so a
    // connector that only sends monthlyPrice still produces usable variants.
    const monthly = dto.monthlyPrice
    const quarterly = dto.quarterlyPrice
    const annual = dto.annualPrice

    const standardPrice =
      monthly ?? (quarterly !== undefined ? Math.round(quarterly / 3) : standardExisting?.price ?? 0)
    const proPrice =
      quarterly ??
      dto.semiannualPrice ??
      (annual !== undefined
        ? Math.round(annual / 4)
        : monthly !== undefined
          ? monthly * 3
          : proExisting?.price ?? 0)
    const proPlusPrice =
      annual ??
      (quarterly !== undefined
        ? quarterly * 4
        : monthly !== undefined
          ? monthly * 12
          : proPlusExisting?.price ?? 0)

    const normalized = normalizeVariants([
      {
        key: 'standard' as const,
        price: standardPrice,
        description: standardExisting?.description,
        stripePriceId: dto.stripeMonthlyPriceId ?? standardExisting?.stripePriceId ?? undefined,
        paypalPlanId: dto.paypalMonthlyPlanId ?? standardExisting?.paypalPlanId ?? undefined,
        isActive: standardExisting?.isActive ?? true,
      },
      {
        key: 'pro' as const,
        price: proPrice,
        description: proExisting?.description,
        stripePriceId:
          dto.stripeQuarterlyPriceId ?? dto.stripeSemiannualPriceId ?? proExisting?.stripePriceId ?? undefined,
        paypalPlanId:
          dto.paypalQuarterlyPlanId ?? dto.paypalSemiannualPlanId ?? proExisting?.paypalPlanId ?? undefined,
        isActive: proExisting?.isActive ?? true,
      },
      {
        key: 'pro_plus' as const,
        price: proPlusPrice,
        description: proPlusExisting?.description,
        stripePriceId: dto.stripeAnnualPriceId ?? proPlusExisting?.stripePriceId ?? undefined,
        paypalPlanId: dto.paypalAnnualPlanId ?? proPlusExisting?.paypalPlanId ?? undefined,
        isActive: proPlusExisting?.isActive ?? true,
      },
    ])

    return PLAN_VARIANT_KEYS.map((key) => this.toVariantDto(normalized[key]))
  }

  /** Convert the internal variant (nullable fields) into the DTO shape. */
  private toVariantDto(variant: {
    key: PlanVariantKey
    price: number
    description: string
    features: any[] | null
    rules: any[] | null
    configuration: any
    stripePriceId: string | null
    paypalPlanId: string | null
    isActive: boolean
  }) {
    return {
      key: variant.key,
      price: variant.price,
      description: variant.description,
      features: variant.features ?? undefined,
      rules: variant.rules ?? undefined,
      configuration: variant.configuration ?? undefined,
      stripePriceId: variant.stripePriceId ?? undefined,
      paypalPlanId: variant.paypalPlanId ?? undefined,
      isActive: variant.isActive,
    }
  }

  // ── read mapping ──────────────────────────────────────────────────────────

  private toExternalPlan(plan: PlanResponseDto): SystemPlanResponseDto {
    const standard = plan.variants.find((variant) => variant.key === 'standard')
    const pro = plan.variants.find((variant) => variant.key === 'pro')
    const proPlus = plan.variants.find((variant) => variant.key === 'pro_plus')

    const externalVariants: SystemPlanVariantDto[] = plan.variants.map((variant) => ({
      tier:
        variant.key === 'pro_plus'
          ? 'PRO_PLUS'
          : variant.key === 'pro'
            ? 'PRO'
            : 'STANDARD',
      tierLevel: {
        name: variant.name,
        durationDays: variant.durationDays,
        isCalendarYear: variant.key === 'pro_plus',
      },
      price: variant.price,
      features: (variant.features?.length ? variant.features : plan.features ?? []).map((feature) => feature.text),
      configuration:
        (mergeConfiguration(plan.configuration, variant.configuration) as any) ?? undefined,
      isActive: variant.isActive !== false,
      stripePriceId: variant.stripePriceId ?? undefined,
      paypalPlanId: variant.paypalPlanId ?? undefined,
    }))

    const tierFeatures: Record<string, string[]> = {}
    for (const variant of externalVariants) {
      const key =
        variant.tier === 'PRO_PLUS' ? 'Pro+' : variant.tier === 'PRO' ? 'Pro' : 'Standard'
      tierFeatures[key] = variant.features ?? []
    }

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      // Central's Generic Connector maps monthly/quarterly/annual to
      // Standard/Pro/Pro+ when a variants array is present.
      monthlyPrice: standard?.price,
      quarterlyPrice: pro?.price,
      semiannualPrice: pro?.price,
      annualPrice: proPlus?.price,
      features: (plan.features ?? []).map((feature) => feature.text),
      configuration: plan.configuration ?? undefined,
      variants: externalVariants,
      tierPrices: {
        Standard: standard?.price ?? 0,
        Pro: pro?.price ?? 0,
        'Pro+': proPlus?.price ?? 0,
      },
      tierFeatures,
      tierDurations: {
        Standard: standard?.durationDays ?? 90,
        Pro: pro?.durationDays ?? 180,
        'Pro+': proPlus?.durationDays ?? 365,
      },
      isActive: plan.status === 'active',
      isDefault: plan.isDefault,
      type: plan.type ?? 'STANDARD',
      seasonId: plan.seasonId ?? undefined,
      stripeMonthlyPriceId: standard?.stripePriceId ?? undefined,
      stripeQuarterlyPriceId: pro?.stripePriceId ?? undefined,
      stripeAnnualPriceId: proPlus?.stripePriceId ?? undefined,
      paypalMonthlyPlanId: standard?.paypalPlanId ?? undefined,
      paypalQuarterlyPlanId: pro?.paypalPlanId ?? undefined,
      paypalAnnualPlanId: proPlus?.paypalPlanId ?? undefined,
      created_at: plan.createdAt?.toISOString(),
      updated_at: plan.updatedAt?.toISOString(),
    }
  }

  private variantKey(tier: string): PlanVariantKey {
    const normalized = (tier || '').toLowerCase().trim()
    if (normalized === 'pro+' || normalized.includes('plus') || normalized === 'pro_plus') {
      return 'pro_plus'
    }
    if (normalized === 'pro') return 'pro'
    return 'standard'
  }
}
