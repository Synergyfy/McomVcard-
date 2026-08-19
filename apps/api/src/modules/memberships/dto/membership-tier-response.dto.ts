import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MembershipTier } from '../entities/membership-tier.entity'
import { Benefit } from '../entities/benefit.entity'

export class MembershipTierResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'Gold' })
  name!: string

  @ApiPropertyOptional({ example: 'Premium tier with extra perks' })
  description!: string | null

  @ApiProperty({ example: 'percentage' })
  discount_type!: string

  @ApiProperty({ example: 10 })
  discount_value!: number

  @ApiProperty({ example: 2 })
  sort_order!: number

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiPropertyOptional({ example: [{ id: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', name: 'Free delivery' }], type: 'array' })
  benefits!: Pick<Benefit, 'id' | 'name'>[]

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(tier: MembershipTier): MembershipTierResponseDto {
    const dto = new MembershipTierResponseDto()

    dto.id = tier.id
    dto.name = tier.name
    dto.description = tier.description ?? null
    dto.discount_type = tier.discountType
    dto.discount_value = tier.discountValue
    dto.sort_order = tier.sortOrder
    dto.status = tier.status
    dto.benefits = (tier.benefits ?? []).map((mb) => ({ id: mb.benefit.id, name: mb.benefit.name }))
    dto.created_at = tier.createdAt
    dto.updated_at = tier.updatedAt

    return dto
  }
}