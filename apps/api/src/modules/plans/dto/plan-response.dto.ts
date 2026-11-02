import {
  Plan,
  PlanConfiguration,
  PlanFeature,
  PlanRule,
  PlanVariant,
} from '../entities/plan.entity'
import { resolvePlanVariants } from '../plan-variants'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class PlanFeatureResponseDto {
  @ApiProperty({ example: '50 Business VCards' })
  text!: string

  @ApiProperty({ example: 'Business vCards your team can create and publish.' })
  description!: string

  @ApiProperty({ enum: ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'] })
  scope!: string
}

export class PlanRuleResponseDto {
  @ApiProperty({ example: 'Business VCards' })
  label!: string

  @ApiProperty({ example: { Standard: '10', Pro: '25', 'Pro+': '50' } })
  values!: Record<string, string>

  @ApiProperty({ example: 'Business vCards the business can create and publish.' })
  description!: string

  @ApiProperty({ enum: ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'] })
  scope!: string
}

export class PlanVariantResponseDto {
  @ApiProperty({ enum: ['standard', 'pro', 'pro_plus'] })
  key!: string

  @ApiProperty({ example: 'Standard' })
  name!: string

  @ApiProperty({ example: 90, description: 'Fixed access duration in days' })
  durationDays!: number

  @ApiProperty({ example: 49 })
  price!: number

  @ApiProperty({ example: 0 })
  setupFee!: number

  @ApiProperty({ example: 14 })
  trialDays!: number

  @ApiProperty({ example: '90 days of access' })
  description!: string

  @ApiPropertyOptional({ type: [PlanFeatureResponseDto], nullable: true })
  features!: PlanFeatureResponseDto[] | null

  @ApiPropertyOptional({ type: [PlanRuleResponseDto], nullable: true })
  rules!: PlanRuleResponseDto[] | null

  @ApiPropertyOptional({ example: { quotas: { maxVCards: 50 }, featureFlags: { customDomains: true } }, nullable: true })
  configuration!: PlanConfiguration | null

  @ApiPropertyOptional({ example: 'price_123' })
  stripePriceId!: string | null

  @ApiPropertyOptional({ example: 'P-123' })
  paypalPlanId!: string | null

  @ApiProperty({ example: true })
  isActive!: boolean
}

export class PlanResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string

  @ApiProperty({ example: 'Business Growth Membership' })
  name!: string

  @ApiProperty({ example: 'Everything a growing business needs to publish and issue cards.' })
  description!: string

  @ApiProperty({ enum: ['business', 'consumer'] })
  audience!: string

  @ApiPropertyOptional({ example: 'Gold', nullable: true, description: 'Optional legacy label' })
  level!: string | null

  @ApiProperty({ example: true })
  popular!: boolean

  @ApiProperty({ example: 2 })
  sortOrder!: number

  @ApiProperty({ type: [PlanFeatureResponseDto], description: 'Features shared by every variant' })
  features!: PlanFeatureResponseDto[]

  @ApiProperty({ type: [PlanRuleResponseDto], description: 'Limit matrix shared by the variants' })
  rules!: PlanRuleResponseDto[]

  @ApiPropertyOptional({ example: { quotas: { maxVCards: 50 }, featureFlags: { customDomains: true } } })
  configuration!: PlanConfiguration | null

  @ApiProperty({ example: 'GBP' })
  currency!: string

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ enum: ['STANDARD', 'TRIAL', 'SEASONAL'], example: 'STANDARD' })
  type!: string

  @ApiPropertyOptional({ example: 'uuid' })
  seasonId!: string | null

  @ApiProperty({ example: false })
  isDefault!: boolean

  @ApiProperty({ type: [PlanVariantResponseDto], description: 'Standard (90d), Pro (180d), Pro+ (365d)' })
  variants!: PlanVariantResponseDto[]

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt!: Date

  static fromEntity(entity: Plan): PlanResponseDto {
    const dto = new PlanResponseDto()
    const variants = resolvePlanVariants(entity)

    dto.id = entity.id
    dto.name = entity.name ?? ''
    dto.description = entity.tagline ?? ''
    dto.audience = entity.audience
    dto.level = entity.level ?? null
    dto.popular = entity.popular
    dto.sortOrder = entity.sortOrder
    dto.features = (entity.features || []).map((f: PlanFeature) => ({
      text: f.text,
      description: f.description,
      scope: f.scope,
    }))
    dto.rules = (entity.rules || []).map((r: PlanRule) => ({
      label: r.label,
      values: r.values,
      description: r.description,
      scope: r.scope,
    }))
    dto.configuration = entity.configuration ?? null
    dto.currency = entity.currency
    dto.status = entity.status
    dto.type = entity.type
    dto.seasonId = entity.seasonId
    dto.isDefault = entity.isDefault
    dto.variants = [variants.standard, variants.pro, variants.pro_plus].map((variant: PlanVariant) => ({
      key: variant.key,
      name: variant.name,
      durationDays: variant.durationDays,
      price: variant.price,
      setupFee: variant.setupFee,
      trialDays: variant.trialDays,
      description: variant.description,
      features: variant.features ?? null,
      rules: variant.rules ?? null,
      configuration: variant.configuration ?? null,
      stripePriceId: variant.stripePriceId ?? null,
      paypalPlanId: variant.paypalPlanId ?? null,
      isActive: variant.isActive !== false,
    }))
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt
    return dto
  }
}
