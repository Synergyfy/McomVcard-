import { Link } from 'react-router-dom'
import { FEATURE_CATEGORIES } from '../../services/featuresConfig'
import FeatureIcon from './FeatureIcon'

/* ------------------------------------------------------------------ */
/*  Features hub — the three primary categories.                       */
/* ------------------------------------------------------------------ */

export default function FeatureCategories() {
  return (
    <section className="py-14 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="inline-block px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
            MCOM VCard Features
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            One product, three feature stories
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Business owners and consumers use MCOM VCard differently — and seasonal stories run across both.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURE_CATEGORIES.map((cat) => {
            const isBlue = cat.tone === 'blue'
            return (
              <Link
                key={cat.id}
                to={cat.route}
                className={`group relative overflow-hidden rounded-3xl border bg-white dark:bg-gray-900 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isBlue
                    ? 'border-blue-100 dark:border-blue-500/20 hover:border-blue-200'
                    : 'border-purple-100 dark:border-purple-500/20 hover:border-purple-200'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5 ${
                    isBlue
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-br from-purple-500 to-fuchsia-600'
                  }`}
                >
                  <FeatureIcon name={cat.icon} className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                  {cat.id === 'business' && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      Business
                    </span>
                  )}
                  {cat.id === 'consumer' && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      Consumer
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{cat.tagline}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{cat.description}</p>
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                    isBlue ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
                  }`}
                >
                  View {cat.name} features
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function CategoryIntro({ categoryId }: { categoryId: 'business' | 'consumer' }) {
  const cat = FEATURE_CATEGORIES.find((c) => c.id === categoryId)
  if (!cat) return null
  const isBlue = cat.tone === 'blue'
  return (
    <section className={`py-12 md:py-16 bg-white dark:bg-gray-950`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-3xl">
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
              isBlue
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
            }`}
          >
            <FeatureIcon name={cat.icon} className="w-4 h-4" />
            {cat.name} features
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{cat.description}</h2>
        </div>
      </div>
    </section>
  )
}