import { Link } from 'react-router-dom'
import type { FeatureConfig } from '../../services/featuresConfig'
import FeatureIcon from './FeatureIcon'
import AudienceBadge from './AudienceBadge'

interface FeatureCardProps {
  feature: FeatureConfig
  tone?: 'blue' | 'purple'
  /** When false (e.g. inside an expandable grid) the card renders as a
      pure container so it can be wrapped in a button. */
  interactive?: boolean
}

export default function FeatureCard({ feature, tone = 'blue', interactive = true }: FeatureCardProps) {
  const iconBg =
    tone === 'purple'
      ? 'bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400'
      : 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400'

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <FeatureIcon name={feature.icon} className="w-6 h-6" />
        </div>
        <AudienceBadge audience={feature.audience} />
      </div>
      <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">{feature.name}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
      {feature.route && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
          Learn more
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </>
  )

  const cls =
    'relative flex flex-col rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'

  if (interactive && feature.route) {
    return (
      <Link to={feature.route} className={`${cls} hover:border-blue-200 dark:hover:border-blue-500/30`}>
        {content}
      </Link>
    )
  }
  return <div className={cls}>{content}</div>
}