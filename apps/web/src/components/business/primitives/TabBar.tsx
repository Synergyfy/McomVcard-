import type { DetailTabKey } from '../../../types/business'

export interface TabDef {
    key: DetailTabKey
    label: string
    icon: string
}

interface TabBarProps {
    tabs: TabDef[]
    active: string
    onChange: (key: string) => void
    className?: string
}

export default function TabBar({ tabs, active, onChange, className = '' }: TabBarProps) {
    return (
        <div className={`sticky top-16 z-20 bg-gray-50 dark:bg-gray-950 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 border-b border-gray-200 dark:border-gray-800 ${className}`}>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
                {tabs.map((tab) => {
                    const isActive = active === tab.key
                    return (
                        <button
                            key={tab.key}
                            onClick={() => onChange(tab.key)}
                            className={`flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${isActive
                                    ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm border border-gray-200 dark:border-gray-700'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                            </svg>
                            {tab.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}