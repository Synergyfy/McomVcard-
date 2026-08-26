import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RewardBalance } from '../entities/reward-balance.entity'
import { RewardTransaction } from '../entities/reward-transaction.entity'

export class RewardBalanceResponseDto {
  @ApiProperty({ description: 'Reward balance ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Owning user ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  user_id!: string

  @ApiProperty({ description: 'Current points balance', example: 250 })
  balance!: number

  @ApiProperty({ description: 'Balance status', example: 'active' })
  status!: string

  @ApiProperty({ description: 'Created at', example: '2026-08-19T09:00:00.000Z' })
  created_at!: string

  @ApiPropertyOptional({ description: 'Updated at', example: '2026-08-19T09:00:00.000Z' })
  updated_at?: string

  static fromEntity(balance: RewardBalance): RewardBalanceResponseDto {
    const dto = new RewardBalanceResponseDto()

    dto.id = balance.id
    dto.user_id = balance.userId
    dto.balance = balance.balance
    dto.status = balance.status
    dto.created_at = balance.createdAt instanceof Date ? balance.createdAt.toISOString() : balance.createdAt
    dto.updated_at = balance.updatedAt instanceof Date ? balance.updatedAt.toISOString() : balance.updatedAt

    return dto
  }
}

export class RewardTransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID', example: 'c9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Reward balance ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  reward_balance_id!: string

  @ApiProperty({ description: 'Transaction type', enum: ['EARN', 'REDEEM', 'EXPIRE', 'ADJUST'], example: 'EARN' })
  type!: string

  @ApiProperty({ description: 'Signed amount (positive = balance up, negative = balance down)', example: 100 })
  amount!: number

  @ApiProperty({ description: 'Balance after this transaction', example: 250 })
  balance_after!: number

  @ApiPropertyOptional({ description: 'Description', example: 'Points from purchase', nullable: true })
  description!: string | null

  @ApiProperty({ description: 'Created at', example: '2026-08-19T09:00:00.000Z' })
  created_at!: string

  static fromEntity(transaction: RewardTransaction): RewardTransactionResponseDto {
    const dto = new RewardTransactionResponseDto()

    dto.id = transaction.id
    dto.reward_balance_id = transaction.rewardBalanceId
    dto.type = transaction.type
    dto.amount = transaction.amount
    dto.balance_after = transaction.balanceAfter
    dto.description = transaction.description
    dto.created_at = transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt

    return dto
  }
}