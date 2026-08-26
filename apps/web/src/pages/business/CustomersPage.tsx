import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { businessService, type Customer } from '../../services/businessApi'

/* ── Presentation helpers ────────────────────────────────────────── */

const AVATAR_COLORS = ['bg-orange-500', 'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500', 'bg-indigo-500']

export function avatarColorFor(key: string): string {
    let h = 0
    for (let i = 0; i < key.length; i++) h = ((h * 31) + key.charCodeAt(i)) >>> 0
    return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export function initialsOf(name: string): string {
    const parts = name.split(/\s+/).filter(Boolean).slice(0, 2)
    const init = parts.map(w => w[0]!.toUpperCase()).join('')
    return init || '?'
}

function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
        return '—'
    }
}

export default function BusinessCustomersPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [customers, setCustomers] = useState<Customer[]>([])

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const res = await businessService.getCustomers(200)
                if (!cancelled) setCustomers(res.items)
            } catch {
                if (!cancelled) setCustomers([])
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Customers - Business Dashboard - MCOMVCard</title></Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Everyone engaging with your business — derived from appointments, reviews and card shares. Tap a customer to see their history.
                </p>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Total" value={String(customers.length)} color="text-gray-900 dark:text-white" />
                <MiniStat label="Active" value={String(customers.filter(c => c.status === 'active').length)} color="text-emerald-600" />
                <MiniStat label="New" value={String(customers.filter(c => c.status === 'new').length)} color="text-blue-600" />
            </div>

            {/* Simple list */}
            {!loading && customers.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                    {customers.map((c) => (
                        <button
                            key={c.email}
                            onClick={() => navigate(`/b/customers/${encodeURIComponent(c.email)}`)}
                            className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                        >
                            <div className={`w-11 h-11 rounded-full ${avatarColorFor(c.email)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                {initialsOf(c.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                                    {c.status === 'new' && (
                                        <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">NEW</span>
                                    )}
                                    {c.status === 'at-risk' && (
                                        <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-semibold">AT RISK</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {c.tier ? `${c.tier} member` : 'Standard'} · customer since {fmtDate(c.memberSince)}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <Metric icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" label="Appointments" value={c.totalAppointments} />
                                    <Metric icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" label="Reviews" value={c.totalReviews} />
                                    <Metric icon="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" label="Shares" value={c.totalShares} />
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>
            )}

            {!loading && customers.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600 p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No customers yet</p>
                    <p className="text-xs text-gray-400">Customers appear here automatically as people book appointments, leave reviews or share your cards.</p>
                </div>
            )}

            {loading && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <p className="text-xs text-gray-400">Loading your customers…</p>
                </div>
            )}
        </div>
    )
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}

function Metric({ icon, label, value }: { icon: string; label: string; value: number }) {
    return (
        <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
            <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
            </svg>
            {value} {label.toLowerCase()}
        </span>
    )
}
