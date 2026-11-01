import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'

export type PurchaseVariant = 'standard' | 'pro' | 'pro_plus'
export type PurchaseProvider = 'wallet' | 'stripe' | 'paypal'

export class InitiatePurchaseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'VCard plan id exposed to MCOM Solutions via /api/v1/system/plans' })
  @IsUUID()
  externalPlanId!: string

  @ApiPropertyOptional({
    enum: ['standard', 'pro', 'pro_plus'],
    description: 'Plan variant: standard (90 days), pro (180 days), pro_plus (365 days). Preferred.',
  })
  @IsOptional()
  @IsIn(['standard', 'pro', 'pro_plus'])
  variant?: PurchaseVariant

  /** @deprecated use variant */
  @ApiPropertyOptional({ enum: ['monthly', 'quarterly', 'semiannual', 'annual'], description: 'Legacy billing cycle. Use variant instead.' })
  @IsOptional()
  @IsIn(['monthly', 'quarterly', 'semiannual', 'annual'])
  billingCycle?: 'monthly' | 'quarterly' | 'semiannual' | 'annual'

  @ApiProperty({
    enum: ['wallet', 'stripe', 'paypal'],
    example: 'wallet',
    description: 'Payment method processed by MCOM Pay.',
  })
  @IsIn(['wallet', 'stripe', 'paypal'])
  provider!: PurchaseProvider

  @ApiProperty({
    description:
      'Unique per purchase attempt (UUID recommended). Retries MUST reuse the same key so MCOM returns the original charge instead of charging twice.',
    example: '5b0f7d8e-6f39-4a2a-9f1d-0a2b3c4d5e6f',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @IsNotEmpty()
  idempotencyKey!: string
}
