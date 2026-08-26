import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsISO8601, IsNumber, IsOptional, Max, Min } from 'class-validator'

export class CreateCashbackRuleDto {
  @ApiProperty({ description: 'Cashback percentage', example: 5, minimum: 0.01, maximum: 100 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'percentage must be a number with at most 2 decimal places' })
  @Min(0.01, { message: 'percentage must be greater than zero' })
  @Max(100, { message: 'percentage cannot exceed 100' })
  percentage!: number

  @ApiPropertyOptional({ description: 'Minimum spend to qualify for cashback', example: 10, nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'minimum_amount must be a number' })
  @Min(0, { message: 'minimum_amount cannot be negative' })
  minimum_amount?: number

  @ApiPropertyOptional({ description: 'Maximum cashback payout', example: 50, nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'maximum_amount must be a number' })
  @Min(0, { message: 'maximum_amount cannot be negative' })
  maximum_amount?: number

  @ApiPropertyOptional({ description: 'Rule start date (ISO 8601)', example: '2026-08-19T00:00:00.000Z', nullable: true })
  @IsOptional()
  @IsISO8601({}, { message: 'starts_at must be a valid ISO 8601 date' })
  starts_at?: string

  @ApiPropertyOptional({ description: 'Rule end date (ISO 8601)', example: '2027-08-19T00:00:00.000Z', nullable: true })
  @IsOptional()
  @IsISO8601({}, { message: 'ends_at must be a valid ISO 8601 date' })
  ends_at?: string
}