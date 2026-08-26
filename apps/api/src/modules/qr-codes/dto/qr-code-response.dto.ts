import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { QrCode, QrDestinationType, QR_PUBLIC_BASE_URL } from '../entities/qr-code.entity'

export class QrCodeResponseDto {
  @ApiProperty({ description: 'QR code ID', example: 'e1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Card the QR belongs to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  card_id!: string

  @ApiProperty({ description: 'What the QR opens', enum: QrDestinationType, example: QrDestinationType.VCARD })
  destination_type!: QrDestinationType

  @ApiProperty({ description: 'Route target the QR resolves to', example: 'john-doe' })
  destination!: string

  @ApiProperty({ description: 'Whether the QR is active', example: true })
  is_active!: boolean

  @ApiProperty({ description: 'Public URL a device scans/opens to be routed to the destination', example: 'https://mcomvcard.link/qr/e1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  url!: string

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiProperty({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string

  static fromEntity(qr: QrCode): QrCodeResponseDto {
    const dto = new QrCodeResponseDto()

    dto.id = qr.id
    dto.card_id = qr.cardId
    dto.destination_type = qr.destinationType
    dto.destination = qr.destination
    dto.is_active = qr.isActive
    dto.url = `${QR_PUBLIC_BASE_URL}/${qr.id}`
    dto.created_at = qr.createdAt instanceof Date ? qr.createdAt.toISOString() : qr.createdAt
    dto.updated_at = qr.updatedAt instanceof Date ? qr.updatedAt.toISOString() : qr.updatedAt

    return dto
  }
}

export class QrResolveResponseDto {
  @ApiProperty({ description: 'QR code ID', example: 'e1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Card the QR belongs to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  card_id!: string

  @ApiProperty({ description: 'What the QR opens', enum: QrDestinationType, example: QrDestinationType.VCARD })
  destination_type!: QrDestinationType

  @ApiProperty({ description: 'Route target to send the visitor to', example: 'john-doe' })
  destination!: string

  static fromEntity(qr: QrCode): QrResolveResponseDto {
    const dto = new QrResolveResponseDto()

    dto.id = qr.id
    dto.card_id = qr.cardId
    dto.destination_type = qr.destinationType
    dto.destination = qr.destination

    return dto
  }
}