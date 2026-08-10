import { Link } from 'react-router-dom'

interface UserMoreSheetProps {
    open: boolean
    onClose: () => void
}

interface SheetGroup {
    label: string
    items: { to: string; label: string; icon: string }[]
}

const groups: SheetGroup[] = [
    {
        label: 'Account',
        items: [
            { to: '/user/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { to: '/user/subscription', label: 'Membership', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { to: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { to: '/user/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
        ],
    },
]

export default function UserMoreSheet({ open, onClose }: UserMoreSheetProps) {
    if (!open) return null

    return (
        <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <button
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
                aria-label="Close menu"
            />
            {/* Sheet */}
            <div className="absolute bottom-0 inset-x-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl pb-safe animate-slideDown max-h-[85vh] overflow-y-auto">
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">More</h2>
                </div>
                {groups.map((group) => (
                    <div key={group.label} className="px-2 pt-1">
                        <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{group.label}</p>
                        {group.items.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className="flex items-center gap-4 px-3 py-3.5 min-h-[48px] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                ))}
                <div className="p-2 pt-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 min-h-[48px] rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
