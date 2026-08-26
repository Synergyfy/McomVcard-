import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import BusinessSidebar from './BusinessSidebar'
import BusinessTopBar from './BusinessTopBar'
import BusinessBottomNav from './BusinessBottomNav'
import { useAuth } from '../../../contexts/AuthContext'

export default function BusinessLayout() {
    const { isAuthenticated, isLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login', { replace: true })
        }
    }, [isAuthenticated, isLoading, navigate])

    if (isLoading) return null
    if (!isAuthenticated) return null

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