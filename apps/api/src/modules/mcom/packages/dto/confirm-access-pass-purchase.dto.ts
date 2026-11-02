import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class ConfirmAccessPassPurchaseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Access pass id',
  })
  @IsUUID()
  accessPassId!: string

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
