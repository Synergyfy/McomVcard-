import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'
import type { MockConsumer, NearbyOffer } from '../../services/mockData'
import { Link } from 'react-router-dom'
import ConsumerVCard from '../../components/consumer/ConsumerVCard'
import VCardSection from '../../components/consumer/home/VCardSection'
import WalletSummary from '../../components/consumer/WalletSummary'
import FamilyPreview from '../../components/consumer/FamilyPreview'
import ActivityTimeline from '../../components/consumer/ActivityTimeline'
import NearbyOffers from '../../components/consumer/NearbyOffers'

function getGreeting(): string {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
}

const statItems = [
    { key: 'cards' as const, label: 'Cards', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
    { key: 'rewards' as const, label: 'Rewards', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' },
    { key: 'referrals' as const, label: 'Referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
    { key: 'scans' as const, label: 'Scans', icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 8a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17h3.839a.75.75 0 00.53-.919c-.083-.322-.173-.657-.263-1.003m0 0a15.976 15.976 0 00-2.595-6.625', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400' },
]

export default function ConsumerHomePage() {
    const [profile, setProfile] = useState<MockConsumer | null>(null)
const [rewardHistory, setRewardHistory] = useState<{reward:string,points:number,date:string,status:string}[]>([])
    const [offers, setOffers] = useState<NearbyOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const loadDashboard = useCallback(() => {
        setLoading(true)
        setError(false)
        Promise.all([consumerService.getProfile(), consumerService.getNearbyOffers()])
            .then(([p, o]) => {
                setProfile(p)
                setOffers(o)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        loadDashboard()
    }, [loadDashboard])

    useEffect(() => {
        consumerService.getRewardHistory()
            .then(setRewardHistory)
            .catch(() => setRewardHistory([]))
    }, [])

    // Exchange items fetch removed – not needed for dashboard

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    if (error || !profile) {
        return (
            <div className="rounded-3xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-10 text-center">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">We couldn't load your dashboard</p>
                <p className="text-xs text-red-400 dark:text-red-500 mt-1">Check your connection and try again.</p>
                <button
                    onClick={loadDashboard}
                    className="mt-5 inline-flex items-center justify-center px-6 h-11 rounded-2xl bg-accent-500 text-white text-sm font-bold active:scale-[0.98] transition-transform"
                >
                    Try again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4 pb-2 lg:space-y-6">
            <Helmet><title>My MCOMVCard - MCOM VCard</title></Helmet>

            {/* Page header */}
            <div className="pt-1 lg:flex lg:items-end lg:justify-between">
                <div>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400">{getGreeting()},</p>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{profile.name.split(' ')[0]}</h1>
                    <p className="text-xs text-accent-500 font-semibold mt-0.5">Your {profile.membership} Card</p>
                </div>
                <div className="hidden lg:block text-right text-xs text-gray-400 dark:text-gray-600">
                    <p>Member since {profile.joined}</p>
                    <p className="mt-0.5">{profile.primaryIssuingBusiness}</p>
                </div>
            </div>

            {/* Desktop stat strip */}
            <div className="hidden lg:grid grid-cols-4 gap-4">
                {statItems.map((s) => (
                    <div key={s.key} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex items-center gap-3">
                        <span className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                            </svg>
                        </span>
                        <div>
                            <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">{profile.stats[s.key]}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dashboard grid */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-5 lg:items-start">
                <div className="space-y-4 lg:space-y-5 lg:col-span-2">
                    <ConsumerVCard profile={profile} />
                    <VCardSection />
                    <WalletSummary wallet={profile.wallet} />
                    <div className="mt-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Membership Overview</h3>
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="px-3 py-1 rounded-full bg-orange-200/25 text-orange-50 border border-orange-200/20 whitespace-nowrap">{profile.membership}</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{profile.membershipStatus}</span>
                                </div>
                                <Link to="/c/membership" className="text-xs font-semibold text-accent-500 hover:underline shrink-0">View Details</Link>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3">
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Cards used</p>
                                    <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">
                                        {profile.allocatedAdditionalCards} <span className="text-sm font-semibold text-gray-400">of {profile.additionalEntitlements}</span>
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3">
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Remaining</p>
                                    <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">
                                        {Math.max(profile.additionalEntitlements - profile.allocatedAdditionalCards, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ActivityTimeline activity={profile.recentActivity} limit={6} showSeeAll />
                </div>
                <div className="space-y-4 lg:space-y-5">
                    <div className="mt-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Rewards Summary</h3>
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">Points: {profile.wallet.points}</span>
                                <span className="text-sm font-medium">Available Rewards: {rewardHistory.filter(r => r.status === 'available').length}</span>
                            </div>
                            <Link to="/c/rewards" className="text-xs font-semibold text-accent-500 hover:underline">View Rewards</Link>
                        </div>
                    </div>
                    <FamilyPreview profile={profile} />
                    <div className="mt-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Your E‑Card</h3>
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex items-center justify-between">
                            {profile?.eCardStatus === 'Available' ? (
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">{profile?.eCardFaceValue}</span>
                                    <span className="text-sm text-gray-500">valid till {profile?.eCardExpiryDate}</span>
                                    <span className="text-[11px] text-gray-400">· {profile?.eCardSource || 'MCOMVCard'}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-500">No e‑card available</span>
                            )}
                            <Link to="/c/cards" className="text-xs font-semibold text-accent-500 hover:underline">View Cards</Link>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Current Campaigns</h3>
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">No campaigns available at this time</span>
                        </div>
                    </div>
                    <NearbyOffers offers={offers} />
                </div>
            </div>
        </div>
    )
}
