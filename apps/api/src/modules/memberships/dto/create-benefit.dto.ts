import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBenefitDto {
  @ApiProperty({ example: 'Free delivery', description: 'Benefit name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ example: 'Complimentary delivery on all orders' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ example: 'perk', enum: ['perk', 'discount', 'access', 'gift'], default: 'perk' })
  @IsOptional()
  @IsString()
  benefit_type?: string
}