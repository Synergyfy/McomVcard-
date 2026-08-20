import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator'

export class CreateShareDto {
  @ApiProperty({ description: 'Card ID being shared', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  @IsUUID('4', { message: 'card_id must be a valid UUID' })
  card_id!: string

  @ApiProperty({ description: 'Platform the card was shared on (free-text)', example: 'whatsapp' })
  @IsString()
  @MinLength(2, { message: 'platform must be at least 2 characters' })
  @MaxLength(50, { message: 'platform must be at most 50 characters' })
  platform!: string
}