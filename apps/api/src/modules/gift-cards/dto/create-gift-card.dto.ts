import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsIn, MaxLength, Min, IsUUID } from 'class-validator'
import { GiftCardStatus } from '../entities/gift-card.entity'

export class CreateGiftCardDto {
  @ApiProperty({ example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', description: 'Business ID' })
  @IsUUID()
  business_id!: string

  @ApiProperty({ example: 'Summer Gift Card', description: 'Title of the gift card' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string

  @ApiProperty({ example: 100, description: 'Face value of the gift card' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  value!: number

  @ApiProperty({ example: 90, description: 'Purchase price of the gift card' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price!: number

  @ApiPropertyOptional({ enum: GiftCardStatus, default: GiftCardStatus.ACTIVE })
  @IsOptional()
  @IsIn(Object.values(GiftCardStatus))
  status?: GiftCardStatus
}