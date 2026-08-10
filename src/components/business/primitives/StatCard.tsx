interface StatCardProps {
    label: string
    value: string
    change?: string
    trend?: 'up' | 'down' | 'flat'
    icon: string
    accent?: 'orange' | 'blue' | 'green' | 'purple' | 'red'
}

const ACCENTS: Record<string, { bg: string; icon: string }> = {
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-600 dark:text-orange-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400' },
}

const TREND_STYLES: Record<string, string> = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    flat: 'text-gray-500 dark:text-gray-400',
}

export default function StatCard({ label, value, change, trend = 'flat', icon, accent = 'orange' }: StatCardProps) {
    const a = ACCENTS[accent] || ACCENTS.orange
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${a.bg} flex items-center justify-center`}>
                    <svg className={`w-5 h-5 ${a.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                    </svg>
                </div>
                {change && (
                    <span className={`text-xs font-semibold ${TREND_STYLES[trend]}`}>{change}</span>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}