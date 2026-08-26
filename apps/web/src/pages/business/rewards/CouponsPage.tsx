import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { businessService, type Campaign } from '../../../services/businessApi'

function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    } catch {
        return '—'
    }
}

export default function CouponsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const data = await businessService.getCampaigns()
                if (!cancelled) setCampaigns(data)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    // Flatten coupons from all campaigns → offers → coupons
    const coupons = campaigns.flatMap((c) =>
        (c.offers ?? []).flatMap((o) =>
            (o.coupons ?? []).map((cpn) => ({
                ...cpn,
                offerTitle: o.title,
                campaignName: c.name,
            }))
        )
    )

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Coupons - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discount codes your customers can redeem.</p>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
            ) : coupons.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No coupons yet. Create a campaign with offers and coupons to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {coupons.map((c) => (
                        <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{c.offerTitle}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Expires {fmtDate(c.expires_at)} · {c.used_count} uses{c.max_uses ? ` / ${c.max_uses}` : ''}</p>
                                    </div>
                                    <StatusPill status={c.status} />
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-200">{c.code}</span>
                                    <span className="text-xs font-semibold text-orange-600">{c.discount_type === 'PERCENT' ? `${c.discount_value}%` : `£${c.discount_value}`}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function StatusPill({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        draft: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
        expired: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
    }
    return <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] ?? styles.draft}`}>{status}</span>
}
