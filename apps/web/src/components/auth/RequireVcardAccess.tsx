import { useState } from 'react'
import { Navigate, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Route guard that enforces MCOM platform access.
 *
 * Users must be authenticated AND have an active MCOM VCard package
 * (permissions.can_access_vcard === true) to enter the wrapped dashboards.
 * Users without access see an upgrade/access-denied screen instead.
 */
export default function RequireVcardAccess() {
  const { user, isAuthenticated, isLoading, refreshMcomStatus } = useAuth()
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState('')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const hasAccess = user?.permissions?.can_access_vcard === true

  if (!hasAccess) {
    const handleResync = async () => {
      setSyncing(true)
      setSyncError('')
      try {
        await refreshMcomStatus()
      } catch (err: any) {
        setSyncError(err?.response?.data?.message || 'Could not refresh your MCOM access. Please try again.')
      } finally {
        setSyncing(false)
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h1 className="text-xl font-extrabold text-gray-900 mt-6">MCOM VCard access required</h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Your MCOM Solutions account does not have an active package for MCOM VCard. Choose a plan to unlock the
              dashboard — payments are processed securely by MCOM Solutions.
            </p>

            {syncError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{syncError}</div>
            )}

            <div className="mt-6 space-y-2">
              <Link
                to="/b/payment"
                className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold hover:opacity-95 transition-all shadow-md shadow-blue-200"
              >
                Choose a plan & pay
              </Link>
              <button
                type="button"
                onClick={handleResync}
                disabled={syncing}
                className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                {syncing ? 'Checking…' : 'Check my access again'}
              </button>
              <Link
                to="/"
                className="block w-full py-2.5 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}