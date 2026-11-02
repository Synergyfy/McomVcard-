import {
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import { WalletService } from '../finance/wallet.service'
import { McomWalletError, McomWalletService } from '../mcom/mcom-wallet.service'
import { CardTopUpDto } from './dto/card-topup.dto'

export interface WalletSummary {
  enabled: boolean
  balance: number
  availableBalance: number
  currency: string
  status: string
  topUpUrl: string
}

/**
 * Customer-facing wallet helpers.
 *
 * The MCOM Wallet is the only funding source in this app: balances are read
 * from Central, and moving value onto a VCard product (the physical/virtual
 * card balance) is a wallet debit performed server-side with a deterministic
 * idempotency key.
 */
@Injectable()
export class PaymentsService {
  private readonly topUpUrl: string

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
    private readonly mcomWallet: McomWalletService,
  ) {
    const solutionsUrl = (this.config.get<string>('MCOM_SOLUTIONS_URL') || 'http://localhost:3010').replace(/\/+$/, '')
    this.topUpUrl =
      this.config.get<string>('mcom.walletTopUpUrl') || `${solutionsUrl}/dashboard/wallet`
  }

  /** The payer's centralized wallet balance plus the Central Hub top-up link. */
  async getWalletSummary(userId: string): Promise<WalletSummary> {
    const user = await this.usersService.findById(userId)
    if (!user?.mcomUserId) {
      throw new BadRequestException('Account is not linked to MCOM Solutions — sign in with MCOM first')
    }

    if (!this.mcomWallet.enabled) {
      return {
        enabled: false,
        balance: 0,
        availableBalance: 0,
        currency: 'MCOM',
        status: 'UNAVAILABLE',
        topUpUrl: this.topUpUrl,
      }
    }

    try {
      const balance = await this.mcomWallet.getBalance(user.mcomUserId)
      return {
        enabled: true,
        balance: balance.balance,
        availableBalance: balance.availableBalance,
        currency: balance.currency || 'MCOM',
        status: balance.status,
        topUpUrl: this.topUpUrl,
      }
    } catch (err) {
      this.rethrowWalletError(err)
    }
  }

  /** The local card balance (separate from the centralized wallet). */
  async getCardBalance(userId: string): Promise<{ balance: number; currency: string }> {
    return this.walletService.getCardBalance(userId)
  }

  /**
   * Move credits from the MCOM Wallet onto the local card balance.
   * The wallet debit happens first; the local ledger is credited atomically and
   * a compensating refund is issued if that write fails.
   */
  async topUpCard(userId: string, dto: CardTopUpDto) {
    const user = await this.usersService.findById(userId)
    if (!user?.mcomUserId) {
      throw new BadRequestException('Account is not linked to MCOM Solutions — sign in with MCOM first')
    }
    if (!this.mcomWallet.enabled) {
      throw new ServiceUnavailableException('MCOM Wallet payments are not configured on this server')
    }

    const amount = Number(dto.amount.toFixed(2))
    const reference = `vcards:card-topup:${dto.idempotencyKey}`
    const debitKey = this.mcomWallet.idempotencyKey('card-topup', userId, dto.idempotencyKey)

    let receipt
    try {
      receipt = await this.mcomWallet.debit(
        user.mcomUserId,
        amount,
        {
          category: 'PURCHASE',
          description: 'MCOM VCard — card top-up',
          reference,
          metadata: { purpose: 'vcard-card-topup', userId },
        },
        debitKey,
      )
    } catch (err) {
      this.rethrowWalletError(err)
    }

    try {
      const card = await this.walletService.creditCardBalance(userId, amount, {
        description: 'Card funded from MCOM Wallet',
        reference,
        idempotencyKey: debitKey,
      })

      // The debit receipt may be a replay; read the live balance so the UI is accurate.
      let walletBalance = receipt.balanceAfter
      try {
        walletBalance = (await this.mcomWallet.getBalance(user.mcomUserId)).balance
      } catch {
        // keep the receipt balance
      }

      return {
        transactionId: receipt.transactionId,
        amount: receipt.amount,
        walletBalance,
        cardBalance: card.balance,
        currency: receipt.currency,
        processedAt: receipt.processedAt,
      }
    } catch (err) {
      // The wallet was debited but the local ledger failed — return the money.
      await this.mcomWallet
        .credit(
          user.mcomUserId,
          amount,
          {
            category: 'REFUND',
            description: 'Refund — VCard card top-up failed',
            reference,
            metadata: { purpose: 'vcard-card-topup-refund', userId },
          },
          this.mcomWallet.idempotencyKey('card-topup-refund', userId, dto.idempotencyKey),
        )
        .catch(() => undefined)

      throw err
    }
  }

  private rethrowWalletError(err: unknown): never {
    if (!(err instanceof McomWalletError)) throw err

    if (err.code === 'INSUFFICIENT_BALANCE' && err.httpStatus === 422) {
      throw new HttpException(
        {
          error: 'WALLET_INSUFFICIENT_FUNDS',
          message: 'Top up your MCOM Wallet to continue.',
          topUpUrl: this.topUpUrl,
        },
        402,
      )
    }

    if (err.httpStatus === 401) {
      throw new BadRequestException('MCOM Wallet rejected the request — sign in again to continue')
    }
    if (err.httpStatus >= 500) {
      throw new ServiceUnavailableException(`MCOM Wallet error (${err.code}): ${err.message}`)
    }

    throw new HttpException({ error: err.code || 'WALLET_ERROR', message: err.message }, err.httpStatus || 400)
  }
}
