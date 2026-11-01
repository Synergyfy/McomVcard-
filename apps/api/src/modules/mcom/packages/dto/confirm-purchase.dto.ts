import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import type { PurchaseVariant } from './initiate-purchase.dto'

export class ConfirmPurchaseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'VCard plan id' })
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

  @ApiProperty({ description: 'MCOM Pay charge id returned by the purchase initiate call' })
  @IsString()
  @IsNotEmpty()
  chargeId!: string

  @ApiPropertyOptional({ description: 'Stripe PaymentIntent id after stripe.confirmPayment succeeds' })
  @IsOptional()
  @IsString()
  paymentIntentId?: string

  @ApiPropertyOptional({ description: 'PayPal order id (approval token) when returning from PayPal' })
  @IsOptional()
  @IsString()
  orderId?: string
}
