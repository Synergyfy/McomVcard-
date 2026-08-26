import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsIn,
  ValidateNested,
  IsObject,
  IsNumber,
  IsPositive,
  IsNotEmpty,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export type PlanLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
export type PlanAudience = 'business' | 'consumer'
export type PlanAccessTier = 'Normal' | 'Pro' | 'Pro+'
export type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual'
export type RuleScope = 'All' | 'Admin setup' | 'Business usage' | 'Consumer usage' | 'Public page'

export class PlanFeatureDto {
  @ApiProperty({ example: '1 Digital membership card' })
  @IsString()
  @IsNotEmpty()
  text!: string

  @ApiPropertyOptional({ example: 'Your membership card in the MCOM app.' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'], example: 'All' })
  @IsIn(['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'])
  scope!: RuleScope
}

export class PlanRuleDto {
  @ApiProperty({ example: 'Store Cards collectable' })
  @IsString()
  @IsNotEmpty()
  label!: string

  @ApiProperty({ example: { Normal: '10', Pro: '20', 'Pro+': '40' } })
  @IsObject()
  values!: Record<PlanAccessTier, string>

  @ApiPropertyOptional({ example: 'Number of business store cards you can collect.' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'], example: 'All' })
  @IsIn(['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page'])
  scope!: RuleScope
}

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
  @ApiProperty({ example: 'Prices for the selected tier...' })
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
  @IsPositive()
  value!: number
}

export class CreatePlanDto {
  @ApiProperty({ enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], example: 'Gold' })
  @IsIn(['Bronze', 'Silver', 'Gold', 'Platinum'])
  level!: PlanLevel

  @ApiProperty({ enum: ['business', 'consumer'], example: 'business' })
  @IsIn(['business', 'consumer'])
  audience!: PlanAudience

  @ApiPropertyOptional({ example: 'Gold' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'Premium access with guest passes...' })
  @IsOptional()
  @IsString()
  tagline?: string

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
  @ValidateNested({ each: true })
  @Type(() => PlanFeatureDto)
  features?: PlanFeatureDto[]

  @ApiPropertyOptional({ type: [PlanRuleDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PlanRuleDto)
  rules?: PlanRuleDto[]

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
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ example: 'Gold' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'Premium access with guest passes...' })
  @IsOptional()
  @IsString()
  tagline?: string

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
  @ValidateNested({ each: true })
  @Type(() => PlanFeatureDto)
  features?: PlanFeatureDto[]

  @ApiPropertyOptional({ type: [PlanRuleDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PlanRuleDto)
  rules?: PlanRuleDto[]

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

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string
}