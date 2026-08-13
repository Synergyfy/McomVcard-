/* ------------------------------------------------------------------ */
/*  Business-only benefits grid.                                       */
/* ------------------------------------------------------------------ */

import { SectionHeading } from './SectionHeading'

const BENEFITS = [
  {
    title: 'Digital cards & vCards',
    desc: 'Create branded digital business cards and vCards with templates, custom URLs and NFC sharing.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  {
    title: 'Issue cards to customers',
    desc: 'Issue consumer cards and VCards to your customers — their gateway into MCOMVCard.',
    icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20h2m4-16v16M6 4h4',
  },
  {
    title: 'Rewards & cashback',
    desc: 'Run cashback, coupons, gift cards and rewards programmes that live on your customers&apos; cards.',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
  },
  {
    title: 'Campaigns & seasonal offers',
    desc: 'Launch limited-time and seasonal campaigns tied to your cards and QR codes.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Analytics & insights',
    desc: 'Track scans, cards issued and redemptions to see what your customers respond to.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    title: 'Friends & Family allocations',
    desc: 'Extend additional cards to your customers&apos; family and friends — grow your reach through people.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

export default function BusinessBenefits() {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="Why businesses choose MCOM VCard"
          title="Everything a business needs on one card"
          subtitle="From the first digital card to a full rewards programme — build it once, put it on your customers&apos; cards."
          tone="blue"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={b.icon} /></svg>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{b.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}