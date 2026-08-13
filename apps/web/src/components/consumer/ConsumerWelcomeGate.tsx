import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

interface ConsumerWelcomeGateProps {
  cardId: string
  business?: string
}

export default function ConsumerWelcomeGate({ cardId, business }: ConsumerWelcomeGateProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
      <Helmet>
        <title>Welcome to MCOMVCard</title>
      </Helmet>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/25">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">MCOMVCard</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center">Welcome to MCOMVCard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            Your digital card and membership experience.
          </p>

          {business && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent-50 dark:bg-accent-500/10 px-4 py-3 text-sm font-semibold text-accent-700 dark:text-accent-300">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              You've been invited by {business}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Link
              to={`/register?card=${encodeURIComponent(cardId)}&business=${encodeURIComponent(business || '')}`}
              className="block w-full py-3.5 text-center rounded-2xl bg-accent-500 text-white text-sm font-bold shadow-lg shadow-accent-500/25 hover:bg-accent-600 transition-colors"
            >
              Create an Account
            </Link>
            <Link
              to={`/login?card=${encodeURIComponent(cardId)}&business=${encodeURIComponent(business || '')}`}
              className="block w-full py-3.5 text-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <p>
              New to MCOM?{' '}
              <span className="font-semibold text-gray-600 dark:text-gray-300">Create an account</span>
            </p>
            <p>
              Already have an MCOM account?{' '}
              <span className="font-semibold text-gray-600 dark:text-gray-300">Sign in</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          No payment or subscription required.
        </p>
      </div>
    </div>
  )
}
