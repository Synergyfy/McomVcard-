import FeatureSeo from '../../components/features/FeatureSeo'
import FeatureGrid from '../../components/features/FeatureGrid'
import { Breadcrumb, CTASection, ContentSection } from '../../components/features/FeatureShared'
import FeatureIcon from '../../components/features/FeatureIcon'
import { FEATURE_CATEGORIES, featuresForAudience } from '../../services/featuresConfig'
import { Link } from 'react-router-dom'
import { SectionHeading } from '../../components/landing/SectionHeading'

/* ------------------------------------------------------------------ */
/*  /features/business — the Business Features page.                   */
/*  What can MCOM VCard do for my business?                            */
/*  Deeper feature explanation (vs the business landing marketing      */
/*  story). Audience-tagged with reusable feature records.             */
/* ------------------------------------------------------------------ */

export default function BusinessFeaturesPage() {
  const features = featuresForAudience('business')
  const cat = FEATURE_CATEGORIES.find((c) => c.id === 'business')!

  return (
    <>
      <FeatureSeo
        title="Business Features — What MCOM VCard Does for Your Business"
        description="Discover MCOM VCard for business owners: mobile VCard templates, smart contact sharing, business cards and VCards, appointment scheduling, analytics, campaigns, rewards and more — each with its audience tag and deeper feature explanation."
        path="/features/business"
        keywords={['business vcard', 'business card features', 'smart contact sharing', 'appointment scheduling', 'mcom vcard for business']}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'Features', to: '/features' },
              { label: 'Business' },
            ]}
          />
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-4">
            <FeatureIcon name="briefcase" className="w-4 h-4" />
            Business &mdash; features for business owners
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold max-w-3xl">What can MCOM VCard do for your business?</h1>
          <p className="mt-4 text-sm md:text-lg text-blue-50/90 max-w-2xl leading-relaxed">
            The landing page tells the marketing story. Here you'll find the deeper feature explanation — the
            capabilities available to business owners, each tagged by audience and expandable as the feature catalogue
            grows.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/features/consumer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-purple-700 text-sm font-bold hover:bg-purple-50 transition-colors"
            >
              See the consumer story
            </Link>
          </div>
        </div>
      </section>

      {/* Intro / answer to "what can it do" */}
      <ContentSection
        badge={cat.tagline}
        title="Business features, explained"
        subtitle="Every feature below is identified by its audience — Business, or Business + Consumer. Features useful to both audiences appear in both areas from one underlying record."
        tone="blue"
      >
        <div className="flex flex-wrap gap-3 mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wide">
            Business
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wide">
            Business + Consumer
          </span>
          <p className="text-xs text-gray-400 dark:text-gray-500 self-center ml-2">
            Audience classification comes from the product feature configuration.
          </p>
        </div>
        <FeatureGrid features={features} tone="blue" />
      </ContentSection>

      {/* Audience differentiation */}
      <section className="py-14 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            badge="Business + Consumer"
            title="Shared features, one record"
            subtitle="A feature like Smart Contact Sharing is useful to business owners and consumers. It appears on both pages without duplicating the underlying feature data."
            tone="blue"
          />
          <div className="rounded-3xl border border-indigo-100 dark:border-indigo-500/20 bg-white dark:bg-gray-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FeatureIcon name="share" className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Smart Contact Sharing</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    Business + Consumer
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Shared via QR code, NFC, smart link or messaging. A single feature record shown in both the Business
                  and Consumer feature sections — no duplicated data, one source of truth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership relation */}
      <ContentSection
        badge="Feature vs membership"
        title="What a feature does vs how much you can access"
        subtitle="This page explains what each feature does. Access to each feature is governed by membership entitlements — not hard-coded here."
        tone="blue"
        className="bg-white dark:bg-gray-950"
      >
        <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            <span className="font-bold text-gray-700 dark:text-gray-300">Access note:</span> available according to
            membership. Your plan and tier decide the extent of each feature. Membership entitlement configuration
            drives access — these pages describe capability only.
          </p>
        </div>
      </ContentSection>

      <CTASection
        title="Ready to put your business on a card?"
        subtitle="Create your digital card and VCard, issue them to customers and run rewards, campaigns and bookings — all from one membership."
        ctaLabel="Start your business"
        ctaTo="/register"
        secondaryLabel="I'm a consumer"
        secondaryTo="/features/consumer"
        tone="blue"
      />
    </>
  )
}