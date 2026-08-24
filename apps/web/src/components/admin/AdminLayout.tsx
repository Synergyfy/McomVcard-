import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { tokenStore } from '../../services/tokenStore'

export default function AdminLayout() {
  useEffect(() => {
    // Seed a mock access token in memory for demo/admin flows that bypass
    // the real auth system. The token lives only in memory (tokenStore),
    // never in localStorage, preserving XSS protection.
    if (!tokenStore.get()) {
      tokenStore.set('mock-token-00000')
    }
    const raw = localStorage.getItem('auth_user')
    if (!raw || raw === 'null') {
      localStorage.setItem('auth_user', JSON.stringify({
        id: '1', name: 'Super Admin', first_name: 'Super', last_name: 'Admin',
        email: 'admin@vcardlink.com', status: 'active', is_active: true, is_verified: true,
      }))
      window.location.reload()
    }
  }, [])

  return (
    <div className="admin-app flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}