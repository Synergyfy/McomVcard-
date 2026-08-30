import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class InitiatePurchaseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'VCard plan id exposed to MCOM Solutions via /api/v1/system/plans' })
  @IsUUID()
  externalPlanId!: string

  @ApiProperty({ enum: ['monthly', 'quarterly', 'annual'] })
  @IsIn(['monthly', 'quarterly', 'annual'])
  billingCycle!: 'monthly' | 'quarterly' | 'annual'

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