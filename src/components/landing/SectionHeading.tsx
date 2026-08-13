/* Shared section heading used across the MCOM VCard landing pages. */

export function SectionHeading({ badge, title, subtitle, tone = 'orange', align = 'center' }: {
  badge?: string
  title: React.ReactNode
  subtitle?: string
  tone?: 'orange' | 'blue' | 'purple'
  align?: 'center' | 'left'
}) {
  const badgeTones: Record<string, string> = {
    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  }
  return (
    <div className={align === 'center' ? 'text-center mb-10' : 'text-left mb-8'}>
      {badge && (
        <p className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${badgeTones[tone]}`}>
          {badge}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && (
        <p className={`text-gray-500 dark:text-gray-400 mt-3 ${align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
