import { IsString, IsOptional, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCountryDto {
  @ApiProperty({ example: 'US' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code!: string

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string

  @ApiProperty({ example: '+1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  phoneCode!: string

  @ApiPropertyOptional({ example: '🇺🇸' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  flagEmoji?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateCountryDto {
  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code?: string

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string

  @ApiPropertyOptional({ example: '+1' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  phoneCode?: string

  @ApiPropertyOptional({ example: '🇺🇸' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  flagEmoji?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
