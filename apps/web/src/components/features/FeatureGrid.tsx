import { useState } from 'react'
import type { FeatureConfig } from '../../services/featuresConfig'
import FeatureCard from './FeatureCard'
import { HowItWorks, Benefits } from './FeatureShared'

/* ------------------------------------------------------------------ */
/*  FeatureGrid — cards plus an expandable detail drawer.              */
/*  Deeper feature information lives here (not the homepage cards).    */
/* ------------------------------------------------------------------ */

interface FeatureGridProps {
  features: FeatureConfig[]
  tone?: 'blue' | 'purple'
}

export default function FeatureGrid({ features, tone = 'blue' }: FeatureGridProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = openId ? features.find((f) => f.id === openId) : null

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setOpenId(openId === f.id ? null : f.id)}
            aria-expanded={openId === f.id}
            className="text-left h-full w-full"
          >
            <FeatureCard feature={f} tone={tone} interactive={false} />
          </button>
        ))}
      </div>

      {/* Expandable detail section */}
      {open && (
        <FeatureDetail feature={open} tone={tone} onClose={() => setOpenId(null)} />
      )}
    </div>
  )
}

function FeatureDetail({ feature, tone, onClose }: { feature: FeatureConfig; tone: 'blue' | 'purple'; onClose: () => void }) {
  const hasLong = Boolean(feature.longDescription)
  const howItWorks = feature.howItWorks?.length ? feature.howItWorks : null
  const benefits = feature.benefits?.length ? feature.benefits : null

  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-6 md:p-10 animate-fadeInUp">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">{feature.name}</h3>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="tap-target shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
        {hasLong ? feature.longDescription : feature.description}
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {howItWorks && <HowItWorks steps={howItWorks} tone={tone} className="bg-gray-50 dark:bg-gray-800/40" />}
        {benefits && <Benefits benefits={benefits} tone={tone} />}
      </div>
    </div>
  )
}