interface ErrorStateProps {
    title?: string
    message?: string
    onRetry?: () => void
    compact?: boolean
}

/** Human-readable error state with an optional retry action. */
export default function ErrorState({ title = "We couldn't load this", message = 'Please try again in a moment.', onRetry, compact }: ErrorStateProps) {
    return (
        <div className={`rounded-3xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-8 text-center ${compact ? 'lg:max-w-2xl' : ''}`}>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
            </div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">{title}</p>
            <p className="text-xs text-red-400 dark:text-red-500 mt-1">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-5 inline-flex items-center justify-center px-6 h-11 rounded-2xl bg-accent-500 text-white text-sm font-bold active:scale-[0.98] transition-transform"
                >
                    Try again
                </button>
            )}
        </div>
    )
}
