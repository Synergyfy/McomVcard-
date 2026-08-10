import { Link } from 'react-router-dom'
import type { MockConsumer } from '../../services/mockData'

interface ActivityTimelineProps {
    activity: MockConsumer['recentActivity']
    limit?: number
    showHeader?: boolean
    showSeeAll?: boolean
}

const activityIcons: Record<string, string> = {
    reward: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    earn: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    referral: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    card: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    nfc: 'M8 7v8a2 2 0 002 2h4m0-10V7a2 2 0 00-2-2H8a2 2 0 00-2 2v10a2 2 0 002 2h4a2 2 0 002-2v-3',
    milestone: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    booking: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
    exchange: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    profile: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    vcard: 'M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm4 6h4m-4 4h8m2-6h.01',
    wallet: 'M21 12a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6zm-6 3h.01M3 18V6a2 2 0 012-2h12a2 2 0 012 2',
    funding: 'M12 4v16m8-8H4',
    family: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    membership: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    campaign: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7z',
}

const iconColors: Record<string, string> = {
    reward: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    earn: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    referral: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    card: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    nfc: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    milestone: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    booking: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    alert: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    exchange: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    profile: 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    vcard: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    wallet: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
    funding: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    family: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    membership: 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400',
    campaign: 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400',
}

const statusColors: Record<string, string> = {
    completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    active: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    failed: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    default: 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
}

function groupLabel(time: string): 'Today' | 'Yesterday' | 'Earlier' {
    const t = time.toLowerCase()
    if (t.includes('min') || t.includes('hour') || t.includes('now')) return 'Today'
    if (t.includes('yesterday') || t.includes('1 day')) return 'Yesterday'
    return 'Earlier'
}

export default function ActivityTimeline({ activity, limit = 8, showHeader = true, showSeeAll = false }: ActivityTimelineProps) {
    const grouped = activity.slice(0, limit).reduce<Record<'Today' | 'Yesterday' | 'Earlier', typeof activity>>(
        (acc, item) => {
            acc[groupLabel(item.time)].push(item)
            return acc
        },
        { Today: [], Yesterday: [], Earlier: [] }
    )

    const order: Array<'Today' | 'Yesterday' | 'Earlier'> = ['Today', 'Yesterday', 'Earlier']

    return (
        <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            {showHeader && (
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                    {showSeeAll && (
                        <Link to="/consumer/activity" className="flex items-center gap-1 text-xs font-semibold text-accent-500">
                            See all
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    )}
                </div>
            )}

            <div>
                {order.map((group) => {
                    const items = grouped[group]
                    if (items.length === 0) return null
                    return (
                        <div key={group}>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 mt-5 first:mt-0">{group}</p>
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {items.map((a, i) => {
                                    const c = iconColors[a.type] || iconColors.profile
                                    const statusC = a.status ? statusColors[a.status.toLowerCase()] || statusColors.default : null
                                    return (
                                        <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                            <div className={`w-9 h-9 rounded-full ${c} flex items-center justify-center shrink-0`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={activityIcons[a.type] || activityIcons.profile} />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">{a.action}</p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                                                    <p className="text-[11px] text-gray-400">{a.time}</p>
                                                    {a.value && <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">{a.value}</span>}
                                                    {statusC && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusC}`}>{a.status}</span>}
                                                </div>
                                            </div>
                                            {a.detailTo && (
                                                <Link to={a.detailTo} aria-label="View details" className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-accent-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
