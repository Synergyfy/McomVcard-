import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { participatingBusinessService, PARTICIPATING_LEVELS, PARTICIPATING_TIERS, getParticipatingCities, getParticipatingIndustries, joinedToDate } from '../../services/participatingBusinesses'
import type { ParticipatingBusiness, MembershipTier } from '../../services/participatingBusinesses'
import type { PlanLevel } from '../../services/membershipPricingStore'

type Step = 'find' | 'connect' | 'receive'

type BrowseMode = 'all' | 'featured' | 'popular' | 'recent'

const MEMBERSHIP_BADGE: Record<PlanLevel, string> = {
    Bronze: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    Silver: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
    Gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    Platinum: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
}

const BROWSE_MODES: { id: BrowseMode; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'featured', label: 'Featured' },
    { id: 'popular', label: 'Top & Popular' },
    { id: 'recent', label: 'Recently Added' },
]

interface PseudoQRProps {
    value: string
    label?: string
}

function PseudoQR({ value, label }: PseudoQRProps) {
    const cells = 9
    const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const matrix: boolean[][] = []
    for (let r = 0; r < cells; r++) {
        const row: boolean[] = []
        for (let c = 0; c < cells; c++) {
            row.push(((seed * (r + 3) + c * 7 + r * c * 11) % 3) !== 0)
        }
        matrix.push(row)
    }
    return (
        <div className="text-center">
            <div className="inline-block p-3 bg-white rounded-2xl shadow-sm">
                <div className="grid grid-cols-9 gap-[3px]">
                    {matrix.flat().map((on, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${on ? 'bg-gray-900' : 'bg-transparent'}`} />
                    ))}
                </div>
            </div>
            {label && <p className="text-[10px] font-semibold text-gray-400 mt-1.5">{label}</p>}
        </div>
    )
}

function BusinessCard({ business, onConnect }: { business: ParticipatingBusiness; onConnect: () => void }) {
    return (
        <article className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-base shrink-0 overflow-hidden">
                    <span className="absolute inset-0 flex items-center justify-center">{business.initials}</span>
                    {business.logo && (
                        <img
                            src={business.logo}
                            alt={`${business.name} logo`}
                            className="relative w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                        />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{business.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{business.industry} · {business.city}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${MEMBERSHIP_BADGE[business.membershipLevel]}`}>
                        {business.membership}
                    </span>
                </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">{business.description}</p>
            <div className="mt-auto">
                <button
                    onClick={onConnect}
                    className="w-full h-11 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-bold active:scale-[0.98] transition-transform"
                >
                    Connect with {business.name}
                </button>
            </div>
        </article>
    )
}

export default function FindBusinessPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>('find')
    const [businesses, setBusinesses] = useState<ParticipatingBusiness[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [mode, setMode] = useState<BrowseMode>('all')
    const [city, setCity] = useState('All')
    const [industry, setIndustry] = useState('All')
    const [level, setLevel] = useState<PlanLevel | 'All'>('All')
    const [tier, setTier] = useState<MembershipTier | 'All'>('All')
    const [selected, setSelected] = useState<ParticipatingBusiness | null>(null)
    const [connecting, setConnecting] = useState(false)
    const [error, setError] = useState(false)
    const [industries, setIndustries] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])

    const inviteCardId = useMemo(() => `MC-CARD-${(selected?.id ?? 0).toString().padStart(6, '0')}`, [selected])

    const loadBusinesses = useCallback(() => {
        setLoading(true)
        setError(false)
        participatingBusinessService.getAll()
            .then((b) => {
                setBusinesses(b)
                setLoading(false)
            })
            .catch(() => {
                setError(true)
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        loadBusinesses()
        getParticipatingIndustries().then(setIndustries).catch(() => {})
        getParticipatingCities().then(setCities).catch(() => {})
    }, [loadBusinesses])

    const results = useMemo(() => {
        const q = query.trim().toLowerCase()
        const filtered = businesses.filter((b) => {
            if (industry !== 'All' && b.industry !== industry) return false
            if (level !== 'All' && b.membershipLevel !== level) return false
            if (tier !== 'All' && b.membershipTier !== tier) return false
            if (city !== 'All' && b.city !== city) return false
            if (mode === 'featured' && !b.featured) return false
            if (!q) return true
            return b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q) || b.membership.toLowerCase().includes(q)
        })

        if (mode === 'popular') {
            return [...filtered].sort((a, z) => z.scans - a.scans || z.cards - a.cards)
        }
        if (mode === 'recent') {
            return [...filtered].sort((a, z) => joinedToDate(z.joined).getTime() - joinedToDate(a.joined).getTime())
        }
        if (mode === 'featured') {
            return [...filtered].sort((a, z) => z.scans - a.scans)
        }
        return filtered
    }, [businesses, query, mode, city, industry, level, tier])

    const handleConnect = async (business: ParticipatingBusiness) => {
        setSelected(business)
        setStep('connect')
    }

    const handleConfirmConnect = async () => {
        if (!selected) return
        setConnecting(true)
        await new Promise((r) => setTimeout(r, 900))
        setConnecting(false)
        setStep('receive')
    }

    return (
        <div className="min-h-[60vh]">
            <Helmet>
                <title>Find a Business - Get Your MCOMVCard</title>
                <meta name="description" content="MCOMVCard is provided through participating businesses. Find a business near you, connect, and receive your consumer card." />
            </Helmet>

            {/* Header */}
            <section className="bg-gradient-to-br from-purple-600 via-accent-500 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-14 md:py-16 text-center">
                    <p className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-4">For Consumers</p>
                    <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">Get Your MCOMVCard Through a Participating Business</h1>
                    <p className="text-sm md:text-base text-white/85 max-w-2xl mx-auto">
                        Consumers don't purchase access — connect with a business, receive your card or vCard, then create or sign in to your MCOM account to enter MCOMVCard. Filter by membership — Bronze, Silver, Gold or Platinum, each with Standard, Pro and Pro+ — and the sector you care about.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {(['find', 'connect', 'receive'] as Step[]).map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                step === s ? 'bg-accent-500 text-white' : i < ['find', 'connect', 'receive'].indexOf(step) ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                                {i + 1}
                            </span>
                            <span className={`text-xs font-semibold hidden sm:block ${step === s ? 'text-accent-600 dark:text-accent-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                {s === 'find' ? 'Find a Business' : s === 'connect' ? 'Connect' : 'Receive Card'}
                            </span>
                            {i < 2 && <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />}
                        </div>
                    ))}
                </div>

                {step === 'find' && (
                    <div>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Participating Businesses</h2>
                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                                {results.length} {level !== 'All' ? `· ${level}` : ''}{tier !== 'All' ? ` ${tier}` : ''} {results.length === 1 ? 'business' : 'businesses'} issuing consumer cards
                            </span>
                        </div>

                        {/* Browse: featured / popular / recent / all */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-4">
                            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mr-1">Browse</span>
                            {BROWSE_MODES.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                                        mode === m.id
                                            ? 'bg-purple-600 text-white shadow'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {/* Search + filter */}
                        <div className="flex flex-col md:flex-row gap-3 mb-6">
                            <div className="flex items-center gap-2 flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 h-12">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by name, city or industry"
                                    className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
                                />
                            </div>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="h-12 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none focus:border-accent-500"
                            >
                                <option value="All">All locations</option>
                                {cities.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <select
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="h-12 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none focus:border-accent-500"
                            >
                                <option value="All">All industries</option>
                                {industries.map((ind) => (
                                    <option key={ind} value={ind}>{ind}</option>
                                ))}
                            </select>
                        </div>

                        {/* Membership filter */}
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    Membership
                                </p>
                                {(level !== 'All' || tier !== 'All') && (
                                    <button onClick={() => { setLevel('All'); setTier('All') }} className="text-[11px] font-semibold text-accent-600 dark:text-accent-400 hover:underline">
                                        Clear membership filters
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                        onClick={() => setLevel('All')}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${level === 'All' ? 'bg-accent-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
                                    >
                                        All levels
                                    </button>
                                    {PARTICIPATING_LEVELS.map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => setLevel(level === l ? 'All' : l)}
                                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${level === l ? 'bg-accent-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                        onClick={() => setTier('All')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${tier === 'All' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow' : 'bg-gray-50 dark:bg-gray-800/60 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        All tiers
                                    </button>
                                    {PARTICIPATING_TIERS.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTier(tier === t ? 'All' : t)}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${tier === t ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow' : 'bg-gray-50 dark:bg-gray-800/60 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
                        ) : error ? (
                            <div className="rounded-3xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-10 text-center">
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">We couldn't load participating businesses</p>
                                <p className="text-xs text-red-400 dark:text-red-500 mt-1">Check your connection and try again.</p>
                                <button
                                    onClick={loadBusinesses}
                                    className="mt-5 inline-flex items-center justify-center px-6 h-11 rounded-2xl bg-accent-500 text-white text-sm font-bold active:scale-[0.98] transition-transform"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No businesses match your search</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different search or filter.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.map((business) => (
                                    <BusinessCard key={business.id} business={business} onConnect={() => handleConnect(business)} />
                                ))}
                            </div>
                        )}

                        <div className="mt-8 rounded-2xl bg-purple-50 dark:bg-purple-500/10 p-5 flex flex-col md:flex-row items-center gap-4 justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                <span className="text-lg">💡</span>
                                Can't find your business? Ask them to join MCOMVCard —{' '}
                                <Link to="/membership" className="text-accent-600 dark:text-accent-400 font-semibold hover:underline">businesses start here</Link>.
                            </p>
                        </div>
                    </div>
                )}

                {step === 'connect' && selected && (
                    <div className="max-w-lg mx-auto">
                        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xl">
                                    {selected.initials}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-gray-900 dark:text-white">{selected.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selected.industry} · {selected.city}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${MEMBERSHIP_BADGE[selected.membershipLevel]}`}>
                                            {selected.membership}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verified participant
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{selected.description}</p>

                            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-4 mb-5 text-xs text-gray-500 dark:text-gray-400 space-y-2">
                                <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> {selected.name} will issue your consumer card or vCard.</p>
                                <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> You'll get an access link or invitation to open it.</p>
                                <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> Create or sign in to your MCOM account to enter MCOMVCard.</p>
                            </div>

                            <button
                                onClick={handleConfirmConnect}
                                disabled={connecting}
                                className="w-full h-12 rounded-2xl bg-accent-500 text-white font-bold shadow-lg shadow-accent-500/25 disabled:opacity-50 active:scale-[0.98] transition-transform"
                            >
                                {connecting ? 'Connecting…' : `Connect with ${selected.name}`}
                            </button>
                            <button
                                onClick={() => setStep('find')}
                                className="w-full mt-3 h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300 active:scale-[0.98] transition-transform"
                            >
                                Back to results
                            </button>
                        </div>
                    </div>
                )}

                {step === 'receive' && selected && (
                    <div className="max-w-lg mx-auto">
                        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-5 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 animate-fadeIn">
                                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Your card is ready!</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{selected.name}</span> has issued your consumer card. Create an MCOM account or sign in to open it.
                            </p>
                        </div>

                        {/* Card preview */}
                        <div className="rounded-3xl bg-gradient-to-br from-purple-600 via-accent-500 to-indigo-600 p-6 text-white shadow-lg mb-5 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
                            <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-black/10" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-sm font-extrabold">{selected.initials}</div>
                                    <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide">Consumer VCard</span>
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <PseudoQR value={inviteCardId} />
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-wider text-white/70">Access link</p>
                                        <p className="text-xs font-semibold break-all">mcomvcard.link/{inviteCardId.toLowerCase()}</p>
                                        <p className="text-[10px] text-white/70 mt-1">Scan or open to claim your card</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-white/70">Issued by</p>
                                        <p className="text-sm font-bold">{selected.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-white/70">Card ID</p>
                                        <p className="text-sm font-bold font-mono">{inviteCardId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Auth CTA */}
                        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-5">
                                Your MCOM account connects you to <span className="font-semibold text-gray-900 dark:text-white">{selected.name}</span> and your MCOMVCard.
                            </p>
                            <button
                                onClick={() => navigate(`/register?card=${inviteCardId}&business=${encodeURIComponent(selected.name)}`)}
                                className="w-full h-12 rounded-2xl bg-accent-500 text-white font-bold shadow-lg shadow-accent-500/25 hover:bg-accent-600 active:scale-[0.98] transition-transform"
                            >
                                Create MCOM Account
                            </button>
                            <button
                                onClick={() => navigate(`/login?card=${inviteCardId}&business=${encodeURIComponent(selected.name)}`)}
                                className="w-full mt-3 h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 active:scale-[0.98] transition-transform"
                            >
                                I already have an account — Sign in
                            </button>
                            <button
                                onClick={() => setStep('find')}
                                className="w-full mt-2 h-12 rounded-2xl font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                Start over
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
