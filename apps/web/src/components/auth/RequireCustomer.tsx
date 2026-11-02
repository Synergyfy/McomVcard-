import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Customer dashboard RBAC guard.
 *
 * Customers may only enter /c/* when their canonical Central Hub profile is a
 * CUSTOMER. Business, staff and admin identities are redirected to their own
 * dashboards, and unauthenticated visitors are sent to the Central Hub SSO
 * login page, preserving the destination for after authentication.
 */
export default function RequireCustomer() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    const currentPath = `${location.pathname}${location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />
  }

  const identity = String(user.role || user.profile_type || '').toUpperCase()

  // Only Central-provisioned customers may use the customer dashboard. There
  // is deliberately no email/password customer login path.
  if (identity !== 'CUSTOMER') {
    if (identity === 'ADMIN') return <Navigate to="/admin" replace />
    if (identity === 'BUSINESS' || identity === 'BUSINESS_OWNER') {
      return <Navigate to="/b/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
