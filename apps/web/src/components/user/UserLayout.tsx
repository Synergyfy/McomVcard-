import { Outlet } from 'react-router-dom'
import UserSidebar from './UserSidebar'
import UserHeader from './UserHeader'
import UserBottomNav from './UserBottomNav'

export default function UserLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <UserHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
        <UserBottomNav />
      </div>
    </div>
  )
}
