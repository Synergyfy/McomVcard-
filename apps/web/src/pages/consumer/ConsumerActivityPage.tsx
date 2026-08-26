import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'
import type { MockConsumer } from '../../services/mockData'
import ActivityTimeline from '../../components/consumer/ActivityTimeline'

type FilterKey = 'all' | 'reward' | 'earn' | 'share' | 'exchange' | 'nfc' | 'vcard' | 'wallet' | 'funding' | 'family' | 'membership' | 'campaign'

const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'vcard', label: 'VCards' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'funding', label: 'Funding' },
    { key: 'share', label: 'Shares' },
    { key: 'exchange', label: 'Exchanges' },
    { key: 'reward', label: 'Rewards' },
    { key: 'earn', label: 'Earned' },
    { key: 'nfc', label: 'Taps' },
    { key: 'family', label: 'Family' },
    { key: 'membership', label: 'Membership' },
    { key: 'campaign', label: 'Campaigns' },
]

function matchesFilter(type: string, filter: FilterKey): boolean {
    if (filter === 'all') return true
    if (filter === 'reward') return type === 'reward' || type === 'milestone'
    if (filter === 'earn') return type === 'earn'
    if (filter === 'share') return type === 'referral'
    if (filter === 'exchange') return type === 'exchange'
    if (filter === 'nfc') return type === 'nfc'
    if (filter === 'vcard') return type === 'vcard'
    if (filter === 'wallet') return type === 'wallet'
    if (filter === 'funding') return type === 'funding'
    if (filter === 'family') return type === 'family'
    if (filter === 'membership') return type === 'membership'
    if (filter === 'campaign') return type === 'campaign'
    return true
}

export default function ConsumerActivityPage() {
    const [profile, setProfile] = useState<MockConsumer | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterKey>('all')

    const loadActivity = useCallback(() => {
        setLoading(true)
        setError(null)
        consumerService
            .getProfile()
            .then(setProfile)
            .catch(() => setError("We couldn't load your activity. Please try again."))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        loadActivity()
    }, [loadActivity])

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    if (error) {
        return (
            <div className="space-y-4 pb-2">
                <Helmet><title>Activity - Consumer - MCOM VCard</title></Helmet>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Activity</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Everything you've done with your card</p>
                </div>
                <div className="lg:max-w-2xl">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                        <button
                            onClick={loadActivity}
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-500 text-white px-4 py-2 text-xs font-semibold"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!profile) return null

    const filtered = profile.recentActivity.filter((a) => matchesFilter(a.type, filter))

    return (
        <div className="space-y-4 pb-2">
            <Helmet><title>Activity - Consumer - MCOM VCard</title></Helmet>

            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Activity</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Everything you've done with your card</p>
            </div>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 py-1 lg:flex-wrap lg:overflow-visible lg:-mx-0 lg:px-0">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`shrink-0 lg:shrink px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                            filter === f.key
                                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/25'
                                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="lg:max-w-2xl">
                {filtered.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No {filter === 'all' ? 'activity' : filters.find((f) => f.key === filter)?.label.toLowerCase()} yet.</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Once you share, redeem, or exchange, it will show up here.</p>
                    </div>
                ) : (
                    <ActivityTimeline activity={filtered} limit={50} showHeader={false} />
                )}
            </div>
        </div>
    )
}
