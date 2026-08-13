import { Link } from 'react-router-dom'
import type { SeasonalContent, SeasonalEvent } from '../../services/seasonalConfig'
import { BodySeasonalVideo } from './BodySeasonalVideo'
import FeatureIcon from '../features/FeatureIcon'
import { Breadcrumb, HowItWorks } from '../features/FeatureShared'
import { SectionHeading } from '../landing/SectionHeading'

/* ------------------------------------------------------------------ */
/*  SeasonalStoryPage — the shared structure used by BOTH the Gifts    */
/*  and Rewards seasonal pages.                                        */
/*                                                                     */
/*  Gifts and Rewards are separate pages but share this layout. Each   */
/*  renders its own season content and cross-links to the other.       */
/* ------------------------------------------------------------------ */

interface SeasonalStoryPageProps {
  kind: 'gift' | 'reward'
  content: SeasonalContent
  events: SeasonalEvent[]
}

export default function SeasonalStoryPage({ kind, content, events }: SeasonalStoryPageProps) {
  const isGift = kind === 'gift'
  const title = isGift ? 'Seasonal Gifts' : 'Seasonal Rewards'
  const heroTitle = isGift ? 'Seasonal Gift experience' : 'Seasonal Rewards experience'
  const gradient = isGift
    ? 'from-pink-600 via-rose-600 to-orange-500'
    : 'from-amber-500 via-orange-500 to-purple-600'
  const other = isGift
    ? { label: 'Explore Seasonal Rewards', to: '/features/seasonal/rewards', cls: 'border-amber-300/40 hover:bg-amber-500/10' }
    : { label: 'Explore Seasonal Gifts', to: '/features/seasonal/gifts', cls: 'border-pink-300/40 hover:bg-pink-500/10' }

  const primaryEvent = events[0]

  return (
    <>
      {/* Hero */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${gradient} text-white`}>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'Features', to: '/features' },
              { label: 'Seasonal', to: '/features/seasonal' },
              { label: title },
            ]}
          />
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-4">
            <FeatureIcon name={isGift ? 'present' : 'gift'} className="w-4 h-4" />
            {title}
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold max-w-3xl">{heroTitle}</h1>
          <p className="mt-4 text-sm md:text-lg text-white/85 max-w-2xl leading-relaxed">
            {content.heroMessage} The seasonal {isGift ? 'gift' : 'reward'} story is configured for{' '}
            <strong className="font-bold text-white">{content.heroTitle}</strong>.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {primaryEvent?.cta && (
              <Link
                to={primaryEvent.cta.to}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-gray-900 text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                {primaryEvent.cta.label}
              </Link>
            )}
            <Link
              to={other.to}
              className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border text-white text-sm font-bold transition-colors ${other.cls}`}
            >
              {other.label}
            </Link>
          </div>
        </div>
      </section>

      {/* Gift/Reward explanation */}
      <section className="py-14 md:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            badge={isGift ? 'Gifts' : 'Rewards'}
            title={primaryEvent?.title ?? title}
            subtitle={
              primaryEvent?.message ??
              (isGift
                ? 'Gift vouchers and e-cards are issued through participating businesses and held in the consumer wallet.'
                : 'Rewards are issued to consumers by participating businesses and redemption is tracked in the wallet and VCard.')
            }
            tone={isGift ? 'purple' : 'orange'}
          />

          <div className="grid md:grid-cols-2 gap-6 mt-2">
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
                <FeatureIcon
                  name={isGift ? 'present' : 'gift'}
                  className="w-5 h-5 text-orange-500 dark:text-orange-400"
                />
                What is the {isGift ? 'gift' : 'reward'}?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {isGift
                  ? 'A seasonal gift is a voucher or e-card issued to a consumer — a way to share value with the people around you and support participating businesses during this season.'
                  : 'A seasonal reward is issued to a consumer as they take part in a business’ campaign. Rewards are held in the VCard wallet and redeemed where accepted.'}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
                <FeatureIcon name="users" className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                Who is it for?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {isGift
                  ? 'Consumers give and receive gifts through participating businesses. The exact eligibility for each seasonal gift is set by the campaign configuration.'
                  : 'Consumers receive rewards from participating businesses. The exact eligibility and membership relationship for each seasonal reward are set by the campaign configuration.'}
              </p>
            </div>
          </div>

          {primaryEvent?.eligibility || primaryEvent?.membershipNote ? (
            <div className="mt-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Eligibility &amp; membership</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {primaryEvent.eligibility && (
                  <div>
                    <p className="font-semibold text-gray-500 dark:text-gray-400 uppercase text-[11px] tracking-wide mb-1">Eligibility</p>
                    {primaryEvent.eligibility}
                  </div>
                )}
                {primaryEvent.membershipNote && (
                  <div>
                    <p className="font-semibold text-gray-500 dark:text-gray-400 uppercase text-[11px] tracking-wide mb-1">Membership</p>
                    {primaryEvent.membershipNote}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <NoteMembershipAccess />
          )}
        </div>
      </section>

      {/* How the seasonal gift/reward works */}
      <section className="py-14 md:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeading
            badge="How it works"
            title={isGift ? 'How the seasonal gift works' : 'How the seasonal reward works'}
            tone={isGift ? 'purple' : 'orange'}
          />
          <HowItWorks
            steps={
              primaryEvent?.howItWorks ?? [
                'A participating business runs the seasonal campaign',
                isGift
                  ? 'The gift is issued and held in the consumer wallet'
                  : 'Rewards are issued to the consumer VCard and wallet',
                isGift ? 'Use the gift within the seasonal window' : 'Redeem the reward where accepted',
              ]
            }
            tone={isGift ? 'purple' : 'orange'}
            icon={isGift ? 'present' : 'gift'}
          />
        </div>
      </section>

      {/* Seasonal video for this story */}
      <BodySeasonalVideo content={content} kind={kind} />

      {/* Cross-link + CTA */}
      <section className="py-14 md:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className={`inline-flex flex-col items-center gap-4 rounded-3xl border p-8 md:p-10 w-full ${isGift ? 'border-pink-100 dark:border-pink-500/20' : 'border-amber-100 dark:border-amber-500/20'}`}>
            <FeatureIcon
              name={isGift ? 'gift' : 'present'}
              className={`w-10 h-10 ${isGift ? 'text-pink-500' : 'text-amber-500'}`}
            />
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              {isGift ? 'Gave a gift this season?' : 'Earning rewards this season?'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
              {isGift
                ? 'Gifts and rewards are connected stories. See the reward side of this season’s campaigns, too.'
                : 'Rewards and gifts are connected stories. See what seasonal gifts are available this season, too.'}
            </p>
            <Link
              to={other.to}
              className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl ${
                isGift
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                  : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white'
              } text-sm font-bold shadow-lg transition-all active:scale-[0.98]`}
            >
              {other.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function NoteMembershipAccess() {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-6">
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        <span className="font-bold text-gray-700 dark:text-gray-300">Access:</span> available according to membership.
        Membership entitlement configuration is not hard-coded here — it is driven by the membership entitlements for
        this campaign period.
      </p>
    </div>
  )
}