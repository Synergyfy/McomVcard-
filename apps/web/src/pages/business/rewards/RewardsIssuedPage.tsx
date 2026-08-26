import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { businessService, type RewardTransaction, type RewardBalance } from '../../../services/businessApi'

function fmtDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
        return iso
    }
}

export default function RewardsIssuedPage() {
    const [balance, setBalance] = useState<RewardBalance | null>(null)
    const [transactions, setTransactions] = useState<RewardTransaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const [b, txs] = await Promise.all([
                    businessService.getRewardBalance(),
                    businessService.getRewardTransactions(),
                ])
                if (!cancelled) {
                    setBalance(b)
                    setTransactions(txs)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const earns = transactions.filter((t) => t.type === 'EARN')
    const adjusts = transactions.filter((t) => t.type === 'ADJUST')
    const totals = {
        issued: earns.length + adjusts.length,
        totalEarned: earns.reduce((s, t) => s + t.amount, 0),
        totalAdjusted: adjusts.reduce((s, t) => s + t.amount, 0),
        currentBalance: balance?.balance ?? 0,
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Rewards Issued - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards Issued</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Points and adjustments your business has given out.</p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
            ) : (
                <>
                    <div className="grid grid-cols-4 gap-3">
                        <IssueStat label="Issued" value={String(totals.issued)} />
                        <IssueStat label="Points Given" value={String(totals.totalEarned)} className="text-emerald-600" />
                        <IssueStat label="Adjusted" value={String(totals.totalAdjusted)} className="text-amber-600" />
                        <IssueStat label="Balance" value={String(totals.currentBalance)} className="text-orange-600" />
                    </div>

                    {transactions.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No rewards issued yet.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{tx.description ?? `Reward ${tx.type}`}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Balance after: {tx.balance_after} · {fmtDate(tx.created_at)}</p>
                                    </div>
                                    <span className={`shrink-0 text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-400">
                        Rewards are tracked on your business reward balance ledger. Points issued via Issue Reward appear here.
                    </p>
                </>
            )}
        </div>
    )
}

function IssueStat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-3 text-center">
            <p className={`text-lg font-bold text-gray-900 dark:text-white ${className}`}>{value}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}
