import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export const MCOM_WEBHOOK_EVENTS = [
  'package.created',
  'package.renewed',
  'package.cancelled',
  'package.expired',
  'payment.failed',
  'payment.succeeded',
  'payment.refunded',
] as const

export type McomWebhookEvent = (typeof MCOM_WEBHOOK_EVENTS)[number]

/**
 * The `data` envelope shared by MCOM lifecycle and MCOM Pay webhooks.
 * Lifecycle events carry `packageId`; MCOM Pay events carry `chargeId`.
 */
export class McomWebhookDataDto {
  @ApiPropertyOptional({ example: 'pkg_uuid_123' })
  @IsOptional()
  @IsString()
  packageId?: string

  @ApiPropertyOptional({ example: 'usr_uuid_456' })
  @IsOptional()
  @IsString()
  mcomUserId?: string

  @ApiPropertyOptional({ example: 'clx8p2qr10000x4vj3k5m7n9p', description: 'MCOM Pay charge id' })
  @IsOptional()
  @IsString()
  chargeId?: string

  @ApiPropertyOptional({ example: 'vcards:plan:a1b2...:standard', description: 'Partner reference on the charge' })
  @IsOptional()
  @IsString()
  reference?: string

  @ApiPropertyOptional({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', description: 'Local VCard user id' })
  @IsOptional()
  @IsString()
  externalCustomerId?: string

  @ApiPropertyOptional({ example: '10270', description: 'Charge amount in minor units' })
  @IsOptional()
  @IsString()
  amountMinor?: string

  @ApiPropertyOptional({ example: '9952' })
  @IsOptional()
  @IsString()
  netMinor?: string

  @ApiPropertyOptional({ example: '318' })
  @IsOptional()
  @IsString()
  feeMinor?: string

  @ApiPropertyOptional({ example: '10270', description: 'Original charge amount (refund events)' })
  @IsOptional()
  @IsString()
  chargeAmountMinor?: string

  @ApiPropertyOptional({ example: '10270', description: 'Total refunded so far (refund events)' })
  @IsOptional()
  @IsString()
  totalRefundedMinor?: string

  @ApiPropertyOptional({ enum: ['stripe', 'paypal', 'wallet'], example: 'wallet' })
  @IsOptional()
  @IsString()
  method?: string

  @ApiPropertyOptional({ example: 'wallet' })
  @IsOptional()
  @IsString()
  provider?: string

  @ApiPropertyOptional({ example: 'pi_3Pabc...' })
  @IsOptional()
  @IsString()
  providerRef?: string

  @ApiPropertyOptional({ example: 'paid' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ example: '2026-10-11T10:00:05.000Z' })
  @IsOptional()
  @IsString()
  paidAt?: string

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

/** The full webhook body dispatched by MCOM Solutions. */
export class McomWebhookDto {
  @ApiProperty({ enum: MCOM_WEBHOOK_EVENTS, example: 'package.created' })
  @IsIn(MCOM_WEBHOOK_EVENTS)
  event!: McomWebhookEvent

  @ApiProperty({ example: 'vcards' })
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
