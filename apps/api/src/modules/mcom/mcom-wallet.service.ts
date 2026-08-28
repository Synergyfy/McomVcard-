import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHmac } from 'crypto'

/**
 * MCOM Wallet partner API client.
 *
 * Talks to the centralized wallet on MCOM Solutions (`/api/v1/wallet/partner`)
 * using the HMAC-signed, idempotent scheme described in the Partner Integration
 * Guide. McomSolutions is the single source of truth for balances — this app
 * never stores a wallet balance; it only reads, debits or credits one.
 *
 * Every write carries a deterministic `X-Idempotency-Key` so retries can never
 * double-charge. Transient failures (409/429/500/503) are retried with
 * exponential backoff and the SAME idempotency key; permanent failures surface
 * as {@link McomWalletError} with the partner's error code.
 */

// Categories accepted by the partner API per direction.
export const WALLET_DEBIT_CATEGORIES = ['SUBSCRIPTION', 'PURCHASE', 'SERVICE_FEE'] as const
export const WALLET_CREDIT_CATEGORIES = ['REWARD', 'REFUND', 'ADMIN_CREDIT', 'TRANSFER_IN'] as const
export type WalletDebitCategory = (typeof WALLET_DEBIT_CATEGORIES)[number]
export type WalletCreditCategory = (typeof WALLET_CREDIT_CATEGORIES)[number]

/** Statuses that should be retried with the same idempotency key. */
const RETRYABLE_STATUSES = new Set([409, 429, 500, 503])

/** A partner API failure, carrying the machine-readable `error` code from Central. */
export class McomWalletError extends Error {
  constructor(
    public code: string,
    message: string,
    public httpStatus: number,
    public retryable = false,
  ) {
    super(message)
    this.name = 'McomWalletError'
  }
}

export interface WalletOperationOptions {
  category: WalletDebitCategory | WalletCreditCategory
  description?: string
  reference?: string
  metadata?: Record<string, unknown>
}

export interface PartnerBalance {
  success: boolean
  balance: number
  availableBalance: number
  status: string
  currency: string
}

export interface PartnerReceipt {
  success: boolean
  transactionId: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  balanceBefore: number
  balanceAfter: number
  currency: string
  reference?: string | null
  idempotencyKey?: string | null
  processedAt: string
}

export interface PartnerTransaction {
  id: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  currency: string
  platformClientId?: string | null
  platformName?: string | null
  platformSlug?: string | null
  category: string
  reference?: string | null
  description?: string | null
  status: string
  initiatedBy?: string | null
  createdAt: string
}

export interface PartnerTransactionList {
  success: boolean
  data: PartnerTransaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PartnerHold {
  id: string
  amount: number
  platformClientId: string
  platformName: string
  reference?: string | null
  status: string
  expiresAt: string
  createdAt: string
}

interface RequestOptions {
  method: 'GET' | 'POST'
  body?: unknown
  idempotencyKey?: string
  retries?: number
}

@Injectable()
export class McomWalletService {
  private readonly baseUrl: string
  private readonly clientId: string
  private readonly hmacSecret: string

  constructor(private readonly config: ConfigService) {
    this.baseUrl = (this.config.get<string>('MCOM_SOLUTIONS_URL') || 'http://localhost:3010').replace(/\/+$/, '')
    this.clientId = this.config.get<string>('MCOM_CLIENT_ID') || ''
    this.hmacSecret = this.config.get<string>('MCOM_HMAC_SECRET') || ''
  }

  /** Whether the centralized wallet is configured and enabled. */
  get enabled(): boolean {
    return this.config.get<boolean>('mcom.walletEnabled') === true && Boolean(this.clientId && this.hmacSecret)
  }

  /** HMAC-SHA256 of the exact JSON body we send. GETs sign the empty string. */
  private sign(body: unknown): string {
    const raw = typeof body === 'string' ? body : JSON.stringify(body)
    return 'sha256=' + createHmac('sha256', this.hmacSecret).update(raw).digest('hex')
  }

  private headers(body: unknown, idempotencyKey?: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Mcom-Client-ID': this.clientId,
      'X-Mcom-Signature': this.sign(body),
      ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
    }
  }

  /** Deterministic, platform-scoped idempotency key for a business event. */
  idempotencyKey(operation: string, ...parts: (string | number)[]): string {
    return [this.clientId || 'vcard', operation, ...parts.map(String)]
      .join('-')
      .replace(/[^A-Za-z0-9_-]/g, '_')
      .slice(0, 255)
  }

  // ── reads ──────────────────────────────────────────────────────────────────

  /** A user's wallet balance (cached 30s by Central). */
  async getBalance(userId: string): Promise<PartnerBalance> {
    return this.request(`/api/v1/wallet/partner/balance/${encodeURIComponent(userId)}`, { method: 'GET' })
  }

  /** Transactions THIS platform originated for the user (paginated, newest first). */
  async getTransactions(userId: string, page = 1, limit = 20): Promise<PartnerTransactionList> {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) })
    return this.request(`/api/v1/wallet/partner/transactions/${encodeURIComponent(userId)}?${query}`, {
      method: 'GET',
    })
  }

  /** Look up one of our transactions by id (or by idempotency key). */
  async getTransaction(id: string, by: 'id' | 'idempotencyKey' = 'id'): Promise<PartnerTransaction> {
    const query = by === 'idempotencyKey' ? '?by=idempotencyKey' : '?by=id'
    return this.request(`/api/v1/wallet/partner/transaction/${encodeURIComponent(id)}${query}`, { method: 'GET' })
  }

  // ── writes ─────────────────────────────────────────────────────────────────

  /** Debit a wallet. `idempotencyKey` is REQUIRED — retries reuse it. */
  async debit(userId: string, amount: number, opts: WalletOperationOptions, idempotencyKey: string): Promise<PartnerReceipt> {
    if (!WALLET_DEBIT_CATEGORIES.includes(opts.category as WalletDebitCategory)) {
      throw new McomWalletError('INVALID_CATEGORY', `Invalid debit category: ${opts.category}`, 400)
    }
    return this.request(`/api/v1/wallet/partner/debit`, {
      method: 'POST',
      idempotencyKey,
      body: { userId, amount, ...opts },
    })
  }

  /** Credit a wallet. `idempotencyKey` is REQUIRED — retries reuse it. */
  async credit(userId: string, amount: number, opts: WalletOperationOptions, idempotencyKey: string): Promise<PartnerReceipt> {
    if (!WALLET_CREDIT_CATEGORIES.includes(opts.category as WalletCreditCategory)) {
      throw new McomWalletError('INVALID_CATEGORY', `Invalid credit category: ${opts.category}`, 400)
    }
    return this.request(`/api/v1/wallet/partner/credit`, {
      method: 'POST',
      idempotencyKey,
      body: { userId, amount, ...opts },
    })
  }

  /** Reserve funds before a confirmed debit. Returns a holdId + expiresAt. */
  async placeHold(userId: string, amount: number, opts: WalletOperationOptions): Promise<PartnerHold> {
    return this.request(`/api/v1/wallet/partner/hold/place`, {
      method: 'POST',
      body: { userId, amount, ...opts },
    })
  }

  /** Convert a previously placed hold into a real debit. */
  async captureHold(holdId: string, idempotencyKey?: string): Promise<PartnerReceipt> {
    return this.request(`/api/v1/wallet/partner/hold/capture`, {
      method: 'POST',
      idempotencyKey,
      body: { holdId },
    })
  }

  /** Release a hold back to the available balance. */
  async releaseHold(holdId: string): Promise<unknown> {
    return this.request(`/api/v1/wallet/partner/hold/release`, {
      method: 'POST',
      body: { holdId },
    })
  }

  // ── transport ──────────────────────────────────────────────────────────────

  private async request<T>(path: string, opts: RequestOptions): Promise<T> {
    const retries = opts.retries ?? 3

    for (let attempt = 1; attempt <= retries; attempt++) {
      const body = opts.body !== undefined ? opts.body : ''
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: opts.method,
        headers: this.headers(body, opts.idempotencyKey),
        body: opts.method === 'POST' && opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      })

      if (res.ok) {
        const text = await res.text().catch(() => '')
        return (text ? JSON.parse(text) : {}) as T
      }

      const err = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
      const code = err.error || 'WALLET_ERROR'
      const message = err.message || res.statusText
      const retryable = RETRYABLE_STATUSES.has(res.status)

      // Retry transient failures with the SAME idempotency key (never a double charge).
      if (retryable && attempt < retries) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000))
        continue
      }

      throw new McomWalletError(code, message, res.status, retryable)
    }

    // Unreachable — the loop always throws or returns.
    throw new McomWalletError('WALLET_ERROR', 'MCOM wallet request failed', 500)
  }
}