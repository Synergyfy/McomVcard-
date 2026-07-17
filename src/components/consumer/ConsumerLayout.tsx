import { Outlet } from 'react-router-dom'
import ConsumerSidebar from './ConsumerSidebar'
import ConsumerHeader from './ConsumerHeader'

export default function ConsumerLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <ConsumerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ConsumerHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
