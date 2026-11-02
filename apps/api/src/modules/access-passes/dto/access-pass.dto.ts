import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  IsNotEmpty,
  IsIn,
  IsArray,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PlanFeatureDto } from '../../plans/dto/plan.dto'

export class AccessPassConfigurationDto {
  @ApiPropertyOptional({
    example: { maxVCards: 50, maxTeamMembers: 5 },
    description: 'Quota limits (numeric, -1 = unlimited) or toggles (boolean)',
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

export class CreateAccessPassDto {
  @ApiProperty({ example: '70-Day Business Boost', description: 'Free-form access pass name' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiPropertyOptional({ example: 'Everything you need to run your business for 70 days.' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: 30, description: 'One-off price for the whole pass' })
  @IsNumber()
  @Min(0)
  price!: number

  @ApiProperty({ example: 70, description: 'How many days of access the pass grants' })
  @IsInt()
  @Min(1)
  durationDays!: number

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ type: [PlanFeatureDto], description: 'Checklist shown on the pass card' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanFeatureDto)
  features?: PlanFeatureDto[]

  @ApiPropertyOptional({ type: AccessPassConfigurationDto, description: 'Quotas and feature flags granted by the pass' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AccessPassConfigurationDto)
  configuration?: AccessPassConfigurationDto

  @ApiPropertyOptional({ example: 'price_123' })
  @IsOptional()
  @IsString()
  stripePriceId?: string

  @ApiPropertyOptional({ example: 'P-123' })
  @IsOptional()
  @IsString()
  paypalPlanId?: string

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  popular?: boolean

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}

export class UpdateAccessPassDto {
  @ApiPropertyOptional({ example: '70-Day Business Boost' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'Everything you need to run your business for 70 days.' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ type: [PlanFeatureDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanFeatureDto)
  features?: PlanFeatureDto[]

  @ApiPropertyOptional({ type: AccessPassConfigurationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AccessPassConfigurationDto)
  configuration?: AccessPassConfigurationDto

  @ApiPropertyOptional({ example: 'price_123' })
  @IsOptional()
  @IsString()
  stripePriceId?: string

  @ApiPropertyOptional({ example: 'P-123' })
  @IsOptional()
  @IsString()
  paypalPlanId?: string

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  popular?: boolean

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}
