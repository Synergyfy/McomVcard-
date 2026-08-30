import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class ConfirmPurchaseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'VCard plan id' })
  @IsUUID()
  externalPlanId!: string

  @ApiProperty({ enum: ['monthly', 'quarterly', 'annual'] })
  @IsIn(['monthly', 'quarterly', 'annual'])
  billingCycle!: 'monthly' | 'quarterly' | 'annual'

  @ApiPropertyOptional({ description: 'Stripe PaymentIntent id (pi_...) after stripe.confirmPayment succeeded. Required unless setupIntentId is provided.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  paymentIntentId?: string

  @ApiPropertyOptional({ description: 'Stripe SetupIntent id (seti_...) after stripe.confirmSetup succeeded (trial / £0 plans). Required unless paymentIntentId is provided.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  setupIntentId?: string
}