import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'
import { QrDestinationType } from '../entities/qr-code.entity'

export class CreateQrCodeDto {
  @ApiProperty({ description: 'Card the QR code belongs to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  @IsUUID('4', { message: 'card_id must be a valid UUID' })
  card_id!: string

  @ApiProperty({ description: 'What the QR should open', enum: QrDestinationType, example: QrDestinationType.VCARD })
  @IsEnum(QrDestinationType, { message: 'destination_type must be VCARD, BUSINESS_PROFILE, OFFER, or CAMPAIGN' })
  destination_type!: QrDestinationType

  @ApiProperty({ description: 'Route target the QR resolves to (card slug/id for VCARD, business slug/id for BUSINESS_PROFILE, offer/campaign id for OFFER/CAMPAIGN)', example: 'john-doe' })
  @IsString()
  @MinLength(1, { message: 'destination is required' })
  @MaxLength(500, { message: 'destination must be at most 500 characters' })
  destination!: string
}

export class UpdateQrCodeDto {
  @ApiPropertyOptional({ description: 'New destination type', enum: QrDestinationType, example: QrDestinationType.BUSINESS_PROFILE })
  @IsOptional()
  @IsEnum(QrDestinationType, { message: 'destination_type must be VCARD, BUSINESS_PROFILE, OFFER, or CAMPAIGN' })
  destination_type?: QrDestinationType

  @ApiPropertyOptional({ description: 'New route target', example: 'acme-corp' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'destination cannot be empty' })
  @MaxLength(500, { message: 'destination must be at most 500 characters' })
  destination?: string

  @ApiPropertyOptional({ description: 'Toggle the QR code active/inactive', example: false })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean' })
  is_active?: boolean
}