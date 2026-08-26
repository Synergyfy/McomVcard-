import { Link } from 'react-router-dom'
import type { MockConsumer } from '../../../services/mockData'

interface WalletSummaryProps {
    profile: MockConsumer
}

export default function WalletSummary({ profile }: WalletSummaryProps) {
    const { cashback, points, vouchers } = profile.wallet

    return (
        <Link to="/c/wallet" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Wallet</h2>
                    <span className="text-xs text-accent-500 font-medium">View all →</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">£{cashback.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Cashback</p>
                    </div>
                    <div className="text-center border-x border-gray-100 dark:border-gray-700">
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{points}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Rewards</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{vouchers}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Active Vouchers</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}