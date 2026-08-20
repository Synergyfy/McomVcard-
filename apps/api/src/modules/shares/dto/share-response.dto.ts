import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Share } from '../entities/share.entity'

export class ShareResponseDto {
  @ApiProperty({ description: 'Share ID', example: 'e1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'User who shared the card', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  user_id!: string

  @ApiProperty({ description: 'Card ID being shared', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  card_id!: string

  @ApiProperty({ description: 'Platform the card was shared on', example: 'whatsapp' })
  platform!: string

  @ApiPropertyOptional({ description: 'Affiliate ID attached for attribution', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d', nullable: true })
  affiliate_id!: string | null

  @ApiPropertyOptional({ description: 'Referral code attached for attribution', example: 'AFF-8K2QZ7', nullable: true })
  referral_code!: string | null

  @ApiProperty({ description: 'Shared at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  static fromEntity(share: Share): ShareResponseDto {
    const dto = new ShareResponseDto()

    dto.id = share.id
    dto.user_id = share.userId
    dto.card_id = share.cardId
    dto.platform = share.platform
    dto.affiliate_id = share.affiliateId
    dto.referral_code = share.referralCode
    dto.created_at = share.createdAt instanceof Date ? share.createdAt.toISOString() : share.createdAt

    return dto
  }
}

export class ShareStatsResponseDto {
  @ApiProperty({ description: 'Card ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  card_id!: string

  @ApiProperty({ description: 'Total number of shares', example: 12 })
  total_shares!: number

  @ApiProperty({ description: 'Shares grouped by platform', example: { whatsapp: 5, email: 4, sms: 3 } })
  by_platform!: Record<string, number>

  @ApiProperty({ description: 'Shares with affiliate attribution', example: 7 })
  attributed_shares!: number

  static fromData(cardId: string, total: number, byPlatform: Record<string, number>, attributed: number): ShareStatsResponseDto {
    const dto = new ShareStatsResponseDto()

    dto.card_id = cardId
    dto.total_shares = total
    dto.by_platform = byPlatform
    dto.attributed_shares = attributed

    return dto
  }
}