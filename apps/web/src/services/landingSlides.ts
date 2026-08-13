/* ------------------------------------------------------------------ */
/*  Landing page hero sliders.                                         */
/*                                                                     */
/*  The three MCOM VCard landing pages (/, /business, /consumer) each  */
/*  render a carousel of slides. Every slide (badge, heading, copy,    */
/*  calls-to-action, image, theme) is configured here and persisted to */
/*  localStorage, so admins can add slides and edit content & images   */
/*  from the admin Landing Page editor without touching code.          */
/*                                                                     */
/*  A slide renders either a built-in vector illustration (imageKey)   */
/*  or a custom image URL (imageUrl) when one is provided.             */
/* ------------------------------------------------------------------ */

export type LandingPageId = 'general' | 'business' | 'consumer'
export type SlideTheme = 'orange' | 'blue' | 'purple'

/* What kind of asset the slide shows. Vector = built-in animated       */
/* illustration; the rest use imageUrl (an uploaded local asset or a    */
/* hosted URL).                                                         */
export type SlideMediaType = 'vector' | 'image' | 'gif' | 'video'

export interface LandingSlide {
  id: string
  /* Small pill above the heading, e.g. "For businesses".             */
  badge: string
  /* Plain heading text.                                               */
  title: string
  /* Highlighted fragment of the heading, rendered in a gradient.      */
  titleAccent: string
  description: string
  ctaLabel?: string
  ctaTo?: string
  secondaryLabel?: string
  secondaryTo?: string
  /* Kind of asset rendered on the slide.                              */
  mediaType: SlideMediaType
  /* Built-in illustration for mediaType 'vector'.                     */
  imageKey?: LandingPageId
  /* Custom image / gif / video URL (hosted or a base64 upload).       */
  imageUrl?: string
  theme: SlideTheme
  enabled: boolean
  order: number
}

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `s${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/* ── Defaults ─────────────────────────────────────────────────────── */

const generalSlides: Omit<LandingSlide, 'id' | 'mediaType'>[] = [
  {
    badge: 'MCOM VCard — more than a digital card',
    title: 'One card that carries your business,',
    titleAccent: 'your rewards and your people.',
    description:
      'MCOM VCard is the digital card, vCard and reward platform. Businesses build and share them. Customers collect them from the businesses they trust — cashback, coupons, deals and family & friends all live on one card.',
    ctaLabel: 'Start Your Business',
    ctaTo: '/register',
    secondaryLabel: "I'm a Consumer",
    secondaryTo: '/consumer',
    imageKey: 'general',
    theme: 'orange',
    enabled: true,
    order: 0,
  },
  {
    badge: 'For businesses',
    title: 'Create, publish and reward with',
    titleAccent: 'one digital card.',
    description:
      'Build digital business cards and vCards, issue them to your customers, and run rewards, cashback and campaigns on the cards they keep. One membership — Bronze, Silver, Gold or Platinum.',
    ctaLabel: 'Start Your Business',
    ctaTo: '/register',
    secondaryLabel: 'View Memberships',
    secondaryTo: '/membership?audience=business',
    imageKey: 'business',
    theme: 'blue',
    enabled: true,
    order: 1,
  },
  {
    badge: 'For consumers',
    title: 'Collect cashback, coupons and rewards',
    titleAccent: 'from the businesses you trust.',
    description:
      'Get your card from a participating business you trust. Collect cashback, coupons, deals and rewards — and share Family & Friends cards with the people who matter. No subscription to enter.',
    ctaLabel: 'Find a Business',
    ctaTo: '/find-a-business',
    secondaryLabel: 'Explore Consumer Cards',
    secondaryTo: '/consumer',
    imageKey: 'consumer',
    theme: 'purple',
    enabled: true,
    order: 2,
  },
]

const businessSlides: Omit<LandingSlide, 'id' | 'mediaType'>[] = [
  {
    badge: 'For businesses',
    title: "Your customers' card.",
    titleAccent: 'Your rewards. Your brand.',
    description:
      'Create digital business cards and vCards, issue them to your customers, and put rewards, cashback and campaigns on the cards they keep. One membership — Bronze, Silver, Gold or Platinum — with Standard, Pro or Pro+ access.',
    ctaLabel: 'Start Your Business',
    ctaTo: '/register',
    secondaryLabel: 'View Memberships',
    secondaryTo: '/membership?audience=business',
    imageKey: 'business',
    theme: 'blue',
    enabled: true,
    order: 0,
  },
  {
    badge: 'One membership',
    title: 'Bronze, Silver, Gold or Platinum',
    titleAccent: 'with Standard, Pro or Pro+ access.',
    description:
      'Pick the level that fits your goals. 90-day, 180-day and annual access — all configured by MCOM, always up to date. Grow from a single card to full reward, campaign and booking management.',
    ctaLabel: 'View Memberships',
    ctaTo: '/membership?audience=business',
    secondaryLabel: 'Start Your Business',
    secondaryTo: '/register',
    imageKey: 'general',
    theme: 'orange',
    enabled: true,
    order: 1,
  },
  {
    badge: 'Keep customers coming back',
    title: 'Rewards, cashback and campaigns',
    titleAccent: 'on the cards they keep.',
    description:
      'Run seasonal campaigns, issue rewards, and track bookings and analytics — all from one membership. Every campaign is configurable and always up to date from the catalog.',
    ctaLabel: 'Start Your Business',
    ctaTo: '/register',
    secondaryLabel: 'Explore Rewards',
    secondaryTo: '/features/seasonal',
    imageKey: 'consumer',
    theme: 'purple',
    enabled: true,
    order: 2,
  },
]

const consumerSlides: Omit<LandingSlide, 'id' | 'mediaType'>[] = [
  {
    badge: 'For consumers',
    title: 'Your MCOMVCard.',
    titleAccent: 'Cashback, rewards and your people — in one place.',
    description:
      'Get your card from a participating business you trust. Collect cashback, coupons, deals and rewards — and share Family & Friends cards with the people who matter.',
    ctaLabel: 'Find a Business',
    ctaTo: '/find-a-business',
    secondaryLabel: 'What You Can Collect',
    secondaryTo: '/features/consumer',
    imageKey: 'consumer',
    theme: 'purple',
    enabled: true,
    order: 0,
  },
  {
    badge: 'Family & Friends',
    title: 'Share cards with',
    titleAccent: 'the people who matter.',
    description:
      'Your membership includes family cards and friend cards. Allocate them from your wallet so the whole family collects cashback, vouchers and rewards together.',
    ctaLabel: 'Find a Business',
    ctaTo: '/find-a-business',
    secondaryLabel: 'Explore Consumer Cards',
    secondaryTo: '/consumer',
    imageKey: 'general',
    theme: 'orange',
    enabled: true,
    order: 1,
  },
  {
    badge: 'Free to collect',
    title: 'Cashback, vouchers, coupons and deals',
    titleAccent: 'collected from businesses you trust.',
    description:
      'No subscription to enter. Walk into a participating business, receive your consumer card, and explore your MCOMVCard wallet of cashback, rewards and family & friends.',
    ctaLabel: 'Find a Business',
    ctaTo: '/find-a-business',
    secondaryLabel: 'View Memberships',
    secondaryTo: '/membership?audience=consumer',
    imageKey: 'business',
    theme: 'blue',
    enabled: true,
    order: 2,
  },
]

const DEFAULT_SLIDES: Record<LandingPageId, Omit<LandingSlide, 'id' | 'mediaType'>[]> = {
  general: generalSlides,
  business: businessSlides,
  consumer: consumerSlides,
}

export function defaultLandingSlides(pageId: LandingPageId): LandingSlide[] {
  return DEFAULT_SLIDES[pageId].map((s) => ({ ...s, id: uid(), mediaType: 'vector' }))
}

/* ── Persistence ──────────────────────────────────────────────────── */

const KEY = 'mcom_landing_slides'

function normalizeSlide(raw: any): LandingSlide | null {
  if (!raw || typeof raw !== 'object') return null
  const page = raw.pageId
  if (page !== 'general' && page !== 'business' && page !== 'consumer') return null
  const mediaType: SlideMediaType =
    raw.mediaType === 'image' || raw.mediaType === 'gif' || raw.mediaType === 'video'
      ? raw.mediaType
      : raw.imageUrl
        ? 'image'
        : 'vector'
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : uid(),
    badge: typeof raw.badge === 'string' ? raw.badge : '',
    title: typeof raw.title === 'string' ? raw.title : '',
    titleAccent: typeof raw.titleAccent === 'string' ? raw.titleAccent : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    ctaLabel: typeof raw.ctaLabel === 'string' ? raw.ctaLabel : '',
    ctaTo: typeof raw.ctaTo === 'string' ? raw.ctaTo : '',
    secondaryLabel: typeof raw.secondaryLabel === 'string' ? raw.secondaryLabel : '',
    secondaryTo: typeof raw.secondaryTo === 'string' ? raw.secondaryTo : '',
    mediaType,
    imageKey: raw.imageKey === 'general' || raw.imageKey === 'business' || raw.imageKey === 'consumer' ? raw.imageKey : undefined,
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : '',
    theme: raw.theme === 'blue' || raw.theme === 'purple' ? raw.theme : 'orange',
    enabled: raw.enabled !== false,
    order: Number(raw.order) || 0,
  }
}

export function loadLandingSlides(pageId: LandingPageId): LandingSlide[] {
  const slides = readAll()[pageId]
  if (slides.length === 0) return defaultLandingSlides(pageId)
  return slides
    .filter((s) => s.order >= 0 && s.enabled)
    .sort((a, b) => a.order - b.order)
}

export function loadAllLandingSlides(): Record<LandingPageId, LandingSlide[]> {
  const all = readAll()
  const result = {} as Record<LandingPageId, LandingSlide[]>
  for (const pageId of Object.keys(all) as LandingPageId[]) {
    const list = all[pageId].length ? all[pageId] : defaultLandingSlides(pageId)
    result[pageId] = list.slice().sort((a, b) => a.order - b.order)
  }
  return result
}

export function saveLandingSlide(pageId: LandingPageId, slide: LandingSlide) {
  const all = readAll()
  const list = all[pageId]
  const idx = list.findIndex((s) => s.id === slide.id)
  const next: Record<LandingPageId, LandingSlide[]> = {
    ...all,
    [pageId]: idx >= 0 ? list.map((s) => (s.id === slide.id ? slide : s)) : [...list, slide],
  }
  persist(next)
}

export function deleteLandingSlide(pageId: LandingPageId, slideId: string) {
  const all = readAll()
  const next: Record<LandingPageId, LandingSlide[]> = {
    ...all,
    [pageId]: all[pageId].filter((s) => s.id !== slideId),
  }
  persist(next)
}

export function resetLandingSlides(pageId: LandingPageId): LandingSlide[] {
  const all = readAll()
  const fresh = defaultLandingSlides(pageId)
  persist({ ...all, [pageId]: fresh })
  return fresh
}

export function resetAllLandingSlides() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

function readAll(): Record<LandingPageId, LandingSlide[]> {
  const all: Record<LandingPageId, LandingSlide[]> = {
    general: [],
    business: [],
    consumer: [],
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return all
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : []
    for (const pageId of Object.keys(all) as LandingPageId[]) {
      all[pageId] = list
        .map(normalizeSlide)
        .filter((s): s is LandingSlide => s !== null && s.id !== undefined)
        .filter((s) => (s as LandingSlide & { pageId?: string }).pageId === pageId)
    }
  } catch {
    /* ignore */
  }
  return all
}

function persist(all: Record<LandingPageId, LandingSlide[]>) {
  const flat: Array<LandingSlide & { pageId: LandingPageId }> = []
  for (const pageId of Object.keys(all) as LandingPageId[]) {
    for (const s of all[pageId]) flat.push({ ...s, pageId })
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(flat))
  } catch {
    /* ignore quota errors */
  }
}
