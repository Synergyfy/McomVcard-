import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Wallet } from '../entities/wallet.entity'
import { WalletTransaction } from '../entities/wallet-transaction.entity'
import { PartnerBalance, PartnerTransaction } from '../../mcom/mcom-wallet.service'

export class WalletResponseDto {
  @ApiPropertyOptional({ description: 'Wallet ID (null when served by the centralized MCOM Wallet)', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string | null

  @ApiProperty({ description: 'Owning user ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  user_id!: string

  @ApiProperty({ description: 'Current balance', example: 25.5 })
  balance!: number

  @ApiPropertyOptional({ description: 'Available balance (balance minus active holds)', example: 25.5 })
  available_balance?: number

  @ApiProperty({ description: 'Wallet currency', example: 'MCOM' })
  currency!: string

  @ApiProperty({ description: 'Wallet status', example: 'active' })
  status!: string

  @ApiPropertyOptional({ description: 'Created at', example: '2026-08-19T09:00:00.000Z' })
  created_at?: string | null

  @ApiPropertyOptional({ description: 'Updated at', example: '2026-08-19T09:00:00.000Z' })
  updated_at?: string | null

  static fromEntity(wallet: Wallet): WalletResponseDto {
    const dto = new WalletResponseDto()

    dto.id = wallet.id
    dto.user_id = wallet.userId
    dto.balance = wallet.balance
    dto.available_balance = wallet.balance
    dto.currency = wallet.currency
    dto.status = wallet.status
    dto.created_at = wallet.createdAt instanceof Date ? wallet.createdAt.toISOString() : wallet.createdAt
    dto.updated_at = wallet.updatedAt instanceof Date ? wallet.updatedAt.toISOString() : wallet.updatedAt

    return dto
  }

  /** Map the centralized MCOM Wallet balance response into the local shape. */
  static fromCentral(userId: string, balance: PartnerBalance): WalletResponseDto {
    const dto = new WalletResponseDto()

    dto.id = null
    dto.user_id = userId
    dto.balance = balance.balance
    dto.available_balance = balance.availableBalance
    dto.currency = balance.currency
    dto.status = String(balance.status || 'ACTIVE').toLowerCase()
    dto.created_at = null
    dto.updated_at = null

    return dto
  }
}

export class WalletTransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID', example: 'c9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiPropertyOptional({ description: 'Wallet ID (null when served by the centralized MCOM Wallet)', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  wallet_id!: string | null

  @ApiProperty({ description: 'Transaction type', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' })
  type!: string

  @ApiProperty({ description: 'Amount', example: 25.5 })
  amount!: number

  @ApiProperty({ description: 'Balance after this transaction', example: 25.5 })
  balance_after!: number

  @ApiPropertyOptional({ description: 'Description', example: 'Wallet top-up', nullable: true })
  description!: string | null

  @ApiPropertyOptional({ description: 'Reference from the originating platform', example: 'sub_inv_0042', nullable: true })
  reference?: string | null

  @ApiPropertyOptional({ description: 'Category', example: 'REWARD', nullable: true })
  category?: string | null

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

  /** Map a centralized MCOM Wallet transaction into the local shape. */
  static fromCentral(transaction: PartnerTransaction): WalletTransactionResponseDto {
    const dto = new WalletTransactionResponseDto()

    dto.id = transaction.id
    dto.wallet_id = null
    dto.type = transaction.type
    dto.amount = transaction.amount
    dto.balance_after = transaction.balanceAfter
    dto.description = transaction.description ?? null
    dto.reference = transaction.reference ?? null
    dto.category = transaction.category ?? null
    dto.created_at = transaction.createdAt

    return dto
  }
}