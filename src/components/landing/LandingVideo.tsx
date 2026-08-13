/* ------------------------------------------------------------------ */
/*  Prominent explainer video section. The video URL comes from the    */
/*  landing configuration (LANDING_VIDEO.src). Until a video is set,   */
/*  a styled placeholder is shown so the section is discoverable and   */
/*  swaps in the video as soon as the config is populated.             */
/* ------------------------------------------------------------------ */

import { LANDING_VIDEO } from '../../services/landingConfig'
import { SectionHeading } from './SectionHeading'

export default function LandingVideo({ tone = 'orange' }: { tone?: 'orange' | 'blue' | 'purple' }) {
  const bg = tone === 'blue' ? 'from-blue-600 to-indigo-700' : tone === 'purple' ? 'from-purple-600 to-indigo-700' : 'from-orange-500 to-purple-600'

  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4">
        <SectionHeading
          badge="Watch it in action"
          title={LANDING_VIDEO.title}
          subtitle={LANDING_VIDEO.subtitle}
          tone={tone}
        />

        <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br shadow-2xl group">
          {LANDING_VIDEO.src ? (
            <video className="absolute inset-0 w-full h-full object-cover" controls src={LANDING_VIDEO.src} poster={undefined} />
          ) : (
            <>
              {/* Placeholder backdrop */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
              <div className={`absolute inset-0 bg-gradient-to-br opacity-20 ${bg}`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.25),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.25),transparent_45%)]" />

              {/* Central play affordance */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                <button
                  type="button"
                  disabled
                  className={`w-20 h-20 rounded-full bg-gradient-to-r text-white flex items-center justify-center shadow-2xl ring-8 ring-white/10 transition-transform group-hover:scale-105 ${bg}`}
                  aria-label="Video coming soon"
                >
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </button>
                <p className="mt-5 text-white font-bold text-lg">Watch the MCOM VCard story</p>
                <p className="mt-1 text-white/60 text-sm">Configured via LANDING_VIDEO.src · {LANDING_VIDEO.durationLabel}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}