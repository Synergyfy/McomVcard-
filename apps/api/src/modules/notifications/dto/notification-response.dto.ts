import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Notification } from '../entities/notification.entity'

const toIso = (d: Date | null | undefined): string | null =>
  d === null || d === undefined ? null : d instanceof Date ? d.toISOString() : (d as string)

export class NotificationResponseDto {
  @ApiProperty({ description: 'Notification ID', example: 'a1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Recipient user', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  user_id!: string

  @ApiProperty({ description: 'Notification type', example: 'system' })
  type!: string

  @ApiProperty({ description: 'Notification title', example: 'New review received' })
  title!: string

  @ApiPropertyOptional({ description: 'Notification message', example: 'Someone reviewed your business', nullable: true })
  message!: string | null

  @ApiPropertyOptional({ description: 'JSON payload', example: { business_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' }, nullable: true })
  data!: Record<string, unknown> | null

  @ApiProperty({ description: 'Read at', example: null, nullable: true })
  read_at!: string | null

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  static fromEntity(notification: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto()

    dto.id = notification.id
    dto.user_id = notification.userId
    dto.type = notification.type
    dto.title = notification.title
    dto.message = notification.message
    dto.data = notification.data
    dto.read_at = toIso(notification.readAt)
    dto.created_at = toIso(notification.createdAt)

    return dto
  }
}

export class UnreadCountDto {
  @ApiProperty({ description: 'Number of unread notifications', example: 3 })
  unread_count!: number

  static fromCount(count: number): UnreadCountDto {
    const dto = new UnreadCountDto()

    dto.unread_count = count

    return dto
  }
}