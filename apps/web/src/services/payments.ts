import api from './api'

export interface WalletSummary {
  enabled: boolean
  balance: number
  availableBalance: number
  currency: string
  status: string
  topUpUrl: string
}

export interface CardBalance {
  balance: number
  currency: string
}

export interface CardTopUpResult {
  transactionId: string
  amount: number
  walletBalance: number
  cardBalance: number
  currency: string
  processedAt: string
}

/** A UUID suitable for X-Idempotency-Key (one per business event). */
export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

/**
 * Centralized MCOM Wallet helpers. Balances live on MCOM Solutions; the only
 * local balance is the VCard card ledger, which is funded from the wallet.
 */
export const paymentsService = {
  async getWallet(): Promise<WalletSummary> {
    const res = await api.get('/v1/payments/wallet')
    return res.data as WalletSummary
  },

  async getCardBalance(): Promise<CardBalance> {
    const res = await api.get('/v1/payments/card-balance')
    return res.data as CardBalance
  },

  async topUpCard(amount: number, idempotencyKey: string): Promise<CardTopUpResult> {
    const res = await api.post('/v1/payments/card-topup', { amount, idempotencyKey })
    return res.data as CardTopUpResult
  },
}
