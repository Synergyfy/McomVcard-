import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Route guard that only requires authentication (unlike RequireVcardAccess,
 * which additionally demands an active VCard package). Used for payment flow
 * pages that must be reachable before access is granted.
 */
export default function RequireAuth() {
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

  return <Outlet />
}