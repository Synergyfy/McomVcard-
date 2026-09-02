import { ApiProperty } from '@nestjs/swagger'
import { Share } from '../../shares/entities/share.entity'

export class ShareContentResponseDto {
  @ApiProperty({ example: 'e1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', description: 'Share record ID' })
  id!: string

  @ApiProperty({ example: 'My Business Card', description: 'Card title' })
  card_title!: string

  @ApiProperty({ example: 'whatsapp', description: 'Platform shared on' })
  source!: string

  @ApiProperty({ example: 'active', description: 'Card status' })
  status!: string

  @ApiProperty({ example: '2026-08-20T09:00:00.000Z', description: 'Shared at' })
  created_at!: string

  static fromEntity(share: Share): ShareContentResponseDto {
    const dto = new ShareContentResponseDto()

    dto.id = share.id
    dto.card_title = share.card?.name ?? 'Untitled'
    dto.source = share.platform
    dto.status = share.card?.status ?? 'unknown'
    dto.created_at = share.createdAt instanceof Date ? share.createdAt.toISOString() : share.createdAt

    return dto
  }
}
