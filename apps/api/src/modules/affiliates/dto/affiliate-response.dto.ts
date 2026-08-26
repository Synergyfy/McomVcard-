import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Affiliate } from '../entities/affiliate.entity'
import { Referral } from '../entities/referral.entity'
import { AffiliateTransaction } from '../entities/affiliate-transaction.entity'

export class AffiliateResponseDto {
  @ApiProperty({ description: 'Affiliate ID', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d' })
  id!: string

  @ApiProperty({ description: 'Owning user ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  user_id!: string

  @ApiProperty({ description: 'Unique affiliate code (referral code)', example: 'AFF-8K2QZ7' })
  affiliate_code!: string

  @ApiProperty({ description: 'Affiliate status', example: 'active' })
  status!: string

  @ApiProperty({ description: 'When the user joined as an affiliate', example: '2026-08-20T09:00:00.000Z' })
  joined_at!: string

  @ApiProperty({ description: 'Referral link that carries the affiliate code', example: 'https://mcomvcard.link/ref/AFF-8K2QZ7' })
  referral_link!: string

  @ApiProperty({ description: 'Number of referred users', example: 3 })
  referred_count!: number

  @ApiProperty({ description: 'Total commission earned (approved)', example: 15 })
  total_earned!: number

  @ApiProperty({ description: 'Pending commission awaiting approval', example: 5 })
  pending_earned!: number

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiPropertyOptional({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at?: string

  static fromEntity(affiliate: Affiliate, referredCount: number, totalEarned: number, pendingEarned: number): AffiliateResponseDto {
    const dto = new AffiliateResponseDto()

    dto.id = affiliate.id
    dto.user_id = affiliate.userId
    dto.affiliate_code = affiliate.affiliateCode
    dto.status = affiliate.status
    dto.joined_at = affiliate.joinedAt instanceof Date ? affiliate.joinedAt.toISOString() : affiliate.joinedAt
    dto.referral_link = `https://mcomvcard.link/ref/${affiliate.affiliateCode}`
    dto.referred_count = referredCount
    dto.total_earned = totalEarned
    dto.pending_earned = pendingEarned
    dto.created_at = affiliate.createdAt instanceof Date ? affiliate.createdAt.toISOString() : affiliate.createdAt
    dto.updated_at = affiliate.updatedAt instanceof Date ? affiliate.updatedAt.toISOString() : affiliate.updatedAt

    return dto
  }
}

export class ReferralUserDto {
  @ApiProperty({ description: 'Referred user ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ description: 'Referred user name', example: 'Jane Doe', nullable: true })
  name!: string | null

  @ApiProperty({ description: 'Referred user email', example: 'jane@example.com' })
  email!: string

  static fromEntity(referral: Referral): ReferralUserDto {
    const dto = new ReferralUserDto()

    dto.id = referral.referredUserId
    dto.name = referral.referredUser
      ? [referral.referredUser.firstName, referral.referredUser.lastName].filter(Boolean).join(' ') || null
      : null
    dto.email = referral.referredUser?.email ?? ''

    return dto
  }
}

export class ReferralResponseDto {
  @ApiProperty({ description: 'Referral ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Affiliate ID that earned the referral', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d' })
  affiliate_id!: string

  @ApiProperty({ description: 'Referred user', type: ReferralUserDto })
  referred_user!: ReferralUserDto

  @ApiProperty({ description: 'Attribution source', example: 'register' })
  source!: string

  @ApiProperty({ description: 'Referral status', example: 'CONVERTED' })
  status!: string

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  static fromEntity(referral: Referral): ReferralResponseDto {
    const dto = new ReferralResponseDto()

    dto.id = referral.id
    dto.affiliate_id = referral.affiliateId
    dto.referred_user = ReferralUserDto.fromEntity(referral)
    dto.source = referral.source
    dto.status = referral.status
    dto.created_at = referral.createdAt instanceof Date ? referral.createdAt.toISOString() : referral.createdAt

    return dto
  }
}

export class AffiliateTransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID', example: 'e1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Affiliate ID', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d' })
  affiliate_id!: string

  @ApiPropertyOptional({ description: 'Referral ID this commission is tied to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', nullable: true })
  referral_id!: string | null

  @ApiProperty({ description: 'Transaction type', enum: ['COMMISSION', 'PAYOUT', 'ADJUST'], example: 'COMMISSION' })
  type!: string

  @ApiProperty({ description: 'Transaction amount', example: 5 })
  amount!: number

  @ApiProperty({ description: 'Transaction status', enum: ['pending', 'approved', 'rejected'], example: 'pending' })
  status!: string

  @ApiPropertyOptional({ description: 'Description', example: 'Welcome commission for referred signup', nullable: true })
  description!: string | null

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiProperty({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string

  static fromEntity(transaction: AffiliateTransaction): AffiliateTransactionResponseDto {
    const dto = new AffiliateTransactionResponseDto()

    dto.id = transaction.id
    dto.affiliate_id = transaction.affiliateId
    dto.referral_id = transaction.referralId
    dto.type = transaction.type
    dto.amount = transaction.amount
    dto.status = transaction.status
    dto.description = transaction.description
    dto.created_at = transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt
    dto.updated_at = transaction.updatedAt instanceof Date ? transaction.updatedAt.toISOString() : transaction.updatedAt

    return dto
  }
}

export class ReferralLookupResponseDto {
  @ApiProperty({ description: 'Affiliate ID', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d' })
  affiliate_id!: string

  @ApiProperty({ description: 'Affiliate code', example: 'AFF-8K2QZ7' })
  affiliate_code!: string

  @ApiProperty({ description: 'Affiliate status', example: 'active' })
  status!: string

  static fromEntity(affiliate: Affiliate): ReferralLookupResponseDto {
    const dto = new ReferralLookupResponseDto()

    dto.affiliate_id = affiliate.id
    dto.affiliate_code = affiliate.affiliateCode
    dto.status = affiliate.status

    return dto
  }
}