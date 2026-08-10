import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'
import type { ConsumerNotification } from '../../services/mockData'

type FilterKey = 'all' | 'unread' | 'read'

const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'read', label: 'Read' },
]

const CATEGORY_LABELS: Record<ConsumerNotification['type'], string> = {
    cashback: 'Cashback',
    reward: 'Reward',
    offer: 'Offer',
    voucher: 'Voucher',
    family: 'Family',
}

export default function ConsumerNotificationsPage() {
    const [notifications, setNotifications] = useState<ConsumerNotification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterKey>('all')

    const loadNotifications = useCallback(() => {
        setLoading(true)
        setError(null)
        consumerService
            .getNotifications()
            .then(setNotifications)
            .catch(() => setError("We couldn't load your notifications. Please try again."))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        loadNotifications()
    }, [loadNotifications])

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const markRead = (id: number) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    }

    const markUnread = (id: number) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
    }

    const dismiss = (id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    const unread = notifications.filter((n) => !n.read).length

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    if (error) {
        return (
            <div className="space-y-4 pb-2">
                <Helmet><title>Notifications - Consumer - MCOM VCard</title></Helmet>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{unread > 0 ? `${unread} unread` : 'You are all caught up'}</p>
                    </div>
                </div>
                <div className="lg:max-w-2xl">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                        <button
                            onClick={loadNotifications}
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-500 text-white px-4 py-2 text-xs font-semibold"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const filtered = notifications.filter((n) => (filter === 'all' ? true : filter === 'unread' ? !n.read : n.read))

    return (
        <div className="space-y-4 pb-2">
            <Helmet><title>Notifications - Consumer - MCOM VCard</title></Helmet>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{unread > 0 ? `${unread} unread` : 'You are all caught up'}</p>
                </div>
                {unread > 0 && (
                    <button
                        onClick={markAllRead}
                        className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 py-1 lg:flex-wrap lg:overflow-visible lg:-mx-0 lg:px-0">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`shrink-0 lg:shrink px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                            filter === f.key
                                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/25'
                                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="space-y-3 lg:max-w-2xl">
                {filtered.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            {filter === 'all' ? 'No Notifications Yet' : filter === 'unread' ? 'No Unread Notifications' : 'No Read Notifications'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-[260px] mx-auto">
                            {filter === 'all'
                                ? 'Updates about your rewards, cashback, offers and family cards will show up here.'
                                : 'Try a different filter to see your other notifications.'}
                        </p>
                    </div>
                ) : (
                    filtered.map((n) => (
                        <div
                            key={n.id}
                            className={`w-full text-left flex items-start gap-4 p-4 rounded-3xl border transition-colors ${
                                n.read
                                    ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-70'
                                    : 'bg-white dark:bg-gray-900 border-accent-200 dark:border-accent-500/30 shadow-sm'
                            }`}
                        >
                            <div className="relative shrink-0">
                                <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${n.color}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={n.icon} />
                                    </svg>
                                </span>
                                {!n.read && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-500 ring-2 ring-white dark:ring-gray-900" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</p>
                                    <span className="text-[11px] text-gray-400 shrink-0">{n.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{n.message}</p>
                                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-semibold uppercase tracking-wide">
                                        {CATEGORY_LABELS[n.type] || n.type}
                                    </span>
                                    {n.action && (
                                        <Link
                                            to={n.action.to}
                                            onClick={() => markRead(n.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-300 text-[11px] font-semibold hover:bg-accent-100 dark:hover:bg-accent-500/20 transition-colors"
                                        >
                                            {n.action.label}
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 shrink-0">
                                {!n.read ? (
                                    <button
                                        onClick={() => markRead(n.id)}
                                        aria-label="Mark as read"
                                        title="Mark as read"
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => markUnread(n.id)}
                                        aria-label="Mark as unread"
                                        title="Mark as unread"
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-500/10 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 18h18" />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={() => dismiss(n.id)}
                                    aria-label="Dismiss"
                                    title="Dismiss"
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
