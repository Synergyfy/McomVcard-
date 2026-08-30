import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CapturePurchaseDto {
  @ApiProperty({ description: 'PayPal order id returned from the approval redirect (token query param)' })
  @IsString()
  @IsNotEmpty()
  orderId!: string
}