import api from './api'

export interface PurchasablePlan {
  id: string
  name: string
  level: string
  monthlyPrice: number
  quarterlyPrice: number
  annualPrice: number
  trialDuration?: number
  features: string[]
  configuration?: Record<string, unknown> | null
}

export interface InitiateResult {
  clientSecret?: string
  approvalUrl?: string
  /** Stripe intent kind: 'payment' (pi_…) for paid plans, 'setup' (seti_…) for trial/£0 plans. */
  type?: 'payment' | 'setup'
  plan?: Record<string, unknown>
}

export type BillingCycle = 'monthly' | 'quarterly' | 'annual'
export type PaymentProvider = 'stripe' | 'paypal'

/**
 * In-app plan purchases proxied through the VCard API to the centralized MCOM
 * Solutions billing engine. Stripe returns a clientSecret to confirm in the
 * browser; PayPal returns an approvalUrl to redirect to.
 */
export const packagesService = {
  async listPlans(): Promise<PurchasablePlan[]> {
    const res = await api.get('/v1/mcom/packages/plans')
    return res.data as PurchasablePlan[]
  },

  async initiate(opts: {
    externalPlanId: string
    billingCycle: BillingCycle
    provider: PaymentProvider
  }): Promise<InitiateResult> {
    const res = await api.post('/v1/mcom/packages/purchase/initiate', opts)
    return res.data as InitiateResult
  },

  async confirmStripe(opts: {
    externalPlanId: string
    billingCycle: BillingCycle
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