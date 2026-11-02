import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateConsumerProfileDto {
  @ApiPropertyOptional({ example: 'Jane', description: 'First name shown on your customer card', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string

  @ApiPropertyOptional({ example: 'Smith', description: 'Last name shown on your customer card', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string

  @ApiPropertyOptional({ example: 'jane@example.com', description: 'Contact email — changing it requires re-verification' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string

  @ApiPropertyOptional({ example: '+44 7700 900123', description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string

  @ApiPropertyOptional({ example: '12 High Street, London', description: 'Street address' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string

  @ApiPropertyOptional({ example: 'EC1A 1BB', description: 'Postal / ZIP code' })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  postcode?: string

  @ApiPropertyOptional({ example: 'United Kingdom', description: 'Country of residence' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string
}
