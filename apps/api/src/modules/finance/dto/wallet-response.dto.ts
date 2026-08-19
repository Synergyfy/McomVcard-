import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Wallet } from '../entities/wallet.entity'
import { WalletTransaction } from '../entities/wallet-transaction.entity'

export class WalletResponseDto {
  @ApiProperty({ description: 'Wallet ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Owning user ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  user_id!: string

  @ApiProperty({ description: 'Current balance', example: 25.5 })
  balance!: number

  @ApiProperty({ description: 'Wallet currency', example: 'GBP' })
  currency!: string

  @ApiProperty({ description: 'Wallet status', example: 'active' })
  status!: string

  @ApiProperty({ description: 'Created at', example: '2026-08-19T09:00:00.000Z' })
  created_at!: string

  @ApiPropertyOptional({ description: 'Updated at', example: '2026-08-19T09:00:00.000Z' })
  updated_at?: string

  static fromEntity(wallet: Wallet): WalletResponseDto {
    const dto = new WalletResponseDto()

    dto.id = wallet.id
    dto.user_id = wallet.userId
    dto.balance = wallet.balance
    dto.currency = wallet.currency
    dto.status = wallet.status
    dto.created_at = wallet.createdAt instanceof Date ? wallet.createdAt.toISOString() : wallet.createdAt
    dto.updated_at = wallet.updatedAt instanceof Date ? wallet.updatedAt.toISOString() : wallet.updatedAt

    return dto
  }
}

export class WalletTransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID', example: 'c9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Wallet ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  wallet_id!: string

  @ApiProperty({ description: 'Transaction type', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' })
  type!: string

  @ApiProperty({ description: 'Amount', example: 25.5 })
  amount!: number

  @ApiProperty({ description: 'Balance after this transaction', example: 25.5 })
  balance_after!: number

  @ApiPropertyOptional({ description: 'Description', example: 'Wallet top-up', nullable: true })
  description!: string | null

  @ApiProperty({ description: 'Created at', example: '2026-08-19T09:00:00.000Z' })
  created_at!: string

  static fromEntity(transaction: WalletTransaction): WalletTransactionResponseDto {
    const dto = new WalletTransactionResponseDto()

    dto.id = transaction.id
    dto.wallet_id = transaction.walletId
    dto.type = transaction.type
    dto.amount = transaction.amount
    dto.balance_after = transaction.balanceAfter
    dto.description = transaction.description
    dto.created_at = transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt

    return dto
  }
}