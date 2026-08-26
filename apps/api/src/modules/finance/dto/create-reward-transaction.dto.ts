import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, MinLength } from 'class-validator'
import { RewardTransactionType } from '../entities/reward-transaction.entity'

export class CreateRewardTransactionDto {
  @ApiProperty({ description: 'Transaction type', enum: ['EARN', 'REDEEM', 'EXPIRE', 'ADJUST'], example: 'EARN' })
  @IsIn(['EARN', 'REDEEM', 'EXPIRE', 'ADJUST'], { message: 'type must be EARN, REDEEM, EXPIRE, or ADJUST' })
  type!: RewardTransactionType

  @ApiProperty({
    description: 'Amount. Positive for EARN/ADJUST-up. For REDEEM, EXPIRE, and ADJUST-down the balance must not go below zero.',
    example: 100,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number with at most 2 decimal places' })
  @Max(9999999999.99, { message: 'amount is too large' })
  amount!: number

  @ApiProperty({ description: 'Optional description', example: 'Points from purchase', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description?: string
}