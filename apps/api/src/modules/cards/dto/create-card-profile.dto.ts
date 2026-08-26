import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCardProfileDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Display name shown on the card' })
  @IsString()
  @MaxLength(150)
  display_name: string

  @ApiPropertyOptional({ example: 'Digital marketer & coffee lover' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string

  @ApiPropertyOptional({ example: 'Marketing Lead' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title?: string

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png' })
  @IsOptional()
  @IsUrl()
  avatar?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.png' })
  @IsOptional()
  @IsUrl()
  cover_image?: string

  @ApiPropertyOptional({ example: 'San Francisco, CA' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string

  @ApiPropertyOptional({ example: 'https://janedoe.com' })
  @IsOptional()
  @IsUrl()
  website?: string
}