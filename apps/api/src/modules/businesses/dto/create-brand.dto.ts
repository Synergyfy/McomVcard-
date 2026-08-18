import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBrandDto {
  @ApiProperty({ example: 'Acme Signature', description: 'Brand name' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string

  @ApiPropertyOptional({ example: 'Premium line of coffee', description: 'Brand description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png', description: 'Brand logo URL' })
  @IsOptional()
  @IsUrl()
  logo_url?: string
}