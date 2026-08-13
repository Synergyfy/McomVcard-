import type { SeasonalContent } from '../../services/seasonalConfig'

/* ------------------------------------------------------------------ */
/*  BodySeasonalVideo — the seasonal video for a specific story page   */
/*  (Gifts or Rewards). Reads its config from the season's content.    */
/* ------------------------------------------------------------------ */

export function BodySeasonalVideo({ content, kind }: { content: SeasonalContent; kind: 'gift' | 'reward' }) {
  const videos = content.video
  if (!videos) return null
  return (
    <section className="py-14 md:py-20 bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            {kind === 'gift' ? 'Seasonal gifts, on film' : 'Seasonal rewards, on film'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto text-sm md:text-base">
            {videos.subtitle}
          </p>
        </div>

        <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl group">
          {videos.src ? (
            <video className="absolute inset-0 w-full h-full object-cover" controls src={videos.src} poster={undefined} />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-purple-600/20" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                <button
                  type="button"
                  disabled
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white flex items-center justify-center shadow-2xl ring-8 ring-white/10"
                  aria-label={`Seasonal ${kind} video coming soon`}
                >
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </button>
                <p className="mt-5 text-white font-bold text-lg">
                  {content.campaignName ? `${content.campaignName} — the seasonal story` : 'The seasonal story'}
                </p>
                <p className="mt-1 text-white/60 text-sm">Configured seasonally · the {kind} video appears here when ready</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}