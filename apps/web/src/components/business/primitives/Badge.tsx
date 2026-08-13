import type { TemplateStatus } from '../../../types/business'

interface BadgeProps {
    status: TemplateStatus | 'active' | 'pending' | 'suspended' | 'verified' | 'coming-soon' | 'future'
    label?: string
    className?: string
}

const STYLES: Record<string, string> = {
    active: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    verified: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    needs_update: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    locked: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    suspended: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'coming-soon': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    future: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const LABELS: Record<string, string> = {
    active: 'Active',
    verified: 'Verified',
    needs_update: 'Needs update',
    pending: 'Pending',
    locked: 'Locked',
    suspended: 'Suspended',
    'coming-soon': 'Coming soon',
    future: 'Future',
}

export default function Badge({ status, label, className = '' }: BadgeProps) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[status] || STYLES.active} ${className}`}>
            {label || LABELS[status] || status}
        </span>
    )
}