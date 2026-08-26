interface LoadingStateProps {
    rows?: number
    className?: string
}

export default function LoadingState({ rows = 4, className = '' }: LoadingStateProps) {
    return (
        <div className={`space-y-3 ${className}`} aria-busy="true" role="status">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl animate-shimmer" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-1/3 rounded animate-shimmer" />
                            <div className="h-2.5 w-2/3 rounded animate-shimmer" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}