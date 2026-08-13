/* ------------------------------------------------------------------ */
/*  Reusable final CTA strip for the landing pages.                    */
/* ------------------------------------------------------------------ */

import { Link } from 'react-router-dom'

export default function FinalCTA({ title, subtitle, ctaLabel, ctaTo, secondaryLabel, secondaryTo, tone = 'orange' }: {
  title: string
  subtitle: string
  ctaLabel: string
  ctaTo: string
  secondaryLabel?: string
  secondaryTo?: string
  tone?: 'orange' | 'blue' | 'purple'
}) {
  const gradient = tone === 'blue' ? 'from-blue-600 to-indigo-700' : tone === 'purple' ? 'from-purple-600 to-fuchsia-600' : 'from-orange-500 to-purple-600'
  const ctaBtn = tone === 'blue' ? 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900' : tone === 'purple' ? 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900' : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900'

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-10 md:p-14 text-center text-white shadow-2xl`}>
          <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">{title}</h2>
            <p className="mt-3 text-white/80 max-w-xl mx-auto">{subtitle}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link
                to={ctaTo}
                className={`inline-flex items-center px-8 py-3 rounded-xl text-white dark:text-gray-900 text-sm font-bold shadow-lg hover:shadow-2xl transition-all active:scale-[0.98] ${ctaBtn}`}
              >
                {ctaLabel}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              {secondaryLabel && secondaryTo && (
                <Link
                  to={secondaryTo}
                  className="inline-flex items-center px-8 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/30 text-white text-sm font-bold hover:bg-white/20 transition-all"
                >
                  {secondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}