import { IsArray, IsBoolean, IsDateString, IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCardAccessDto {
  @ApiPropertyOptional({ example: false, description: 'Whether access control is enabled for this card' })
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean

  @ApiPropertyOptional({ example: 'secret123', description: 'Plaintext password protecting the card' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @ApiPropertyOptional({ example: 'Password hint text', description: 'A hint shown to users when they try to access protected sections' })
  @IsOptional()
  @IsString()
  hint?: string

  @ApiPropertyOptional({ example: { wallet: true, rewards: true } })
  @IsOptional()
  @IsObject()
  protected_sections?: Record<string, boolean>

  @ApiPropertyOptional({ example: ['profile', 'wallet'], description: 'Array of section schema IDs that require password to view' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  protected_section_ids?: string[]

  @ApiPropertyOptional({ example: 'never', enum: ['never', 'until'], description: 'Access expiry policy' })
  @IsOptional()
  @IsIn(['never', 'until'])
  access_expiry?: string

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z', description: 'Required when access_expiry is "until"' })
  @IsOptional()
  @IsDateString()
  expires_at?: string
}