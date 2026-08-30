import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import AuthLayout from '../../components/auth/AuthLayout'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Direct Dashboard Handshake landing page (spec §3.3).
 *
 * MCOM Central redirects the browser here with `?token=<JWT>` (shared-secret
 * signed, ~60s TTL). This page hands the token to
 * GET /api/v1/auth/sso-login, which verifies it, JIT-provisions the user and
 * issues a local session, then forwards to the dashboard.
 *
 * The handshake JWT is short-lived, so the effect must fire exactly ONCE even
 * though React StrictMode double-invokes effects in development.
 */
export default function SsoLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { completeMcomHandshake } = useAuth()
  const [error, setError] = useState('')
  const [handled, setHandled] = useState(false)
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true

    const token = searchParams.get('token')

    if (!token) {
      setError('Missing handshake token — this link may be incomplete or expired.')
      setHandled(true)
      return
    }

    const run = async () => {
      try {
        const { user, role } = await completeMcomHandshake(token)

        const redirect = searchParams.get('redirect')
        if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
          navigate(redirect, { replace: true })
        } else if (role === 'CUSTOMER' || user.email) {
          // Consumer identities land on the consumer dashboard.
          navigate('/c/dashboard', { replace: true })
        } else {
          navigate('/b/dashboard', { replace: true })
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Handshake verification failed. Please try again.')
      } finally {
        setHandled(true)
      }
    }

    run()
  }, [searchParams, completeMcomHandshake, navigate])

  return (
    <AuthLayout title="Signing you in" subtitle="Connecting you from MCOM Solutions…">
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