import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator'

export class AllocateToChildDto {
  @ApiProperty({ description: 'Child card share ID', example: 'c9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  @IsUUID()
  child_card_id!: string

  @ApiProperty({ description: 'Amount to allocate', example: 50, minimum: 0.01, maximum: 9999999999.99 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number with at most 2 decimal places' })
  @Min(0.01, { message: 'amount must be greater than zero' })
  @Max(9999999999.99, { message: 'amount is too large' })
  amount!: number

  @ApiPropertyOptional({
    description: 'Unique per allocation attempt. Required for centralized MCOM Wallet debits; retries reuse it.',
    example: '5b0f7d8e-6f39-4a2a-9f1d-0a2b3c4d5e6f',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string
}
