import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'
import type { PurchaseProvider } from './initiate-purchase.dto'

export class InitiateAccessPassPurchaseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Access pass id returned by /v1/mcom/packages/access-passes',
  })
  @IsUUID()
  accessPassId!: string

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
