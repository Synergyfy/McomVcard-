/* ------------------------------------------------------------------ */
/*  Seasonal content framework — /features/seasonal, gifts and rewards. */
/*                                                                     */
/*  Seasonal is NOT a static page. It is a reusable, config-driven     */
/*  framework that renders whatever season is currently active. The    */
/*  backend/admin controls season windows (catalogStore seasons) and    */
/*  centrally supplied seasonal content (this config / future API).    */
/*                                                                     */
/*  Design notes (from the product brief):                             */
/*   - One season = one 90-day campaign period.                        */
/*   - A 90-day period can contain MULTIPLE events (Valentine's,       */
/*     Mother's Day, bank holidays, Black Friday, Christmas...).        */
/*   - Each event can carry its own gift + reward + video + CTA.        */
/*   - Gift and Reward are separate stories with dedicated pages.       */
/*   - UI must automatically handle inactive/expired seasons.           */
/* ------------------------------------------------------------------ */

import { loadSeasons, seasonStatus, getSeason, type Season } from './catalogStore'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SeasonalEventType = 'gift' | 'reward' | 'promotion'

export interface SeasonalEvent {
  id: string
  name: string
  eventType: SeasonalEventType
  title: string
  message: string
  /** Optional narrower dates inside the season window. */
  startDate?: string
  endDate?: string
  video?: { src: string; title: string; subtitle: string }
  image?: string
  eligibility?: string
  membershipNote?: string
  /** How the gift/reward works. */
  howItWorks?: string[]
  cta?: { label: string; to: string }
  /** Cross-reference to the related VCard / campaign. */
  relatedVCard?: string
  relatedCampaign?: string
}

export interface SeasonalContent {
  seasonId: string
  /** Configurable label above the seasonal hero. Default "CURRENT SEASON". */
  heroHeading: string
  heroTitle: string
  heroMessage: string
  video?: { src: string; title: string; subtitle: string }
  campaignName?: string
  /** Purpose string shown as a badge. */
  purposeLabel?: string
  /** Events inside this season's 90-day period. */
  events?: SeasonalEvent[] | null
  primaryCta?: { label: string; to: string }
}

/* ------------------------------------------------------------------ */
/*  Centrally supplied seasonal content keyed by season id.            */
/*                                                                     */
/*  Data-driven: to launch a new season, admins add an entry below     */
/*  (or, once a backend exists, this is fetched from a CMS / API).     */
/*  No page code changes are required.                                 */
/*                                                                     */
/*  IMPORTANT: Do not hard-code campaigns as permanent. Values here    */
/*  are examples/presets for the current configured season — replace   */
/*  via configuration, not code.                                       */
/* ------------------------------------------------------------------ */

const SEASONAL_CONTENT: Record<string, SeasonalContent> = {
  'sea-summer-2026': {
    seasonId: 'sea-summer-2026',
    heroHeading: 'Current Season',
    heroTitle: 'Summer Season 2026',
    heroMessage:
      'Summer is all about the places you love and the people around you. During the Summer Season, participating businesses run seasonal gifts, rewards and promotions through MCOM VCard.',
    campaignName: 'Summer Seasonal Programme',
    purposeLabel: 'Summer',
    video: {
      src: '',
      title: 'MCOM VCard — Summer Season',
      subtitle:
        'One video for the whole season: what MCOM is doing, the seasonal message and how businesses and consumers take part.',
    },
    events: [
      {
        id: 'sea-summer-2026-gifts',
        name: 'Summer Gifts',
        eventType: 'gift',
        title: 'Summer Gift Campaign',
        message:
          'Give something back this summer. Seasonal gift vouchers and e-cards are issued through participating businesses and held in the consumer wallet.',
        howItWorks: ['A participating business issues a seasonal gift', 'The gift is delivered to your wallet', 'Use it within the seasonal window'],
        cta: { label: 'Explore Summer Gifts', to: '/features/seasonal/gifts' },
      },
      {
        id: 'sea-summer-2026-rewards',
        name: 'Summer Rewards',
        eventType: 'reward',
        title: 'Summer Rewards Campaign',
        message:
          'Earn more from every visit. Businesses run reward campaigns throughout the season and rewards are issued straight to your VCard and wallet.',
        howItWorks: ['Visit a participating business', 'Rewards are issued as you take part', 'Redeem them where accepted'],
        cta: { label: 'Explore Summer Rewards', to: '/features/seasonal/rewards' },
      },
    ],
    primaryCta: { label: 'Find a participating business', to: '/find-a-business' },
  },
  'sea-holidays-2026': {
    seasonId: 'sea-holidays-2026',
    heroHeading: 'Current Season',
    heroTitle: 'Holiday Season 2026',
    heroMessage:
      'The festive holiday window is a central seasonal period with gifts and rewards running across the ecosystem. Seasonal content is configured centrally and appears here automatically.',
    campaignName: 'Holiday Seasonal Programme',
    purposeLabel: 'Holidays',
    video: {
      src: '',
      title: 'MCOM VCard — Holiday Season',
      subtitle:
        'The overall seasonal video: the holiday message, what MCOM is doing and how you can take part.',
    },
    events: [
      {
        id: 'sea-holidays-2026-gifts',
        name: 'Holiday Gifts',
        eventType: 'gift',
        title: 'Holiday Gift Campaign',
        message:
          'Give the gift of your local businesses this season. Seasonal gift vouchers and e-cards are shared through participating businesses.',
        howItWorks: ['Choose a holiday gift from a participating business', 'Send or receive it in your wallet', 'Use it before the window closes'],
        cta: { label: 'Explore Holiday Gifts', to: '/features/seasonal/gifts' },
      },
      {
        id: 'sea-holidays-2026-rewards',
        name: 'Holiday Rewards',
        eventType: 'reward',
        title: 'Holiday Rewards Campaign',
        message:
          'Extra rewards through the holiday period. Businesses run festive reward campaigns and issue rewards to their customers.',
        howItWorks: ['Take part in a seasonal reward campaign', 'Rewards are issued to your VCard', 'Redeem before the season ends'],
        cta: { label: 'Explore Holiday Rewards', to: '/features/seasonal/rewards' },
      },
    ],
    primaryCta: { label: 'Find a participating business', to: '/find-a-business' },
  },
}

/* ------------------------------------------------------------------ */
/*  Placeholder content — used when a season is active but no          */
/*  centrally configured content exists yet.                           */
/*                                                                     */
/*  Per brief rule 28: create the data structure but DO NOT invent     */
/*  product claims. This placeholder exposes the framework structure   */
/*  with honest labels instead of marketing copy.                      */
/* ------------------------------------------------------------------ */

function placeholderContent(season: Season): SeasonalContent {
  return {
    seasonId: season.id,
    heroHeading: 'Current Season',
    heroTitle: season.name || 'Current Season',
    heroMessage:
      season.description ||
      'A seasonal period is active on MCOM VCard. Seasonal messages, gifts, rewards and campaigns for this season are prepared centrally and will appear here.',
    campaignName: `${season.name} Programme`,
    purposeLabel: season.name,
    video: {
      src: '',
      title: `MCOM VCard — ${season.name}`,
      subtitle:
        'The seasonal video for this period. A video is shown here once one is configured for this season.',
    },
    events: null,
    primaryCta: { label: 'Find a participating business', to: '/find-a-business' },
  }
}

/* ------------------------------------------------------------------ */
/*  Accessors                                                          */
/* ------------------------------------------------------------------ */

/** The currently ACTIVE season from the admin season catalogue. */
export function getActiveSeason(now = new Date()): Season | undefined {
  const seasons = loadSeasons()
  return seasons.find((s) => seasonStatus(s, now) === 'active')
}

/** The next upcoming (not yet started) season, if any. */
export function getUpcomingSeason(now = new Date()): Season | undefined {
  const seasons = loadSeasons()
  return seasons.find((s) => seasonStatus(s, now) === 'upcoming')
}

/** Full seasonal content for a season id (falls back to placeholder). */
export function getSeasonalContent(seasonId: string): SeasonalContent {
  const configured = SEASONAL_CONTENT[seasonId]
  if (configured) return configured
  const season = getSeason(seasonId)
  if (season) return placeholderContent(season)
  return placeholderContent({
    id: seasonId,
    name: 'Current Season',
    startDate: '',
    endDate: '',
    color: '#F97316',
    createdAt: '',
  })
}

/** Content for the currently active season, or a placeholder when none. */
export function getCurrentSeasonalContent(now = new Date()): SeasonalContent {
  const active = getActiveSeason(now)
  if (!active) {
    const upcoming = getUpcomingSeason(now)
    if (upcoming) {
      return {
        ...placeholderContent(upcoming),
        heroHeading: 'Next Up',
        heroMessage:
          'The next seasonal period on MCOM VCard is "' +
          upcoming.name +
          '". It is not active yet — gifts, rewards and campaigns for this season will be released here when the season begins.',
      }
    }
    return placeholderContent({
      id: 'no-active-season',
      name: 'Seasonal Experiences',
      startDate: '',
      endDate: '',
      color: '#F97316',
      createdAt: '',
    })
  }
  return getSeasonalContent(active.id)
}

/** Gift events within a season's content. */
export function getSeasonalGiftEvents(content: SeasonalContent): SeasonalEvent[] {
  return (content.events ?? []).filter((e) => e.eventType === 'gift')
}

/** Reward events within a season's content. */
export function getSeasonalRewardEvents(content: SeasonalContent): SeasonalEvent[] {
  return (content.events ?? []).filter((e) => e.eventType === 'reward')
}

/** All events within a season's 90-day period. */
export function getSeasonalEvents(content: SeasonalContent): SeasonalEvent[] {
  return content.events ?? []
}

/** Friendly, configurable label for an event's story page header. */
export function seasonalTypeLabel(kind: 'gift' | 'reward'): string {
  return kind === 'gift' ? 'Gifts' : 'Rewards'
}