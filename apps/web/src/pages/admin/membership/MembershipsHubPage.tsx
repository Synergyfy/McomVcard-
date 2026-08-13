import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

/* ------------------------------------------------------------------ */
/*  Admin — Memberships hub (/admin/membership/memberships)            */
/*  Single entry point for Business and Consumer memberships, which    */
/*  depend on the plans set in Pricing & Plans.                        */
/* ------------------------------------------------------------------ */

export default function MembershipsHubPage() {
  const cards = [
    {
      title: 'Business Memberships',
      desc: 'Businesses subscribed to the Bronze, Silver, Gold and Platinum plans — status, renewals, upgrades and suspended accounts.',
      to: '/admin/membership/business-memberships',
      accent: 'from-blue-500 to-indigo-600',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      stats: [
        { label: 'Active', value: '412' },
        { label: 'Pending', value: '38' },
        { label: 'Suspended', value: '17' },
      ],
    },
    {
      title: 'Consumer Memberships',
      desc: 'Consumers on each tier level, progressions between levels, and consumer card & VCard allocations.',
      to: '/admin/membership/consumer-memberships',
      accent: 'from-purple-500 to-fuchsia-600',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      stats: [
        { label: 'Active', value: '8,940' },
        { label: 'Progression-ready', value: '1,240' },
        { label: 'On Platinum', value: '450' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <Helmet><title>Memberships - Membership &amp; Pricing - MCOM VCard</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">Memberships</h1>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Manage who is on each plan. Memberships depend on the plans and pricing defined in <Link to="/admin/membership/pricing" className="text-orange-600 hover:underline">Pricing &amp; Plans</Link>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map(c => (
          <Link
            key={c.title}
            to={c.to}
            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.accent} text-white flex items-center justify-center shadow-lg shrink-0`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon} /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{c.title}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{c.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {c.stats.map(s => (
                <div key={s.label} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-[8px] text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
