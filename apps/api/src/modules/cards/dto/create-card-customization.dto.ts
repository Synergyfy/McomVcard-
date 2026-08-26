import { IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCardCustomizationDto {
  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logo?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/hero.png' })
  @IsOptional()
  @IsUrl()
  hero_image?: string

  @ApiPropertyOptional({ example: '#0f172a' })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  primary_color?: string

  @ApiPropertyOptional({ example: '#f59e0b' })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  secondary_color?: string

  @ApiPropertyOptional({ example: 'Poppins' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  font?: string

  @ApiPropertyOptional({ example: 'modern' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  layout?: string

  @ApiPropertyOptional({ example: { wallet: true, rewards: false } })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, unknown>
}