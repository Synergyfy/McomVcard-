interface StatusBadgeProps {
    status: string
    label?: string
    className?: string
}

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    verified: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    published: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    completed: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    success: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    available: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    review: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    'needs_update': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    processing: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    suspended: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    inactive: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    failed: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    expired: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    locked: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
    draft: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
    archived: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    inactive_alt: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'coming-soon': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
    future: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

const STATUS_LABELS: Record<string, string> = {
    verified: 'Verified',
    needs_update: 'Needs update',
    'coming-soon': 'Coming soon',
    inactive_alt: 'Inactive',
}

export default function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
    const key = status.toLowerCase()
    const style = STATUS_STYLES[key] || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
    const text = label || STATUS_LABELS[key] || status
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style} ${className}`}>
            {text}
        </span>
    )
}
