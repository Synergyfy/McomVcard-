import api from './api'

export type PlanVariantKey = 'standard' | 'pro' | 'pro_plus'
export type PlanPaymentProvider = 'wallet' | 'stripe' | 'paypal'

export interface PurchasableVariant {
  key: PlanVariantKey
  name: string
  durationDays: number
  price: number
  setupFee: number
  trialDays: number
  description: string
  features: string[]
  configuration?: Record<string, unknown> | null
}

export interface PurchasablePlan {
  id: string
  name: string
  description: string
  audience: string
  currency: string
  variants: PurchasableVariant[]
}

export interface AppCharge {
  id: string
  amountMinor: string
  currency: string
  feeMinor: string
  netMinor: string
  method: PlanPaymentProvider
  status: 'pending' | 'paid' | 'refunding' | 'partially_refunded' | 'refunded' | 'failed' | 'cancelled'
  reference?: string | null
  description?: string | null
  clientSecret?: string | null
  approvalUrl?: string | null
  walletDebitAmount?: string | null
  paidAt?: string | null
  createdAt: string
}

export interface PlanPurchaseResult {
  charge: AppCharge
  clientSecret?: string | null
  approvalUrl?: string | null
  plan: {
    id: string
    name: string | null
    variant: PlanVariantKey
    durationDays: number
    price: number
  }
  canAccessVcard: boolean
}

/**
 * In-app plan purchases. Every charge is created server-side and processed by
 * MCOM Pay (wallet, Stripe or PayPal) — the browser never sets the amount.
 */
export const packagesService = {
  async listPlans(): Promise<PurchasablePlan[]> {
    const res = await api.get('/v1/mcom/packages/plans')
    return res.data as PurchasablePlan[]
  },

  async initiate(opts: {
    externalPlanId: string
    variant: PlanVariantKey
    provider: PlanPaymentProvider
    idempotencyKey: string
  }): Promise<PlanPurchaseResult> {
    const res = await api.post('/v1/mcom/packages/purchase/initiate', opts)
    return res.data as PlanPurchaseResult
  },

  async confirm(opts: {
    externalPlanId: string
    variant: PlanVariantKey
    chargeId: string
    paymentIntentId?: string
    orderId?: string
  }): Promise<PlanPurchaseResult> {
    const res = await api.post('/v1/mcom/packages/purchase/confirm', opts)
    return res.data as PlanPurchaseResult
  },
}
