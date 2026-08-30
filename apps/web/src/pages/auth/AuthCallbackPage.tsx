import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import AuthLayout from '../../components/auth/AuthLayout'
import { useAuth } from '../../contexts/AuthContext'
import { consumerService } from '../../services/consumer'

/**
 * OAuth 2.0 callback landing page (the browser lands here after MCOM Central
 * redirects with ?code=...&state=...). The actual token exchange happens
 * server-side at POST /api/v1/auth/sso/callback; this page just orchestrates it.
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
        } else {
          navigate('/b/dashboard', { replace: true })
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'MCOM authentication failed. Please try again.')
      } finally {
        setHandled(true)
      }
    }

    run()
  }, [searchParams, completeMcomCallback, navigate])

  return (
    <AuthLayout title="Signing you in" subtitle="Completing MCOM Solutions authentication…">
      <Helmet>
        <title>Signing you in - Mobile VCard Link</title>
      </Helmet>

      {!handled && !error && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Verifying your MCOM identity…</p>
        </div>
      )}

      {error && (
        <div className="py-6 space-y-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
          <Link
            to="/login"
            className="block text-center py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Back to login
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}