/* ------------------------------------------------------------------ */
/*  Landing hero slider.                                               */
/*                                                                     */
/*  Data-driven carousel for the three landing pages. Every slide is   */
/*  read from the landingSlides store (admin-editable) and rendered    */
/*  here: badge, heading + highlighted accent, description, primary &  */
/*  secondary calls-to-action, and an illustration.                    */
/*                                                                     */
/*  Illustrations are either the built-in vector art (by imageKey) or  */
/*  a custom image URL (imageUrl). The section tints follow the active */
/*  slide's theme so each slide can carry its own personality.         */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadLandingSlides, type LandingPageId, type LandingSlide, type SlideTheme } from '../../services/landingSlides'
import { GeneralHeroImage, BusinessHeroImage, ConsumerHeroImage } from './LandingHeroImages'

const THEME: Record<SlideTheme, {
  bg: string
  blobA: string
  blobB: string
  pill: string
  pillDot: string
  gradient: string
  cta: string
  shadow: string
}> = {
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-orange-500/10 dark:via-gray-950 dark:to-purple-500/10',
    blobA: 'bg-orange-200/30 dark:bg-orange-500/10',
    blobB: 'bg-purple-200/30 dark:bg-purple-500/10',
    pill: 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-800/40 text-orange-600 dark:text-orange-400',
    pillDot: 'bg-orange-500',
    gradient: 'from-orange-500 to-purple-600',
    cta: 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700',
    shadow: 'hover:shadow-orange-200',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-500/10 dark:via-gray-950 dark:to-indigo-500/10',
    blobA: 'bg-blue-200/30 dark:bg-blue-500/10',
    blobB: 'bg-indigo-200/30 dark:bg-indigo-500/10',
    pill: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-800/40 text-blue-600 dark:text-blue-400',
    pillDot: 'bg-blue-500',
    gradient: 'from-blue-600 to-indigo-600',
    cta: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
    shadow: 'hover:shadow-blue-200',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 dark:from-purple-500/10 dark:via-gray-950 dark:to-fuchsia-500/10',
    blobA: 'bg-purple-200/30 dark:bg-purple-500/10',
    blobB: 'bg-fuchsia-200/30 dark:bg-fuchsia-500/10',
    pill: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-800/40 text-purple-600 dark:text-purple-400',
    pillDot: 'bg-purple-500',
    gradient: 'from-purple-600 to-fuchsia-600',
    cta: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700',
    shadow: 'hover:shadow-purple-200',
  },
}

function SlideArt({ slide }: { slide: LandingSlide }) {
  if (slide.mediaType === 'video') {
    return (
      <video
        src={slide.imageUrl}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-auto rounded-3xl shadow-2xl bg-gray-900"
        style={{ maxHeight: 440 }}
      />
    )
  }
  if (slide.mediaType === 'gif' || slide.mediaType === 'image') {
    if (slide.imageUrl) return <img src={slide.imageUrl} alt="" className="w-full h-auto drop-shadow-2xl rounded-3xl" />
  }
  if (slide.imageKey === 'business') return <BusinessHeroImage />
  if (slide.imageKey === 'consumer') return <ConsumerHeroImage />
  return <GeneralHeroImage />
}

export default function LandingSlider({ pageId }: { pageId: LandingPageId }) {
  const [slides, setSlides] = useState<LandingSlide[]>(() => loadLandingSlides(pageId))
  const [current, setCurrent] = useState(0)

  const count = Math.max(slides.length, 1)
  const safeCurrent = Math.min(current, count - 1)

  useEffect(() => {
    setSlides(loadLandingSlides(pageId))
    setCurrent(0)
  }, [pageId])

  const prev = useCallback(() => setCurrent((p) => (p - 1 + count) % count), [count])
  const next = useCallback(() => setCurrent((p) => (p + 1) % count), [count])

  useEffect(() => {
    if (count <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, count])

  const slide = slides[safeCurrent]
  const theme = THEME[slide?.theme ?? 'orange']

  if (!slide) {
    return (
      <section className="relative overflow-hidden bg-white dark:bg-gray-950">
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center text-gray-400">
          No slides configured yet. Add slides from the admin Landing Page editor.
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-950">
      {/* Theme gradient wash */}
      <div className={`absolute inset-0 transition-colors duration-700 ${theme.bg}`} />
      <div className={`absolute top-24 left-[10%] w-72 h-72 rounded-full blur-3xl transition-colors duration-700 ${theme.blobA}`} />
      <div className={`absolute bottom-10 right-[8%] w-80 h-80 rounded-full blur-3xl transition-colors duration-700 ${theme.blobB}`} />

      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="relative">
          {/* Slides */}
          {slides.map((s, idx) => {
            const isCurrent = idx === safeCurrent
            return (
              <div
                key={s.id}
                className={`transition-all duration-700 ease-in-out ${isCurrent ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 absolute inset-0 pointer-events-none'}`}
                style={{ display: isCurrent || idx === (safeCurrent + 1) % count ? '' : 'none' }}
              >
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <p className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-6 ${theme.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme.pillDot}`} />
                      {s.badge}
                    </p>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                      {s.title}
                      {s.titleAccent && (
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.gradient}`}> {s.titleAccent}</span>
                      )}
                    </h1>

                    <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                      {s.description}
                    </p>

                    {(s.ctaLabel || s.secondaryLabel) && (
                      <div className="flex flex-wrap gap-3 mt-8">
                        {s.ctaLabel && s.ctaTo && (
                          <Link
                            to={s.ctaTo}
                            className={`inline-flex items-center px-7 py-3 rounded-xl text-white text-sm font-bold hover:shadow-lg transition-all active:scale-[0.98] ${theme.cta} ${theme.shadow}`}
                          >
                            {s.ctaLabel}
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                          </Link>
                        )}
                        {s.secondaryLabel && s.secondaryTo && (
                          <Link
                            to={s.secondaryTo}
                            className="inline-flex items-center px-7 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold hover:border-gray-300 dark:hover:border-gray-500 transition-all active:scale-[0.98]"
                          >
                            {s.secondaryLabel}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <SlideArt slide={s} />
                  </div>
                </div>
              </div>
            )
          })}

          {/* Prev / Next */}
          {count > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous slide"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-6 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all z-20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={next}
                aria-label="Next slide"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-6 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all z-20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {count > 1 && (
          <div className="flex items-center justify-center gap-2.5 mt-10">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${idx === safeCurrent ? 'w-8 h-2.5 bg-gradient-to-r ' + theme.gradient : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
