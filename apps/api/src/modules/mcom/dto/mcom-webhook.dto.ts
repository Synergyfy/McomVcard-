import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export const MCOM_WEBHOOK_EVENTS = [
  'package.created',
  'package.renewed',
  'package.cancelled',
  'package.expired',
  'payment.failed',
] as const

export type McomWebhookEvent = (typeof MCOM_WEBHOOK_EVENTS)[number]

/** The `data` envelope of an MCOM Solutions lifecycle webhook (spec §6.2). */
export class McomWebhookDataDto {
  @ApiProperty({ example: 'pkg_uuid_123' })
  @IsString()
  @IsNotEmpty()
  packageId!: string

  @ApiProperty({ example: 'usr_uuid_456' })
  @IsString()
  @IsNotEmpty()
  mcomUserId!: string

  @ApiPropertyOptional({ example: 'plan_uuid_789' })
  @IsOptional()
  @IsString()
  externalPlanId?: string

  @ApiPropertyOptional({ example: 'Pro Plan' })
  @IsOptional()
  @IsString()
  packageName?: string

  @ApiPropertyOptional({ enum: ['STANDARD', 'TRIAL', 'SEASONAL'], example: 'STANDARD' })
  @IsOptional()
  @IsString()
  planType?: string

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ enum: ['monthly', 'quarterly', 'annual'], example: 'monthly' })
  @IsOptional()
  @IsString()
  billingCycle?: string

  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @IsNumber()
  amount?: number

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ example: '2026-09-30T20:00:00.000Z' })
  @IsOptional()
  @IsString()
  expiresAt?: string

  @ApiPropertyOptional({ example: { maxCards: 10, allowCustomDomain: true } })
  @IsOptional()
  @IsObject()
  limits?: Record<string, unknown>
}

/** The full webhook body dispatched by MCOM Solutions (spec §6.2). */
export class McomWebhookDto {
  @ApiProperty({ enum: MCOM_WEBHOOK_EVENTS, example: 'package.created' })
  @IsIn(MCOM_WEBHOOK_EVENTS)
  event!: McomWebhookEvent

  @ApiProperty({ example: 'vcard' })
  @IsString()
  @IsNotEmpty()
  platform!: string

  @ApiPropertyOptional({ example: '2026-08-30T20:00:00.000Z' })
  @IsOptional()
  @IsString()
  timestamp?: string

  @ApiProperty({ type: McomWebhookDataDto })
  @IsObject()
  data!: McomWebhookDataDto
}