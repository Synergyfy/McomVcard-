import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'
import type { MockConsumer } from '../../services/mockData'
import MembershipProgressionModal, {
    LEVELS,
    TIERS,
    buildLadder,
    parseMembership,
} from '../../components/consumer/MembershipProgressionModal'
import ErrorState from '../../components/common/ErrorState'

function getMembershipGradient(membership: string): string {
    const m = membership.toLowerCase()
    if (m.includes('platinum')) return 'from-slate-600 via-slate-800 to-slate-950'
    if (m.includes('gold')) return 'from-amber-400 via-yellow-500 to-amber-700'
    if (m.includes('silver')) return 'from-slate-300 via-slate-400 to-slate-600'
    return 'from-amber-500 via-orange-600 to-amber-800'
}

const LEVEL_BADGE: Record<string, string> = {
    Bronze: 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-800',
    Silver: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600',
    Gold: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700',
    Platinum: 'bg-gradient-to-br from-slate-600 via-slate-800 to-slate-950',
}

interface FeatureItem {
    text: string
    note: string
}

const LEVEL_FEATURES: Record<string, FeatureItem[]> = {
    Bronze: [
        { text: 'Digital membership cards', note: 'Collect and store cards from any business' },
        { text: 'Points collection', note: 'Earn points on every tap, scan and purchase' },
        { text: 'Friends & Family sharing', note: 'Allocate cards to family and friends' },
        { text: '£2 e-Card face value', note: 'Pre-loaded value on your e-card' },
    ],
    Silver: [
        { text: 'Everything in Bronze', note: 'All Bronze benefits included' },
        { text: 'Higher cashback', note: 'Earn more cashback on eligible spend' },
        { text: 'More Friends & Family cards', note: 'Increased allocation allowance' },
        { text: 'Priority offers', note: 'Early access to member-only deals' },
    ],
    Gold: [
        { text: 'Everything in Silver', note: 'All Silver benefits included' },
        { text: 'Premium cashback', note: 'Top cashback rates on eligible spend' },
        { text: 'Guest passes', note: 'One-off passes for friends to try' },
        { text: 'Early access to campaigns', note: 'Join seasonal campaigns first' },
    ],
    Platinum: [
        { text: 'Everything in Gold', note: 'All Gold benefits included' },
        { text: 'Unlimited e-Card value', note: 'No cap on your e-card' },
        { text: 'VIP support', note: 'Priority help when you need it' },
        { text: 'Preview new MCOM features', note: 'Be first to try new tools' },
    ],
}

function currentSeasonLabel(): { name: string; end: string } {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    if (month >= 8) return { name: `${year} Autumn`, end: `31 Dec ${year}` }
    if (month >= 4) return { name: `${year} Summer`, end: `31 Aug ${year}` }
    return { name: `${year} Spring`, end: `30 Apr ${year}` }
}

export default function ConsumerMembershipPage() {
    const [profile, setProfile] = useState<MockConsumer | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null)

    const loadProfile = () => {
        setLoading(true)
        setError(false)
        consumerService.getProfile()
            .then(setProfile)
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadProfile()
    }, [])

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    if (error || !profile) {
        return (
            <div>
                <Helmet><title>Membership - Consumer - MCOM VCard</title></Helmet>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">My Membership</h1>
                <div className="lg:max-w-2xl">
                    <ErrorState title="We couldn't load your membership" message="Please try again in a moment." onRetry={loadProfile} />
                </div>
            </div>
        )
    }

    if (!profile) return null

    const ladder = buildLadder()
    const { level, tier } = parseMembership(profile.membership)
    const currentIdx = Math.max(0, ladder.indexOf(profile.membership))
    const nextStep = currentIdx < ladder.length - 1 ? ladder[currentIdx + 1] : null
    const levelIdx = Math.max(0, LEVELS.indexOf(level as (typeof LEVELS)[number]))
    const tierIdx = Math.max(0, TIERS.indexOf(tier as (typeof TIERS)[number]))
    const nextLevel = levelIdx < LEVELS.length - 1 ? LEVELS[levelIdx + 1] : null
    const atMax = currentIdx >= ladder.length - 1
    const season = currentSeasonLabel()

    const features = LEVEL_FEATURES[level] || LEVEL_FEATURES.Bronze
    const benefits = [
        { label: 'Family Cards', value: `${profile.allocatedAdditionalCards} of ${profile.additionalEntitlements} used`, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { label: 'Cashback Rewards', value: `£${profile.wallet.cashback.toFixed(2)} earned`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'Points Balance', value: `${profile.wallet.points.toLocaleString()} pts`, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    ]

    return (
        <div className="space-y-4 pb-2">
            <Helmet><title>My Membership - Consumer - MCOM VCard</title></Helmet>

            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Membership</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your membership status, benefits and progression</p>
            </div>

            {/* Current membership hero */}
            <div className={`relative overflow-hidden rounded-[28px] p-6 bg-gradient-to-br ${getMembershipGradient(profile.membership)} shadow-xl shadow-black/20`}>
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
                <div className="absolute -bottom-20 -left-10 w-52 h-52 rounded-full bg-black/10" />
                <div className="relative">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Current Membership</p>
                        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold border border-white/25">
                            {profile.membershipStatus}
                        </span>
                    </div>
                    <p className="text-3xl font-extrabold text-white mt-1">{profile.membership}</p>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-2xl bg-white/10 border border-white/15 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Start date</p>
                            <p className="text-sm font-bold text-white mt-0.5">{profile.joined}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 border border-white/15 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Season</p>
                            <p className="text-sm font-bold text-white mt-0.5">{season.name}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 border border-white/15 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Ends</p>
                            <p className="text-sm font-bold text-white mt-0.5">{season.end}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progression */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Membership Progression</h2>
                    <span className="text-xs font-bold text-accent-600 dark:text-accent-400">
                        {currentIdx + 1} / {ladder.length}
                    </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {atMax
                        ? 'You are at the highest membership level — Platinum Pro+.'
                        : `Next: ${nextStep}${nextLevel ? ` · Next available level: ${nextLevel}` : ''}`}
                </p>

                {/* Ladder */}
                <div className="space-y-2.5">
                    {LEVELS.map((lv, li) => (
                        <div key={lv} className="flex items-center gap-2">
                            <span className={`w-[74px] shrink-0 text-center text-[10px] font-extrabold uppercase tracking-wide text-white py-1.5 rounded-lg ${LEVEL_BADGE[lv]}`}>
                                {lv}
                            </span>
                            <div className="flex flex-1 gap-1.5">
                                {TIERS.map((tr, ti) => {
                                    const combo = `${lv} ${tr}`
                                    const isCurrent = combo === profile.membership
                                    const isNext = combo === nextStep
                                    return (
                                        <span
                                            key={tr}
                                            className={`flex-1 text-center text-[10px] font-bold py-1.5 rounded-lg border transition-colors ${
                                                isCurrent
                                                    ? 'bg-accent-500 text-white border-accent-500 shadow-md shadow-accent-500/25'
                                                    : isNext
                                                        ? 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 border-accent-300 dark:border-accent-700'
                                                        : li < levelIdx || (li === levelIdx && ti < tierIdx)
                                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'
                                                            : 'bg-transparent text-gray-400 dark:text-gray-600 border-gray-100 dark:border-gray-700'
                                            }`}
                                        >
                                            {tr}
                                            {isCurrent && <span className="hidden sm:inline"> ✓</span>}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mt-4">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, ((currentIdx + 1) / ladder.length) * 100)}%` }}
                    />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                    The ultimate goal is progressing to the highest level: <strong className="text-gray-600 dark:text-gray-300">Platinum Pro+</strong>.
                </p>

                {nextStep && (
                    <button
                        onClick={() => setUpgradeTarget(nextStep)}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-300 text-sm font-semibold hover:bg-accent-100 dark:hover:bg-accent-500/20 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        What qualifies me for {nextStep}?
                    </button>
                )}
            </section>

            {/* Benefits */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Your Benefits</h2>
                <div className="space-y-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0">
                    {benefits.map((b) => (
                        <div key={b.label} className="flex items-center gap-4 sm:flex-col sm:items-start sm:p-4 sm:rounded-2xl sm:bg-gray-50 sm:dark:bg-gray-800/60">
                            <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={b.icon} />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{b.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Available features */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Available Features</h2>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${LEVEL_BADGE[level]}`}>{level}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Everything unlocked by your current {profile.membership} membership</p>
                <div className="space-y-3">
                    {features.map((f) => (
                        <div key={f.text} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.text}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">{f.note}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Friends & Family allowance */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Friends &amp; Family Allowance</h2>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {Math.max(0, profile.additionalEntitlements - profile.allocatedAdditionalCards)} remaining
                    </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    You can create {profile.additionalEntitlements} family cards with your {profile.membership} membership
                </p>
                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-4">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, (profile.allocatedAdditionalCards / profile.additionalEntitlements) * 100)}%` }}
                    />
                </div>
                <Link
                    to="/c/family"
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    Manage Friends &amp; Family
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </section>

            {/* Card allowances */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Card Allowances &amp; Entitlements</h2>
                <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3 text-center">
                        <p className="text-lg font-extrabold text-gray-900 dark:text-white">{profile.additionalEntitlements}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">Card entitlement</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3 text-center">
                        <p className="text-lg font-extrabold text-gray-900 dark:text-white">{profile.allocatedAdditionalCards}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">Cards allocated</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3 text-center">
                        <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{Math.max(0, profile.additionalEntitlements - profile.allocatedAdditionalCards)}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">Remaining</p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    {profile.familyAllocations} family and {profile.friendAllocations} friend allocations available on your {profile.membership} membership.
                </p>
            </section>

            {/* Card & VCard access */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Card &amp; VCard Access</h2>
                <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">VCard</p>
                        <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">{profile.vcardStatus}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Your shared business profile</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Card</p>
                        <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">{profile.cardStatus}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{profile.cardTemplate}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">E-Card value</p>
                        <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">{profile.eCardFaceValue}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{profile.eCardStatus}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Connected businesses</p>
                        <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">{profile.businessCount}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{profile.primaryIssuingBusiness}</p>
                    </div>
                </div>
            </section>

            {/* Membership history */}
            {profile.membershipHistory && profile.membershipHistory.length > 0 && (
                <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Membership History</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">How your membership has changed over time</p>
                    <div className="space-y-0">
                        {[...profile.membershipHistory].reverse().map((h, i, arr) => (
                            <div key={h.date + h.state} className="flex items-start gap-3 relative pb-5 last:pb-0">
                                {i < arr.length - 1 && <span className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />}
                                <span className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${i === arr.length - 1 ? 'bg-accent-500 border-accent-500' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'}`}>
                                    <svg className={`w-2.5 h-2.5 ${i === arr.length - 1 ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                                <div className="min-w-0 pt-0.5">
                                    <p className={`text-sm font-bold ${i === arr.length - 1 ? 'text-accent-700 dark:text-accent-300' : 'text-gray-900 dark:text-white'}`}>{h.state}</p>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{h.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">
                        Current membership: <strong className="text-gray-600 dark:text-gray-300">{profile.membership}</strong> · Status: {profile.membershipStatus} · Since {profile.joined}
                    </p>
                </section>
            )}

            {/* Available upgrades */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Available Upgrades</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Ways to progress your membership</p>

                <div className="space-y-2.5">
                    {!atMax && nextStep && (
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-accent-200 dark:border-accent-800/40 bg-accent-50/50 dark:bg-accent-500/5">
                            <div className="w-10 h-10 rounded-xl bg-accent-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-accent-500/25">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{nextStep}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Tier upgrade within {level}</p>
                            </div>
                            <button
                                onClick={() => setUpgradeTarget(nextStep)}
                                className="px-3 py-1.5 rounded-lg bg-accent-500 text-white text-[11px] font-semibold hover:bg-accent-600 shrink-0"
                            >
                                View
                            </button>
                        </div>
                    )}
                    {nextLevel && (
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className={`w-10 h-10 rounded-xl ${LEVEL_BADGE[nextLevel]} text-white flex items-center justify-center shrink-0 shadow-md shadow-black/10`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{nextLevel} membership</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Cross-tier progression to the next level</p>
                            </div>
                            <button
                                onClick={() => setUpgradeTarget(`${nextLevel} Standard`)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-[11px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 shrink-0"
                            >
                                View
                            </button>
                        </div>
                    )}
                    {atMax && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">
                            You have reached the highest membership level — enjoy Platinum Pro+!
                        </p>
                    )}
                </div>
            </section>

            {/* Membership notes */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 px-6">
                Membership is received from businesses you connect with through MCOMVCard. There is nothing to buy.
            </p>

            <MembershipProgressionModal
                open={!!upgradeTarget}
                onClose={() => setUpgradeTarget(null)}
                profile={profile}
                current={profile.membership}
                target={upgradeTarget || nextStep || profile.membership}
                nextLevel={nextLevel || undefined}
            />
        </div>
    )
}
