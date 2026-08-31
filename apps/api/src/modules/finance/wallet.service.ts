import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Wallet } from './entities/wallet.entity'
import { WalletTransaction } from './entities/wallet-transaction.entity'
import { ChildCard } from '../child-cards/entities/child-card.entity'
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto'
import { WalletTransferDto } from './dto/wallet-transfer.dto'
import { AllocateToChildDto } from './dto/allocate-to-child.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { WalletResponseDto, WalletTransactionResponseDto } from './dto/wallet-response.dto'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletsRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction) private walletTransactionsRepo: Repository<WalletTransaction>,
    @InjectRepository(ChildCard) private childCardsRepo: Repository<ChildCard>,
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

  async transfer(userId: string, dto: WalletTransferDto) {
    if (userId === dto.recipient_id) {
      throw new BadRequestException('Cannot transfer funds to yourself')
    }

    const senderWallet = await this.getOwnedWallet(userId)

    if (senderWallet.status !== 'active') throw new BadRequestException('Sender wallet is not active')

    if (senderWallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance for this transfer')
    }

    // Get or create recipient wallet
    let recipientWallet = await this.walletsRepo.findOne({ where: { userId: dto.recipient_id } })

    if (!recipientWallet) {
      recipientWallet = await this.walletsRepo.save(
        this.walletsRepo.create({ userId: dto.recipient_id, balance: 0, currency: senderWallet.currency, status: 'active' }),
      )
    }

    const senderBalanceAfter = Number((senderWallet.balance - dto.amount).toFixed(2))
    const recipientBalanceAfter = Number((recipientWallet.balance + dto.amount).toFixed(2))

    const result = await this.dataSource.transaction(async (manager) => {
      // Debit sender
      const debitTransaction = await manager.save(
        this.walletTransactionsRepo.create({
          walletId: senderWallet.id,
          type: 'DEBIT',
          amount: dto.amount,
          balanceAfter: senderBalanceAfter,
          description: dto.description ?? `Transfer to ${dto.recipient_id}`,
        }),
      )

      await manager.update(Wallet, { id: senderWallet.id }, { balance: senderBalanceAfter })

      // Credit recipient
      const creditTransaction = await manager.save(
        this.walletTransactionsRepo.create({
          walletId: recipientWallet.id,
          type: 'CREDIT',
          amount: dto.amount,
          balanceAfter: recipientBalanceAfter,
          description: dto.description ?? `Transfer from ${userId}`,
        }),
      )

      await manager.update(Wallet, { id: recipientWallet.id }, { balance: recipientBalanceAfter })

      return { senderBalanceAfter, debitTransaction, creditTransaction }
    })

    return ApiResponse.success(
      { balance: result.senderBalanceAfter },
      'Transfer completed successfully',
      200,
    )
  }

  async allocateToChild(userId: string, dto: AllocateToChildDto) {
    const wallet = await this.getOwnedWallet(userId)

    if (wallet.status !== 'active') throw new BadRequestException('Wallet is not active')

    if (wallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance for this allocation')
    }

    // Load child card and verify the caller is the card owner (parent)
    const childCard = await this.childCardsRepo.findOne({
      where: { id: dto.child_card_id },
      relations: { card: true },
    })

    if (!childCard) throw new NotFoundException('Child card not found')

    if (childCard.card.ownerId !== userId) {
      throw new ForbiddenException('Only the card owner can allocate funds to a child')
    }

    const newAllocation = Number(((childCard.walletAllocation ?? 0) + dto.amount).toFixed(2))
    const senderBalanceAfter = Number((wallet.balance - dto.amount).toFixed(2))

    await this.dataSource.transaction(async (manager) => {
      // Debit parent wallet
      await manager.save(
        this.walletTransactionsRepo.create({
          walletId: wallet.id,
          type: 'DEBIT',
          amount: dto.amount,
          balanceAfter: senderBalanceAfter,
          description: `Allocation to child card ${dto.child_card_id}`,
        }),
      )

      await manager.update(Wallet, { id: wallet.id }, { balance: senderBalanceAfter })

      // Update child card wallet allocation
      await manager.update(ChildCard, { id: dto.child_card_id }, { walletAllocation: newAllocation })
    })

    return ApiResponse.success(
      { wallet_allocation: newAllocation, balance: senderBalanceAfter },
      'Funds allocated to child card',
      200,
    )
  }

  private async getOwnedWallet(userId: string) {
    const wallet = await this.walletsRepo.findOne({ where: { userId } })

    if (!wallet) throw new NotFoundException('Wallet not found. Create one first.')

    return wallet
  }
}