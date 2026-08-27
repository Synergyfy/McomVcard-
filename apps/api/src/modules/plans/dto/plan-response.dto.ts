import { Plan, PlanFeature, PlanRule, PlanTierPricing, PricingSections, AnnualDiscount } from '../entities/plan.entity'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class PlanFeatureResponseDto {
  @ApiProperty({ example: '1 Digital membership card' })
  text!: string

  @ApiProperty({ example: 'Your membership card in the MCOM app.' })
  description!: string

  @ApiProperty({ enum: ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'] })
  scope!: string
}

export class PlanRuleResponseDto {
  @ApiProperty({ example: 'Store Cards collectable' })
  label!: string

  @ApiProperty({ example: { Normal: '10', Pro: '20', 'Pro+': '40' } })
  values!: Record<string, string>

  @ApiProperty({ example: 'Number of business store cards you can collect.' })
  description!: string

  @ApiProperty({ enum: ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'] })
  scope!: string
}

export class PlanTierPricingResponseDto {
  @ApiProperty({ example: 0 })
  monthly!: number

  @ApiProperty({ example: 0 })
  quarterly!: number

  @ApiProperty({ example: 0 })
  semiannual!: number

  @ApiProperty({ example: 0 })
  annual!: number

  @ApiProperty({ example: 0 })
  setupFee!: number

  @ApiProperty({ example: 14 })
  trialDays!: number

  @ApiProperty({ example: '' })
  description!: string

  @ApiProperty({ enum: ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'] })
  scope!: string
}

export class PlanTiersResponseDto {
  @ApiProperty({ type: PlanTierPricingResponseDto })
  Normal!: PlanTierPricingResponseDto

  @ApiProperty({ type: PlanTierPricingResponseDto })
  Pro!: PlanTierPricingResponseDto

  @ApiProperty({ type: PlanTierPricingResponseDto })
  'Pro+'!: PlanTierPricingResponseDto
}

export class PricingSectionItemResponseDto {
  @ApiProperty({ example: 'Prices for the selected tier...' })
  description!: string
}

export class PricingSectionsResponseDto {
  @ApiProperty({ type: PricingSectionItemResponseDto })
  price!: PricingSectionItemResponseDto

  @ApiProperty({ type: PricingSectionItemResponseDto })
  feature!: PricingSectionItemResponseDto

  @ApiProperty({ type: PricingSectionItemResponseDto })
  rule!: PricingSectionItemResponseDto
}

export class AnnualDiscountResponseDto {
  @ApiProperty({ enum: ['months', 'percent'] })
  type!: 'months' | 'percent'

  @ApiProperty({ example: 2 })
  value!: number
}

export class PlanResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string

  @ApiProperty({ enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] })
  level!: string

  @ApiProperty({ enum: ['business', 'consumer'] })
  audience!: string

  @ApiProperty({ example: 'Gold' })
  name!: string | null

  @ApiProperty({ example: 'Premium access with guest passes...' })
  tagline!: string | null

  @ApiProperty({ example: true })
  popular!: boolean

  @ApiProperty({ example: 2 })
  sortOrder!: number

  @ApiProperty({ type: [PlanFeatureResponseDto] })
  features!: PlanFeatureResponseDto[]

  @ApiProperty({ type: [PlanRuleResponseDto] })
  rules!: PlanRuleResponseDto[]

  @ApiProperty({ type: PlanTiersResponseDto })
  tiers!: PlanTiersResponseDto

  @ApiProperty({ type: PricingSectionsResponseDto })
  sections!: PricingSectionsResponseDto

  @ApiProperty({ type: AnnualDiscountResponseDto })
  annualDiscount!: AnnualDiscountResponseDto

  @ApiProperty({ example: 'GBP' })
  currency!: string

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt!: Date

  static fromEntity(entity: Plan): PlanResponseDto {
    const dto = new PlanResponseDto()
    dto.id = entity.id
    dto.level = entity.level
    dto.audience = entity.audience
    dto.name = entity.name
    dto.tagline = entity.tagline
    dto.popular = entity.popular
    dto.sortOrder = entity.sortOrder
    dto.features = (entity.features || []).map((f) => ({
      text: f.text,
      description: f.description,
      scope: f.scope,
    }))
    dto.rules = (entity.rules || []).map((r) => ({
      label: r.label,
      values: r.values,
      description: r.description,
      scope: r.scope,
    }))
    dto.tiers = entity.tiers
      ? {
          Normal: entity.tiers.Normal,
          Pro: entity.tiers.Pro,
          'Pro+': entity.tiers['Pro+'],
        }
      : {
          Normal: {
            monthly: 0,
            quarterly: 0,
            semiannual: 0,
            annual: 0,
            setupFee: 0,
            trialDays: 0,
            description: '',
            scope: 'All',
          },
          Pro: {
            monthly: 0,
            quarterly: 0,
            semiannual: 0,
            annual: 0,
            setupFee: 0,
            trialDays: 0,
            description: '',
            scope: 'All',
          },
          'Pro+': {
            monthly: 0,
            quarterly: 0,
            semiannual: 0,
            annual: 0,
            setupFee: 0,
            trialDays: 0,
            description: '',
            scope: 'All',
          },
        }
    dto.sections = entity.sections || {
      price: { description: '' },
      feature: { description: '' },
      rule: { description: '' },
    }
    dto.annualDiscount = entity.annualDiscount || { type: 'months', value: 2 }
    dto.currency = entity.currency
    dto.status = entity.status
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt
    return dto
  }
}