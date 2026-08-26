interface ComingSoonStateProps {
    title: string
    description: string
    badge?: string
    icon?: 'card' | 'store' | 'heart' | 'sparkles' | 'clipboard' | 'map' | 'image' | 'spark' | 'gift' | 'default'
    className?: string
}

const ICONS: Record<NonNullable<ComingSoonStateProps['icon']>, string> = {
    card: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    store: 'M3 7l1.5-3h15L21 7M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7h18M7 10v4m5-4v4m5-4v4',
    heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    sparkles: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    map: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    spark: 'M13 10V3L4 14h7v7l9-11h-7z',
    gift: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm5 3h6a1 1 0 011 1v2a1 1 0 01-1 1h-1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6H5a1 1 0 01-1-1V9a1 1 0 011-1h6',
    default: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
}

export default function ComingSoonState({
    title,
    description,
    badge = 'Coming soon',
    icon = 'default',
    className = '',
}: ComingSoonStateProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 shadow-sm p-8 text-left relative overflow-hidden ${className}`}>
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                {badge}
            </span>
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ICONS[icon]} />
                </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
    )
}