import FeatureSeo from '../../components/features/FeatureSeo'
import FeatureGrid from '../../components/features/FeatureGrid'
import { Breadcrumb, CTASection, ContentSection } from '../../components/features/FeatureShared'
import FeatureIcon from '../../components/features/FeatureIcon'
import { FEATURE_CATEGORIES, featuresForAudience } from '../../services/featuresConfig'
import { Link } from 'react-router-dom'
import { SectionHeading } from '../../components/landing/SectionHeading'

/* ------------------------------------------------------------------ */
/*  /features/consumer — the Consumer Features page.                   */
/*  The consumer story is genuinely different from the business one:   */
/*  receive rewards, give rewards, give gifts, and use the VCard for   */
/*  more value and access through the consumer experience.             */
/* ------------------------------------------------------------------ */

const CONSUMER_STORY = [
  { icon: 'coins', title: 'Cashback', desc: 'Get more back from participating businesses on every visit.' },
  { icon: 'gift', title: 'Receive rewards', desc: 'Rewards are issued to your VCard and wallet by the businesses you trust.' },
  { icon: 'present', title: 'Give rewards & gifts', desc: 'Share value with friends, family and the people around you.' },
  { icon: 'wallet', title: 'More value & access', desc: 'Wallet, offers, membership and family all in your consumer experience.' },
]

export default function ConsumerFeaturesPage() {
  const features = featuresForAudience('consumer')
  const cat = FEATURE_CATEGORIES.find((c) => c.id === 'consumer')!

  return (
    <>
      <FeatureSeo
        title="Consumer Features — Cashback, Rewards, Gifts, Family & Friends"
        description="Discover MCOM VCard from the consumer's perspective: cashback, rewards, friends & family, giving and receiving gifts, digital wallet, store cards and local offers — the way a consumer uses MCOM VCard is different."
        path="/features/consumer"
        keywords={['consumer vcard', 'consumer card', 'cashback', 'rewards', 'gifts', 'friends and family', 'vcard wallet']}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-800 text-white">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'Features', to: '/features' },
              { label: 'Consumer' },
            ]}
          />
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-4">
            <FeatureIcon name="wallet" className="w-4 h-4" />
            Consumer &mdash; made for how you spend
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold max-w-3xl">The way you use MCOM VCard is different</h1>
          <p className="mt-4 text-sm md:text-lg text-purple-50/90 max-w-2xl leading-relaxed">
            A business owner builds and issues. You collect, earn and share. MCOM VCard as a consumer means receiving
            rewards, giving rewards, giving gifts — and getting more value and access through your VCard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/features/business"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 transition-colors"
            >
              See the business story
            </Link>
          </div>
        </div>
      </section>

      {/* Consumer value proposition */}
      <section className="py-14 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            badge="The consumer story"
            title="Receive rewards, give rewards and give gifts"
            subtitle="Your VCard carries the value and access that matters to you — from the businesses you already trust."
            tone="purple"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONSUMER_STORY.map((s) => (
              <div
                key={s.title}
                className="rounded-3xl border border-purple-100 dark:border-purple-500/20 bg-white dark:bg-gray-900 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white flex items-center justify-center mb-4">
                  <FeatureIcon name={s.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full consumer catalogue */}
      <ContentSection
        badge={cat.tagline}
        title="Consumer features, explained"
        subtitle="Capabilities relevant to consumers — each tagged by audience. Features shared with business owners appear in both areas from a single record."
        tone="purple"
      >
        <div className="flex flex-wrap gap-3 mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wide">
            Consumer
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wide">
            Business + Consumer
          </span>
        </div>
        <FeatureGrid features={features} tone="purple" />
      </ContentSection>

      {/* Consumer how it starts */}
      <section className="py-14 md:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            badge="Where your card comes from"
            title="Your card starts with a business you trust"
            subtitle="Consumers receive their card from a participating business — never by purchasing access directly."
            tone="purple"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', text: 'Visit a participating business near you' },
              { step: '2', text: 'Receive your consumer card and VCard access invitation' },
              { step: '3', text: 'Sign in to MCOM and start collecting rewards, cashback and gifts' },
            ].map((s) => (
              <div key={s.step} className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
                <span className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-extrabold mb-4">
                  {s.step}
                </span>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/find-a-business"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors"
            >
              Find a participating business
            </Link>
          </div>
        </div>
      </section>

      {/* Membership relation */}
      <ContentSection
        badge="Feature vs membership"
        title="Feature access follows membership"
        subtitle="This page explains what each consumer feature does. How much you can access is driven by membership development — never hard-coded here."
        tone="purple"
        className="bg-gray-50 dark:bg-gray-900"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
          <span className="font-bold text-gray-700 dark:text-gray-300">Access note:</span> available according to
          membership. Your consumer membership position determines the extent of each feature. These pages describe
          capability only.
        </p>
      </ContentSection>

      <CTASection
        title="Your card is waiting — with a business you trust"
        subtitle="Find a participating business, receive your consumer card, then explore your VCard wallet of cashback, rewards and family & friends."
        ctaLabel="Find a Business"
        ctaTo="/find-a-business"
        secondaryLabel="Seasonal gifts & rewards"
        secondaryTo="/features/seasonal"
        tone="purple"
      />
    </>
  )
}