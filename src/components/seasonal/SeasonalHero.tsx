import { Link } from 'react-router-dom'
import type { SeasonalContent } from '../../services/seasonalConfig'
import { seasonStatus } from '../../services/catalogStore'
import type { Season } from '../../services/catalogStore'
import { Breadcrumb } from '../features/FeatureShared'

interface SeasonalHeroProps {
  content: SeasonalContent
  season?: Season
}

/* ------------------------------------------------------------------ */
/*  Seasonal hero — configurable heading + current season message.     */
/* ------------------------------------------------------------------ */

export default function SeasonalHero({ content, season }: SeasonalHeroProps) {
  const heading = content.heroHeading || 'Current Season'
  const status = season ? seasonStatus(season) : 'active'

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-purple-700 text-white">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-purple-400/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
        <Breadcrumb
          items={[
            { label: 'Home', to: '/' },
            { label: 'Features', to: '/features' },
            { label: 'Seasonal', to: '/features/seasonal' },
          ]}
        />

        <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-4">
          {status === 'active' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {heading}
            </>
          ) : status === 'upcoming' ? (
            'Next Up'
          ) : (
            'Seasonal'
          )}
        </p>

        <h1 className="text-3xl md:text-5xl font-extrabold max-w-3xl">{content.heroTitle}</h1>
        <p className="mt-4 text-sm md:text-lg text-orange-50/90 max-w-2xl leading-relaxed">{content.heroMessage}</p>

        {(content.campaignName || content.purposeLabel) && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {content.purposeLabel && (
              <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wide">
                {content.purposeLabel}
              </span>
            )}
            {content.campaignName && (
              <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wide">
                {content.campaignName}
              </span>
            )}
          </div>
        )}

        {content.primaryCta && (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={content.primaryCta.to}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-orange-600 text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              {content.primaryCta.label}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/features/seasonal/gifts"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white text-sm font-bold hover:bg-white/10 transition-colors"
            >
              Seasonal Gifts
            </Link>
            <Link
              to="/features/seasonal/rewards"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white text-sm font-bold hover:bg-white/10 transition-colors"
            >
              Seasonal Rewards
            </Link>
          </div>
        )}

        {/* Season window dates */}
        {season?.startDate && season.endDate && (
          <div className="mt-8 inline-flex flex-wrap items-center gap-2 text-xs text-orange-100/80">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatWindow(season.startDate)}</span>
            <span>—</span>
            <span>{formatWindow(season.endDate)}</span>
          </div>
        )}
      </div>
    </section>
  )
}

function formatWindow(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/* ------------------------------------------------------------------ */
/*  SeasonalVideos — prominent configurable seasonal video / content.  */
/* ------------------------------------------------------------------ */

export function SeasonalVideos({ content }: { content: SeasonalContent }) {
  const videos = content.video
  return (
    <section className="py-14 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            {videos?.title ?? 'This season, on film'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto text-sm md:text-base">
            {videos?.subtitle ??
              'A seasonal video is configured for this period. When it is ready it will appear here as the overall seasonal story.'}
          </p>
        </div>

        <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl group">
          {videos?.src ? (
            <video className="absolute inset-0 w-full h-full object-cover" controls src={videos.src} poster={undefined} />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-purple-600/20" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                <button
                  type="button"
                  disabled
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white flex items-center justify-center shadow-2xl ring-8 ring-white/10"
                  aria-label="Seasonal video coming soon"
                >
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </button>
                <p className="mt-5 text-white font-bold text-lg">
                  {content.campaignName ? `${content.campaignName} — the seasonal story` : 'The seasonal story'}
                </p>
                <p className="mt-1 text-white/60 text-sm">Configured seasonally · sure to be replaced with the seasonal video</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}