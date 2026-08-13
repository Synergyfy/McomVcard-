import { Outlet } from 'react-router-dom'
import BusinessSidebar from './BusinessSidebar'
import BusinessTopBar from './BusinessTopBar'
import BusinessBottomNav from './BusinessBottomNav'

export default function BusinessLayout() {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <BusinessSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <BusinessTopBar />
                <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
            <BusinessBottomNav />
        </div>
    )
}