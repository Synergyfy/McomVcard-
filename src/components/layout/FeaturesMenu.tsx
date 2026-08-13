import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FeatureIcon from '../features/FeatureIcon'

/* ------------------------------------------------------------------ */
/*  Features navigation menu.                                          */
/*                                                                     */
/*  FEATURES                                                           */
/*   ├── Business        /features/business                            */
/*   └── Consumer        /features/consumer                            */
/*                                                                     */
/*  Desktop: mega dropdown with hover + click + keyboard navigation.   */
/*  Mobile:  accessible accordion.                                     */
/* ------------------------------------------------------------------ */

export interface FeaturesMenuProps {
  variant: 'desktop' | 'mobile'
  onNavigate?: () => void
}

type ActivePath = 'business' | 'consumer' | null

function resolveActive(pathname: string): ActivePath {
  if (pathname.startsWith('/features/business')) return 'business'
  if (pathname.startsWith('/features/consumer')) return 'consumer'
  return null
}

const NAV_TRANSLATIONS = {
  features: 'Features',
  business: 'Business',
  consumer: 'Consumer',
}

export function featuresNavLabels() {
  return NAV_TRANSLATIONS
}

/* ================================================================== */
/*  Desktop mega dropdown                                              */
/* ================================================================== */

export function FeaturesDesktopMenu({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const active = resolveActive(location.pathname)
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  const isFeaturesActive = active !== null

  const openMenu = () => {
    window.clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  const closeMenu = () => {
    setOpen(false)
  }
  const scheduleClose = () => {
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(closeMenu, 180)
  }

  /* Close on Escape. */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  /* Close when routing away. */
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      {/* Trigger — also a real link so Features is clickable on its own. */}
      <Link
        to="/features"
        aria-expanded={open}
        aria-haspopup="true"
        onFocus={openMenu}
        className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isFeaturesActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        {NAV_TRANSLATIONS.features}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>

      {open && (
        <div className="absolute left-0 top-full pt-2 w-[300px] z-50">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-2 animate-slideDown">
            {/* Business */}
            <Link
              to="/features/business"
              onClick={() => onNavigate?.()}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors ${
                active === 'business'
                  ? 'bg-blue-50 dark:bg-blue-500/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FeatureIcon name="briefcase" className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Business</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Features and capabilities for business owners</p>
              </div>
              {active === 'business' && <ActiveDot />}
            </Link>

            {/* Consumer */}
            <Link
              to="/features/consumer"
              onClick={() => onNavigate?.()}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors ${
                active === 'consumer'
                  ? 'bg-purple-50 dark:bg-purple-500/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FeatureIcon name="wallet" className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Consumer</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Features and capabilities for consumers</p>
              </div>
              {active === 'consumer' && <ActiveDot />}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ActiveDot() {
  return <span className="ml-auto mt-1 w-2 h-2 rounded-full bg-current shrink-0" aria-hidden="true" />
}

/* ================================================================== */
/*  Mobile accordion                                                   */
/* ================================================================== */

export function FeaturesMobileAccordion({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const active = resolveActive(location.pathname)
  const [featuresOpen, setFeaturesOpen] = useState(false)

  const linkCls = (isActive: boolean, accent: 'blue' | 'purple') => {
    const base = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full'
    if (isActive) {
      const map =
        accent === 'blue'
          ? 'text-blue-600 bg-blue-50'
          : 'text-purple-600 bg-purple-50'
      return `${base} ${map}`
    }
    return `${base} text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`
  }

  return (
    <div className="space-y-1">
      {/* FEATURES accordion trigger */}
      <button
        type="button"
        aria-expanded={featuresOpen}
        onClick={() => setFeaturesOpen(!featuresOpen)}
        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active !== null ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <span>{NAV_TRANSLATIONS.features}</span>
        <svg
          className={`w-4 h-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {featuresOpen && (
        <div className="pl-3 space-y-1 border-l-2 border-gray-100 dark:border-gray-800 ml-3">
          <Link to="/features/business" onClick={onNavigate} className={linkCls(active === 'business', 'blue')}>
            <FeatureIcon name="briefcase" className="w-4.5 h-4.5 shrink-0" />
            Business
          </Link>

          <Link to="/features/consumer" onClick={onNavigate} className={linkCls(active === 'consumer', 'purple')}>
            <FeatureIcon name="wallet" className="w-4.5 h-4.5 shrink-0" />
            Consumer
          </Link>
        </div>
      )}
    </div>
  )
}