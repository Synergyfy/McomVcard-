import { Link } from 'react-router-dom'
import type { MockConsumer } from '../../services/mockData'

interface WalletSummaryProps {
    wallet: MockConsumer['wallet']
}

const items = [
    {
        label: 'Cashback',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
    },
    {
        label: 'Rewards',
        icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
    },
    {
        label: 'Vouchers',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
    },
]

export default function WalletSummary({ wallet }: WalletSummaryProps) {
    const values = {
        Cashback: `£${wallet.cashback.toFixed(0)}`,
        Rewards: wallet.points.toString(),
        Vouchers: wallet.vouchers.toString(),
    }

    return (
        <Link
            to="/consumer/wallet"
            className="block bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 active:scale-[0.99] transition-transform"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Wallet</h2>
                <span className="flex items-center gap-1 text-xs font-semibold text-accent-500">
                    View all
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {items.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5 text-center">
                        <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                            </svg>
                        </div>
                        <p className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">{values[item.label as keyof typeof values]}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">{item.label}</p>
                    </div>
                ))}
            </div>
        </Link>
    )
}
