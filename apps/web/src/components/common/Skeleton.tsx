interface SkeletonProps {
    className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return <div className={`animate-shimmer rounded-xl ${className}`} aria-hidden="true" />
}

export function SkeletonBlock({ rows = 3, className = '' }: { rows?: number; className?: string }) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 ${className}`}>
            <Skeleton className="h-4 w-1/3 mb-4" />
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-2/3" />
                            <Skeleton className="h-2.5 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function SkeletonRow({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 ${className}`}>
            <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-2.5 w-1/2" />
            </div>
        </div>
    )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className={i === lines - 1 ? 'h-3 w-1/3' : 'h-3 w-full'} />
            ))}
        </div>
    )
}

export function SkeletonCircle({ className = '' }: { className?: string }) {
    return <Skeleton className={`rounded-full ${className || 'w-12 h-12'}`} />
}
