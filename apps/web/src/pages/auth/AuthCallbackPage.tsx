import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import AuthLayout from '../../components/auth/AuthLayout'
import { useAuth } from '../../contexts/AuthContext'
import { consumerService } from '../../services/consumer'

/**
 * OAuth 2.0 callback landing page (the browser lands here after Central Hub
 * Solution redirects with ?code=...&state=..., bridged through the API's
 * GET /auth/callback). The actual token exchange happens server-side at
 * POST /api/v1/auth/sso/callback; this page just orchestrates it.
 *
 * The OAuth `code` is single-use, so this effect must fire exactly ONCE even
 * though React StrictMode double-invokes effects in development — otherwise the
 * second POST re-exchanges the already-consumed code and Central answers 401.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { completeMcomCallback } = useAuth()
  const [error, setError] = useState('')
  const [upgradeUrl, setUpgradeUrl] = useState('')
  const [handled, setHandled] = useState(false)
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      setError('Invalid authentication response — missing code or state.')
      setHandled(true)
      return
    }

    const run = async () => {
      try {
        const { user, returnTo } = await completeMcomCallback(code, state)

        if (returnTo) {
          navigate(returnTo, { replace: true })
          return
        }

        const card = searchParams.get('card')
        if (card) {
          const business = searchParams.get('business') || undefined
          await consumerService.associateCard(card, business)
          const existing = await consumerService.getProfileByEmail(user.email)
          if (existing) {
            navigate('/c/dashboard', { replace: true })
          } else {
            navigate(`/c/setup?card=${encodeURIComponent(card)}&business=${encodeURIComponent(business || '')}`, {
              replace: true,
            })
          }
        } else if (user.role === 'CUSTOMER' || user.profile_type === 'CUSTOMER') {
          navigate('/c/dashboard', { replace: true })
        } else {
          navigate('/b/dashboard', { replace: true })
        }
      } catch (err: any) {
        const data = err?.response?.data
        setError(data?.message || 'Central Hub Solution authentication failed. Please try again.')
        setUpgradeUrl(data?.upgradeUrl || '')
      } finally {
        setHandled(true)
      }
    }

    run()
  }, [searchParams, completeMcomCallback, navigate])

  return (
    <AuthLayout title="Signing you in" subtitle="Completing Central Hub Solution authentication…">
      <Helmet>
        <title>Signing you in - Mobile VCard Link</title>
      </Helmet>

      {!handled && !error && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Verifying your Central Hub Solution identity…</p>
        </div>
      )}

      {error && (
        <div className="py-6 space-y-3">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800">{error}</div>

          {upgradeUrl && (
            <>
              <Link
                to="/b/payment"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-95 transition-all text-center shadow-md shadow-blue-200"
              >
                <span className="block text-sm font-bold">Buy MCOM VCard plans</span>
                <span className="block text-[11px] text-white/80 mt-0.5">Choose Standard, Pro or Pro+ here</span>
              </Link>
              <a
                href={upgradeUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-3 rounded-xl border-2 border-blue-600 text-blue-700 hover:bg-blue-50 transition-all text-center"
              >
                <span className="block text-sm font-bold">Buy membership on Central Hub Solution</span>
                <span className="block text-[11px] text-blue-500 mt-0.5">Opens your Central Hub membership page</span>
              </a>
            </>
          )}

          <Link
            to="/login"
            className="block text-center py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            Back to login
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}