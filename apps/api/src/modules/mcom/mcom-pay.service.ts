import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHmac } from 'crypto'

/**
 * MCOM Pay partner API client (`/api/v1/app-payments`).
 *
 * Every charge is created server-side with an exact amount in MINOR units
 * (pence) and an idempotency key, then settled by MCOM through Stripe, PayPal
 * or the payer's MCOM Wallet. This app only ever uses the `wallet` method, so
 * the customer always pays from their centralized prepaid balance.
 *
 * The transport mirrors {@link McomWalletService}: the same HMAC scheme, the
 * same deterministic idempotency keys and the same retry policy for transient
 * failures (409/429/500/503).
 */

export type AppChargeMethod = 'stripe' | 'paypal' | 'wallet'
export type AppChargeStatus =
  | 'pending'
  | 'paid'
  | 'refunding'
  | 'partially_refunded'
  | 'refunded'
  | 'failed'
  | 'cancelled'

/** Retry these statuses with the SAME idempotency key. */
const RETRYABLE_STATUSES = new Set([409, 429, 500, 503])

export class McomPayError extends Error {
  constructor(
    public code: string,
    message: string,
    public httpStatus: number,
    public retryable = false,
  ) {
    super(message)
    this.name = 'McomPayError'
  }
}

export interface AppCharge {
  id: string
  appClientId: string
  amountMinor: string
  currency: string
  feeMinor: string
  netMinor: string
  refundedMinor?: string
  method: AppChargeMethod
  status: AppChargeStatus
  reference?: string | null
  description?: string | null
  mcomUserId?: string | null
  externalCustomerId?: string | null
  provider?: string | null
  providerRef?: string | null
  walletDebitAmount?: string | null
  reconciliationNeeded?: boolean
  paidAt?: string | null
  createdAt: string
  source?: 'app' | 'central'
}

export interface CreateChargeInput {
  amountMinor: string
  currency?: string
  method: AppChargeMethod
  reference: string
  description?: string
  mcomUserId?: string
  externalCustomerId?: string
  metadata?: Record<string, unknown>
}

export interface CreateChargeResult {
  charge: AppCharge
  clientSecret?: string | null
  approvalUrl?: string | null
}

export interface ConfirmChargeInput {
  paymentIntentId?: string
  orderId?: string
}

export interface RefundChargeInput {
  amountMinor?: string
  reason?: string
}

export interface AppRefund {
  id: string
  chargeId: string
  amountMinor: string
  feeRefundMinor: string
  netRefundMinor: string
  currency: string
  provider?: string | null
  providerRef?: string | null
  status: 'pending' | 'succeeded' | 'failed'
  reason?: string | null
  failureReason?: string | null
  createdAt: string
}

export interface RefundChargeResult {
  charge: AppCharge
  refund: AppRefund
}

export interface AppChargeList {
  success: boolean
  data: AppCharge[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface RequestOptions {
  method: 'GET' | 'POST'
  body?: unknown
  idempotencyKey?: string
  retries?: number
}

@Injectable()
export class McomPayService {
  private readonly baseUrl: string
  private readonly clientId: string
  private readonly hmacSecret: string

  constructor(private readonly config: ConfigService) {
    this.baseUrl = (this.config.get<string>('MCOM_SOLUTIONS_URL') || 'http://localhost:3010').replace(/\/+$/, '')
    this.clientId = this.config.get<string>('MCOM_CLIENT_ID') || ''
    this.hmacSecret = this.config.get<string>('MCOM_HMAC_SECRET') || ''
  }

  /** Whether MCOM Pay is configured and enabled. */
  get enabled(): boolean {
    return this.config.get<boolean>('mcom.payEnabled') === true && Boolean(this.clientId && this.hmacSecret)
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

  /** Create a charge. The idempotency key is REQUIRED — retries reuse it. */
  async createCharge(input: CreateChargeInput, idempotencyKey: string): Promise<CreateChargeResult> {
    return this.request<CreateChargeResult>('/api/v1/app-payments/charges', {
      method: 'POST',
      body: input,
      idempotencyKey,
    })
  }

  /** Confirm a settled charge (idempotent by status). */
  async confirmCharge(chargeId: string, input: ConfirmChargeInput = {}): Promise<AppCharge> {
    return this.request<AppCharge>(`/api/v1/app-payments/charges/${encodeURIComponent(chargeId)}/confirm`, {
      method: 'POST',
      body: input,
    })
  }

  /** Refund a paid charge (full when amountMinor is omitted). */
  async refundCharge(
    chargeId: string,
    input: RefundChargeInput,
    idempotencyKey: string,
  ): Promise<RefundChargeResult> {
    return this.request<RefundChargeResult>(
      `/api/v1/app-payments/charges/${encodeURIComponent(chargeId)}/refund`,
      { method: 'POST', body: input, idempotencyKey },
    )
  }

  /** Fetch a single charge owned by this app. */
  async getCharge(chargeId: string): Promise<AppCharge> {
    return this.request<AppCharge>(`/api/v1/app-payments/charges/${encodeURIComponent(chargeId)}`, {
      method: 'GET',
    })
  }

  /** List this app's charges (newest first). */
  async listCharges(params: {
    status?: AppChargeStatus
    mcomUserId?: string
    reference?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  } = {}): Promise<AppChargeList> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
    })
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return this.request<AppChargeList>(`/api/v1/app-payments/charges${suffix}`, { method: 'GET' })
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
      const code = err.error || 'PAYMENT_ERROR'
      const message = err.message || res.statusText
      const retryable = RETRYABLE_STATUSES.has(res.status)

      if (retryable && attempt < retries) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000))
        continue
      }

      throw new McomPayError(code, message, res.status, retryable)
    }

    throw new McomPayError('PAYMENT_ERROR', 'MCOM Pay request failed', 500)
  }
}
