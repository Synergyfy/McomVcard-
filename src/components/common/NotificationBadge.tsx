interface NotificationBadgeProps {
    count: number
    dot?: boolean
    className?: string
}

export default function NotificationBadge({ count, dot = false, className = '' }: NotificationBadgeProps) {
    if (!dot && count <= 0) return null
    return (
        <span className={`relative inline-flex shrink-0 ${className}`}>
            {dot ? (
                <span className="w-2 h-2 rounded-full bg-red-500" aria-label={`${count} unread`} />
            ) : (
                <span
                    className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center"
                    aria-label={`${count} unread`}
                >
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </span>
    )
}
