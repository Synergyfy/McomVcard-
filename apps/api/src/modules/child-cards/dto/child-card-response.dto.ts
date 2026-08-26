import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ChildCard } from '../entities/child-card.entity'

export class ChildCardUserSummaryDto {
  @ApiProperty({ description: 'User ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ description: 'First name', example: 'Charlie', nullable: true })
  first_name!: string | null

  @ApiProperty({ description: 'Last name', example: 'Doe', nullable: true })
  last_name!: string | null

  @ApiProperty({ description: 'Email', example: 'charlie@example.com' })
  email!: string
}

export class ChildCardCardSummaryDto {
  @ApiProperty({ description: 'Card ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Card slug', example: 'alice-wedding' })
  slug!: string

  @ApiProperty({ description: 'Card type', enum: ['PERSONAL', 'BUSINESS'], example: 'PERSONAL' })
  type!: string
}

export class ChildCardResponseDto {
  @ApiProperty({ description: 'ChildCard ID', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d' })
  id!: string

  @ApiProperty({ description: 'Card being shared', type: ChildCardCardSummaryDto })
  card!: ChildCardCardSummaryDto

  @ApiProperty({ description: 'Child user with access', type: ChildCardUserSummaryDto })
  child!: ChildCardUserSummaryDto

  @ApiProperty({ description: 'Child may view the card', example: true })
  can_view!: boolean

  @ApiProperty({ description: 'Child may use the parent wallet', example: false })
  can_use_wallet!: boolean

  @ApiProperty({ description: 'Child may manage the card', example: false })
  can_manage!: boolean

  @ApiPropertyOptional({ description: 'Wallet amount allocated to the child', example: 50.0, nullable: true })
  wallet_allocation!: number | null

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiProperty({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string

  private static summarizeUser(user: { id: string; firstName: string | null; lastName: string | null; email: string }): ChildCardUserSummaryDto {
    return { id: user.id, first_name: user.firstName, last_name: user.lastName, email: user.email }
  }

  private static summarizeCard(card: { id: string; slug: string; type: string }): ChildCardCardSummaryDto {
    return { id: card.id, slug: card.slug, type: card.type }
  }

  static fromEntity(entity: ChildCard): ChildCardResponseDto {
    const dto = new ChildCardResponseDto()

    dto.id = entity.id
    dto.card = this.summarizeCard(entity.card)
    dto.child = this.summarizeUser(entity.child)
    dto.can_view = entity.canView
    dto.can_use_wallet = entity.canUseWallet
    dto.can_manage = entity.canManage
    dto.wallet_allocation = entity.walletAllocation
    dto.created_at = entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt
    dto.updated_at = entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt

    return dto
  }
}