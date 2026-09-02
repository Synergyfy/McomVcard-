import { IsString, IsOptional, IsBoolean, IsIn, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateNewsletterCampaignDto {
  @ApiProperty({ example: 'Summer Sale Campaign' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string

  @ApiProperty({ example: 'Summer Sale - Up to 50% Off!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  subject!: string

  @ApiProperty({ example: '<h1>Hello!</h1><p>Check out our summer sale...</p>' })
  @IsString()
  @IsNotEmpty()
  body!: string

  @ApiPropertyOptional({ enum: ['draft', 'scheduled', 'sent'], example: 'draft' })
  @IsOptional()
  @IsIn(['draft', 'scheduled', 'sent'])
  status?: string

  @ApiPropertyOptional({ example: '2026-09-15T10:00:00.000Z' })
  @IsOptional()
  @IsString()
  scheduledAt?: string
}

export class UpdateNewsletterCampaignDto {
  @ApiPropertyOptional({ example: 'Updated Campaign Name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string

  @ApiPropertyOptional({ example: 'Updated Subject' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  subject?: string

  @ApiPropertyOptional({ example: '<p>Updated content</p>' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  body?: string

  @ApiPropertyOptional({ enum: ['draft', 'scheduled', 'sent'], example: 'draft' })
  @IsOptional()
  @IsIn(['draft', 'scheduled', 'sent'])
  status?: string

  @ApiPropertyOptional({ example: '2026-09-15T10:00:00.000Z' })
  @IsOptional()
  @IsString()
  scheduledAt?: string | null
}
