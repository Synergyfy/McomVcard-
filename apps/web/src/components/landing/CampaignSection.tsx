/* ------------------------------------------------------------------ */
/*  Campaign / seasonal offer section.                                 */
/*  Config-driven from landingConfig — a campaign entry price is only   */
/*  shown when configured, and never presented as standard pricing.    */
/* ------------------------------------------------------------------ */

import { Link } from 'react-router-dom'
import { CAMPAIGN_OFFER, SEASONAL_OFFER } from '../../services/landingConfig'
import { formatPounds } from '../../services/membershipPricingStore'
import { SectionHeading } from './SectionHeading'

export default function CampaignSection({ tone = 'orange' }: { tone?: 'orange' | 'blue' | 'purple' }) {
  const ctaBtn =
    tone === 'purple'
      ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-200'
      : tone === 'blue'
        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 hover:shadow-orange-200'

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="Campaigns & seasonal"
          title="Limited-time offers, configured by MCOM"
          subtitle="Campaign pricing is a configurable highlight — never hard-coded — and seasonal offers are managed from the catalog."
          tone={tone}
        />

        <div className="grid md:grid-cols-2 gap-5">
          {CAMPAIGN_OFFER.active && (
            <div className="relative overflow-hidden rounded-3xl border border-orange-100 dark:border-orange-500/20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-gray-900 p-8">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-200/40 dark:bg-orange-500/10 blur-2xl" />
              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 text-[10px] font-extrabold uppercase tracking-wide mb-4">
                {CAMPAIGN_OFFER.badge}
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{CAMPAIGN_OFFER.title}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{CAMPAIGN_OFFER.description}</p>
              {CAMPAIGN_OFFER.entryPrice > 0 && (
                <div className="mt-5 inline-flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{formatPounds(CAMPAIGN_OFFER.entryPrice)}</span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">entry · campaign</span>
                </div>
              )}
              <Link
                to={CAMPAIGN_OFFER.ctaTo}
                className={`inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-md transition-all active:scale-[0.98] ${ctaBtn}`}
              >
                {CAMPAIGN_OFFER.ctaLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
              <p className="mt-3 text-[10px] text-gray-400 dark:text-gray-500">{CAMPAIGN_OFFER.note}</p>
            </div>
          )}

          <div className="relative overflow-hidden rounded-3xl border border-purple-100 dark:border-purple-500/20 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-500/10 dark:to-gray-900 p-8">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-200/40 dark:bg-purple-500/10 blur-2xl" />
            <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wide mb-4">
              {SEASONAL_OFFER.badge}
            </span>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{SEASONAL_OFFER.title}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{SEASONAL_OFFER.description}</p>
            <div className="mt-5 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M5 6l7-3 7 3m-1 1v11H6V7z" /></svg>
              Businesses set their own season dates, colours and offers.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}