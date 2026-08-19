import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, MinLength } from 'class-validator'
import { CashbackTransactionType } from '../entities/cashback-transaction.entity'

export class CreateCashbackTransactionDto {
  @ApiProperty({ description: 'Transaction type', enum: ['EARN', 'REDEEM', 'ADJUST'], example: 'EARN' })
  @IsIn(['EARN', 'REDEEM', 'ADJUST'], { message: 'type must be EARN, REDEEM, or ADJUST' })
  type!: CashbackTransactionType

  @ApiProperty({
    description: 'Amount. Positive for EARN/ADJUST-up. For REDEEM and ADJUST-down the balance must not go below zero.',
    example: 5,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number with at most 2 decimal places' })
  @Max(9999999999.99, { message: 'amount is too large' })
  amount!: number

  @ApiProperty({ description: 'Optional description', example: 'Cashback from purchase', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description?: string
}