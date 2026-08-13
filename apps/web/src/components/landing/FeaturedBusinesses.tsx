/* ------------------------------------------------------------------ */
/*  Featured / recent participating businesses for the consumer page.  */
/*  Data-driven from participatingBusinesses (admin-controlled         */
/*  featured flags + scan ranking, mirroring the home page).           */
/* ------------------------------------------------------------------ */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { participatingBusinessService, type ParticipatingBusiness } from '../../services/participatingBusinesses'
import type { PlanLevel } from '../../services/membershipPricingStore'
import { SectionHeading } from './SectionHeading'

const MEMBERSHIP_BADGE: Record<PlanLevel, string> = {
  Bronze: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Silver: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
  Gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  Platinum: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
}

function BusinessRow({ b }: { b: ParticipatingBusiness }) {
  return (
    <Link
      to={`/find-a-business/${b.id}`}
      className="group flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl hover:shadow-purple-100 dark:hover:shadow-black/30 hover:border-purple-200 dark:hover:border-purple-500/30 hover:-translate-y-0.5 transition-all"
    >
      {/* Card header — brand strip */}
      <div className="h-16 bg-gradient-to-br from-purple-500/15 via-white to-indigo-500/15 dark:from-purple-500/15 dark:via-gray-900 dark:to-indigo-500/15 relative overflow-hidden">
        <div className="absolute -bottom-5 -right-4 w-20 h-20 rounded-full bg-purple-200/40 dark:bg-purple-500/10 blur-xl" />
      </div>

      <div className="px-5 pb-5 -mt-7 flex flex-col flex-1">
        {/* Avatar + name */}
        <div className="flex items-end justify-between gap-2">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0 ring-4 ring-white dark:ring-gray-900 overflow-hidden shadow-md">
            <span className="absolute inset-0 flex items-center justify-center">{b.initials}</span>
            {b.logo && (
              <img src={b.logo} alt={`${b.name} logo`} className="relative w-full h-full object-cover" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {b.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Verified
              </span>
            )}
            {b.featured && (
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            )}
          </div>
        </div>

        {/* Name + meta */}
        <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{b.name}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">{b.industry} · {b.city}</p>

        {/* Description */}
        <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{b.description}</p>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-y border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs font-extrabold text-gray-900 dark:text-white">{b.scans.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">Scans</p>
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900 dark:text-white">{b.cards.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">Cards</p>
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900 dark:text-white">{b.joined}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">Joined</p>
          </div>
        </div>

        {/* Membership + connect */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${MEMBERSHIP_BADGE[b.membershipLevel]}`}>
              {b.membershipLevel}
            </span>
            <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {b.membershipTier}
            </span>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400">
            Connect
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function FeaturedBusinesses() {
  const [businesses, setBusinesses] = useState<ParticipatingBusiness[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    participatingBusinessService.getAll().then((b) => {
      setBusinesses(
        [...b]
          .sort((a, z) => {
            if (a.featured !== z.featured) return a.featured ? -1 : 1
            return z.scans - a.scans
          })
          .slice(0, 6),
      )
      setLoading(false)
    })
  }, [])

  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeading
          badge="Featured businesses"
          title="Get your card from a business you trust"
          subtitle="Connect with a participating business near you — they&apos;ll issue your consumer card or vCard."
          tone="purple"
        />

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {businesses.map((b) => <BusinessRow key={b.id} b={b} />)}
            </div>
            <div className="flex justify-center mt-8">
              <Link
                to="/find-a-business"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-[0.98]"
              >
                View all businesses
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}