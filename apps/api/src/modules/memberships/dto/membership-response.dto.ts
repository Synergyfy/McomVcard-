import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Membership } from '../entities/membership.entity'

export class MembershipTierSummaryDto {
  @ApiProperty({ description: 'Tier ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ description: 'Tier name', example: 'Gold' })
  name!: string

  @ApiProperty({ description: 'Discount type', enum: ['percentage', 'fixed'], example: 'percentage' })
  discount_type!: string

  @ApiProperty({ description: 'Discount value', example: 10 })
  discount_value!: number
}

export class MembershipResponseDto {
  @ApiProperty({ description: 'Membership ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Owning user ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  user_id!: string

  @ApiProperty({ description: 'Assigned tier ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  membership_tier_id!: string

  @ApiProperty({ description: 'Tier summary', type: MembershipTierSummaryDto })
  tier!: MembershipTierSummaryDto

  @ApiProperty({ description: 'Membership status', enum: ['active', 'cancelled', 'expired'], example: 'active' })
  status!: string

  @ApiProperty({ description: 'Start date', example: '2026-08-19T09:00:00.000Z' })
  started_at!: string

  @ApiPropertyOptional({ description: 'Expiry date (null = open-ended)', example: '2027-08-19T09:00:00.000Z', nullable: true })
  expires_at!: string | null

  @ApiProperty({ description: 'Created at', example: '2026-08-19T09:00:00.000Z' })
  created_at!: string

  static fromEntity(membership: Membership): MembershipResponseDto {
    const dto = new MembershipResponseDto()

    dto.id = membership.id
    dto.user_id = membership.userId
    dto.membership_tier_id = membership.membershipTierId

    dto.tier = {
      id: membership.tier.id,
      name: membership.tier.name,
      discount_type: membership.tier.discountType,
      discount_value: membership.tier.discountValue,
    }

    dto.status = membership.status
    dto.started_at = membership.startedAt instanceof Date ? membership.startedAt.toISOString() : membership.startedAt
    dto.expires_at = membership.expiresAt instanceof Date ? membership.expiresAt.toISOString() : membership.expiresAt
    dto.created_at = membership.createdAt instanceof Date ? membership.createdAt.toISOString() : membership.createdAt

    return dto
  }
}