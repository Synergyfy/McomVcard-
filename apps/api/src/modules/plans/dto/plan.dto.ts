import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsIn,
  ValidateNested,
  IsObject,
  IsNumber,
  IsNotEmpty,
  IsArray,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type { PlanVariantKey } from '../entities/plan.entity'

export type PlanLevel = string
export type PlanAudience = 'business' | 'consumer'
/** Legacy tier label. */
export type PlanAccessTier = 'Normal' | 'Pro' | 'Pro+'
export type PlanType = 'STANDARD' | 'TRIAL' | 'SEASONAL'
export type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual'
export type RuleScope = 'All' | 'Admin setup' | 'Business usage' | 'Consumer usage' | 'Public page'

export const PLAN_VARIANT_KEYS: PlanVariantKey[] = ['standard', 'pro', 'pro_plus']

export class PlanFeatureDto {
  @ApiProperty({ example: '50 Business VCards' })
  @IsString()
  @IsNotEmpty()
  text!: string

  @ApiPropertyOptional({ example: 'Business vCards your team can create and publish.' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'], example: 'All' })
  @IsIn(['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'])
  scope!: RuleScope
}

export class PlanRuleDto {
  @ApiProperty({ example: 'Business VCards' })
  @IsString()
  @IsNotEmpty()
  label!: string

  @ApiProperty({ example: { Standard: '10', Pro: '25', 'Pro+': '50' } })
  @IsObject()
  values!: Record<string, string>

  @ApiPropertyOptional({ example: 'Business vCards the business can create and publish.' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'], example: 'All' })
  @IsIn(['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'])
  scope!: RuleScope
}

export class PlanConfigurationDto {
  @ApiPropertyOptional({
    example: { maxVCards: 50, maxTeamMembers: 5 },
    description: 'Quota limits (numeric) or toggles (boolean)',
  })
  @IsOptional()
  @IsObject()
  quotas?: Record<string, number | boolean>

  @ApiPropertyOptional({
    example: { customDomains: true, advancedAnalytics: false },
    description: 'Boolean feature flags',
  })
  @IsOptional()
  @IsObject()
  featureFlags?: Record<string, boolean>
}

/** One of the three purchasable variants of a plan. */
export class PlanVariantDto {
  @ApiProperty({ enum: ['standard', 'pro', 'pro_plus'], example: 'standard', description: 'standard = 90 days, pro = 180 days, pro_plus = 365 days' })
  @IsIn(PLAN_VARIANT_KEYS)
  key!: PlanVariantKey

  @ApiPropertyOptional({ example: 'Standard', description: 'Fixed to Standard/Pro/Pro+ by the key' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 90, description: 'Fixed by the key: 90 / 180 / 365 days' })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number

  @ApiProperty({ example: 49 })
  @IsNumber()
  @Min(0)
  price!: number

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  setupFee?: number

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsInt()
  @Min(0)
  trialDays?: number

  @ApiPropertyOptional({ example: '90 days of access' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ type: [PlanFeatureDto], description: 'Overrides the plan-level feature list when provided' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanFeatureDto)
  features?: PlanFeatureDto[]

  @ApiPropertyOptional({ type: [PlanRuleDto], description: 'Overrides the plan-level rule list when provided' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanRuleDto)
  rules?: PlanRuleDto[]

  @ApiPropertyOptional({ type: PlanConfigurationDto, description: 'Merged over the plan-level configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlanConfigurationDto)
  configuration?: PlanConfigurationDto

  @ApiPropertyOptional({ example: 'price_123' })
  @IsOptional()
  @IsString()
  stripePriceId?: string

  @ApiPropertyOptional({ example: 'P-123' })
  @IsOptional()
  @IsString()
  paypalPlanId?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

/**
 * Legacy tier pricing DTO retained so older MCOM connector payloads and cached
 * clients keep validating. New plans should send `variants`.
 */
export class PlanTierPricingDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  monthly!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  quarterly!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  semiannual!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  annual!: number

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  setupFee!: number

  @ApiProperty({ example: 14 })
  @IsInt()
  @Min(0)
  trialDays!: number

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'], example: 'All' })
  @IsIn(['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'])
  scope!: RuleScope
}

export class PlanTiersDto {
  @ApiProperty({ type: PlanTierPricingDto })
  @ValidateNested()
  @Type(() => PlanTierPricingDto)
  Normal!: PlanTierPricingDto

  @ApiProperty({ type: PlanTierPricingDto })
  @ValidateNested()
  @Type(() => PlanTierPricingDto)
  Pro!: PlanTierPricingDto

  @ApiProperty({ type: PlanTierPricingDto })
  @ValidateNested()
  @Type(() => PlanTierPricingDto)
  'Pro+'!: PlanTierPricingDto
}

export class PricingSectionItemDto {
  @ApiProperty({ example: 'Prices for the selected variant...' })
  @IsString()
  description!: string
}

export class PricingSectionsDto {
  @ApiProperty({ type: PricingSectionItemDto })
  @ValidateNested()
  @Type(() => PricingSectionItemDto)
  price!: PricingSectionItemDto

  @ApiProperty({ type: PricingSectionItemDto })
  @ValidateNested()
  @Type(() => PricingSectionItemDto)
  feature!: PricingSectionItemDto

  @ApiProperty({ type: PricingSectionItemDto })
  @ValidateNested()
  @Type(() => PricingSectionItemDto)
  rule!: PricingSectionItemDto
}

export class AnnualDiscountDto {
  @ApiProperty({ enum: ['months', 'percent'], example: 'months' })
  @IsIn(['months', 'percent'])
  type!: 'months' | 'percent'

  @ApiProperty({ example: 2 })
  @IsNumber()
  value!: number
}

export class CreatePlanDto {
  @ApiProperty({ example: 'Business Growth Membership', description: 'Any free-form plan name' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiPropertyOptional({ example: 'Everything a growing business needs to publish and issue cards.' })
  @IsOptional()
  @IsString()
  description?: string

  /** @deprecated use description */
  @ApiPropertyOptional({ example: 'Everything a growing business needs.' })
  @IsOptional()
  @IsString()
  tagline?: string

  @ApiProperty({ enum: ['business', 'consumer'], example: 'business' })
  @IsIn(['business', 'consumer'])
  audience!: PlanAudience

  @ApiPropertyOptional({ example: 'Gold', description: 'Optional legacy label; plans are identified by name' })
  @IsOptional()
  @IsString()
  level?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  popular?: boolean

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number

  @ApiPropertyOptional({ type: [PlanFeatureDto], description: 'Features shared by every variant' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanFeatureDto)
  features?: PlanFeatureDto[]

  @ApiPropertyOptional({ type: [PlanRuleDto], description: 'Limit matrix shared by the variants (per-variant values)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanRuleDto)
  rules?: PlanRuleDto[]

  @ApiPropertyOptional({ type: PlanConfigurationDto, description: 'Base quotas/feature flags inherited by every variant' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlanConfigurationDto)
  configuration?: PlanConfigurationDto

  @ApiPropertyOptional({
    type: [PlanVariantDto],
    description: 'The three fixed variants (standard 90d, pro 180d, pro_plus 365d). Missing variants get defaults.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanVariantDto)
  variants?: PlanVariantDto[]

  /** @deprecated legacy pricing matrix — converted to variants when present */
  @ApiPropertyOptional({ type: PlanTiersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlanTiersDto)
  tiers?: PlanTiersDto

  @ApiPropertyOptional({ type: PricingSectionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PricingSectionsDto)
  sections?: PricingSectionsDto

  @ApiPropertyOptional({ type: AnnualDiscountDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AnnualDiscountDto)
  annualDiscount?: AnnualDiscountDto

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ enum: ['STANDARD', 'TRIAL', 'SEASONAL'], example: 'STANDARD' })
  @IsOptional()
  @IsIn(['STANDARD', 'TRIAL', 'SEASONAL'])
  type?: PlanType

  @ApiPropertyOptional({ example: 'uuid', description: 'Season UUID for SEASONAL plans' })
  @IsOptional()
  @IsString()
  seasonId?: string

  @ApiPropertyOptional({ example: false, description: 'Marks this as the default/free plan' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string

  // Legacy single price-ID fields (deprecated: use variant price IDs).
  @ApiPropertyOptional({ example: 'price_123' })
  @IsOptional()
  @IsString()
  stripeMonthlyPriceId?: string

  @ApiPropertyOptional({ example: 'price_456' })
  @IsOptional()
  @IsString()
  stripeQuarterlyPriceId?: string

  @ApiPropertyOptional({ example: 'price_789' })
  @IsOptional()
  @IsString()
  stripeAnnualPriceId?: string

  @ApiPropertyOptional({ example: 'P-123' })
  @IsOptional()
  @IsString()
  paypalMonthlyPlanId?: string

  @ApiPropertyOptional({ example: 'P-456' })
  @IsOptional()
  @IsString()
  paypalQuarterlyPlanId?: string

  @ApiPropertyOptional({ example: 'P-789' })
  @IsOptional()
  @IsString()
  paypalAnnualPlanId?: string
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ example: 'Business Growth Membership' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'Everything a growing business needs.' })
  @IsOptional()
  @IsString()
  description?: string

  /** @deprecated use description */
  @ApiPropertyOptional({ example: 'Everything a growing business needs.' })
  @IsOptional()
  @IsString()
  tagline?: string

  @ApiPropertyOptional({ example: 'Gold' })
  @IsOptional()
  @IsString()
  level?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  popular?: boolean

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number

  @ApiPropertyOptional({ type: [PlanFeatureDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanFeatureDto)
  features?: PlanFeatureDto[]

  @ApiPropertyOptional({ type: [PlanRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanRuleDto)
  rules?: PlanRuleDto[]

  @ApiPropertyOptional({ type: PlanConfigurationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlanConfigurationDto)
  configuration?: PlanConfigurationDto

  @ApiPropertyOptional({ type: [PlanVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanVariantDto)
  variants?: PlanVariantDto[]

  /** @deprecated legacy pricing matrix */
  @ApiPropertyOptional({ type: PlanTiersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlanTiersDto)
  tiers?: PlanTiersDto

  @ApiPropertyOptional({ type: PricingSectionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PricingSectionsDto)
  sections?: PricingSectionsDto

  @ApiPropertyOptional({ type: AnnualDiscountDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AnnualDiscountDto)
  annualDiscount?: AnnualDiscountDto

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ enum: ['STANDARD', 'TRIAL', 'SEASONAL'], example: 'STANDARD' })
  @IsOptional()
  @IsIn(['STANDARD', 'TRIAL', 'SEASONAL'])
  type?: PlanType

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  seasonId?: string

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ example: 'price_123' })
  @IsOptional()
  @IsString()
  stripeMonthlyPriceId?: string

  @ApiPropertyOptional({ example: 'price_456' })
  @IsOptional()
  @IsString()
  stripeQuarterlyPriceId?: string

  @ApiPropertyOptional({ example: 'price_789' })
  @IsOptional()
  @IsString()
  stripeAnnualPriceId?: string

  @ApiPropertyOptional({ example: 'P-123' })
  @IsOptional()
  @IsString()
  paypalMonthlyPlanId?: string

  @ApiPropertyOptional({ example: 'P-456' })
  @IsOptional()
  @IsString()
  paypalQuarterlyPlanId?: string

  @ApiPropertyOptional({ example: 'P-789' })
  @IsOptional()
  @IsString()
  paypalAnnualPlanId?: string
}
