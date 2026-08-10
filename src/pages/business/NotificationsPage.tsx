import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockNotifications } from '../../services/businessDashboardStore'

const toneStyles = {
    warning: {
        card: 'bg-amber-50/80 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/40',
        icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
        svg: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.024-.833-2.732 0L4.354 16.5c-.77.833.192 2.5 1.732 2.5z',
    },
    success: {
        card: 'bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/40',
        icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
        svg: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    info: {
        card: 'bg-blue-50/80 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/40',
        icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
        svg: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
}

const categories = ['Membership', 'Rewards', 'Customers', 'Appointments', 'Campaigns', 'Cards', 'VCard', 'Smart Money', 'System'] as const

export default function NotificationsPage() {
    const [read, setRead] = useState<Set<number>>(new Set())
    const [category, setCategory] = useState<'All' | typeof categories[number]>('All')

    const markAllRead = () => setRead(new Set(mockNotifications.map(n => n.id)))
    const markRead = (id: number) => setRead(prev => new Set(prev).add(id))

    const visible = mockNotifications.filter(n => category === 'All' || n.category === category)
    const unread = mockNotifications.filter(n => !read.has(n.id)).length

    return (
        <div className="space-y-6 animate-fadeIn max-w-lg">
            <Helmet><title>Notifications - Business Dashboard - MCOMVCard</title></Helmet>

            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {unread > 0 ? `${unread} unread` : 'You are all caught up'}
                    </p>
                </div>
                {unread > 0 && (
                    <button
                        onClick={markAllRead}
                        className="shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {(['All', ...categories] as const).map((c) => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`shrink-0 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold transition-colors ${
                            category === c
                                ? 'bg-orange-600 text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {visible.map((n) => {
                    const tone = toneStyles[n.tone]
                    const isRead = read.has(n.id)
                    return (
                        <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-sm transition-colors ${tone.card} ${isRead ? 'opacity-60' : ''}`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone.icon}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tone.svg} />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                                    <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[9px] font-semibold text-gray-500 dark:text-gray-400">{n.category}</span>
                                    {n.actionLabel && n.actionTo && (
                                        <Link to={n.actionTo} className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                                            {n.actionLabel}
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
                {visible.length === 0 && (
                    <div className="px-4 py-8 text-center text-xs text-gray-400">No notifications in this category.</div>
                )}
            </div>
        </div>
    )
}
