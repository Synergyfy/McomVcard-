import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../contexts/AuthContext'
import { packagesService, type PlanVariantKey } from '../../services/packages'

const PENDING_KEY = 'vcard_pending_wallet_purchase'

interface PendingPurchase {
  kind?: 'plan' | 'access_pass'
  externalPlanId: string
  variant?: PlanVariantKey
  accessPassId?: string
  provider: 'wallet' | 'stripe' | 'paypal'
  idempotencyKey: string
  chargeId?: string
  approvalUrl?: string
}

function confirmPending(pending: PendingPurchase, paymentIntentId?: string) {
  if (pending.kind === 'access_pass' && pending.accessPassId) {
    return packagesService.confirmAccessPass({
      accessPassId: pending.accessPassId,
      chargeId: pending.chargeId as string,
      ...(paymentIntentId ? { paymentIntentId } : {}),
    })
  }
  if (!pending.variant) {
    return Promise.reject(new Error('Missing plan variant on the pending purchase'))
  }
  return packagesService.confirm({
    externalPlanId: pending.externalPlanId,
    variant: pending.variant,
    chargeId: pending.chargeId as string,
    ...(paymentIntentId ? { paymentIntentId } : {}),
  })
}

/** Stripe and the activation webhook can settle a few seconds apart. */
async function confirmWithPolling(pending: PendingPurchase, paymentIntentId?: string) {
  let result = await confirmPending(pending, paymentIntentId)
  for (let attempt = 0; attempt < 10 && !result.canAccessVcard; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 2000))
    try {
      result = await confirmPending(pending)
    } catch {
      // Keep polling — the webhook may still be in flight.
    }
  }
  return result
}

function loadPendingPurchase(): PendingPurchase | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingPurchase) : null
  } catch {
    return null
  }
}

function clearPendingPurchase() {
  try {
    localStorage.removeItem(PENDING_KEY)
  } catch {
    // ignore
  }
}

type State = 'processing' | 'success' | 'error'

export default function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { refreshMcomStatus } = useAuth()
  const [state, setState] = useState<State>('processing')
  const [error, setError] = useState('')
  const [canAccessVcard, setCanAccessVcard] = useState<boolean | null>(null)

  const paymentIntentId = useMemo(() => {
    const raw = params.get('payment_intent') || params.get('payment_intent_client_secret') || ''
    return raw.includes('_secret_') ? raw.slice(0, raw.indexOf('_secret_')) : raw || undefined
  }, [params])

  const redirectStatus = params.get('redirect_status')
  const cancelled = params.get('cancel') === 'true'

  useEffect(() => {
    if (cancelled) {
      setState('error')
      setError('Payment was cancelled. No charge was made.')
      return
    }
    if (redirectStatus && redirectStatus !== 'succeeded') {
      setState('error')
      setError('The card payment was not completed. Please try again.')
      return
    }

    const run = async () => {
      const pending = loadPendingPurchase()

      if (!pending?.chargeId) {
        setState('error')
        setError('No payment reference was found. If you were charged, contact support with your receipt.')
        return
      }

      if (!paymentIntentId) {
        // PayPal polling normally finishes on the checkout page. If the user
        // lands here without a Stripe intent, check the charge status anyway.
        try {
          const result = await confirmWithPolling(pending)
          if (result.canAccessVcard) {
            clearPendingPurchase()
            await refreshMcomStatus().catch(() => undefined)
            setCanAccessVcard(true)
            setState('success')
            setTimeout(() => navigate('/b/dashboard', { replace: true }), 2200)
            return
          }
          setState('error')
          setError('We could not confirm the payment yet. Complete it in the provider window, then try again.')
        } catch (err: any) {
          setState('error')
          setError(err?.response?.data?.message || 'We could not confirm the payment. Please contact support.')
        }
        return
      }

      try {
        const result = await confirmWithPolling(pending, paymentIntentId)

        clearPendingPurchase()
        await refreshMcomStatus().catch(() => undefined)
        setCanAccessVcard(result.canAccessVcard)
        setState(result.canAccessVcard ? 'success' : 'error')
        if (!result.canAccessVcard) {
          setError('Payment succeeded but the plan is not active yet. Please contact support.')
        } else {
          setTimeout(() => navigate('/b/dashboard', { replace: true }), 2200)
        }
      } catch (err: any) {
        setState('error')
        setError(err?.response?.data?.message || 'We could not confirm your payment. Please contact support.')
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const shell = (children: ReactNode) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Helmet><title>Payment status - MCOM VCard</title></Helmet>
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-gray-200/60">
        {children}
      </div>
    </div>
  )

  if (state === 'processing') {
    return shell(
      <>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
        <h1 className="mt-6 text-xl font-black text-gray-900">Confirming your payment</h1>
        <p className="mt-2 text-sm text-gray-500">Please wait while MCOM Pay verifies the transaction…</p>
      </>,
    )
  }

  if (state === 'success') {
    return shell(
      <>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-xl font-black text-gray-900">Payment successful</h1>
        <p className="mt-2 text-sm text-gray-500">Your MCOM VCard access is now active. Taking you to your dashboard…</p>
        {canAccessVcard === false && (
          <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
            Your plan is active, but your MCOM membership may still need attention. Use “Check access again” on the
            dashboard if it stays locked.
          </p>
        )}
      </>,
    )
  }

  return shell(
    <>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-2xl font-black text-amber-600">
        !
      </div>
      <h1 className="mt-6 text-xl font-black text-gray-900">Payment not confirmed</h1>
      <p className="mt-2 text-sm text-gray-500">{error}</p>
      <div className="mt-6 space-y-2">
        <Link
          to="/plans"
          className="block min-h-[48px] w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-sm font-bold text-white transition-all hover:opacity-95"
        >
          Back to plans
        </Link>
        <Link
          to="/b/dashboard"
          className="block min-h-[48px] w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
        >
          Go to dashboard
        </Link>
      </div>
    </>,
  )
}
