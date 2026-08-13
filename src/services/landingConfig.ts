/* ------------------------------------------------------------------ */
/*  Landing page configuration.                                        */
/*                                                                     */
/*  Everything an admin or MCOM team would want to edit on the three   */
/*  MCOM VCard landing pages lives here (single source of truth):      */
/*    - the explainer video URL                                        */
/*    - the current campaign offer                                     */
/*    - seasonal offer copy                                            */
/*                                                                     */
/*  Membership levels, tiers, prices and durations are NOT defined     */
/*  here — they render from membershipPricingStore so the landing      */
/*  pages always reflect the admin's pricing configuration.            */
/* ------------------------------------------------------------------ */

export interface LandingVideoConfig {
  /* Set to a hosted video URL to show a playable explainer.           */
  src: string
  title: string
  subtitle: string
  durationLabel?: string
}

export const LANDING_VIDEO: LandingVideoConfig = {
  src: '',
  title: 'Meet the MCOM VCard',
  subtitle:
    'One card that carries your business, your rewards and your family & friends — digital first, physical when you want it.',
  durationLabel: '2 min',
}

export interface CampaignOffer {
  active: boolean
  badge: string
  title: string
  description: string
  ctaLabel: string
  ctaTo: string
  /* Optional configurable entry price shown as a campaign offer       */
  /* (e.g. Black Friday £5 entry). Only displayed when entryPrice > 0  */
  /* and only ever as a campaign highlight — never standard pricing.   */
  entryPrice: number
  note: string
}

export const CAMPAIGN_OFFER: CampaignOffer = {
  active: true,
  badge: 'Limited-time campaign',
  title: 'Black Friday: VCard access for £5 entry',
  description:
    'Join during the campaign to lock in reduced entry. Campaign offers are configurable and shown here only while they are live.',
  ctaLabel: 'Start your business',
  ctaTo: '/register',
  entryPrice: 5,
  note: 'Configurable campaign — set from the landing page configuration.',
}

export interface SeasonalOffer {
  active: boolean
  badge: string
  title: string
  description: string
}

export const SEASONAL_OFFER: SeasonalOffer = {
  active: true,
  badge: 'Seasonal',
  title: 'Seasonal campaigns are configured by MCOM',
  description:
    'Businesses can run seasonal card and vCard campaigns with their own dates, colours and offers — administered from the catalog.',
}

/** Billing durations surfaced on the landing pages (driven by the     */
/*  membership pricing configuration, never hard-coded).               */
export const LANDING_DURATIONS = ['90 days', '180 days', 'Annual'] as const
