import { useNavigate } from 'react-router-dom'
import BottomSheet from '../../business/primitives/BottomSheet'

interface ConsumerMoreSheetProps {
    open: boolean
    onClose: () => void
}

export default function ConsumerMoreSheet({ open, onClose }: ConsumerMoreSheetProps) {
    const navigate = useNavigate()

    const items = [
        {
            label: 'Notifications',
            icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
            to: '/consumer/notifications',
            color: 'text-accent-500 bg-accent-50 dark:bg-accent-500/10',
        },
        {
            label: 'Membership',
            icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20h2m-2-4h4m0-8h.01M17 8h.01',
            to: '/consumer/membership',
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10',
        },
        {
            label: 'Activity',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            to: '/consumer/activity',
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
        },
        {
            label: 'Friends & Family',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
            to: '/consumer/family',
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10',
        },
        {
            label: 'Settings',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
            to: '/consumer/settings',
            color: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300',
        },
        {
            label: 'Help & Support',
            icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            to: '/consumer/help',
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10',
        },
    ]

    const handleNavigate = (to: string) => {
        onClose()
        navigate(to)
    }

    const handleLogout = () => {
        onClose()
        navigate('/')
    }

    return (
        <BottomSheet open={open} onClose={onClose} title="More">
            <div className="space-y-1">
                {items.map((item) => (
                    <button
                        key={item.to}
                        onClick={() => handleNavigate(item.to)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                            </svg>
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                    </button>
                ))}

                <div className="border-t border-gray-100 dark:border-gray-800 my-2" />

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Logout</span>
                </button>
            </div>
        </BottomSheet>
    )
}