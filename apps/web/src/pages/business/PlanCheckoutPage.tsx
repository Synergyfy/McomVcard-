import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../../contexts/AuthContext'
import {
  packagesService,
  type PaymentProvider,
  type PlanVariantKey,
  type PurchasablePlan,
  type PurchasableVariant,
} from '../../services/packages'

const stripePromise: Promise<Stripe | null> = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface PendingPurchase {
  externalPlanId: string
  variant: PlanVariantKey
}

const PENDING_KEY = 'vcard_pending_purchase'

function pendingPurchase(): PendingPurchase | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingPurchase) : null
  } catch {
    return null
  }
}

function currencySymbol(currency?: string): string {
  return currency === 'USD' ? '$' : '£'
}

function durationLabel(days: number): string {
  if (days >= 365 && days % 365 === 0) return `${days / 365} ${days === 365 ? 'year' : 'years'}`
  return `${days} days`
}

function PaymentForm({
  planName,
  amount,
  currency,
  mode,
  onSuccess,
  onError,
}: {
  planName: string
  amount: number
  currency?: string
  mode: 'payment' | 'setup'
  onSuccess: (intentId: string, intentType: 'payment' | 'setup') => void
  onError: (message: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError('')

    if (mode === 'setup') {
      // Trial / £0 plans: Central returns a SetupIntent clientSecret. Confirm
      // the card setup (no charge is taken) and activate the trial package.
      const { error: submitError, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      })

      if (submitError) {
        setError(submitError.message || 'Payment setup failed. Please try again.')
        setProcessing(false)
        return
      }

      if (setupIntent?.id) {
        onSuccess(setupIntent.id, 'setup')
      } else {
        onError('Payment is being finalized. Check your email for confirmation.')
      }
      return
    }

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/b/payment/success`,
      },
      redirect: 'if_required',
    })

    if (submitError) {
      setError(submitError.message || 'Payment failed. Please try again.')
      setProcessing(false)
      return
    }

    if (paymentIntent?.id) {
      onSuccess(paymentIntent.id, 'payment')
    } else {
      onError('Payment is being finalized. Check your email for confirmation.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        {planName} — {currencySymbol(currency)}
        {amount.toLocaleString()}
      </div>

      <PaymentElement />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing payment…' : 'Pay now'}
      </button>
    </form>
  )
}

export default function PlanCheckoutPage() {
  const navigate = useNavigate()
  const { refreshMcomStatus, loginWithMcom } = useAuth()

  const [plans, setPlans] = useState<PurchasablePlan[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedVariant, setSelectedVariant] = useState<PlanVariantKey | ''>('')
  const [provider, setProvider] = useState<PaymentProvider>('stripe')
  const [clientSecret, setClientSecret] = useState('')
  const [stripeIntentType, setStripeIntentType] = useState<'payment' | 'setup'>('payment')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    packagesService
      .listPlans()
      .then((list) => {
        setPlans(list)
        const firstPlan = list[0]
        if (firstPlan) {
          setSelectedId(firstPlan.id)
          setSelectedVariant(firstPlan.variants[0]?.key ?? '')
        }
      })
      .catch(() => setError('Could not load plans. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedId), [plans, selectedId])
  const selectedPlanVariant = useMemo<PurchasableVariant | undefined>(
    () => selectedPlan?.variants.find((variant) => variant.key === selectedVariant),
    [selectedPlan, selectedVariant],
  )
  const price = selectedPlanVariant?.price ?? 0
  const symbol = currencySymbol(selectedPlan?.currency)

  const selectVariant = (plan: PurchasablePlan, variant: PurchasableVariant) => {
    setSelectedId(plan.id)
    setSelectedVariant(variant.key)
    setClientSecret('')
  }

  const handleSuccess = async (intentId: string, intentType: 'payment' | 'setup') => {
    const pending = pendingPurchase()
    if (!pending) return

    try {
      const result = await packagesService.confirmStripe({
        externalPlanId: pending.externalPlanId,
        variant: pending.variant,
        ...(intentType === 'setup' ? { setupIntentId: intentId } : { paymentIntentId: intentId }),
      })
      localStorage.removeItem(PENDING_KEY)
      await finish(result.canAccessVcard === true)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Payment succeeded but plan activation failed. Contact support.')
      setProcessing(false)
    }
  }

  const finish = async (canAccessVcard: boolean) => {
    try {
      await refreshMcomStatus()
    } catch {
      // profile refresh failure is non-fatal; the gate will re-check on load
    }
    if (!canAccessVcard) {
      setError('Your plan is active, but your MCOM membership must be active too before the dashboard unlocks. Try "Check my access again" after activating your membership.')
    }
    navigate('/b/dashboard', { replace: true })
  }

  /** Re-sync the MCOM session so the stored Central access token is fresh before paying. */
  const ensureSession = async (): Promise<boolean> => {
    setSessionExpired(false)
    try {
      await refreshMcomStatus()
      return true
    } catch {
      // Central session is dead — the user must re-authorize via SSO.
      setSessionExpired(true)
      return false
    }
  }

  const startStripe = async () => {
    if (!selectedPlan || !selectedPlanVariant) return
    setError('')
    setProcessing(true)
    try {
      if (!(await ensureSession())) return
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ externalPlanId: selectedPlan.id, variant: selectedPlanVariant.key }),
      )
      const res = await packagesService.initiate({
        externalPlanId: selectedPlan.id,
        variant: selectedPlanVariant.key,
        provider: 'stripe',
      })
      if (res.clientSecret) {
        setStripeIntentType(res.type ?? 'payment')
        setClientSecret(res.clientSecret)
      } else {
        setError('Stripe did not return a client secret.')
        localStorage.removeItem(PENDING_KEY)
      }
    } catch (err: any) {
      localStorage.removeItem(PENDING_KEY)
      if (err?.response?.status === 401) setSessionExpired(true)
      else setError(err?.response?.data?.message || 'Failed to start payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const startPaypal = async () => {
    if (!selectedPlan || !selectedPlanVariant) return
    setError('')
    setProcessing(true)
    try {
      if (!(await ensureSession())) return
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ externalPlanId: selectedPlan.id, variant: selectedPlanVariant.key }),
      )
      const res = await packagesService.initiate({
        externalPlanId: selectedPlan.id,
        variant: selectedPlanVariant.key,
        provider: 'paypal',
      })
      if (res.approvalUrl) {
        window.location.href = res.approvalUrl
      } else {
        setError('PayPal did not return an approval URL.')
        localStorage.removeItem(PENDING_KEY)
      }
    } catch (err: any) {
      localStorage.removeItem(PENDING_KEY)
      if (err?.response?.status === 401) setSessionExpired(true)
      else setError(err?.response?.data?.message || 'Failed to start payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const chooseProvider = (p: PaymentProvider) => {
    setProvider(p)
    setClientSecret('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-sm text-gray-500 font-medium hover:text-gray-800 inline-block mb-6">
          ← Back
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900">Choose your MCOM VCard plan</h1>
        <p className="text-sm text-gray-500 mt-2">
          Every plan comes in three variants — Standard (90 days), Pro (180 days) and Pro+ (1 year). Payments are
          processed securely by Central Hub Solution.
        </p>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="mt-10 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="mt-10 p-8 rounded-2xl bg-white border border-gray-100 text-center text-gray-500">
            No plans are available for purchase yet. Please contact MCOM Solutions.
          </div>
        ) : (
          <>
            {/* Plan + variant cards */}
            <div className="mt-8 space-y-4">
              {plans.map((plan) => {
                const planActive = plan.id === selectedId
                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl border p-6 transition-all ${
                      planActive
                        ? 'border-blue-600 ring-2 ring-blue-600/20 bg-white shadow-lg shadow-blue-100'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-extrabold text-gray-900">{plan.name}</h3>
                        {plan.description && (
                          <p className="text-sm text-gray-500 mt-1 max-w-xl">{plan.description}</p>
                        )}
                      </div>
                      {planActive && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold shrink-0">
                          Selected
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid sm:grid-cols-3 gap-3">
                      {plan.variants.map((variant) => {
                        const active = planActive && selectedVariant === variant.key
                        return (
                          <button
                            key={variant.key}
                            type="button"
                            onClick={() => selectVariant(plan, variant)}
                            className={`text-left rounded-xl border p-4 transition-all ${
                              active
                                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-900">{variant.name}</span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                {durationLabel(variant.durationDays)}
                              </span>
                            </div>
                            <div className="mt-2 flex items-end gap-1">
                              <span className="text-2xl font-black text-gray-900">
                                {symbol}
                                {variant.price.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500 mb-1">
                                /{durationLabel(variant.durationDays)}
                              </span>
                            </div>
                            {variant.description && (
                              <p className="text-[11px] text-gray-500 mt-1">{variant.description}</p>
                            )}
                            <ul className="mt-3 space-y-1">
                              {(variant.features.length > 0 ? variant.features : ['Full VCard suite access'])
                                .slice(0, 4)
                                .map((feature) => (
                                  <li key={feature} className="text-[11px] text-gray-600 flex items-start gap-1.5">
                                    <span className="text-blue-500 mt-0.5">✓</span>
                                    {feature}
                                  </li>
                                ))}
                            </ul>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Payment method */}
            {sessionExpired && (
              <div className="mt-8 rounded-2xl bg-white border border-amber-200 p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 text-xl">
                  !
                </div>
                <h3 className="font-bold text-gray-900 mt-4">Your MCOM session has expired</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Sign in with Central Hub Solution again to re-authorize your account, then you can continue with your plan purchase.
                </p>
                <button
                  type="button"
                  onClick={() => loginWithMcom({ redirect: '/b/payment' })}
                  disabled={processing}
                  className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold hover:opacity-95 transition-all disabled:opacity-50"
                >
                  Sign in with Central Hub Solution again
                </button>
              </div>
            )}

            {!sessionExpired && !clientSecret && (
              <>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => chooseProvider('stripe')}
                    className={`rounded-xl border p-4 text-sm font-bold transition-all ${
                      provider === 'stripe'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Pay with Card (Stripe)
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseProvider('paypal')}
                    className={`rounded-xl border p-4 text-sm font-bold transition-all ${
                      provider === 'paypal'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Pay with PayPal
                  </button>
                </div>

                <button
                  type="button"
                  onClick={provider === 'stripe' ? startStripe : startPaypal}
                  disabled={processing || !selectedPlan || !selectedPlanVariant}
                  className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-base font-bold hover:opacity-95 transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing
                    ? 'Starting payment…'
                    : `Continue to payment — ${symbol}${price.toLocaleString()}`}
                </button>
                <p className="mt-3 text-center text-xs text-gray-400">
                  Secured by Central Hub Solution via Stripe &amp; PayPal
                </p>
              </>
            )}

            {/* Stripe Elements */}
            {clientSecret && selectedPlan && selectedPlanVariant && (
              <div className="mt-8 rounded-2xl bg-white border border-gray-100 p-6">
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: { colorPrimary: '#2563eb', borderRadius: '12px' },
                    },
                  }}
                >
                  <PaymentForm
                    planName={`${selectedPlan.name} — ${selectedPlanVariant.name}`}
                    amount={price}
                    currency={selectedPlan.currency}
                    mode={stripeIntentType}
                    onSuccess={handleSuccess}
                    onError={(msg) => {
                      setError(msg)
                      setProcessing(false)
                    }}
                  />
                </Elements>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
