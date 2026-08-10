import { Navigate, Outlet, useLocation } from 'react-router-dom'
import ConsumerTopBar from './layout/ConsumerTopBar'
import ConsumerBottomNav from './layout/ConsumerBottomNav'
import ConsumerSideNav from './layout/ConsumerSideNav'
import { loadConsumerSetup } from '../../services/consumerSetupStore'

export default function ConsumerLayout() {
    const location = useLocation()
    const setup = loadConsumerSetup()

    // First-time setup guard: an in-progress (but unfinished) consumer setup
    // must be completed before the dashboard is shown.
    if (setup.status === 'in-progress' && setup.completedAt === null && location.pathname !== '/consumer/setup') {
        return <Navigate to="/consumer/setup" replace />
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:bg-white dark:lg:bg-gray-900 lg:border-r lg:border-gray-100 dark:lg:border-gray-800">
                <ConsumerSideNav />
            </aside>

            {/* Main column */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <ConsumerTopBar />
                <main className="pb-24 lg:pb-12 flex-1">
                    <div className="max-w-md mx-auto px-4 pt-4 lg:max-w-5xl lg:px-8 lg:pt-6">
                        <Outlet />
                    </div>
                </main>
            </div>

            <ConsumerBottomNav />
        </div>
    )
}
