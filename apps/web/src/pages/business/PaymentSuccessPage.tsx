import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { packagesService, type BillingCycle } from '../../services/packages'

const PENDING_KEY = 'vcard_pending_purchase'

function pendingPurchase(): { externalPlanId: string; billingCycle: BillingCycle } | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
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

  const orderId = params.get('token') || params.get('orderId') // PayPal
  const rawPaymentIntent = params.get('payment_intent') || params.get('payment_intent_client_secret') || ''
  const paymentIntentId = rawPaymentIntent.includes('_secret_')
    ? rawPaymentIntent.slice(0, rawPaymentIntent.indexOf('_secret_'))
    : rawPaymentIntent || undefined
  const cancelled = params.get('cancel') === 'true'

  useEffect(() => {
    if (cancelled) {
      setState('error')
      setError('Payment was cancelled. No charge was made.')
      return
    }

    const run = async () => {
      try {
        const pending = pendingPurchase()
        let access: boolean | null = null

        if (orderId) {
          const result = await packagesService.capturePaypal(orderId)
          access = result.canAccessVcard ?? null
        } else if (paymentIntentId && pending) {
          const result = await packagesService.confirmStripe({
            externalPlanId: pending.externalPlanId,
            billingCycle: pending.billingCycle,
            paymentIntentId,
          })
          access = result.canAccessVcard ?? null
        } else {
          setState('error')
          setError(
            'No payment reference was found. If you were redirected here after paying, check your email or contact support.',
          )
          return
        }

        localStorage.removeItem(PENDING_KEY)
        await refreshMcomStatus()
        setCanAccessVcard(access)
        setState('success')
        setTimeout(() => navigate('/b/dashboard', { replace: true }), 2600)
      } catch (err: any) {
        setState('error')
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'We could not confirm your payment. Please try again or contact support.',
        )
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Confirming your payment…</p>
        </div>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 text-3xl">
            ✓
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-6">Payment successful!</h1>
          <p className="text-sm text-gray-500 mt-2">
            Your MCOM VCard plan is now active. Taking you to your dashboard…
          </p>
          {canAccessVcard === false && (
            <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-3">
              Note: your plan is active, but your MCOM membership must also be active before the dashboard unlocks. If
              the dashboard still shows “access required”, activate your membership then use “Check my access again”.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 text-3xl">
          !
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 mt-6">Payment could not be confirmed</h1>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
        <div className="mt-6 space-y-2">
          <Link
            to="/b/payment"
            className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold hover:opacity-95 transition-all"
          >
            Try again
          </Link>
          <Link
            to="/b/payment"
            className="block w-full py-2.5 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            Back to plans
          </Link>
        </div>
      </div>
    </div>
  )
}