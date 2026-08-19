import { Transform } from 'class-transformer'
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateMembershipTierDto {
  @ApiProperty({ example: 'Gold', description: 'Tier name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ example: 'Premium tier with extra perks' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ example: 'percentage', enum: ['percentage', 'fixed'], default: 'percentage' })
  @IsOptional()
  @IsIn(['percentage', 'fixed'])
  discount_type?: string

  @ApiPropertyOptional({ example: 10, description: 'Discount value (percent when percentage, amount when fixed)' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? undefined : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  discount_value?: number

  @ApiPropertyOptional({ example: 2, description: 'Display order (lower sorts first)' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  sort_order?: number
}