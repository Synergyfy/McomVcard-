import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'

export class CreateWalletTransactionDto {
  @ApiProperty({ description: 'Transaction type', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' })
  @IsIn(['CREDIT', 'DEBIT'], { message: 'type must be CREDIT or DEBIT' })
  type!: 'CREDIT' | 'DEBIT'

  @ApiProperty({ description: 'Amount to credit or debit', example: 25.5, minimum: 0.01, maximum: 9999999999.99 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number with at most 2 decimal places' })
  @Min(0.01, { message: 'amount must be greater than zero' })
  @Max(9999999999.99, { message: 'amount is too large' })
  amount!: number

  @ApiProperty({ description: 'Optional description', example: 'Wallet top-up', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description?: string

  @ApiPropertyOptional({
    description: 'Unique per business event. Required for centralized MCOM Wallet writes; retries reuse it.',
    example: '5b0f7d8e-6f39-4a2a-9f1d-0a2b3c4d5e6f',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string
}