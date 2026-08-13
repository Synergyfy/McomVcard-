import FeatureSeo from '../../components/features/FeatureSeo'
import FeatureCategories from '../../components/features/FeatureCategories'
import { featuresForAudience } from '../../services/featuresConfig'
import FeatureCard from '../../components/features/FeatureCard'
import { Breadcrumb, CTASection, ContentSection } from '../../components/features/FeatureShared'
import { Link } from 'react-router-dom'

/* ------------------------------------------------------------------ */
/*  /features — the Features hub.                                      */
/*  The dedicated Features area is the FULLER catalogue (vs homepage   */
/*  highlighted cards) and is structured so more feature pages can be  */
/*  added over time.                                                   */
/* ------------------------------------------------------------------ */

export default function FeaturesHubPage() {
  const highlights = featuresForAudience('business').slice(0, 3)
  return (
    <>
      <FeatureSeo
        title="Features — Everything MCOM VCard Can Do"
        description="Explore the full MCOM VCard feature catalogue: business features and capabilities for business owners, consumer features for cashback, rewards, gifts, family & friends, and seasonal gift and reward experiences."
        path="/features"
        keywords={['MCOM VCard features', 'business vcard', 'consumer vcard', 'vcard rewards', 'vcard gifts', 'seasonal campaigns']}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'Features' },
            ]}
          />
          <p className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-4">
            MCOM VCard — the full catalogue
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold max-w-3xl">Features that do more</h1>
          <p className="mt-4 text-sm md:text-lg text-blue-50/90 max-w-2xl leading-relaxed">
            Business owners, consumers and the seasonal stories that connect them. This is the deeper feature catalogue
            beyond the homepage — structured to grow as MCOM VCard grows.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/features/business"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-blue-700 text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              Business features
            </Link>
            <Link
              to="/features/consumer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-purple-700 text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              Consumer features
            </Link>
            <Link
              to="/features/seasonal"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white text-sm font-bold hover:bg-white/10 transition-colors"
            >
              Seasonal experiences
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <FeatureCategories />

      {/* Sample of the fuller catalogue (distinct from homepage cards) */}
      <ContentSection
        badge="Beyond the homepage"
        title="Selected features, explained deeper"
        subtitle="A sample of the fuller feature information held in the catalogue. The dedicated Business and Consumer pages carry the complete set."
        tone="blue"
        className="bg-gray-50 dark:bg-gray-900"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((f) => (
            <FeatureCard key={f.id} feature={f} tone={f.category === 'consumer' ? 'purple' : 'blue'} />
          ))}
        </div>
        <div className="text-center mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/features/business"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            View all business features
          </Link>
          <Link
            to="/features/consumer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors"
          >
            View all consumer features
          </Link>
        </div>
      </ContentSection>

      {/* Relationship to memberships */}
      <ContentSection
        badge="Features vs membership"
        title="A feature explains what MCOM VCard can do"
        subtitle="Membership determines how much of a feature you can access. Features are described on these pages; access is driven by your membership entitlements — never hard-coded on the page."
        tone="blue"
        className="bg-white dark:bg-gray-950"
      >
        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Feature</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                What a capability does — reusable across audiences. For example Smart Contact Sharing is a{' '}
                <strong className="text-gray-700 dark:text-gray-200">Business + Consumer</strong> feature that appears on
                both the Business and Consumer pages from one underlying record.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Membership</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Which plan, tier or entitlement unlocks it. The membership configuration holds access rules — feature
                pages simply point to it.
              </p>
            </div>
          </div>
        </div>
      </ContentSection>

      <CTASection
        title="Ready to see MCOM VCard for your side?"
        subtitle="Businesses build and publish. Consumers collect from the businesses they trust. Both stories run all year with seasonal gifts and rewards."
        ctaLabel="Start your business"
        ctaTo="/register"
        secondaryLabel="I'm a consumer"
        secondaryTo="/find-a-business"
      />
    </>
  )
}