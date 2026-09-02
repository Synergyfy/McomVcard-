import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ChildCard } from '../../child-cards/entities/child-card.entity'

export class FamilyCardSummaryDto {
  @ApiProperty({ example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', description: 'Card ID' })
  id!: string

  @ApiProperty({ example: 'My Business Card', description: 'Card name' })
  name!: string | null

  @ApiProperty({ example: 'alice-wedding', description: 'Card slug' })
  slug!: string

  @ApiProperty({ example: 'PERSONAL', description: 'Card type' })
  type!: string

  @ApiProperty({ example: 'active', description: 'Card status' })
  status!: string
}

export class FamilyCardResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d', description: 'ChildCard record ID' })
  id!: string

  @ApiProperty({ description: 'Card details', type: FamilyCardSummaryDto })
  card!: FamilyCardSummaryDto

  @ApiProperty({ example: true, description: 'Can view the card' })
  can_view!: boolean

  @ApiProperty({ example: false, description: 'Can use wallet' })
  can_use_wallet!: boolean

  @ApiProperty({ example: false, description: 'Can manage the card' })
  can_manage!: boolean

  @ApiPropertyOptional({ example: 50.0, description: 'Wallet allocation', nullable: true })
  wallet_allocation!: number | null

  @ApiProperty({ example: '2026-08-20T09:00:00.000Z', description: 'Created at' })
  created_at!: string

  static fromEntity(entity: ChildCard): FamilyCardResponseDto {
    const dto = new FamilyCardResponseDto()

    dto.id = entity.id
    dto.card = {
      id: entity.card.id,
      name: entity.card.name,
      slug: entity.card.slug,
      type: entity.card.type,
      status: entity.card.status,
    }
    dto.can_view = entity.canView
    dto.can_use_wallet = entity.canUseWallet
    dto.can_manage = entity.canManage
    dto.wallet_allocation = entity.walletAllocation
    dto.created_at = entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt

    return dto
  }
}
