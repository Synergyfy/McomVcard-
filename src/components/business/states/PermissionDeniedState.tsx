import { Link } from 'react-router-dom'

interface PermissionDeniedStateProps {
    featureName: string
    message?: string
    className?: string
}

export default function PermissionDeniedState({
    featureName,
    message = 'This feature is not available for your current plan, sector or business type. It is controlled by your Admin dashboard.',
    className = '',
}: PermissionDeniedStateProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-10 text-center ${className}`}>
            <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{featureName} unavailable</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">{message}</p>
            <Link
                to="/b/help"
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
                Contact Support
            </Link>
        </div>
    )
}