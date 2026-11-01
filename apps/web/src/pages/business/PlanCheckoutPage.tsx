import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useAuth } from '../../contexts/AuthContext'
import {
  packagesService,
  type PlanPaymentProvider,
  type PlanVariantKey,
  type PurchasablePlan,
  type PurchasableVariant,
} from '../../services/packages'
import { paymentsService, newIdempotencyKey, type WalletSummary } from '../../services/payments'
import WalletPayPanel from '../../components/payments/WalletPayPanel'

const PENDING_KEY = 'vcard_pending_wallet_purchase'
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined
const stripePromise: Promise<Stripe | null> | null = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null

interface PendingPurchase {
  externalPlanId: string
  variant: PlanVariantKey
  provider: PlanPaymentProvider
  idempotencyKey: string
  chargeId?: string
  approvalUrl?: string
}

function loadPendingPurchase(): PendingPurchase | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingPurchase) : null
  } catch {
    return null
  }
}

function savePendingPurchase(pending: PendingPurchase) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  } catch {
    // ignore quota errors
  }
}

function clearPendingPurchase() {
  try {
    localStorage.removeItem(PENDING_KEY)
  } catch {
    // ignore
  }
}

function currencySymbol(currency?: string): string {
  return currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'
}

function money(amount: number, currency?: string): string {
  return `${currencySymbol(currency)}${amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function durationLabel(days: number): string {
  if (days >= 365 && days % 365 === 0) return `${days / 365} ${days === 365 ? 'year' : 'years'}`
  return `${days} days`
}

function monthlyEquivalent(price: number, days: number): string {
  if (!days || price <= 0) return ''
  const months = days / 30.44
  if (months < 1.5) return ''
  return `${money(price / months)}/mo`
}

/* ── Stripe Elements ─────────────────────────────────────────────────────── */

function StripePaymentForm({
  amount,
  currency,
  onPaid,
  onError,
}: {
  amount: number
  currency?: string
  onPaid: (paymentIntentId: string) => Promise<void>
  onError: (message: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements || processing) return

    setProcessing(true)
    setLocalError('')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/plans/success?method=stripe`,
      },
      redirect: 'if_required',
    })

    if (error) {
      const message = error.message || 'Card payment failed. Please try again.'
      setLocalError(message)
      onError(message)
      setProcessing(false)
      return
    }

    if (paymentIntent?.id) {
      try {
        await onPaid(paymentIntent.id)
      } catch (err: any) {
        setLocalError(err?.response?.data?.message || 'Payment succeeded but plan activation failed.')
        setProcessing(false)
      }
      return
    }

    // A redirect is in progress — the success page will finish the flow.
    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Card details</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400">
            <LockIcon className="h-3 w-3" /> Secured by Stripe
          </span>
        </div>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {localError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">{localError}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {processing ? 'Processing card payment…' : `Pay ${money(amount, currency)} securely`}
      </button>

      <p className="text-center text-[11px] text-gray-400">
        Your card details are handled by Stripe. MCOM VCard never sees or stores them.
      </p>
    </form>
  )
}

/* ── Icons ───────────────────────────────────────────────────────────────── */

function LockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function WalletIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

function CardIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 10h18M7 15h2m4 0h2M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ShieldIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

/* ── Small building blocks ───────────────────────────────────────────────── */

function StepBadge({ number, label, active, done }: { number: number; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
          done
            ? 'bg-emerald-500 text-white'
            : active
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-400'
        }`}
      >
        {done ? <CheckIcon className="h-3.5 w-3.5" /> : number}
      </span>
      <span className={`text-xs font-semibold ${active || done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
    </div>
  )
}

function TrustChip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600">
      {icon}
      {children}
    </span>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */

type PaypalState = 'idle' | 'opening' | 'waiting' | 'error'

export default function PlanCheckoutPage() {
  const navigate = useNavigate()
  const { refreshMcomStatus, loginWithMcom } = useAuth()

  const [plans, setPlans] = useState<PurchasablePlan[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedVariant, setSelectedVariant] = useState<PlanVariantKey | ''>('')
  const [provider, setProvider] = useState<PlanPaymentProvider>('wallet')
  const [wallet, setWallet] = useState<WalletSummary | null>(null)
  const [walletError, setWalletError] = useState('')
  const [error, setError] = useState('')
  const [topUpUrl, setTopUpUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [busy, setBusy] = useState(false)

  const [stripeClientSecret, setStripeClientSecret] = useState('')
  const [stripeChargeId, setStripeChargeId] = useState('')

  const [paypalState, setPaypalState] = useState<PaypalState>('idle')
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState('')
  const [paypalChargeId, setPaypalChargeId] = useState('')
  const [paypalNotice, setPaypalNotice] = useState('')
  const pollRef = useRef<number | null>(null)
  const paypalWindowRef = useRef<Window | null>(null)

  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedId), [plans, selectedId])
  const selectedPlanVariant = useMemo<PurchasableVariant | undefined>(
    () => selectedPlan?.variants.find((variant) => variant.key === selectedVariant),
    [selectedPlan, selectedVariant],
  )

  const variantTabs = useMemo(() => {
    const keys: PlanVariantKey[] = ['standard', 'pro', 'pro_plus']
    return keys.map((key) => {
      const variants = plans
        .map((plan) => plan.variants.find((variant) => variant.key === key))
        .filter((variant): variant is PurchasableVariant => Boolean(variant))
      const sample = variants[0]
      return {
        key,
        label: sample?.name ?? key,
        note: sample ? durationLabel(sample.durationDays) : '',
        minPrice: variants.length ? Math.min(...variants.map((variant) => variant.price)) : 0,
        hasFree: variants.some((variant) => variant.price === 0),
      }
    })
  }, [plans])

  const price = selectedPlanVariant?.price ?? 0
  const currency = selectedPlan?.currency
  const isFree = price <= 0
  const walletActive = wallet?.enabled === true && String(wallet.status || '').toUpperCase() === 'ACTIVE'
  const walletInsufficient = walletActive && wallet.availableBalance + 1e-9 < price
  const paymentLocked = busy || paypalState === 'waiting' || Boolean(stripeClientSecret)

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const finish = useCallback(async () => {
    stopPolling()
    try {
      paypalWindowRef.current?.close()
    } catch {
      // ignore — the window may already be closed
    }
    paypalWindowRef.current = null
    clearPendingPurchase()
    try {
      await refreshMcomStatus()
    } catch {
      // The local profile fallback in refreshMcomStatus still updates the user.
    }
    navigate('/b/dashboard', { replace: true })
  }, [navigate, refreshMcomStatus, stopPolling])

  const loadWallet = useCallback(() => {
    setWalletError('')
    paymentsService
      .getWallet()
      .then(setWallet)
      .catch((err: any) => {
        setWalletError(err?.response?.data?.message || 'Could not load your MCOM Wallet balance.')
      })
  }, [])

  const startPaypalPolling = useCallback(
    (chargeId: string, planId: string, variant: PlanVariantKey) => {
      stopPolling()
      const startedAt = Date.now()

      pollRef.current = window.setInterval(async () => {
        if (Date.now() - startedAt > 10 * 60 * 1000) {
          stopPolling()
          setPaypalState('error')
          setPaypalNotice('We are still waiting for PayPal. If you completed the payment, use “Check payment again”.')
          return
        }

        try {
          const result = await packagesService.confirm({
            externalPlanId: planId,
            variant,
            chargeId,
          })

          if (result.canAccessVcard) {
            await finish()
            return
          }

          if (result.charge.status === 'failed' || result.charge.status === 'cancelled') {
            stopPolling()
            setPaypalState('error')
            setPaypalNotice('PayPal did not complete this payment. You can try again or choose another method.')
          }
        } catch {
          // Transient — keep polling until the timeout.
        }
      }, 5000)
    },
    [finish, stopPolling],
  )

  useEffect(() => {
    Promise.all([packagesService.listPlans(), paymentsService.getWallet().catch(() => null)])
      .then(([list, walletSummary]) => {
        setPlans(list)
        setWallet(walletSummary)
        if (!walletSummary) setWalletError('Could not load your MCOM Wallet balance.')

        const pending = loadPendingPurchase()
        const pendingPlan = pending ? list.find((plan) => plan.id === pending.externalPlanId) : null
        const pendingVariant = pendingPlan?.variants.find((variant) => variant.key === pending?.variant)

        if (pending && pendingPlan && pendingVariant) {
          setSelectedId(pendingPlan.id)
          setSelectedVariant(pendingVariant.key)
          setProvider(pending.provider)
          setIdempotencyKey(pending.idempotencyKey)

          if (pending.provider === 'paypal' && pending.chargeId) {
            setPaypalChargeId(pending.chargeId)
            setPaypalApprovalUrl(pending.approvalUrl ?? '')
            setPaypalState('waiting')
            startPaypalPolling(pending.chargeId, pendingPlan.id, pendingVariant.key)
          } else if (pending.provider === 'stripe' && pending.chargeId) {
            setStripeChargeId(pending.chargeId)
            setError('A card payment is already in progress. Click “Continue card payment” to finish it.')
          }
          return
        }

        if (pending) clearPendingPurchase()

        const firstPlan = list[0]
        if (firstPlan) {
          setSelectedId(firstPlan.id)
          const recommended =
            firstPlan.variants.find((variant) => variant.price > 0) ?? firstPlan.variants[0]
          setSelectedVariant(recommended?.key ?? '')
        }
      })
      .catch(() => setError('Could not load plans. Please try again.'))
      .finally(() => setLoading(false))

    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetFlow = () => {
    stopPolling()
    try {
      paypalWindowRef.current?.close()
    } catch {
      // ignore
    }
    paypalWindowRef.current = null
    setStripeClientSecret('')
    setStripeChargeId('')
    setPaypalState('idle')
    setPaypalApprovalUrl('')
    setPaypalChargeId('')
    setPaypalNotice('')
    setError('')
    setTopUpUrl('')
    setIdempotencyKey('')
    clearPendingPurchase()
  }

  const selectPlan = (plan: PurchasablePlan) => {
    if (paymentLocked) return
    setSelectedId(plan.id)
    resetFlow()
  }

  const selectVariantTab = (key: PlanVariantKey) => {
    if (paymentLocked) return
    setSelectedVariant(key)
    resetFlow()

    const current = plans.find((plan) => plan.id === selectedId)
    if (!current?.variants.some((variant) => variant.key === key)) {
      const next = plans.find((plan) => plan.variants.some((variant) => variant.key === key))
      if (next) setSelectedId(next.id)
    }
  }

  const chooseProvider = (next: PlanPaymentProvider) => {
    if (paymentLocked) return
    setProvider(next)
    resetFlow()
  }

  const describeError = (err: any): string => {
    const data = err?.response?.data
    if (data?.error === 'WALLET_INSUFFICIENT_FUNDS') {
      setTopUpUrl(data.topUpUrl || wallet?.topUpUrl || '')
      return data.message || 'Your MCOM Wallet balance is too low.'
    }
    return data?.message || 'Payment failed. Please try again.'
  }

  const handlePaymentError = (err: any) => {
    const status = err?.response?.status
    if (status === 401) setSessionExpired(true)
    if (status && status < 500) {
      setIdempotencyKey('')
      clearPendingPurchase()
    }
    setError(describeError(err))
  }

  const storePending = (
    key: string,
    chargeId?: string,
    approvalUrl?: string,
    providerOverride?: PlanPaymentProvider,
  ) => {
    if (!selectedPlan || !selectedPlanVariant) return
    savePendingPurchase({
      externalPlanId: selectedPlan.id,
      variant: selectedPlanVariant.key,
      provider: providerOverride ?? provider,
      idempotencyKey: key,
      ...(chargeId ? { chargeId } : {}),
      ...(approvalUrl ? { approvalUrl } : {}),
    })
  }

  /* ── Wallet ─────────────────────────────────────────────────────────── */

  const payWithWallet = async () => {
    if (busy || !selectedPlan || !selectedPlanVariant) return
    setError('')
    setTopUpUrl('')
    setBusy(true)

    try {
      setSessionExpired(false)
      const key = idempotencyKey || newIdempotencyKey()
      setIdempotencyKey(key)
      storePending(key, undefined, undefined, 'wallet')

      const result = await packagesService.initiate({
        externalPlanId: selectedPlan.id,
        variant: selectedPlanVariant.key,
        provider: 'wallet',
        idempotencyKey: key,
      })

      if (result.canAccessVcard) {
        await finish()
        return
      }

      if (result.charge?.status === 'pending') {
        const confirmed = await packagesService.confirm({
          externalPlanId: selectedPlan.id,
          variant: selectedPlanVariant.key,
          chargeId: result.charge.id,
        })
        if (confirmed.canAccessVcard) {
          await finish()
          return
        }
      }

      setError('Your wallet charge was received but the plan is not active yet. Please check your access again.')
    } catch (err: any) {
      handlePaymentError(err)
    } finally {
      setBusy(false)
    }
  }

  /* ── Stripe ─────────────────────────────────────────────────────────── */

  const startStripe = async () => {
    if (busy || !selectedPlan || !selectedPlanVariant) return
    if (!STRIPE_KEY) {
      setError('Card payments are not configured on this environment (missing Stripe publishable key).')
      return
    }

    setError('')
    setTopUpUrl('')
    setBusy(true)

    try {
      setSessionExpired(false)
      const key = idempotencyKey || newIdempotencyKey()
      setIdempotencyKey(key)

      const result = await packagesService.initiate({
        externalPlanId: selectedPlan.id,
        variant: selectedPlanVariant.key,
        provider: 'stripe',
        idempotencyKey: key,
      })

      if (result.canAccessVcard) {
        await finish()
        return
      }

      storePending(key, result.charge.id, undefined, 'stripe')

      if (result.clientSecret) {
        setStripeChargeId(result.charge.id)
        setStripeClientSecret(result.clientSecret)
      } else {
        setError('Stripe did not return a payment secret. Please try again.')
        clearPendingPurchase()
      }
    } catch (err: any) {
      handlePaymentError(err)
    } finally {
      setBusy(false)
    }
  }

  const handleStripePaid = async (paymentIntentId: string) => {
    if (!selectedPlan || !selectedPlanVariant || !stripeChargeId) return
    try {
      const result = await packagesService.confirm({
        externalPlanId: selectedPlan.id,
        variant: selectedPlanVariant.key,
        chargeId: stripeChargeId,
        paymentIntentId,
      })
      if (result.canAccessVcard) {
        await finish()
      } else {
        setError('Card payment succeeded but the plan is not active yet. Please contact support.')
      }
    } catch (err: any) {
      handlePaymentError(err)
    }
  }

  /* ── PayPal ─────────────────────────────────────────────────────────── */

  const startPaypal = async () => {
    if (busy || !selectedPlan || !selectedPlanVariant) return

    // Open the PayPal window synchronously so the browser keeps the user gesture.
    const popup = window.open('about:blank', 'mcom_paypal_checkout', 'width=520,height=760')
    paypalWindowRef.current = popup

    setError('')
    setTopUpUrl('')
    setPaypalNotice('')
    setPaypalState('opening')
    setBusy(true)

    try {
      setSessionExpired(false)
      const key = idempotencyKey || newIdempotencyKey()
      setIdempotencyKey(key)

      const result = await packagesService.initiate({
        externalPlanId: selectedPlan.id,
        variant: selectedPlanVariant.key,
        provider: 'paypal',
        idempotencyKey: key,
      })

      if (result.canAccessVcard) {
        if (popup) popup.close()
        await finish()
        return
      }

      if (!result.approvalUrl) {
        if (popup) popup.close()
        paypalWindowRef.current = null
        setPaypalState('error')
        setPaypalNotice('PayPal did not return an approval URL. Please try again.')
        clearPendingPurchase()
        return
      }

      storePending(key, result.charge.id, result.approvalUrl, 'paypal')
      setPaypalChargeId(result.charge.id)
      setPaypalApprovalUrl(result.approvalUrl)
      setPaypalState('waiting')

      if (popup) {
        popup.location.href = result.approvalUrl
      } else {
        setPaypalNotice('Your browser blocked the PayPal window. Use the button below to open PayPal.')
      }

      startPaypalPolling(result.charge.id, selectedPlan.id, selectedPlanVariant.key)
    } catch (err: any) {
      if (popup) popup.close()
      paypalWindowRef.current = null
      setPaypalState('idle')
      handlePaymentError(err)
    } finally {
      setBusy(false)
    }
  }

  const checkPaypalNow = async () => {
    if (!selectedPlan || !selectedPlanVariant || !paypalChargeId) return
    setPaypalNotice('')
    try {
      const result = await packagesService.confirm({
        externalPlanId: selectedPlan.id,
        variant: selectedPlanVariant.key,
        chargeId: paypalChargeId,
      })
      if (result.canAccessVcard) {
        await finish()
      } else {
        setPaypalNotice('PayPal has not confirmed the payment yet. Complete it in the PayPal window, then try again.')
      }
    } catch (err: any) {
      setPaypalNotice(describeError(err))
    }
  }

  const cancelPaypal = () => {
    stopPolling()
    resetFlow()
  }

  /* ── Render helpers ─────────────────────────────────────────────────── */

  const renderPaymentMethod = (
    value: PlanPaymentProvider,
    title: string,
    subtitle: string,
    icon: ReactNode,
    badge?: string,
  ) => {
    const active = provider === value
    return (
      <button
        type="button"
        onClick={() => chooseProvider(value)}
        disabled={paymentLocked && !active}
        className={`relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
          active
            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/15'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
        } ${paymentLocked && !active ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{title}</span>
            {badge && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                {badge}
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{subtitle}</span>
        </span>
        <span
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            active ? 'border-blue-600' : 'border-gray-300'
          }`}
        >
          {active && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
        </span>
      </button>
    )
  }

  const renderPaymentPanel = () => {
    if (isFree) {
      return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <CheckIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-emerald-900">This plan variant is free</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                No payment is required. Activate it now and start using your VCard plan immediately.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={payWithWallet}
            disabled={busy}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Activating…' : 'Activate free plan'}
          </button>
        </div>
      )
    }

    if (provider === 'wallet') {
      return (
        <WalletPayPanel
          amount={price}
          currency={currency}
          wallet={wallet}
          walletError={walletError}
          paying={busy}
          error={error}
          onPay={payWithWallet}
          onRetryWallet={loadWallet}
        />
      )
    }

    if (provider === 'stripe') {
      if (stripeClientSecret && stripeChargeId && stripePromise) {
        return (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: stripeClientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#2563eb',
                    colorBackground: '#ffffff',
                    colorText: '#0f172a',
                    borderRadius: '12px',
                  },
                },
              }}
            >
              <StripePaymentForm
                amount={price}
                currency={currency}
                onPaid={handleStripePaid}
                onError={(message) => setError(message)}
              />
            </Elements>
          </div>
        )
      }

      if (stripeChargeId) {
        return (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <p className="text-sm font-bold text-gray-900">Card payment in progress</p>
            <p className="mt-1 text-xs text-gray-500">
              We found an unfinished card payment for this plan. Continue to reuse the same charge — you will not be
              charged twice.
            </p>
            <button
              type="button"
              onClick={startStripe}
              disabled={busy}
              className="mt-4 min-h-[48px] w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? 'Resuming…' : 'Continue card payment'}
            </button>
          </div>
        )
      }

      return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
              <LockIcon className="h-3.5 w-3.5" /> PCI-DSS
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
              <ShieldIcon className="h-3.5 w-3.5" /> 3-D Secure
            </span>
            <span className="font-semibold">Visa · Mastercard · Amex</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            Pay securely by card through Stripe. You will enter your card details in Stripe's PCI-compliant form on the
            next step.
          </p>
          {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">{error}</div>}
          <button
            type="button"
            onClick={startStripe}
            disabled={busy || !STRIPE_KEY}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Preparing secure card form…' : `Continue to card payment — ${money(price, currency)}`}
          </button>
          {!STRIPE_KEY && (
            <p className="mt-3 text-center text-[11px] text-amber-600">
              Card payments are unavailable because the Stripe publishable key is not configured.
            </p>
          )}
        </div>
      )
    }

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl bg-[#003087]/5 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003087] text-sm font-black text-white">
            P
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900">PayPal</p>
            <p className="text-xs text-gray-500">Pay with your PayPal balance or a linked card.</p>
          </div>
        </div>

        {paypalState === 'waiting' ? (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm font-bold text-gray-900">Waiting for PayPal approval…</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Complete the payment in the PayPal window. This page will update automatically once PayPal confirms.
            </p>
            {paypalNotice && <p className="mt-2 text-xs text-amber-700">{paypalNotice}</p>}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {paypalApprovalUrl && (
                <a
                  href={paypalApprovalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Open PayPal again
                </a>
              )}
              <button
                type="button"
                onClick={checkPaypalNow}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
              >
                Check payment
              </button>
            </div>
            <button
              type="button"
              onClick={cancelPaypal}
              className="mt-3 w-full text-center text-[11px] font-semibold text-gray-400 hover:text-gray-600"
            >
              Cancel and choose another method
            </button>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              You will be taken to PayPal to approve the payment. We will keep this page open and activate your plan
              automatically after approval.
            </p>
            {paypalState === 'error' && paypalNotice && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                {paypalNotice}
              </div>
            )}
            {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">{error}</div>}
            <button
              type="button"
              onClick={startPaypal}
              disabled={busy}
              className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#0070ba] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#005ea6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Opening PayPal…' : `Continue with PayPal — ${money(price, currency)}`}
            </button>
            <p className="mt-3 text-center text-[11px] text-gray-400">
              A secure PayPal window will open. Keep this page open until payment is confirmed.
            </p>
          </>
        )}
      </div>
    )
  }

  const providerLabel = isFree
    ? 'Free activation'
    : provider === 'wallet'
      ? 'MCOM Wallet'
      : provider === 'stripe'
        ? 'Card via Stripe'
        : 'PayPal'
  const walletAfter = walletActive && !isFree ? wallet.availableBalance - price : null

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet><title>Checkout - MCOM VCard</title></Helmet>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
            <ShieldIcon className="h-4 w-4 text-emerald-500" />
            Secure checkout by MCOM Pay
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">MCOM VCard plans</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Choose your plan and pay your way
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
              Standard, Pro and Pro+ give you 90, 180 or 365 days of access. Pay from your MCOM Wallet, by card through
              Stripe, or with PayPal — all processed securely by MCOM Central Hub.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TrustChip icon={<LockIcon className="h-3.5 w-3.5 text-emerald-500" />}>PCI-DSS</TrustChip>
            <TrustChip icon={<ShieldIcon className="h-3.5 w-3.5 text-blue-500" />}>3-D Secure</TrustChip>
            <TrustChip icon={<CheckIcon className="h-3.5 w-3.5 text-emerald-500" />}>Instant activation</TrustChip>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-5">
          <StepBadge number={1} label="Choose plan" done={Boolean(selectedPlanVariant)} />
          <span className="hidden h-px w-8 bg-gray-200 sm:block" />
          <StepBadge number={2} label="Payment method" active={Boolean(selectedPlanVariant)} />
          <span className="hidden h-px w-8 bg-gray-200 sm:block" />
          <StepBadge number={3} label="Access activated" />
          <span className="ml-auto hidden text-[11px] font-semibold text-gray-400 sm:block">
            One-time payment · no auto-renew
          </span>
        </div>

        {sessionExpired && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-bold text-amber-900">Your MCOM session has expired</p>
            <p className="mt-1 text-xs text-amber-700">
              Sign in with Central Hub Solution again to re-authorize your account, then continue.
            </p>
            <button
              type="button"
              onClick={() => loginWithMcom({ redirect: '/plans' })}
              disabled={busy}
              className="mt-4 min-h-[44px] rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              Sign in with Central Hub Solution
            </button>
          </div>
        )}

        {error && !stripeClientSecret && paypalState !== 'waiting' && provider === 'wallet' && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
            {topUpUrl && (
              <a href={topUpUrl} target="_blank" rel="noreferrer" className="ml-2 font-bold underline">
                Top up your wallet
              </a>
            )}
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs font-semibold text-gray-400">Loading plans…</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-bold text-gray-900">No plans are available yet</p>
            <p className="mt-1 text-xs text-gray-500">Please contact MCOM Solutions to enable plan purchases.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
            <div className="space-y-8">
              {/* Step 1 — plans */}
              <section>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">1. Choose your plan</h2>
                    <p className="mt-1 text-xs text-gray-500">Pick the access level and duration that fits your business.</p>
                  </div>
                  <span className="hidden text-[11px] font-semibold text-gray-400 sm:block">No hidden fees</span>
                </div>

                <div className="mt-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
                    <div className="grid grid-cols-3 gap-1.5">
                      {variantTabs.map((tab) => {
                        const active = selectedVariant === tab.key
                        return (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => selectVariantTab(tab.key)}
                            disabled={paymentLocked}
                            className={`relative rounded-xl px-2 py-2.5 text-center transition-all ${
                              active
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                            } ${paymentLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                          >
                            <span className="flex flex-wrap items-center justify-center gap-1.5">
                              <span className={`text-xs font-black sm:text-sm ${active ? 'text-white' : 'text-gray-900'}`}>
                                {tab.label}
                              </span>
                              {tab.key === 'pro_plus' && (
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                    active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  Best value
                                </span>
                              )}
                            </span>
                            <span className={`mt-0.5 block text-[10px] font-semibold ${active ? 'text-white/70' : 'text-gray-400'}`}>
                              {tab.note}
                            </span>
                            <span className={`mt-0.5 block text-[10px] font-bold ${active ? 'text-white/85' : 'text-gray-500'}`}>
                              {tab.hasFree && tab.minPrice === 0 ? 'Free' : `From ${money(tab.minPrice, currency)}`}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
                    Switch tabs to compare access length. Every plan is available in Standard, Pro and Pro+.
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {plans.map((plan) => {
                      const variant = plan.variants.find((candidate) => candidate.key === selectedVariant)
                      if (!variant) return null
                      const planActive = plan.id === selectedId
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => selectPlan(plan)}
                          disabled={paymentLocked}
                          className={`group flex h-full flex-col rounded-3xl border p-5 text-left transition-all ${
                            planActive
                              ? 'border-blue-600 bg-white shadow-xl shadow-blue-100/70 ring-2 ring-blue-600/15'
                              : 'border-gray-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md'
                          } ${paymentLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-base font-black text-gray-900">{plan.name}</h3>
                              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                {variant.name} · {durationLabel(variant.durationDays)}
                              </p>
                            </div>
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                planActive ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'
                              }`}
                            >
                              {planActive && <CheckIcon className="h-3 w-3 text-white" />}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{plan.description}</p>

                          <div className="mt-4 flex flex-wrap items-end gap-2">
                            <span className="text-3xl font-black tracking-tight text-gray-900">
                              {money(variant.price, plan.currency)}
                            </span>
                            {variant.price === 0 ? (
                              <span className="mb-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                                Free
                              </span>
                            ) : monthlyEquivalent(variant.price, variant.durationDays) ? (
                              <span className="mb-1 text-[11px] font-semibold text-gray-400">
                                ≈ {monthlyEquivalent(variant.price, variant.durationDays)}
                              </span>
                            ) : null}
                          </div>

                          <ul className="mt-4 space-y-2">
                            {(variant.features.length > 0
                              ? variant.features
                              : ['Full VCard suite access', 'Standard QR codes', 'Email support']
                            )
                              .slice(0, 5)
                              .map((feature) => (
                                <li key={feature} className="flex items-start gap-2 text-[11px] leading-snug text-gray-600">
                                  <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                                  {feature}
                                </li>
                              ))}
                          </ul>

                          <div className="mt-auto pt-5">
                            <span
                              className={`flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                                planActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                              }`}
                            >
                              {planActive ? (
                                <>
                                  <CheckIcon className="h-3.5 w-3.5" /> Selected
                                </>
                              ) : (
                                `Select ${plan.name}`
                              )}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* Step 2 — payment */}
              <section>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">
                      {isFree ? '2. Activate your plan' : '2. Payment method'}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {isFree
                        ? 'This variant is free — no payment details are needed.'
                        : 'Choose how you want to pay. All methods settle through MCOM Pay.'}
                    </p>
                  </div>
                </div>

                {!isFree && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {renderPaymentMethod(
                      'wallet',
                      'MCOM Wallet',
                      walletActive
                        ? `${wallet?.availableBalance.toFixed(2)} MCOM available`
                        : 'Pay instantly from your MCOM credits',
                      <WalletIcon />,
                      'Fastest',
                    )}
                    {renderPaymentMethod(
                      'stripe',
                      'Card',
                      'Visa, Mastercard, Amex via Stripe',
                      <CardIcon />,
                    )}
                    {renderPaymentMethod(
                      'paypal',
                      'PayPal',
                      'PayPal balance or linked card',
                      <span className="text-sm font-black">P</span>,
                    )}
                  </div>
                )}

                {walletActive && provider === 'wallet' && !isFree && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs">
                    <span className="font-semibold text-gray-500">
                      Available <span className="text-gray-900">{wallet?.availableBalance.toFixed(2)} MCOM</span>
                      {walletInsufficient && <span className="ml-2 font-bold text-amber-600">Not enough for this plan</span>}
                    </span>
                    {wallet?.topUpUrl && (
                      <a href={wallet.topUpUrl} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline">
                        Top up wallet ↗
                      </a>
                    )}
                  </div>
                )}

                <div className="mt-4">{renderPaymentPanel()}</div>
              </section>

              {/* Trust / help */}
              <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <ShieldIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Secure by design</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">
                        Card data stays with Stripe. Wallet balances live on MCOM Central Hub.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Instant activation</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">
                        Your plan unlocks as soon as the payment is confirmed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Need help?</p>
                      <Link to="/b/help" className="mt-0.5 block text-[11px] font-semibold text-blue-600 hover:underline">
                        Contact MCOM support
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg shadow-gray-200/50">
                <div className="border-b border-gray-100 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Order summary</p>
                  <p className="mt-2 text-lg font-black">{selectedPlan?.name ?? 'Choose a plan'}</p>
                  <p className="mt-0.5 text-xs text-white/70">
                    {selectedPlanVariant ? `${selectedPlanVariant.name} · ${durationLabel(selectedPlanVariant.durationDays)}` : 'Select a variant'}
                  </p>
                </div>

                <div className="p-5">
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">Plan</dt>
                      <dd className="text-right font-semibold text-gray-900">{selectedPlan?.name ?? '—'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">Access</dt>
                      <dd className="text-right font-semibold text-gray-900">
                        {selectedPlanVariant ? `${selectedPlanVariant.name} (${durationLabel(selectedPlanVariant.durationDays)})` : '—'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">Payment method</dt>
                      <dd className="text-right font-semibold text-gray-900">{providerLabel}</dd>
                    </div>
                    {walletAfter !== null && provider === 'wallet' && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-gray-500">Wallet after payment</dt>
                        <dd className={`text-right font-semibold ${walletAfter < 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                          {walletAfter < 0 ? '—' : `${walletAfter.toFixed(2)} MCOM`}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="my-5 border-t border-dashed border-gray-200" />

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total due today</p>
                      <p className="mt-1 text-3xl font-black tracking-tight text-gray-900">{money(price, currency)}</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                      One-time
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] leading-relaxed text-gray-500">
                      This is a one-time payment for {selectedPlanVariant ? durationLabel(selectedPlanVariant.durationDays) : 'your chosen period'} of
                      access. It does not auto-renew and no future charges are scheduled.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-gray-400">
                    <LockIcon className="h-3.5 w-3.5" />
                    {isFree ? 'No payment required' : `Processed by MCOM Pay · ${providerLabel}`}
                  </div>
                </div>
              </div>

              {isFree ? (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="text-xs font-bold text-emerald-900">Free plan</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-emerald-700">
                    No payment details are required. Activate the plan and start using your VCard suite immediately.
                  </p>
                </div>
              ) : provider === 'wallet' ? (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-xs font-bold text-blue-900">MCOM Wallet customers</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-blue-700">
                    1 MCOM = £1.00. Top up on Central Hub at any time and reuse the balance across the MCOM ecosystem.
                  </p>
                  {wallet?.topUpUrl && (
                    <a
                      href={wallet.topUpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex min-h-[40px] items-center rounded-xl bg-blue-600 px-4 py-2 text-[11px] font-bold text-white hover:bg-blue-700"
                    >
                      Top up MCOM Wallet ↗
                    </a>
                  )}
                </div>
              ) : provider === 'stripe' ? (
                <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-bold text-gray-900">Secure card payment</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                    Your card details are entered in Stripe's PCI-DSS compliant form and are never stored by VCard.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <LockIcon className="h-3 w-3" /> 3-D Secure · Stripe
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-xs font-bold text-blue-900">Paying with PayPal</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-blue-700">
                    A secure PayPal window opens for approval. Keep this page open — your plan activates automatically
                    once PayPal confirms.
                  </p>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
