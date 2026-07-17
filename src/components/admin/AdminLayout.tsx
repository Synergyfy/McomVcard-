import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayout() {
  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', 'mock-token-00000')
    }
    const raw = localStorage.getItem('auth_user')
    if (!raw || raw === 'null') {
      localStorage.setItem('auth_user', JSON.stringify({
        id: 1, name: 'Super Admin', email: 'admin@vcardlink.com', is_active: true, is_verified: true,
      }))
      window.location.reload()
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
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