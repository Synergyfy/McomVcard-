import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ActivityLog } from '../../activity/entities/activity-log.entity'

export class CardActivityResponseDto {
  @ApiProperty({ description: 'Activity log ID', example: 'f1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Action title', example: 'Card viewed' })
  action!: string

  @ApiProperty({ description: 'Timestamp (ISO)', example: '2026-08-20T09:00:00.000Z' })
  time!: string

  @ApiProperty({ description: 'Activity type', example: 'card_view' })
  type!: string

  @ApiPropertyOptional({ description: 'Activity status derived from metadata', example: 'success', nullable: true })
  status!: string | null

  @ApiPropertyOptional({ description: 'Value extracted from metadata', nullable: true })
  value!: unknown

  static fromEntity(log: ActivityLog): CardActivityResponseDto {
    const dto = new CardActivityResponseDto()

    dto.id = log.id
    dto.action = log.title
    dto.time = log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt
    dto.type = log.type
    dto.status = (log.metadata as Record<string, unknown>)?.status as string | null ?? null
    dto.value = (log.metadata as Record<string, unknown>)?.value ?? null

    return dto
  }
}
