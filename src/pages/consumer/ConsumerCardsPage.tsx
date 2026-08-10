import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'
import type { MockConsumer } from '../../services/mockData'
import ConsumerVCard from '../../components/consumer/ConsumerVCard'
import ErrorState from '../../components/common/ErrorState'

type CardCategory = 'business' | 'loyalty' | 'rewards'

const CATEGORY_META: Record<CardCategory, { label: string; desc: string; icon: string; color: string; bg: string; badge: string }> = {
    business: {
        label: 'Business Issued',
        desc: 'Cards issued by businesses & organisations',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    loyalty: {
        label: 'Store & Loyalty',
        desc: 'Loyalty and membership cards for stores',
        icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    rewards: {
        label: 'Rewards',
        desc: 'Reward-related and benefit cards',
        icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        badge: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
}

function categorize(type: string): CardCategory {
    const t = (type || '').toLowerCase()
    if (t === 'loyalty') return 'loyalty'
    if (t === 'rewards') return 'rewards'
    return 'business'
}

export default function ConsumerCardsPage() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState<MockConsumer | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const primaryRef = useRef<HTMLDivElement>(null)
    const businessRef = useRef<HTMLDivElement>(null)
    const loyaltyRef = useRef<HTMLDivElement>(null)
    const rewardsRef = useRef<HTMLDivElement>(null)
    const eCardRef = useRef<HTMLDivElement>(null)
    const familyRef = useRef<HTMLDivElement>(null)

    const loadCards = () => {
        setLoading(true)
        setError(false)
        consumerService.getProfile()
            .then((p) => setProfile(p))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadCards()
    }, [])

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    if (error || !profile) {
        return (
            <div className="space-y-4 pb-2">
                <Helmet><title>My Cards - Consumer - MCOM VCard</title></Helmet>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Cards</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your card inventory, entitlements and digital access</p>
                </div>
                <div className="lg:max-w-2xl">
                    <ErrorState title="We couldn't load your cards" message="Please try again in a moment." onRetry={loadCards} />
                </div>
            </div>
        )
    }

    const used = profile.allocatedAdditionalCards
    const total = profile.additionalEntitlements
    const remaining = Math.max(0, total - used)

    const groups: Record<CardCategory, typeof profile.savedCards> = { business: [], loyalty: [], rewards: [] }
    ;(profile.savedCards || []).forEach((c) => groups[categorize(c.type)].push(c))

    const familyCount = profile.additionalCards?.length ?? 0
    const eCardCount = profile.eCardId ? 1 : 0

    const overview = [
        { key: 'primary', label: 'Primary', count: 1, ref: primaryRef, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { key: 'business', label: 'Business', count: groups.business.length, ref: businessRef, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { key: 'loyalty', label: 'Loyalty', count: groups.loyalty.length, ref: loyaltyRef, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { key: 'rewards', label: 'Rewards', count: groups.rewards.length, ref: rewardsRef, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { key: 'ecard', label: 'E-Cards', count: eCardCount, ref: eCardRef, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { key: 'family', label: 'Family', count: familyCount, ref: familyRef, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    ]

    const scrollTo = (el: HTMLDivElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    const renderCardTile = (c: { id: number; name: string; business: string; type: string; source?: string; editable?: boolean }, meta: typeof CATEGORY_META[CardCategory]) => (
        <div key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                    <svg className={`w-5 h-5 ${meta.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={meta.icon} />
                    </svg>
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.business}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${meta.badge}`}>{meta.label}</span>
                    {c.source && <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 truncate">Source: {c.source}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Link
                    to={`/consumer/cards/${c.id}/edit`}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    View
                </Link>
                {c.editable ? (
                    <Link
                        to={`/consumer/cards/${c.id}/edit`}
                        className="px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                        Edit
                    </Link>
                ) : (
                    <span className="relative group">
                        <button
                            type="button"
                            disabled
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 rounded-xl text-xs font-bold cursor-not-allowed"
                        >
                            Edit
                        </button>
                        <span className="absolute bottom-full right-0 mb-1.5 w-48 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded-lg shadow-lg z-20 hidden group-hover:block pointer-events-none">
                            Editing is managed by {c.business || 'the issuing business'} on this card.
                        </span>
                    </span>
                )}
            </div>
        </div>
    )

    const emptyState = (label: string) => (
        <div className="py-6 px-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No {label} cards in your inventory</p>
        </div>
    )

    return (
        <div className="space-y-6 pb-2">
            <Helmet><title>My Cards - Consumer - MCOM VCard</title></Helmet>

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Cards</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your card inventory, entitlements and digital access</p>
            </div>

            {/* CATEGORY OVERVIEW — quick navigation */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {overview.map((o) => (
                    <button
                        key={o.key}
                        onClick={() => scrollTo(o.ref.current)}
                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-3 text-center active:scale-[0.97] transition-transform"
                    >
                        <div className={`w-8 h-8 rounded-lg ${o.bg} flex items-center justify-center mx-auto mb-1.5`}>
                            <span className={`text-sm font-black ${o.color}`}>{o.count}</span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{o.label}</p>
                    </button>
                ))}
            </div>

            {/* PRIMARY CARD SECTION */}
            <div ref={primaryRef} className="space-y-4 scroll-mt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Primary VCard</h2>
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase">Main card</span>
                </div>
                <ConsumerVCard profile={profile} />
                <Link
                    to="/consumer/vcard"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-accent-500 text-white text-sm font-bold shadow-lg shadow-accent-500/25 hover:bg-accent-600 active:scale-[0.98] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Open VCard
                </Link>
            </div>

            {/* BUSINESS CARDS SECTION */}
            <div ref={businessRef} className="space-y-4 scroll-mt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{CATEGORY_META.business.label} Cards</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${CATEGORY_META.business.badge}`}>{groups.business.length}</span>
                </div>
                <p className="text-xs text-gray-400 -mt-2">{CATEGORY_META.business.desc}</p>
                {groups.business.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{groups.business.map((c) => renderCardTile(c, CATEGORY_META.business))}</div>
                ) : emptyState('business issued')}
            </div>

            {/* STORE / LOYALTY CARDS SECTION */}
            <div ref={loyaltyRef} className="space-y-4 scroll-mt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{CATEGORY_META.loyalty.label} Cards</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${CATEGORY_META.loyalty.badge}`}>{groups.loyalty.length}</span>
                </div>
                <p className="text-xs text-gray-400 -mt-2">{CATEGORY_META.loyalty.desc}</p>
                {groups.loyalty.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{groups.loyalty.map((c) => renderCardTile(c, CATEGORY_META.loyalty))}</div>
                ) : emptyState('store & loyalty')}
            </div>

            {/* REWARD CARDS SECTION */}
            <div ref={rewardsRef} className="space-y-4 scroll-mt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{CATEGORY_META.rewards.label} Cards</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${CATEGORY_META.rewards.badge}`}>{groups.rewards.length}</span>
                </div>
                <p className="text-xs text-gray-400 -mt-2">{CATEGORY_META.rewards.desc}</p>
                {groups.rewards.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{groups.rewards.map((c) => renderCardTile(c, CATEGORY_META.rewards))}</div>
                ) : emptyState('reward')}
            </div>

            {/* E-CARDS SECTION */}
            <div ref={eCardRef} className="space-y-4 scroll-mt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Stored Value / E-Cards</h2>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase">{eCardCount}</span>
                </div>

                {profile.eCardId ? (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="px-2 py-1 rounded-lg bg-indigo-500 text-white text-[10px] font-bold uppercase">E-Card</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Available Balance</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{profile.eCardFaceValue || '£0.00'}</p>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Status</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{profile.eCardStatus}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Expires</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{profile.eCardExpiryDate || 'N/A'}</p>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Source: {profile.eCardSource || 'Not specified'}</p>
                            <Link
                                to="/consumer/wallet"
                                className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Use E-Card
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 px-4 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No E-Cards available</p>
                    </div>
                )}
            </div>

            {/* FRIENDS & FAMILY SECTION */}
            <div ref={familyRef} className="space-y-4 scroll-mt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Friends & Family</h2>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">{used} of {total} used</p>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{remaining} remaining</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {profile.additionalCards && profile.additionalCards.length > 0 ? (
                        profile.additionalCards.map((card) => (
                            <div key={card.id} className="flex items-center gap-3.5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {card.name.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{card.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.relationship}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    card.status === 'Active' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                    {card.status}
                                </span>
                                <button
                                    onClick={() => navigate(`/consumer/family/${card.id}`)}
                                    className="ml-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-accent-500 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 px-4 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No family cards allocated</p>
                        </div>
                    )}
                </div>

                <Link
                    to="/consumer/family"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Manage Friends & Family
                </Link>
            </div>
        </div>
    )
}
