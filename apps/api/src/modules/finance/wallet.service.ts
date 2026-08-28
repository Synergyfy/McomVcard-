import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { randomUUID } from 'crypto'
import { Wallet } from './entities/wallet.entity'
import { WalletTransaction } from './entities/wallet-transaction.entity'
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { WalletResponseDto, WalletTransactionResponseDto } from './dto/wallet-response.dto'
import { McomWalletError, McomWalletService } from '../mcom/mcom-wallet.service'
import { UsersService } from '../users/users.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletsRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction) private walletTransactionsRepo: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
    private readonly mcomWallet: McomWalletService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Centralized mode is on when the MCOM wallet integration is enabled AND
   * credentials are configured. Off → the legacy local Postgres wallet is used.
   */
  private get centralEnabled(): boolean {
    return this.mcomWallet.enabled
  }

  /**
   * Map the local user to their MCOM Solutions user id — that id is the wallet
   * owner on Central. Wallets are auto-created there; this app never creates one.
   */
  private async resolveCentralUserId(userId: string): Promise<string> {
    const dbUser = await this.usersService.findById(userId)
    if (!dbUser?.mcomUserId) {
      throw new BadRequestException('Account is not linked to MCOM Solutions — no centralized wallet')
    }
    return dbUser.mcomUserId
  }

  /**
   * Convert a partner {@link McomWalletError} into the appropriate HTTP error.
   * INSUFFICIENT_BALANCE → 402 top-up prompt (Partner Integration Guide §7).
   */
  private rethrowCentralError(err: McomWalletError): never {
    if (err.code === 'INSUFFICIENT_BALANCE' && err.httpStatus === 422) {
      const solutionsUrl = this.config.get<string>('MCOM_SOLUTIONS_URL') || 'http://localhost:3010'
      throw new HttpException(
        {
          error: 'WALLET_INSUFFICIENT_FUNDS',
          message: 'Top up your MCOM Wallet to continue.',
          topUpUrl: `${solutionsUrl.replace(/\/+$/, '')}/dashboard/wallet`,
        },
        402,
      )
    }

    if (err.httpStatus === 401) throw new BadRequestException(`MCOM wallet rejected the request: ${err.message}`)
    if (err.httpStatus === 403) throw new BadRequestException(`MCOM wallet unavailable (${err.code}): ${err.message}`)
    if (err.httpStatus === 404) throw new NotFoundException(`MCOM wallet not found (${err.code})`)
    if (err.httpStatus >= 500) throw new ServiceUnavailableException(`MCOM wallet error (${err.code}): ${err.message}`)

    throw new HttpException({ error: err.code || 'WALLET_ERROR', message: err.message }, err.httpStatus || 400)
  }

  // ── read / wallet ──────────────────────────────────────────────────────────

  async getMyWallet(userId: string) {
    if (this.centralEnabled) {
      const mcomUserId = await this.resolveCentralUserId(userId)
      try {
        const balance = await this.mcomWallet.getBalance(mcomUserId)
        return ApiResponse.success(WalletResponseDto.fromCentral(userId, balance), 'Wallet retrieved', 200)
      } catch (err) {
        this.rethrowCentralError(err as McomWalletError)
      }
    }

    const wallet = await this.walletsRepo.findOne({ where: { userId } })

    if (!wallet) throw new NotFoundException('Wallet not found. Create one first.')

    return ApiResponse.success(WalletResponseDto.fromEntity(wallet), 'Wallet retrieved', 200)
  }

  /**
   * In centralized mode wallets are auto-created on MCOM Solutions at user
   * registration — this simply echoes the current balance.
   */
  async createWallet(userId: string) {
    if (this.centralEnabled) {
      return this.getMyWallet(userId)
    }

    const existing = await this.walletsRepo.findOne({ where: { userId } })

    if (existing) return ApiResponse.success(WalletResponseDto.fromEntity(existing), 'Wallet already exists', 200)

    const saved = await this.walletsRepo.save(
      this.walletsRepo.create({ userId, balance: 0, currency: 'GBP', status: 'active' }),
    )

    return ApiResponse.success(WalletResponseDto.fromEntity(saved), 'Wallet created', 201)
  }

  // ── transactions ───────────────────────────────────────────────────────────

  async listMyTransactions(userId: string) {
    if (this.centralEnabled) {
      const mcomUserId = await this.resolveCentralUserId(userId)
      try {
        const page = await this.mcomWallet.getTransactions(mcomUserId)
        const transactions = page.data.map(WalletTransactionResponseDto.fromCentral)
        return ApiResponse.success(transactions, 'Wallet transactions retrieved', 200)
      } catch (err) {
        this.rethrowCentralError(err as McomWalletError)
      }
    }

    const wallet = await this.getOwnedWallet(userId)

    const transactions = await this.walletTransactionsRepo.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(transactions.map(WalletTransactionResponseDto.fromEntity), 'Wallet transactions retrieved', 200)
  }

  async getMyTransaction(userId: string, transactionId: string) {
    if (this.centralEnabled) {
      // Require a linked account; the partner read is platform-scoped.
      await this.resolveCentralUserId(userId)
      try {
        const transaction = await this.mcomWallet.getTransaction(transactionId)
        return ApiResponse.success(WalletTransactionResponseDto.fromCentral(transaction), 'Wallet transaction retrieved', 200)
      } catch (err) {
        this.rethrowCentralError(err as McomWalletError)
      }
    }

    const wallet = await this.getOwnedWallet(userId)

    const transaction = await this.walletTransactionsRepo.findOne({
      where: { id: transactionId, walletId: wallet.id },
    })

    if (!transaction) throw new NotFoundException('Wallet transaction not found')

    return ApiResponse.success(WalletTransactionResponseDto.fromEntity(transaction), 'Wallet transaction retrieved', 200)
  }

  /**
   * Create a wallet transaction. In centralized mode this proxies to the MCOM
   * partner credit/debit endpoints with a deterministic idempotency key so a
   * retry can never double-charge.
   */
  async createTransaction(userId: string, dto: CreateWalletTransactionDto) {
    if (this.centralEnabled) {
      const mcomUserId = await this.resolveCentralUserId(userId)
      const idempotencyKey = this.mcomWallet.idempotencyKey('wallet-txn', userId, randomUUID())

      try {
        const receipt =
          dto.type === 'CREDIT'
            ? await this.mcomWallet.credit(
                mcomUserId,
                dto.amount,
                { category: 'ADMIN_CREDIT', description: dto.description ?? 'Wallet credit' },
                idempotencyKey,
              )
            : await this.mcomWallet.debit(
                mcomUserId,
                dto.amount,
                { category: 'PURCHASE', description: dto.description ?? 'Wallet debit' },
                idempotencyKey,
              )

        return ApiResponse.success(
          {
            id: receipt.transactionId,
            wallet_id: null,
            type: receipt.type,
            amount: receipt.amount,
            balance_before: receipt.balanceBefore,
            balance_after: receipt.balanceAfter,
            currency: receipt.currency,
            reference: receipt.reference ?? null,
            idempotencyKey: receipt.idempotencyKey ?? idempotencyKey,
            description: dto.description ?? null,
            created_at: receipt.processedAt,
          },
          'Wallet transaction recorded',
          201,
        )
      } catch (err) {
        this.rethrowCentralError(err as McomWalletError)
      }
    }

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