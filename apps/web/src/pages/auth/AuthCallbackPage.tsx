import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import AuthLayout from '../../components/auth/AuthLayout'
import { useAuth } from '../../contexts/AuthContext'
import { consumerService } from '../../services/consumer'

/**
 * OAuth 2.0 callback landing page (the browser lands here after MCOM Central
 * redirects with ?code=...&state=...). The actual token exchange happens
 * server-side at POST /api/auth/sso/callback; this page just orchestrates it.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { completeMcomCallback } = useAuth()
  const [error, setError] = useState('')
  const [handled, setHandled] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      setError('Invalid authentication response — missing code or state.')
      setHandled(true)
      return
    }

    let cancelled = false

    const run = async () => {
      try {
        const { user, returnTo } = await completeMcomCallback(code, state)
        if (cancelled) return

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
        if (cancelled) return
        setError(err?.response?.data?.message || 'MCOM authentication failed. Please try again.')
      } finally {
        if (!cancelled) setHandled(true)
      }
    }

    run()

    return () => {
      cancelled = true
    }
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