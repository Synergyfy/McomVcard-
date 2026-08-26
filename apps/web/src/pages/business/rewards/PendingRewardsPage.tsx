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

export default function PendingRewardsPage() {
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

    // Pending = EARN transactions not yet redeemed/expired (shown as available balance)
    const pendingEarns = transactions.filter((t) => t.type === 'EARN')

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Pending Rewards - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Rewards</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Earned points awaiting redemption by your customers.</p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
            ) : (
                <>
                    {/* Balance card */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-md">
                        <p className="text-xs font-semibold opacity-80">Current Balance</p>
                        <p className="text-3xl font-bold mt-1">{balance?.balance ?? 0}</p>
                        <p className="text-xs opacity-70 mt-1">{pendingEarns.length} earn transactions · status: {balance?.status ?? 'N/A'}</p>
                    </div>

                    {pendingEarns.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No pending rewards right now.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                            {pendingEarns.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{tx.description ?? 'Points earned'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Balance after: {tx.balance_after} · {fmtDate(tx.created_at)}</p>
                                    </div>
                                    <span className="shrink-0 text-sm font-bold text-orange-600">+{tx.amount}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-400">
                        Earned points stay on the balance until the customer redeems or they expire.
                    </p>
                </>
            )}
        </div>
    )
}
