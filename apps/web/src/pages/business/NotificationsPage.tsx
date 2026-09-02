import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../../services/api'

/* ── Types ─────────────────────────────────────────────────────────── */

interface NotificationResponse {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string | null
}

type Tone = 'warning' | 'info' | 'success'
type Category =
  | 'Membership' | 'Rewards' | 'Customers' | 'Appointments'
  | 'Campaigns' | 'Cards' | 'VCard' | 'Smart Money' | 'System'

interface NotificationItem {
  id: string
  title: string
  description: string
  category: Category
  tone: Tone
  actionLabel?: string
  actionTo?: string
  time: string
  read: boolean
}

const ALL_CATEGORIES: readonly Category[] = [
  'Membership', 'Rewards', 'Customers', 'Appointments',
  'Campaigns', 'Cards', 'VCard', 'Smart Money', 'System',
]

/* ── Relative time ─────────────────────────────────────────────────── */

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(isoDate).toLocaleDateString()
}

/* ── API → UI mapping ─────────────────────────────────────────────── */

function mapTypeToTone(type: string): Tone {
  const l = type.toLowerCase()
  if (l.includes('warning') || l.includes('alert') || l.includes('expir') || l.includes('error')) return 'warning'
  if (l.includes('success') || l.includes('complete') || l.includes('reward') || l.includes('sale')) return 'success'
  return 'info'
}

function inferCategory(type: string): Category {
  const l = type.toLowerCase()
  if (l.includes('member') || l.includes('tier')) return 'Membership'
  if (l.includes('reward') || l.includes('points') || l.includes('redeem')) return 'Rewards'
  if (l.includes('customer') || l.includes('voucher')) return 'Customers'
  if (l.includes('appoint') || l.includes('booking')) return 'Appointments'
  if (l.includes('campaign') || l.includes('promo')) return 'Campaigns'
  if (l.includes('card') || l.includes('gift')) return 'Cards'
  if (l.includes('vcard') || l.includes('qr') || l.includes('scan') || l.includes('view')) return 'VCard'
  if (l.includes('wallet') || l.includes('cashback') || l.includes('smart')) return 'Smart Money'
  return 'System'
}

function mapNotification(n: NotificationResponse): NotificationItem {
  const data = n.data ?? {}
  const category = (data.category as Category) ?? inferCategory(n.type)
  return {
    id: n.id,
    title: n.title,
    description: n.message ?? '',
    category,
    tone: mapTypeToTone(n.type),
    actionTo: data.action_to as string | undefined,
    actionLabel: data.action_label as string | undefined,
    time: formatRelativeTime(n.created_at ?? new Date().toISOString()),
    read: n.read_at !== null,
  }
}

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

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [category, setCategory] = useState<'All' | Category>('All')

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get<NotificationResponse[]>('/notifications')
            setNotifications(res.data.map(mapNotification))
            setError(null)
        } catch (err) {
            setError('Failed to load notifications')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchNotifications() }, [fetchNotifications])

    const markRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
        try {
            await api.patch(`/notifications/${id}`, { read: true })
        } catch {
            // Revert on failure
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: false } : n)
            )
        }
    }, [])

    const markAllRead = useCallback(async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        try {
            await api.patch('/notifications/mark-all-read')
        } catch {
            fetchNotifications()
        }
    }, [fetchNotifications])

    const visible = notifications.filter(n => category === 'All' || n.category === category)
    const unread = notifications.filter(n => !n.read).length

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
                <button
                    key="All"
                    onClick={() => setCategory('All')}
                    className={`shrink-0 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold transition-colors ${
                        category === 'All'
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                >
                    All
                </button>
                {ALL_CATEGORIES.map((c) => (
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

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {error && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                    <button
                        onClick={fetchNotifications}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 text-white"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-3">
                    {visible.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => !n.read && markRead(n.id)}
                            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-sm transition-colors cursor-pointer ${toneStyles[n.tone].card} ${n.read ? 'opacity-60' : ''}`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${toneStyles[n.tone].icon}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={toneStyles[n.tone].svg} />
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
                    ))}
                    {visible.length === 0 && (
                        <div className="px-4 py-8 text-center text-xs text-gray-400">
                            {notifications.length === 0 ? 'No notifications yet.' : 'No notifications in this category.'}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
