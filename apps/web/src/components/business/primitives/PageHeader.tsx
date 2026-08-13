import type { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    subtitle?: string
    actions?: ReactNode
    className?: string
}

export default function PageHeader({ title, subtitle, actions, className = '' }: PageHeaderProps) {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 ${className}`}>
            <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    )
}