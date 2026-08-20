import { ApiProperty } from '@nestjs/swagger'
import { Media } from '../entities/media.entity'

const toIso = (d: Date | string): string =>
  d instanceof Date ? d.toISOString() : (d as string)

export class MediaResponseDto {
  @ApiProperty({ description: 'Media ID', example: 'f1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Uploading user', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  uploaded_by!: string

  @ApiProperty({ description: 'Storage provider', example: 'local' })
  provider!: string

  @ApiProperty({ description: 'Object key on the provider', example: 'uploads/8a1e2f3c/photo.jpg' })
  key!: string

  @ApiProperty({ description: 'Public URL', example: '/media/uploads/8a1e2f3c/photo.jpg' })
  url!: string

  @ApiProperty({ description: 'MIME type', example: 'image/jpeg' })
  mime_type!: string

  @ApiProperty({ description: 'Size in bytes', example: 45123 })
  size!: number

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  static fromEntity(media: Media): MediaResponseDto {
    const dto = new MediaResponseDto()

    dto.id = media.id
    dto.uploaded_by = media.uploadedBy
    dto.provider = media.provider
    dto.key = media.key
    dto.url = media.url
    dto.mime_type = media.mimeType
    dto.size = media.size
    dto.created_at = toIso(media.createdAt)

    return dto
  }
}