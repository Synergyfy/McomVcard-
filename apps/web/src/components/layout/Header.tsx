import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../common/LanguageSwitcher'
import ThemeToggle from '../common/ThemeToggle'
import Logo from '../common/Logo'
import { useAuth } from '../../contexts/AuthContext'
import { FeaturesDesktopMenu, FeaturesMobileAccordion } from './FeaturesMenu'
import FeatureIcon from '../features/FeatureIcon'

export default function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const { isAuthenticated, user, isImpersonating, stopImpersonating } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/', label: t('nav.home'), hash: '#home' },
    { to: '/about', label: 'About', hash: '' },
    { to: '/membership', label: t('nav.pricing'), hash: '' },
    { to: '/contact', label: t('nav.contact'), hash: '' },
  ]

   const isActive = (path: string) => {
     if (path === '/') return location.pathname === '/'
     return location.pathname + location.hash === path
   }

   function ActiveDot() {
     return <span className="ml-auto mt-1 w-2 h-2 rounded-full bg-current shrink-0" aria-hidden="true" />;
   }

    function PricingDropdown({ onNavigate }: { onNavigate?: () => void } = {}) {
      const [searchParams] = useSearchParams()
      const audience = searchParams.get('audience') as 'business' | 'consumer' | null
      const isBusinessActive = audience === 'business'
      const isConsumerActive = audience === 'consumer'
      const isActive = isBusinessActive || isConsumerActive

       const [open, setOpen] = useState(false)
       const timeoutRef = useRef<number | undefined>(undefined)

       // Close on Escape
       useEffect(() => {
         if (!open) return
         const onKey = (e: KeyboardEvent) => {
           if (e.key === 'Escape') closeMenu()
         }
         document.addEventListener('keydown', onKey)
         return () => document.removeEventListener('keydown', onKey)
       }, [open])

       const openMenu = () => {
        window.clearTimeout(timeoutRef.current)
        setOpen(true)
      }
      const closeMenu = () => {
        setOpen(false)
        if (onNavigate) {
          onNavigate()
        }
      }
      const scheduleClose = () => {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = window.setTimeout(closeMenu, 180)
      }

      return (
        <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose} onClick={closeMenu}>
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="true"
            onClick={(e) => {
              e.stopPropagation();
              openMenu();
            }}
            onMouseEnter={openMenu}
            onFocus={openMenu}
            className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t('nav.pricing')}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute left-0 top-full pt-2 w-[200px] z-50">
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-2 animate-slideDown">
                 <Link
                   to="/membership?audience=business"
                   onClick={closeMenu}
                   className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors ${
                     isBusinessActive
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
                  {isBusinessActive && <ActiveDot />}
                </Link>

                 <Link
                   to="/membership?audience=consumer"
                   onClick={closeMenu}
                   className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors ${
                     isConsumerActive
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
                  {isConsumerActive && <ActiveDot />}
                </Link>
              </div>
            </div>
          )}
        </div>
      )
    }

   return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.slice(0, 1).map((link) => (
            <Link
              key={link.to + link.hash}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <FeaturesDesktopMenu />

           {navLinks.slice(1).map((link) => {
             if (link.to === '/membership') {
               return <PricingDropdown key="pricing-dropdown" />;
             }
             return (
               <Link
                 key={link.to + link.hash}
                 to={link.to}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                   isActive(link.to)
                     ? 'text-blue-600 bg-blue-50'
                     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                 }`}
               >
                 {link.label}
               </Link>
             );
           })}
        </nav>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {isAuthenticated ? (
            <Link
              to="/b/dashboard"
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md hover:shadow-blue-200"
            >
              {t('nav.dashboard')}
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all duration-200 hover:shadow-md hover:shadow-orange-200"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                {t('nav.login')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Impersonation banner */}
      {isImpersonating && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 flex items-center justify-center gap-2">
          <span>{t('auth.impersonate_banner', { name: user?.name })}</span>
          <button
            onClick={stopImpersonating}
            className="underline font-medium hover:text-yellow-900"
          >
            {t('auth.stop_impersonating')}
          </button>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white px-4 py-4 space-y-1 animate-slideDown">
          {navLinks.slice(0, 1).map((link) => (
            <Link
              key={link.to + link.hash}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <FeaturesMobileAccordion onNavigate={() => setMobileOpen(false)} />

           {navLinks.slice(1).map((link) => {
             if (link.to === '/membership') {
               return <PricingDropdown key="pricing-dropdown-mobile" onNavigate={() => setMobileOpen(false)} />;
             }
             return (
               <Link
                 key={link.to + link.hash}
                 to={link.to}
                 onClick={() => setMobileOpen(false)}
                 className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                   isActive(link.to)
                     ? 'text-blue-600 bg-blue-50'
                     : 'text-gray-600 hover:bg-gray-50'
                 }`}
               >
                 {link.label}
               </Link>
             );
           })}
          <div className="pt-2 px-4 flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <div className="pt-2">
            {isAuthenticated ? (
              <Link
                to="/b/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg"
              >
                {t('nav.dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-lg mb-2"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg"
                >
                  {t('nav.login')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
