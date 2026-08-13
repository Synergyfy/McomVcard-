import type { ReactNode } from 'react'

interface EmptyStateProps {
    title: string
    message: string
    icon?: ReactNode
    action?: ReactNode
    className?: string
}

const defaultIcon = (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
)

export default function EmptyState({ title, message, icon = defaultIcon, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-10 text-center ${className}`}>
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3 text-gray-400 dark:text-gray-500">
                {icon}
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{message}</p>
            {action}
        </div>
    )
}