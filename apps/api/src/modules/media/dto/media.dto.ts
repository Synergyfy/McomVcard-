import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateMediaFromUrlDto {
  @ApiProperty({ description: 'Source URL to store metadata for', example: 'https://example.com/uploads/photo.jpg' })
  @IsString()
  @MinLength(1, { message: 'url is required' })
  @MaxLength(1000, { message: 'url must be at most 1000 characters' })
  url!: string

  @ApiPropertyOptional({ description: 'MIME type', example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'mime_type must be at most 120 characters' })
  mime_type?: string
}