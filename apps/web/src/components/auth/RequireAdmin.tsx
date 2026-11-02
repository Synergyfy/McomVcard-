import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'

export default function RequireAdmin() {
  const { admin, roles, isLoading } = useAdminAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!admin || !roles.includes('ADMIN')) {
    const currentPath = `${location.pathname}${location.search}`
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(currentPath)}`} replace />
  }

  return <Outlet />
}
