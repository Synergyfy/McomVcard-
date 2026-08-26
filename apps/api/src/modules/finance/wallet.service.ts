import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Wallet } from './entities/wallet.entity'
import { WalletTransaction } from './entities/wallet-transaction.entity'
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { WalletResponseDto, WalletTransactionResponseDto } from './dto/wallet-response.dto'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletsRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction) private walletTransactionsRepo: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async getMyWallet(userId: string) {
    const wallet = await this.walletsRepo.findOne({ where: { userId } })

    if (!wallet) throw new NotFoundException('Wallet not found. Create one first.')

    return ApiResponse.success(WalletResponseDto.fromEntity(wallet), 'Wallet retrieved', 200)
  }

  async createWallet(userId: string) {
    const existing = await this.walletsRepo.findOne({ where: { userId } })

    if (existing) return ApiResponse.success(WalletResponseDto.fromEntity(existing), 'Wallet already exists', 200)

    const saved = await this.walletsRepo.save(
      this.walletsRepo.create({ userId, balance: 0, currency: 'GBP', status: 'active' }),
    )

    return ApiResponse.success(WalletResponseDto.fromEntity(saved), 'Wallet created', 201)
  }

  async listMyTransactions(userId: string) {
    const wallet = await this.getOwnedWallet(userId)

    const transactions = await this.walletTransactionsRepo.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(transactions.map(WalletTransactionResponseDto.fromEntity), 'Wallet transactions retrieved', 200)
  }

  async getMyTransaction(userId: string, transactionId: string) {
    const wallet = await this.getOwnedWallet(userId)

    const transaction = await this.walletTransactionsRepo.findOne({
      where: { id: transactionId, walletId: wallet.id },
    })

    if (!transaction) throw new NotFoundException('Wallet transaction not found')

    return ApiResponse.success(WalletTransactionResponseDto.fromEntity(transaction), 'Wallet transaction retrieved', 200)
  }

  async createTransaction(userId: string, dto: CreateWalletTransactionDto) {
    const wallet = await this.getOwnedWallet(userId)

    if (wallet.status !== 'active') throw new BadRequestException('Wallet is not active')

    const sign = dto.type === 'CREDIT' ? 1 : -1
    const balanceAfter = Number((wallet.balance + sign * dto.amount).toFixed(2))

    if (balanceAfter < 0) throw new BadRequestException('Insufficient wallet balance for this debit')

    // The transaction table is the ledger — balance and ledger row must be written atomically (spec §34).
    const saved = await this.dataSource.transaction(async (manager) => {
      const transaction = await manager.save(
        this.walletTransactionsRepo.create({
          walletId: wallet.id,
          type: dto.type,
          amount: dto.amount,
          balanceAfter,
          description: dto.description ?? null,
        }),
      )

      await manager.update(Wallet, { id: wallet.id }, { balance: balanceAfter })

      return transaction
    })

    return ApiResponse.success(WalletTransactionResponseDto.fromEntity(saved), 'Wallet transaction recorded', 201)
  }

  private async getOwnedWallet(userId: string) {
    const wallet = await this.walletsRepo.findOne({ where: { userId } })

    if (!wallet) throw new NotFoundException('Wallet not found. Create one first.')

    return wallet
  }
}