import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { GiftCard } from '../entities/gift-card.entity'
import { CashbackProgram } from '../entities/cashback-program.entity'

export class GiftCardResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string

  @ApiProperty({ example: 'b9e0e8d4-...' })
  business_id!: string

  @ApiProperty({ example: 'GreenLeaf £10 Gift Card' })
  title!: string

  @ApiProperty({ example: 10 })
  value!: number

  @ApiProperty({ example: 10 })
  price!: number

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ example: 240 })
  sold!: number

  @ApiProperty({ example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiProperty({ example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string

  static fromEntity(e: GiftCard): GiftCardResponseDto {
    const dto = new GiftCardResponseDto()
    dto.id = e.id
    dto.business_id = e.businessId
    dto.title = e.title
    dto.value = e.value
    dto.price = e.price
    dto.status = e.status
    dto.sold = e.sold
    dto.created_at = e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt
    dto.updated_at = e.updatedAt instanceof Date ? e.updatedAt.toISOString() : e.updatedAt
    return dto
  }
}

export class CashbackProgramResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string

  @ApiProperty({ example: 'b9e0e8d4-...' })
  business_id!: string

  @ApiProperty({ example: 'Loyalty Cashback' })
  title!: string

  @ApiProperty({ example: 3 })
  rate!: number

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ example: 127.40 })
  earned!: number

  @ApiProperty({ example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiProperty({ example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string

  static fromEntity(e: CashbackProgram): CashbackProgramResponseDto {
    const dto = new CashbackProgramResponseDto()
    dto.id = e.id
    dto.business_id = e.businessId
    dto.title = e.title
    dto.rate = e.rate
    dto.status = e.status
    dto.earned = e.earned
    dto.created_at = e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt
    dto.updated_at = e.updatedAt instanceof Date ? e.updatedAt.toISOString() : e.updatedAt
    return dto
  }
}
