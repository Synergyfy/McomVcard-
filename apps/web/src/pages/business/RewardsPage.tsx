import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const actions = [
    { to: '/b/rewards/issue', label: 'Issue Reward', subtitle: 'Give points or perks', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-orange-500 to-orange-600' },
    { to: '/b/rewards/campaigns', label: 'Campaigns', subtitle: 'Referral, seasonal & more', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z', color: 'from-blue-500 to-blue-600' },
    { to: '/b/rewards/coupons', label: 'Coupons', subtitle: 'Discount codes', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z', color: 'from-purple-500 to-purple-600' },
    { to: '/b/rewards/cashback', label: 'Cashback', subtitle: 'Give money back', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: 'from-emerald-500 to-emerald-600' },
    { to: '/b/rewards/gift-cards', label: 'Gift Cards', subtitle: 'Pre-loaded value', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm5 3h6a1 1 0 011 1v2a1 1 0 01-1 1h-1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6H5a1 1 0 01-1-1V9a1 1 0 011-1h6', color: 'from-rose-500 to-rose-600' },
    { to: '/b/rewards/history', label: 'Redeem History', subtitle: 'See everything redeemed', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-cyan-500 to-cyan-600' },
    { to: '/b/rewards/issued', label: 'Rewards Issued', subtitle: 'See what you gave out', icon: 'M5 13l4 4L19 7', color: 'from-violet-500 to-violet-600' },
    { to: '/b/rewards/pending', label: 'Pending Rewards', subtitle: 'Awaiting redemption', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-amber-500 to-amber-600' },
]

export default function BusinessRewardsPage() {
    const navigate = useNavigate()

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Rewards - Business Dashboard - MCOMVCard</title></Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Reward your customers your way. Everything is card based and ready to go.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {actions.map((a) => (
                    <button
                        key={a.to}
                        onClick={() => navigate(a.to)}
                        className="group text-left bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-all min-h-[130px] flex flex-col justify-between"
                    >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} />
                            </svg>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{a.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.subtitle}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Connected MCOM Rewards */}
            <button
                onClick={() => navigate('/b/integrations')}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex items-center gap-4"
            >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm5 3h6a1 1 0 011 1v2a1 1 0 01-1 1h-1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6H5a1 1 0 01-1-1V9a1 1 0 011-1h6" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">MCOM Rewards</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Connect your MCOM Rewards account for advanced loyalty features.</p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                    Coming soon
                </span>
            </button>
        </div>
    )
}
