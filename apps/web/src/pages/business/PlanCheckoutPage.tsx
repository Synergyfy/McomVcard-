import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../../contexts/AuthContext'
import { packagesService, type BillingCycle, type PaymentProvider, type PurchasablePlan } from '../../services/packages'

const stripePromise: Promise<Stripe | null> = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const BILLING_LABELS: Record<BillingCycle, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
}

interface PendingPurchase {
  externalPlanId: string
  billingCycle: BillingCycle
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

function PaymentForm({
  planName,
  amount,
  mode,
  onSuccess,
  onError,
}: {
  planName: string
  amount: number
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
        {planName} — £{amount.toLocaleString()}
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
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
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
        if (list.length > 0) setSelectedId(list[0].id)
      })
      .catch(() => setError('Could not load plans. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const selectedPlan = useMemo(() => plans.find((p) => p.id === selectedId), [plans, selectedId])
  const price = useMemo(() => {
    if (!selectedPlan) return 0
    if (billingCycle === 'monthly') return selectedPlan.monthlyPrice
    if (billingCycle === 'quarterly') return selectedPlan.quarterlyPrice
    return selectedPlan.annualPrice
  }, [selectedPlan, billingCycle])

  const handleSuccess = async (intentId: string, intentType: 'payment' | 'setup') => {
    const pending = pendingPurchase()
    if (!pending) return

    try {
      const result = await packagesService.confirmStripe({
        externalPlanId: pending.externalPlanId,
        billingCycle: pending.billingCycle,
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
    if (!selectedPlan) return
    setError('')
    setProcessing(true)
    try {
      if (!(await ensureSession())) return
      localStorage.setItem(PENDING_KEY, JSON.stringify({ externalPlanId: selectedPlan.id, billingCycle }))
      const res = await packagesService.initiate({
        externalPlanId: selectedPlan.id,
        billingCycle,
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
    if (!selectedPlan) return
    setError('')
    setProcessing(true)
    try {
      if (!(await ensureSession())) return
      localStorage.setItem(PENDING_KEY, JSON.stringify({ externalPlanId: selectedPlan.id, billingCycle }))
      const res = await packagesService.initiate({
        externalPlanId: selectedPlan.id,
        billingCycle,
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
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-gray-500 font-medium hover:text-gray-800 inline-block mb-6">
          ← Back
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900">Upgrade your MCOM VCard plan</h1>
        <p className="text-sm text-gray-500 mt-2">
          Payments are processed securely by MCOM Solutions. Your plan activates the moment payment settles.
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
            {/* Billing cycle */}
            <div className="mt-8 flex items-center gap-2">
              {(['monthly', 'quarterly', 'annual'] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    billingCycle === cycle
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {BILLING_LABELS[cycle]}
                </button>
              ))}
            </div>

            {/* Plan cards */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              {plans.map((plan) => {
                const active = plan.id === selectedId
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(plan.id)
                      setClientSecret('')
                    }}
                    className={`text-left rounded-2xl border p-6 transition-all ${
                      active
                        ? 'border-blue-600 ring-2 ring-blue-600/20 bg-white shadow-lg shadow-blue-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold text-gray-900">{plan.name}</h3>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">{plan.level}</p>
                      </div>
                      {active && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                          Selected
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <span className="text-2xl font-black text-gray-900">£{plan.monthlyPrice.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">/mo</span>
                    </div>

                    <ul className="mt-4 space-y-1.5">
                      {(plan.features.length > 0 ? plan.features : ['Full VCard suite access']).map((feature) => (
                        <li key={feature} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
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
                  Sign in with MCOM again to re-authorize your account, then you can continue with your plan purchase.
                </p>
                <button
                  type="button"
                  onClick={() => loginWithMcom({ redirect: '/b/payment' })}
                  disabled={processing}
                  className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold hover:opacity-95 transition-all disabled:opacity-50"
                >
                  Sign in with MCOM again
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
                  disabled={processing || !selectedPlan}
                  className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-base font-bold hover:opacity-95 transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing
                    ? 'Starting payment…'
                    : `Continue to payment — £${price.toLocaleString()}`}
                </button>
                <p className="mt-3 text-center text-xs text-gray-400">
                  Secured by MCOM Solutions via Stripe &amp; PayPal
                </p>
              </>
            )}

            {/* Stripe Elements */}
            {clientSecret && selectedPlan && (
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
                    planName={selectedPlan.name}
                    amount={price}
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