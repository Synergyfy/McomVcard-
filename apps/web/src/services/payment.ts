export type PaymentProvider = 'stripe' | 'paypal'

export interface PaymentProviderOption {
  value: PaymentProvider
  label: string
  sub: string
  mode: 'Sandbox' | 'Demo'
  icon: string
}

export const paymentProviderOptions: PaymentProviderOption[] = [
  { value: 'stripe', label: 'Stripe', sub: 'Pay by card (test mode)', mode: 'Sandbox', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { value: 'paypal', label: 'PayPal', sub: 'Pay with PayPal balance', mode: 'Demo', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
]

export interface PaymentResult {
  id: string
  provider: PaymentProvider
  amount: number
  status: 'succeeded'
  processedAt: string
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function txId(provider: PaymentProvider): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return provider === 'stripe' ? `pi_${rand}` : `PAY-${rand.toUpperCase()}`
}

export const mockPaymentService = {
  /** Simulates a Stripe / PayPal checkout. Always succeeds in demo mode. */
  async process(provider: PaymentProvider, amount: number): Promise<PaymentResult> {
    await delay(provider === 'stripe' ? 1600 : 1800)
    return {
      id: txId(provider),
      provider,
      amount,
      status: 'succeeded',
      processedAt: new Date().toISOString(),
    }
  },
}
