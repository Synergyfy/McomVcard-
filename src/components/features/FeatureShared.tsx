import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeading } from '../landing/SectionHeading'
import FeatureIcon from './FeatureIcon'

/* ------------------------------------------------------------------ */
/*  Small building blocks shared by the Feature and Seasonal pages.    */
/* ------------------------------------------------------------------ */

interface ContentSectionProps {
  badge?: string
  title: ReactNode
  subtitle?: string
  tone?: 'orange' | 'blue' | 'purple'
  children: ReactNode
  className?: string
}

/** Section with a consistent SectionHeading + body. */
export function ContentSection({ badge, title, subtitle, tone = 'orange', children, className }: ContentSectionProps) {
  return (
    <section className={`py-14 md:py-20 ${className ?? 'bg-white dark:bg-gray-950'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading badge={badge} title={title} subtitle={subtitle} tone={tone} />
        {children}
      </div>
    </section>
  )
}

interface HowItWorksProps {
  steps: string[]
  tone?: 'orange' | 'blue' | 'purple'
  icon?: string
  className?: string
}

/** "How it works" numbered steps. */
export function HowItWorks({ steps, tone = 'blue', icon, className }: HowItWorksProps) {
  const accents: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  }
  return (
    <div className={`bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 md:p-8 ${className ?? ''}`}>
      <div className="flex items-center gap-2 mb-6">
        {icon && <FeatureIcon name={icon} className={`w-5 h-5 ${accents[tone]}`} />}
        <h3 className="text-base font-bold text-gray-900 dark:text-white">How it works</h3>
      </div>
      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-4">
            <span
              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-extrabold ${accents[tone]}`}
            >
              {i + 1}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-1">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

interface BenefitsProps {
  benefits: string[]
  tone?: 'orange' | 'blue' | 'purple'
  className?: string
}

/** Bulleted benefits column. */
export function Benefits({ benefits, tone = 'blue', className }: BenefitsProps) {
  const dotColor: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }
  return (
    <div className={`rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8 ${className ?? ''}`}>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">Benefits</h3>
      <ul className="space-y-3">
        {benefits.map((b, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <span className={`mt-1.5 w-2 h-2 rounded-full ${dotColor[tone]}`} />
            {b}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface RelatedFeatureProps {
  /** Same feature shown in other audience contexts. */
  related: { name: string; to?: string; audience: string }[]
}

export function RelatedFeatures({ related }: RelatedFeatureProps) {
  if (!related.length) return null
  return (
    <div className="mt-10">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Related features</h4>
      <div className="flex flex-wrap gap-3">
        {related.map((r, i) =>
          r.to ? (
            <Link
              key={i}
              to={r.to}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {r.name}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {r.name}
            </span>
          )
        )}
      </div>
    </div>
  )
}

interface CTASectionProps {
  title: string
  subtitle?: string
  ctaLabel: string
  ctaTo: string
  secondaryLabel?: string
  secondaryTo?: string
  tone?: 'orange' | 'blue' | 'purple'
}

/** Consistent final call-to-action band. */
export function CTASection({
  title,
  subtitle,
  ctaLabel,
  ctaTo,
  secondaryLabel,
  secondaryTo,
  tone = 'orange',
}: CTASectionProps) {
  const bg =
    tone === 'blue'
      ? 'from-blue-600 to-indigo-800'
      : tone === 'purple'
        ? 'from-purple-600 to-indigo-800'
        : 'from-orange-500 to-purple-700'
  const secondary = {
    orange: 'border-white/30 text-white hover:bg-white/10',
    blue: 'border-white/30 text-white hover:bg-white/10',
    purple: 'border-white/30 text-white hover:bg-white/10',
  }[tone]

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bg} text-white px-6 py-12 md:px-12 md:py-16 text-center`}>
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative text-2xl md:text-4xl font-extrabold">{title}</h2>
          {subtitle && <p className="relative mt-3 text-sm md:text-base text-white/70 max-w-2xl mx-auto">{subtitle}</p>}
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={ctaTo}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-gray-900 text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              {ctaLabel}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            {secondaryLabel && secondaryTo && (
              <Link
                to={secondaryTo}
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border text-sm font-bold transition-all ${secondary}`}
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* Breadcrumb helper component. */
export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-400">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg className="w-3 h-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.to ? (
              <Link to={item.to} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500 dark:text-gray-300">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}