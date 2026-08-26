import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  participatingBusinessService,
  type ParticipatingBusiness,
} from '../../services/participatingBusinesses'
import type { PlanLevel } from '../../services/membershipPricingStore'

const MEMBERSHIP_BADGE: Record<PlanLevel, string> = {
    Bronze: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    Silver: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
    Gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    Platinum: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
}

const PER_SLIDE = 3
const AUTO_MS = 5000
const FADE_MS = 350

function BusinessCard({ business }: { business: ParticipatingBusiness }) {
    return (
        <Link
            to={`/find-a-business/${business.id}`}
            className="block h-full rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg hover:shadow-purple-100 dark:hover:shadow-black/30 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all group"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0 overflow-hidden">
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
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{business.name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{business.industry} · {business.city}</p>
                </div>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">{business.description}</p>
            <div className="flex items-center gap-1.5">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${MEMBERSHIP_BADGE[business.membershipLevel]}`}>
                    {business.membership}
                </span>
                {business.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-bold uppercase tracking-wide">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        Featured
                    </span>
                )}
            </div>
        </Link>
    )
}

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = []
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
    return out
}

export default function ParticipatingBusinesses() {
    const [businesses, setBusinesses] = useState<ParticipatingBusiness[]>([])
    const [loading, setLoading] = useState(true)
    const [active, setActive] = useState(0)
    const [visible, setVisible] = useState(true)
    const [paused, setPaused] = useState(false)
    const timeoutRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        participatingBusinessService.getAll().then((b) => {
            setBusinesses(
                [...b].sort((a, z) => {
                    if (a.featured !== z.featured) return a.featured ? -1 : 1
                    return z.scans - a.scans
                }),
            )
            setLoading(false)
        })
    }, [])

    const slides = chunk(businesses, PER_SLIDE)
    const slideCount = slides.length

    useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

    const changeSlide = useCallback((dir: 1 | -1) => {
        if (slideCount <= 1) return
        setVisible(false)
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = window.setTimeout(() => {
            setActive((a) => (a + dir + slideCount) % slideCount)
            setVisible(true)
        }, FADE_MS)
    }, [slideCount])

    useEffect(() => {
        if (paused || slideCount <= 1) return
        const id = window.setInterval(() => changeSlide(1), AUTO_MS)
        return () => window.clearInterval(id)
    }, [paused, slideCount, changeSlide])

    return (
        <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900" id="participating-businesses">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
                    <div className="max-w-2xl">
                        <p className="inline-block px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
                            Participating Businesses
                        </p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                            Get your MCOMVCard from a business you trust
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-3">
                            Connect with a participating business near you — featured, top-rated and recently joined — and they'll issue your consumer card or vCard.
                        </p>
                    </div>
                    <Link
                        to="/find-a-business"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/30 transition-all active:scale-[0.98] shrink-0"
                    >
                        View more businesses
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : slideCount === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No participating businesses yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check back soon or ask a business to join MCOMVCard.</p>
                    </div>
                ) : (
                    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                        <div className={`transition-opacity duration-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`} key={active}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {slides[active].map((business) => (
                                    <BusinessCard key={business.id} business={business} />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={() => changeSlide(-1)}
                                disabled={slideCount <= 1}
                                aria-label="Previous businesses"
                                className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-500/40 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
                                {active + 1} of {slideCount}
                            </span>
                            <button
                                onClick={() => changeSlide(1)}
                                disabled={slideCount <= 1}
                                aria-label="Next businesses"
                                className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-500/40 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        <div className="text-center mt-6 md:hidden">
                            <Link
                                to="/find-a-business"
                                className="inline-block px-8 py-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-300"
                            >
                                View more
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
