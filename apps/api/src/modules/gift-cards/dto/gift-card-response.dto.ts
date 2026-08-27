import { ApiProperty } from '@nestjs/swagger'
import { GiftCard } from '../entities/gift-card.entity'
import { GiftCardStatus } from '../entities/gift-card.entity'

export class GiftCardResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ name: 'business_id', format: 'uuid' })
  businessId!: string

  @ApiProperty()
  title!: string

  @ApiProperty({ type: 'number' })
  value!: number

  @ApiProperty({ type: 'number' })
  price!: number

  @ApiProperty({ enum: GiftCardStatus })
  status!: GiftCardStatus

  @ApiProperty()
  sold!: number

  @ApiProperty({ name: 'created_at' })
  createdAt!: Date

  @ApiProperty({ name: 'updated_at' })
  updatedAt!: Date

  static fromEntity(entity: GiftCard): GiftCardResponseDto {
    const dto = new GiftCardResponseDto()
    dto.id = entity.id
    dto.businessId = entity.businessId
    dto.title = entity.title
    dto.value = Number(entity.value)
    dto.price = Number(entity.price)
    dto.status = entity.status
    dto.sold = entity.sold
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt
    return dto
  }
}