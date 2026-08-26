import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { businessService, type RewardTransaction } from '../../../services/businessApi'

const statusStyles: Record<string, string> = {
    EARN: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    REDEEM: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    EXPIRE: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
    ADJUST: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
}

const typeLabels: Record<string, string> = {
    EARN: 'Earned',
    REDEEM: 'Redeemed',
    EXPIRE: 'Expired',
    ADJUST: 'Adjusted',
}

function fmtDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
        return iso
    }
}

export default function RedeemHistoryPage() {
    const [transactions, setTransactions] = useState<RewardTransaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const txs = await businessService.getRewardTransactions()
                if (!cancelled) setTransactions(txs)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Redeem History - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Every reward transaction on your business ledger.</p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
            ) : transactions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="p-4 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{tx.description ?? typeLabels[tx.type] ?? tx.type}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{typeLabels[tx.type] ?? tx.type} · {fmtDate(tx.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {tx.amount >= 0 ? '+' : ''}{tx.amount}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusStyles[tx.type] ?? 'bg-gray-100 text-gray-500'}`}>
                                    {typeLabels[tx.type] ?? tx.type}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
