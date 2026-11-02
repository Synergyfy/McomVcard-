import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const BUSINESS_ROLES = ['BUSINESS', 'BUSINESS_OWNER', 'STAFF']

/**
 * Route guard for the isolated business dashboard (/b/*).
 *
 * All authentication is delegated to Central Hub Solution through the standard
 * /login entry point — there is no separate business credential store.
 *
 * 1. No session       → /login?redirect=/b/...
 * 2. Wrong role       → blocked (customers to their dashboard, others to login)
 * 3. No VCard access  → plan gate so the business can buy/upgrade first.
 */
export default function RequireBusinessAccess() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentPath = `${location.pathname}${location.search}`

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />
  }

  const role = (user.role || user.profile_type || '').toUpperCase()
  if (!BUSINESS_ROLES.includes(role)) {
    if (role === 'CUSTOMER') return <Navigate to="/c/dashboard" replace />
    return <Navigate to="/login?error=role" replace />
  }

  const hasAccess = user.permissions?.can_access_vcard === true
  if (!hasAccess) {
    const upgradeUrl = user.upgrade_url || 'http://localhost:3010'

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-xl shadow-orange-100/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="mt-6 text-xl font-extrabold text-gray-900">Business membership required</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            You are signed in as a business, but your account does not have an active VCard plan yet.
            Choose a plan to unlock your business dashboard.
          </p>
          <div className="mt-6 grid gap-3">
            <Link to="/plans" className="block w-full min-h-[48px] rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-200">
              Choose a VCard plan
            </Link>
            <a href={upgradeUrl} target="_blank" rel="noreferrer" className="block w-full min-h-[48px] rounded-xl border-2 border-orange-500 px-4 py-3 text-sm font-bold text-orange-700">
              Buy membership on Central Hub Solution
            </a>
            <Link to="/login" className="block py-2.5 text-sm font-semibold text-gray-500 hover:text-orange-600">
              Sign in with another business account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
