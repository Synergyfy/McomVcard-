import { Link } from 'react-router-dom'
import type { SeasonalContent, SeasonalEvent } from '../../services/seasonalConfig'
import { getSeasonalEvents, getSeasonalGiftEvents, getSeasonalRewardEvents } from '../../services/seasonalConfig'
import FeatureIcon from '../features/FeatureIcon'
import { SectionHeading } from '../landing/SectionHeading'

/* ------------------------------------------------------------------ */
/*  Seasonal events — the 90-day period with its multiple events.      */
/*  One season can contain several events (holidays, Black Friday,     */
/*  Christmas...) — each rendered as a card.                           */
/* ------------------------------------------------------------------ */

interface EventCardProps {
  event: SeasonalEvent
}

function EventCard({ event }: EventCardProps) {
  const isGift = event.eventType === 'gift'
  const to = isGift ? '/features/seasonal/gifts' : '/features/seasonal/rewards'
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5 ${
          isGift ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'
        }`}
      >
        <FeatureIcon name={isGift ? 'present' : 'gift'} className="w-6 h-6" />
      </div>
      <span
        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide mb-3 ${
          isGift
            ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400'
            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
        }`}
      >
        {isGift ? 'Gift' : 'Reward'}
      </span>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{event.title}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{event.message}</p>
      {event.cta && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
          {event.cta.label}
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </Link>
  )
}

export function SeasonalEventsSection({ content }: { content: SeasonalContent }) {
  const events = getSeasonalEvents(content)
  if (events.length === 0) return null
  return (
    <section className="py-14 md:py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="The 90-day period"
          title="Events within this season"
          subtitle="A seasonal period can carry several events — gifts, rewards and promotions — released as the season runs."
          tone="orange"
        />
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Seasonal Gifts vs Rewards — cross-linked story cards.              */
/* ------------------------------------------------------------------ */

export function SeasonalGiftRewardSplit({ content }: { content: SeasonalContent }) {
  const gifts = getSeasonalGiftEvents(content)
  const rewards = getSeasonalRewardEvents(content)
  if (gifts.length === 0 && rewards.length === 0) return null

  const gift = gifts[0]
  const reward = rewards[0]

  return (
    <section className="py-14 md:py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="Two seasonal stories"
          title="Gifts and Rewards"
          subtitle="Seasonal Gifts and Seasonal Rewards are separate stories — connected, but distinct."
          tone="orange"
        />
        <div className="grid md:grid-cols-2 gap-6">
          <SeasonalStoryCard
            kind="gift"
            title={gift?.title ?? 'Seasonal Gifts'}
            message={
              gift?.message ??
              'Give something back this season. Gift vouchers and e-cards are issued through participating businesses and held in the consumer wallet.'
            }
            to="/features/seasonal/gifts"
          />
          <SeasonalStoryCard
            kind="reward"
            title={reward?.title ?? 'Seasonal Rewards'}
            message={
              reward?.message ??
              'Earn more from every visit this season. Businesses run reward campaigns and issue rewards to their customers.'
            }
            to="/features/seasonal/rewards"
          />
        </div>
      </div>
    </section>
  )
}

function SeasonalStoryCard({ kind, title, message, to }: { kind: 'gift' | 'reward'; title: string; message: string; to: string }) {
  const isGift = kind === 'gift'
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-3xl border p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${
        isGift
          ? 'border-pink-100 dark:border-pink-500/20 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-500/10 dark:to-gray-900'
          : 'border-amber-100 dark:border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-gray-900'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5 ${
          isGift ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'
        }`}
      >
        <FeatureIcon name={isGift ? 'present' : 'gift'} className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
      <span
        className={`mt-6 inline-flex items-center gap-1.5 text-sm font-bold ${
          isGift ? 'text-pink-600 dark:text-pink-400' : 'text-amber-600 dark:text-amber-400'
        }`}
      >
        {isGift ? 'Explore Seasonal Gifts' : 'Explore Seasonal Rewards'}
        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  )
}