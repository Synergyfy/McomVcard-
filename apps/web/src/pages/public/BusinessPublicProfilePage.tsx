import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { participatingBusinessService } from '../../services/participatingBusinesses'
import type { ParticipatingBusiness } from '../../services/participatingBusinesses'
import type { PlanLevel } from '../../services/membershipPricingStore'

const MEMBERSHIP_BADGE: Record<PlanLevel, string> = {
    Bronze: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    Silver: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
    Gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    Platinum: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
}

type Step = 'connect' | 'receive'

function PseudoQR({ value, label }: { value: string; label?: string }) {
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

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <p className="text-lg font-extrabold text-gray-900 dark:text-white">{value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        </div>
    )
}

export default function BusinessPublicProfilePage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [business, setBusiness] = useState<ParticipatingBusiness | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [step, setStep] = useState<Step>('connect')
    const [connecting, setConnecting] = useState(false)

    const inviteCardId = useMemo(() => `MC-CARD-${(business?.id ?? 0).toString().padStart(6, '0')}`, [business])

    const loadBusiness = useCallback(() => {
        setLoading(true)
        setError(false)
        const numericId = Number(id)
        if (!Number.isFinite(numericId)) {
            setBusiness(null)
            setLoading(false)
            return
        }
        participatingBusinessService.getById(numericId)
            .then((b) => {
                setBusiness(b ?? null)
                setLoading(false)
            })
            .catch(() => {
                setError(true)
                setLoading(false)
            })
    }, [id])

    useEffect(() => {
        loadBusiness()
    }, [loadBusiness])

    const handleConfirmConnect = async () => {
        if (!business) return
        setConnecting(true)
        await new Promise((r) => setTimeout(r, 900))
        setConnecting(false)
        setStep('receive')
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-8">
                    <p className="text-4xl mb-3">⚠️</p>
                    <h1 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">Something went wrong</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">We couldn't load this business. Check your connection and try again.</p>
                    <button onClick={loadBusiness} className="inline-flex items-center justify-center h-11 px-6 rounded-2xl bg-accent-500 text-white text-sm font-bold active:scale-[0.98] transition-transform">
                        Try again
                    </button>
                </div>
            </div>
        )
    }

    if (!business) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-8">
                    <p className="text-4xl mb-3">🔍</p>
                    <h1 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">Business not found</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This participating business could not be found or is no longer active.</p>
                    <Link to="/find-a-business" className="inline-flex items-center justify-center h-11 px-6 rounded-2xl bg-accent-500 text-white text-sm font-bold active:scale-[0.98] transition-transform">
                        Browse participating businesses
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[60vh]">
            <Helmet>
                <title>{business.name} - MCOMVCard</title>
                <meta name="description" content={`Connect with ${business.name}, a ${business.membership} participating business, and receive your MCOMVCard.`} />
            </Helmet>

            {/* Header */}
            <section className="bg-gradient-to-br from-purple-600 via-accent-500 to-indigo-600 text-white">
                <div className="max-w-5xl mx-auto px-4 py-12 md:py-14">
                    <Link to="/find-a-business" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-colors mb-6">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to all businesses
                    </Link>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                    <div className="relative w-20 h-20 rounded-3xl bg-white/20 text-white font-extrabold flex items-center justify-center text-2xl shrink-0 overflow-hidden">
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
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                                <h1 className="text-2xl md:text-3xl font-extrabold">{business.name}</h1>
                                {business.verified && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-white/85 mb-3">{business.industry} · {business.city}</p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${MEMBERSHIP_BADGE[business.membershipLevel]}`}>
                                    {business.membership}
                                </span>
                                {business.featured && (
                                    <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide">Featured</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6">
                    <Stat value={business.scans.toLocaleString()} label="Scans" />
                    <Stat value={business.cards.toString()} label="Cards issued" />
                    <Stat value={business.joined} label="Joined" />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* About + connect */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                            <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-3">About {business.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{business.description}</p>
                        </div>

                        {step === 'receive' ? (
                            <div className="space-y-5">
                                <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 text-center">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 animate-fadeIn">
                                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Your card is ready!</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{business.name}</span> has issued your consumer card. Create an MCOM account or sign in to open it.
                                    </p>
                                </div>

                                <div className="rounded-3xl bg-gradient-to-br from-purple-600 via-accent-500 to-indigo-600 p-6 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
                                    <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-black/10" />
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-sm font-extrabold">{business.initials}</div>
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
                                                <p className="text-sm font-bold">{business.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-wider text-white/70">Card ID</p>
                                                <p className="text-sm font-bold font-mono">{inviteCardId}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-5">
                                        Your MCOM account connects you to <span className="font-semibold text-gray-900 dark:text-white">{business.name}</span> and your MCOMVCard.
                                    </p>
                                    <button
                                        onClick={() => navigate(`/register?card=${inviteCardId}&business=${encodeURIComponent(business.name)}`)}
                                        className="w-full h-12 rounded-2xl bg-accent-500 text-white font-bold shadow-lg shadow-accent-500/25 hover:bg-accent-600 active:scale-[0.98] transition-transform"
                                    >
                                        Create MCOM Account
                                    </button>
                                    <button
                                        onClick={() => navigate(`/login?card=${inviteCardId}&business=${encodeURIComponent(business.name)}`)}
                                        className="w-full mt-3 h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 active:scale-[0.98] transition-transform"
                                    >
                                        I already have an account — Sign in
                                    </button>
                                    <button
                                        onClick={() => setStep('connect')}
                                        className="w-full mt-2 h-12 rounded-2xl font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        Start over
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                                <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-3">Get your MCOMVCard from {business.name}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                                    Consumers don't purchase access — connect with a business, receive your card or vCard, then create or sign in to your MCOM account to enter MCOMVCard.
                                </p>
                                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-4 mb-5 text-xs text-gray-500 dark:text-gray-400 space-y-2">
                                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> {business.name} will issue your consumer card or vCard.</p>
                                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> You'll get an access link or invitation to open it.</p>
                                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> Create or sign in to your MCOM account to enter MCOMVCard.</p>
                                </div>
                                <button
                                    onClick={handleConfirmConnect}
                                    disabled={connecting}
                                    className="w-full h-12 rounded-2xl bg-accent-500 text-white font-bold shadow-lg shadow-accent-500/25 disabled:opacity-50 active:scale-[0.98] transition-transform"
                                >
                                    {connecting ? 'Connecting…' : `Connect with ${business.name}`}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Contact / details */}
                    <div className="space-y-6">
                        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                            <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-4">Contact</h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Address</p>
                                    <p className="text-gray-600 dark:text-gray-300 leading-snug">{business.address}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Phone</p>
                                    <a href={`tel:${business.phone.replace(/\s/g, '')}`} className="text-accent-600 dark:text-accent-400 hover:underline">{business.phone}</a>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Email</p>
                                    <a href={`mailto:${business.email}`} className="text-accent-600 dark:text-accent-400 hover:underline break-all">{business.email}</a>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Website</p>
                                    <a href={business.website} target="_blank" rel="noreferrer" className="text-accent-600 dark:text-accent-400 hover:underline break-all">{business.website.replace(/^https?:\/\//, '')}</a>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                            <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-4">Membership</h2>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Level</span>
                                    <span className="font-bold">{business.membershipLevel}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Tier</span>
                                    <span className="font-bold">{business.membershipTier}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Plan</span>
                                    <span className="font-bold">{business.membership}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
