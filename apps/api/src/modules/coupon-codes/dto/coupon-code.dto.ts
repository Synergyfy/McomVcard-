import { IsString, IsOptional, IsBoolean, IsIn, IsNotEmpty, IsNumber, Min, MaxLength, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCouponCodeDto {
  @ApiProperty({ example: 'SUMMER20' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string

  @ApiProperty({ enum: ['PERCENT', 'FIXED'], example: 'PERCENT' })
  @IsIn(['PERCENT', 'FIXED'])
  discountType!: string

  @ApiProperty({ example: 20 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue!: number

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateCouponCodeDto {
  @ApiPropertyOptional({ example: 'SUMMER20' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code?: string

  @ApiPropertyOptional({ enum: ['PERCENT', 'FIXED'], example: 'PERCENT' })
  @IsOptional()
  @IsIn(['PERCENT', 'FIXED'])
  discountType?: string

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue?: number

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
