import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CashbackAccount } from '../entities/cashback-account.entity'
import { CashbackTransaction } from '../entities/cashback-transaction.entity'
import { CashbackRule } from '../entities/cashback-rule.entity'

export class CashbackAccountResponseDto {
  @ApiProperty({ description: 'Cashback account ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Owning user ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  user_id!: string

  @ApiProperty({ description: 'Current cashback balance', example: 12.5 })
  balance!: number

  @ApiProperty({ description: 'Account status', example: 'active' })
  status!: string

  @ApiProperty({ description: 'Created at', example: '2026-08-19T09:00:00.000Z' })
  created_at!: string

  @ApiPropertyOptional({ description: 'Updated at', example: '2026-08-19T09:00:00.000Z' })
  updated_at?: string

  static fromEntity(account: CashbackAccount): CashbackAccountResponseDto {
    const dto = new CashbackAccountResponseDto()

    dto.id = account.id
    dto.user_id = account.userId
    dto.balance = account.balance
    dto.status = account.status
    dto.created_at = account.createdAt instanceof Date ? account.createdAt.toISOString() : account.createdAt
    dto.updated_at = account.updatedAt instanceof Date ? account.updatedAt.toISOString() : account.updatedAt

    return dto
  }
}

export class CashbackTransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID', example: 'c9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Cashback account ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  cashback_account_id!: string

  @ApiProperty({ description: 'Transaction type', enum: ['EARN', 'REDEEM', 'ADJUST'], example: 'EARN' })
  type!: string

  @ApiProperty({ description: 'Signed amount (positive = balance up, negative = balance down)', example: 5 })
  amount!: number

  @ApiProperty({ description: 'Balance after this transaction', example: 12.5 })
  balance_after!: number

  @ApiPropertyOptional({ description: 'Description', example: 'Cashback from purchase', nullable: true })
  description!: string | null

  @ApiProperty({ description: 'Created at', example: '2026-08-19T09:00:00.000Z' })
  created_at!: string

  static fromEntity(transaction: CashbackTransaction): CashbackTransactionResponseDto {
    const dto = new CashbackTransactionResponseDto()

    dto.id = transaction.id
    dto.cashback_account_id = transaction.cashbackAccountId
    dto.type = transaction.type
    dto.amount = transaction.amount
    dto.balance_after = transaction.balanceAfter
    dto.description = transaction.description
    dto.created_at = transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt

    return dto
  }
}

export class CashbackRuleResponseDto {
  @ApiProperty({ description: 'Rule ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ description: 'Cashback percentage', example: 5 })
  percentage!: number

  @ApiPropertyOptional({ description: 'Minimum spend to qualify', example: 10, nullable: true })
  minimum_amount!: number | null

  @ApiPropertyOptional({ description: 'Maximum cashback payout', example: 50, nullable: true })
  maximum_amount!: number | null

  @ApiPropertyOptional({ description: 'Rule start date', example: '2026-08-19T00:00:00.000Z', nullable: true })
  starts_at!: string | null

  @ApiPropertyOptional({ description: 'Rule end date', example: '2027-08-19T00:00:00.000Z', nullable: true })
  ends_at!: string | null

  @ApiProperty({ description: 'Rule status', example: 'active' })
  status!: string

  @ApiProperty({ description: 'Created at', example: '2026-08-19T09:00:00.000Z' })
  created_at!: string

  @ApiPropertyOptional({ description: 'Updated at', example: '2026-08-19T09:00:00.000Z' })
  updated_at?: string

  static fromEntity(rule: CashbackRule): CashbackRuleResponseDto {
    const dto = new CashbackRuleResponseDto()

    dto.id = rule.id
    dto.percentage = rule.percentage
    dto.minimum_amount = rule.minimumAmount
    dto.maximum_amount = rule.maximumAmount
    dto.starts_at = rule.startsAt instanceof Date ? rule.startsAt.toISOString() : rule.startsAt
    dto.ends_at = rule.endsAt instanceof Date ? rule.endsAt.toISOString() : rule.endsAt
    dto.status = rule.status
    dto.created_at = rule.createdAt instanceof Date ? rule.createdAt.toISOString() : rule.createdAt
    dto.updated_at = rule.updatedAt instanceof Date ? rule.updatedAt.toISOString() : rule.updatedAt

    return dto
  }
}