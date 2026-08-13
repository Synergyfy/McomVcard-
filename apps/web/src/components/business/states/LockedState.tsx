import { Link } from 'react-router-dom'

interface LockedStateProps {
    featureName: string
    planLevel: string
    message?: string
    className?: string
}

export default function LockedState({
    featureName,
    planLevel,
    message = 'This template is not included in your current membership. Upgrade through MCOM Solutions to unlock it.',
    className = '',
}: LockedStateProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-10 text-center ${className}`}>
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{featureName} is locked</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Available from a higher membership tier
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 max-w-sm mx-auto">{message}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <Link
                    to="/b/membership"
                    className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] w-full sm:w-auto bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                    View Membership
                </Link>
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    Current plan: {planLevel}
                </span>
            </div>
        </div>
    )
}