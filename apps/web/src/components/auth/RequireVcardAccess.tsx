import { useEffect, useState } from 'react'
import { Navigate, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { mcomService } from '../../services/mcom'

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
  const [membershipUrl, setMembershipUrl] = useState('')

  const hasAccess = user?.permissions?.can_access_vcard === true

  const reason = user?.access_reason
  const reasonMessage =
    reason === 'PLATFORM_NOT_IN_MEMBERSHIP'
      ? 'Your membership is active, but it does not include MCOM VCard. Ask your admin to add the VCard plan to your membership, or choose a plan below.'
      : reason === 'TRIAL_NO_TASKS'
        ? 'Trial access to MCOM VCard is not available yet — Central needs an active programme task for this app. Please check back soon.'
        : reason === 'TRIAL_EXPIRED'
          ? 'Your VCard trial has ended. Pick a plan or membership below to continue.'
          : reason === 'UNVERIFIED'
            ? 'Your business still needs to complete verification on Central Hub before VCard access can start.'
            : reason === 'MEMBERSHIP_EXPIRED'
              ? 'Your membership has expired. Renew it on Central Hub or choose a VCard plan below.'
              : null

  // The Central Hub Solution page where a user can buy/upgrade a membership.
  // Prefer the URL Central attached to the user's entitlement, then the
  // secret-free config endpoint. Only needed when access is missing.
  useEffect(() => {
    if (hasAccess) return
    mcomService
      .getConfig()
      .then((config) => setMembershipUrl(config.membershipUrl))
      .catch(() => setMembershipUrl(''))
  }, [hasAccess])

  const centralMembershipUrl =
    user?.upgrade_url || membershipUrl || 'http://localhost:3010'

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

            <h1 className="text-xl font-extrabold text-gray-900 mt-6">Get access to MCOM VCard</h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              You're signed in, but your account doesn't have an active plan, membership or trial yet. Choose how
              you'd like to get access:
            </p>

            {reasonMessage && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                {reasonMessage}
              </p>
            )}

            {syncError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{syncError}</div>
            )}

            <div className="mt-6 grid gap-3">
              <Link
                to="/plans"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-95 transition-all shadow-md shadow-blue-200"
              >
                <span className="block text-sm font-bold">Buy MCOM VCard plans</span>
                <span className="block text-[11px] text-white/80 mt-0.5">
                  Choose Standard, Pro or Pro+ right here
                </span>
              </Link>

              <a
                href={centralMembershipUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-3 rounded-xl border-2 border-blue-600 text-blue-700 hover:bg-blue-50 transition-all"
              >
                <span className="block text-sm font-bold">Buy membership on Central Hub Solution</span>
                <span className="block text-[11px] text-blue-500 mt-0.5">
                  Opens your Central Hub membership page
                </span>
              </a>
            </div>

            <div className="mt-4 space-y-2">
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