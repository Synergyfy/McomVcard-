import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Business purchase guard.
 *
 * Plan checkout is a business-only flow. Customers receive memberships from
 * businesses and must never be able to enter the plan purchase pages; admins
 * manage plans in the admin dashboard instead.
 */
export default function RequireBusiness() {
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
  const isBusiness = identity === 'BUSINESS' || identity === 'BUSINESS_OWNER'

  if (!isBusiness) {
    if (identity === 'CUSTOMER') return <Navigate to="/c/dashboard" replace />
    if (identity === 'ADMIN') return <Navigate to="/admin" replace />
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
