import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { PlanConfigurationDto } from '../../plans/dto/plan.dto'

export const SYSTEM_PLAN_TYPES = ['STANDARD', 'TRIAL', 'SEASONAL'] as const

/**
 * DTO mirroring the MCOM Solutions Generic Connector contract
 * (`ExternalPlan` / `CreateExternalPlanInput` in connector.interface.ts).
 *
 * The global ValidationPipe is `forbidNonWhitelisted`, so this class must
 * declare every field the connector may send (including informational ones
 * like `seasonId` that Vcard accepts but does not persist).
 */
export class SystemPlanDto {
  @ApiPropertyOptional({ example: 'Gold', description: 'Plan name (level is inferred from it)' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'High-tier access with the full VCard suite.' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @IsNumber()
  monthlyPrice?: number

  @ApiPropertyOptional({ example: 79.99 })
  @IsOptional()
  @IsNumber()
  quarterlyPrice?: number

  @ApiPropertyOptional({ example: 299.99 })
  @IsOptional()
  @IsNumber()
  annualPrice?: number

  @ApiPropertyOptional({ type: [String], example: ['50 Business VCards', 'Custom domain'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[]

  @ApiPropertyOptional({ type: PlanConfigurationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlanConfigurationDto)
  configuration?: PlanConfigurationDto

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ example: false, description: 'Marks the plan as the default/free tier' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @ApiPropertyOptional({ enum: SYSTEM_PLAN_TYPES, example: 'STANDARD' })
  @IsOptional()
  @IsIn(SYSTEM_PLAN_TYPES)
  type?: string

  @ApiPropertyOptional({ example: 14, description: 'Free trial length in days' })
  @IsOptional()
  @IsNumber()
  trialDuration?: number

  @ApiPropertyOptional({ example: 'uuid', description: 'Seasonal plan season ID (informational only)' })
  @IsOptional()
  @IsString()
  seasonId?: string

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

export class CreateSystemPlanDto extends SystemPlanDto {
  @ApiProperty({ example: 'Gold' })
  @IsString()
  @IsNotEmpty()
  name!: string
}

export class UpdateSystemPlanDto extends SystemPlanDto {}

/** Read model returned to the connector (mirrors `ExternalPlan`). */
export class SystemPlanResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string

  @ApiProperty({ example: 'Gold' })
  name!: string

  @ApiPropertyOptional({ example: 'High-tier access with the full VCard suite.' })
  description?: string

  @ApiPropertyOptional({ example: 29.99 })
  monthlyPrice?: number

  @ApiPropertyOptional({ example: 79.99 })
  quarterlyPrice?: number

  @ApiPropertyOptional({ example: 299.99 })
  annualPrice?: number

  @ApiPropertyOptional({ type: [String] })
  features?: string[]

  @ApiPropertyOptional({ type: PlanConfigurationDto })
  configuration?: PlanConfigurationDto

  @ApiPropertyOptional({ example: true })
  isActive?: boolean

  @ApiPropertyOptional({ example: false })
  isDefault?: boolean

  @ApiPropertyOptional({ enum: SYSTEM_PLAN_TYPES, example: 'STANDARD' })
  type?: string

  @ApiPropertyOptional({ example: 14 })
  trialDuration?: number

  @ApiPropertyOptional({ example: 'uuid' })
  seasonId?: string

  @ApiPropertyOptional({ example: 'price_123' })
  stripeMonthlyPriceId?: string

  @ApiPropertyOptional({ example: 'price_456' })
  stripeQuarterlyPriceId?: string

  @ApiPropertyOptional({ example: 'price_789' })
  stripeAnnualPriceId?: string

  @ApiPropertyOptional({ example: 'P-123' })
  paypalMonthlyPlanId?: string

  @ApiPropertyOptional({ example: 'P-456' })
  paypalQuarterlyPlanId?: string

  @ApiPropertyOptional({ example: 'P-789' })
  paypalAnnualPlanId?: string

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
  created_at?: string

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
  updated_at?: string
}