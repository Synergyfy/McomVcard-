import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Offer, DiscountType } from '../entities/offer.entity'

export class NearbyOfferResponseDto {
  @ApiProperty({ description: 'Offer ID', example: 'd2e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Offer title', example: '20% off all treatments' })
  title!: string

  @ApiPropertyOptional({ description: 'Offer description', example: 'Valid on all beauty treatments this month', nullable: true })
  description!: string | null

  @ApiProperty({ description: 'Discount type', enum: DiscountType, example: DiscountType.PERCENT })
  discount_type!: DiscountType

  @ApiProperty({ description: 'Discount value', example: 20 })
  discount_value!: number

  @ApiProperty({ description: 'Business name', example: 'Bloom Beauty' })
  business_name!: string

  static fromEntity(offer: Offer): NearbyOfferResponseDto {
    const dto = new NearbyOfferResponseDto()

    dto.id = offer.id
    dto.title = offer.title
    dto.description = offer.description
    dto.discount_type = offer.discountType
    dto.discount_value = offer.discountValue
    dto.business_name = offer.business?.name ?? 'Unknown business'

    return dto
  }
}
