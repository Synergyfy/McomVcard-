/* ------------------------------------------------------------------ */
/*  Audience gate — the two landing-page buttons shown directly under  */
/*  the general hero. One routes to the business landing page, the     */
/*  other to the consumer landing page.                                */
/* ------------------------------------------------------------------ */

import { Link } from 'react-router-dom'

export default function AudienceButtons() {
  return (
    <section className="bg-white dark:bg-gray-950 pb-16 md:pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Business landing */}
          <Link
            to="/business"
            className="group relative overflow-hidden rounded-3xl border border-blue-100 dark:border-blue-500/20 bg-gradient-to-br from-blue-50 to-white dark:from-blue-500/10 dark:to-gray-900 p-8 md:p-10 transition-all hover:shadow-2xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:-translate-y-1"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-500/10 blur-2xl" />
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">I&apos;m a Business</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Build your digital card, vCards and QR codes. Issue cards to customers, run rewards,
              cashback and campaigns — all from one membership.
            </p>
            <span className="inline-flex items-center gap-2 mt-6 text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:gap-3 transition-all">
              Explore for Business
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </span>
          </Link>

          {/* Consumer landing */}
          <Link
            to="/consumer"
            className="group relative overflow-hidden rounded-3xl border border-purple-100 dark:border-purple-500/20 bg-gradient-to-br from-purple-50 to-white dark:from-purple-500/10 dark:to-gray-900 p-8 md:p-10 transition-all hover:shadow-2xl hover:shadow-purple-100 dark:hover:shadow-purple-900/20 hover:-translate-y-1"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-purple-100 dark:bg-purple-500/10 blur-2xl" />
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">I&apos;m a Consumer</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Get your MCOMVCard from a participating business. Collect cashback, coupons, deals and
              rewards — and share family &amp; friends cards from your wallet.
            </p>
            <span className="inline-flex items-center gap-2 mt-6 text-purple-600 dark:text-purple-400 font-bold text-sm group-hover:gap-3 transition-all">
              Explore for Consumers
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
