import api from './api'

export type PlanVariantKey = 'standard' | 'pro' | 'pro_plus'

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

export interface InitiateResult {
  clientSecret?: string
  approvalUrl?: string
  /** Stripe intent kind: 'payment' (pi_…) for paid plans, 'setup' (seti_…) for trial/£0 plans. */
  type?: 'payment' | 'setup'
  plan?: Record<string, unknown>
}

export type PaymentProvider = 'stripe' | 'paypal'

/**
 * In-app plan purchases proxied through the VCard API to the centralized MCOM
 * Solutions billing engine. Stripe returns a clientSecret to confirm in the
 * browser; PayPal returns an approvalUrl to redirect to.
 *
 * A purchase targets one of the plan's three fixed-duration variants:
 * standard (90 days), pro (180 days) or pro_plus (365 days).
 */
export const packagesService = {
  async listPlans(): Promise<PurchasablePlan[]> {
    const res = await api.get('/v1/mcom/packages/plans')
    return res.data as PurchasablePlan[]
  },

  async initiate(opts: {
    externalPlanId: string
    variant: PlanVariantKey
    provider: PaymentProvider
  }): Promise<InitiateResult> {
    const res = await api.post('/v1/mcom/packages/purchase/initiate', opts)
    return res.data as InitiateResult
  },

  async confirmStripe(opts: {
    externalPlanId: string
    variant: PlanVariantKey
    paymentIntentId?: string
    setupIntentId?: string
  }): Promise<{ canAccessVcard?: boolean }> {
    const res = await api.post('/v1/mcom/packages/purchase/confirm', opts)
    return res.data as { canAccessVcard?: boolean }
  },

  async capturePaypal(orderId: string): Promise<{ canAccessVcard?: boolean }> {
    const res = await api.post('/v1/mcom/packages/purchase/capture', { orderId })
    return res.data as { canAccessVcard?: boolean }
  },
}
