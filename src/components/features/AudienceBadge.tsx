import type { FeatureAudience } from '../../services/featuresConfig'

const AUDIENCE_STYLES: Record<FeatureAudience, { label: string; cls: string }> = {
  business: { label: 'Business', cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  consumer: { label: 'Consumer', cls: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  both: { label: 'Business + Consumer', cls: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
}

export default function AudienceBadge({ audience, size = 'sm' }: { audience: FeatureAudience; size?: 'sm' | 'md' }) {
  const cfg = AUDIENCE_STYLES[audience]
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wide ${cfg.cls} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
    >
      {cfg.label}
    </span>
  )
}