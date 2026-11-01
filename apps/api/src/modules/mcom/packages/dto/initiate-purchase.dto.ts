import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator'

export type PurchaseVariant = 'standard' | 'pro' | 'pro_plus'

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

  @ApiProperty({ enum: ['stripe', 'paypal', 'wallet'] })
  @IsIn(['stripe', 'paypal', 'wallet'])
  provider!: 'stripe' | 'paypal' | 'wallet'

  @ApiPropertyOptional({ description: 'Return URL after payment completes (defaults to the web confirmation page)' })
  @IsOptional()
  @IsString()
  returnUrl?: string

  @ApiPropertyOptional({ description: 'Cancel URL if the user abandons payment' })
  @IsOptional()
  @IsString()
  cancelUrl?: string
}
