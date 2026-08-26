/* ------------------------------------------------------------------ */
/*  Features catalogue — single source of truth for the Features       */
/*  section of the public site (distinct from homepage cards).         */
/*                                                                     */
/*  The homepage shows selected/highlighted features. This catalogue   */
/*  carries the FULLER feature information and is structured so new    */
/*  feature entries + pages can be added over time without editing     */
/*  page components.                                                   */
/*                                                                     */
/*  Feature content is grounded in the frozen product architecture     */
/*  (ARCHITECTURE.md) — nothing is invented. Where a detailed          */
/*  description is not yet supplied by the backend, a data-driven      */
/*  placeholder structure is exposed rather than a marketing claim.    */
/* ------------------------------------------------------------------ */

export type FeatureAudience = 'business' | 'consumer' | 'both'

export type FeatureCategoryId = 'business' | 'consumer'

export interface FeatureConfig {
  id: string
  category: FeatureCategoryId
  name: string
  /** Short one-liner shown on cards. */
  description: string
  /** Longer explanation used on the deeper detail sections. */
  longDescription?: string
  audience: FeatureAudience
  icon: string
  image?: string
  video?: string
  enabled: boolean
  /** Optional dedicated route (for future deeper pages). */
  route?: string
  relatedFeatures?: string[]
  /** Membership entitlements are NOT hard-coded here — these are only
      internal references for future wiring, not access rules. */
  relatedMemberships?: string[]
  relatedCampaigns?: string[]
  howItWorks?: string[]
  benefits?: string[]
}

export interface FeatureCategory {
  id: FeatureCategoryId
  name: string
  tagline: string
  description: string
  route: string
  icon: string
  tone: 'blue' | 'purple'
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: 'business',
    name: 'Business',
    tagline: 'Built for business owners',
    description:
      'What can MCOM VCard do for your business? Create your digital business card and VCard, issue them to customers, and run bookings, campaigns, rewards and promotions — all from one membership.',
    route: '/features/business',
    icon: 'briefcase',
    tone: 'blue',
  },
  {
    id: 'consumer',
    name: 'Consumer',
    tagline: 'Made for how you spend',
    description:
      'What can MCOM VCard do for you as a consumer? Collect your card from a participating business, then keep your wallet, cashback, rewards, gifts and family & friends together in one place.',
    route: '/features/consumer',
    icon: 'wallet',
    tone: 'purple',
  },
]

/* ------------------------------------------------------------------ */
/*  Business features                                                  */
/*                                                                     */
/*  Grounded in ARCHITECTURE.md: Business Card + Business VCard        */
/*  (identity, branding, QR, NFC, long-scrolling experience, share,    */
/*  exchange, redeem, products, campaigns, bookings, analytics...).    */
/* ------------------------------------------------------------------ */

export const BUSINESS_FEATURES: FeatureConfig[] = [
  {
    id: 'business-mobile-vcard-templates',
    category: 'business',
    name: 'Mobile VCard Templates',
    description:
      'Choose from professionally designed VCard templates and make each one your own.',
    longDescription:
      'A library of mobile-first VCard templates designed to load fast on the devices your customers actually use. Every template is a starting point — colours, fonts, layout and sections are yours to configure.',
    audience: 'business',
    icon: 'layout',
    enabled: true,
    relatedFeatures: ['business-card', 'customizable-templates'],
    howItWorks: ['Pick a template from the catalogue', 'Configure branding, colours and sections', 'Publish and start sharing'],
    benefits: ['Mobile-first, fast loading', 'Consistent professional look', 'Extensible template catalogue'],
  },
  {
    id: 'smart-contact-sharing',
    category: 'business',
    name: 'Smart Contact Sharing',
    description:
      'Share your card and VCard with a tap — QR code, NFC, link or messaging.',
    longDescription:
      'Your contact details travel the way your customers prefer. Share via QR code, NFC, direct link, email or any messaging platform — and let customers save your contact with one tap.',
    audience: 'both',
    icon: 'share',
    enabled: true,
    relatedFeatures: ['business-mobile-vcard-templates', 'consumer-sharing-exchange-redeem'],
    howItWorks: ['Share via QR, NFC or a smart link', 'Customers open your VCard in a tap', 'Save contact or interact with your business'],
    benefits: ['Share anywhere', 'One-tap save', 'QR + NFC + link in one place'],
  },
  {
    id: 'appointment-scheduling',
    category: 'business',
    name: 'Appointment Scheduling',
    description:
      'Let customers book appointments and reservations directly from your digital card.',
    longDescription:
      'Bring bookings into your VCard. Customers choose a slot and book straight from your card, so your availability is always one tap away.',
    audience: 'business',
    icon: 'calendar',
    enabled: true,
    route: '/b/appointments',
    relatedFeatures: ['business-vcard'],
    howItWorks: ['Add the booking section to your VCard', 'Customers pick a time from your availability', 'Bookings land in your dashboard'],
    benefits: ['Fewer missed calls', 'Bookings from any share', 'Availability always current'],
  },
  {
    id: 'business-card',
    category: 'business',
    name: 'Business Card',
    description:
      'Your compact digital business identity — logo, brand, contact, QR and NFC.',
    longDescription:
      'The Business Card answers "who is this business?". A compact, professional digital card carrying your logo, brand colour, contacts, QR code, NFC link and membership badge.',
    audience: 'business',
    icon: 'id',
    enabled: true,
    route: '/b/cards',
    relatedFeatures: ['business-mobile-vcard-templates', 'business-vcard'],
    howItWorks: ['Configure your card identity and branding', 'Add QR / NFC and membership badge', 'Share, save or print from any device'],
    benefits: ['Instant digital identity', 'QR + NFC ready', 'Professional first impression'],
  },
  {
    id: 'business-vcard',
    category: 'business',
    name: 'Business VCard',
    description:
      'A long-scrolling digital experience — your story, products, services and campaigns.',
    longDescription:
      'The Business VCard answers "what does this business offer?". A rich, dynamic profile that carries your about story, contact details, products, services, promotions, campaigns, galleries, videos, testimonials and more.',
    audience: 'business',
    icon: 'layers',
    enabled: true,
    route: '/b/vcards',
    relatedFeatures: ['business-card', 'appointment-scheduling', 'business-campaigns'],
    howItWorks: ['Build your VCard from sections', 'Add products, services, media and offers', 'Publish as your live business profile'],
    benefits: ['Everything in one link', 'Sections you control', 'Always updateable'],
  },
  {
    id: 'customizable-templates',
    category: 'business',
    name: 'Customizable Templates',
    description:
      'Brand cards and VCards with your colours, fonts and logo — no design skills needed.',
    longDescription:
      'Match every card to your brand. Choose from the template library and customise colours, fonts, branding and component sections through the template engine.',
    audience: 'business',
    icon: 'palette',
    enabled: true,
    relatedFeatures: ['business-mobile-vcard-templates', 'business-card'],
    howItWorks: ['Start from a template', 'Set brand colours, fonts and logo', 'Arrange component sections to suit'],
    benefits: ['On-brand everywhere', 'No design skills needed', 'Sections you can reorder'],
  },
  {
    id: 'business-qr-nfc',
    category: 'business',
    name: 'QR Codes & NFC',
    description:
      'Every card and VCard is reachable through its own QR code and NFC tag.',
    longDescription:
      'Businesses get QR codes for cards, VCards, campaigns and dynamic content, with NFC support on physical cards. Point any smart device at the code or tag and the right destination loads.',
    audience: 'business',
    icon: 'qr',
    enabled: true,
    relatedFeatures: ['business-card', 'smart-contact-sharing'],
    howItWorks: ['Generate a QR for your card or VCard', 'Attach NFC for physical cards', 'Route scans to dynamic content'],
    benefits: ['Scan-to-open', 'Physical + digital', 'Dynamic destinations'],
  },
  {
    id: 'business-analytics',
    category: 'business',
    name: 'Analytics',
    description:
      'Understand how your cards and VCards perform with view, click and scan insights.',
    longDescription:
      'Track engagement across your digital cards. See how customers find you, which sections they use and how your campaigns are performing.',
    audience: 'business',
    icon: 'chart',
    enabled: true,
    route: '/b/analytics',
    relatedFeatures: ['business-vcard', 'business-campaigns'],
    howItWorks: ['Cards and VCards feed analytics', 'View, click and scan data is compiled', 'Review performance in your dashboard'],
    benefits: ['Understand engagement', 'Measure campaigns', 'Improve your VCard over time'],
  },
  {
    id: 'business-campaigns',
    category: 'business',
    name: 'Campaigns & Promotions',
    description:
      'Run seasonal campaigns and promotions from a central place and push them through your VCards.',
    longDescription:
      'Plan and run campaigns that surface inside your VCard experience. Seasonal offers, events and promotions are managed centrally and distributed across your cards.',
    audience: 'business',
    icon: 'megaphone',
    enabled: true,
    relatedFeatures: ['business-vcard', 'business-rewards'],
    relatedCampaigns: ['Seasonal campaigns'],
    howItWorks: ['Create a campaign and set its window', 'Attach offers or content to the campaign', 'Push it to the VCard experience'],
    benefits: ['Central campaign control', 'Seasonal timing built in', 'Distributed through your VCards'],
  },
  {
    id: 'business-rewards',
    category: 'business',
    name: 'Rewards for your customers',
    description:
      'Issue rewards, coupons and e-gift cards to customers as part of your membership.',
    longDescription:
      'Businesses issue rewards through the platform. Customers receive them in their wallet, and redemption, issued and pending states are tracked throughout.',
    audience: 'business',
    icon: 'gift',
    enabled: true,
    relatedFeatures: ['business-campaigns', 'consumer-rewards'],
    relatedCampaigns: ['Reward campaigns'],
    howItWorks: ['Configure which rewards you offer', 'Issue rewards to customers', 'Track issued and redeemed states'],
    benefits: ['Repeat-visit driver', 'Tracked end-to-end', 'Launched from one place'],
  },
  {
    id: 'business-family-friends',
    category: 'business',
    name: 'Family & Friends',
    description:
      'Allocate additional cards and VCard access to family and friends on your account.',
    longDescription:
      'Membership allocation lets businesses extend additional cards and VCard access to family, friends and team members under one account.',
    audience: 'business',
    icon: 'users',
    enabled: true,
    relatedFeatures: ['consumer-family-friends'],
    howItWorks: ['Review your allocation allowances', 'Assign additional cards to family or friends', 'Manage from your dashboard'],
    benefits: ['Extend your reach', 'One account to manage', 'Allocation you control'],
  },
]

/* ------------------------------------------------------------------ */
/*  Consumer features                                                  */
/*                                                                     */
/*  Grounded in ARCHITECTURE.md: Consumer Card + Consumer VCard        */
/*  (membership identity, wallet card, QR, friends summary, wallet,    */
/*  cashback, local offers, share/exchange/redeem, referrals...).      */
/* ------------------------------------------------------------------ */

export const CONSUMER_FEATURES: FeatureConfig[] = [
  {
    id: 'consumer-card',
    category: 'consumer',
    name: 'Consumer Card',
    description:
      'Your identity card — membership tier, QR code, wallet card and friends summary.',
    longDescription:
      'The Consumer Card answers "who is this consumer?". A compact membership and loyalty card carrying your name, tier, QR code, card number and digital wallet summary.',
    audience: 'consumer',
    icon: 'id',
    enabled: true,
    route: '/c/cards',
    relatedFeatures: ['consumer-mobile-vcard-templates', 'consumer-wallet'],
    howItWorks: ['Receive your card from a participating business', 'Show your QR or open your VCard', 'Use it to collect rewards and cashback'],
    benefits: ['Membership identity', 'QR ready', 'Wallet attached'],
  },
  {
    id: 'consumer-mobile-vcard-templates',
    category: 'consumer',
    name: 'Consumer VCard Templates',
    description:
      'Present your consumer VCard with templates designed around your experience.',
    longDescription:
      'Consumer VCards have their own template set, separate from the business experience — because the way you use MCOM VCard is different.',
    audience: 'consumer',
    icon: 'layout',
    enabled: true,
    relatedFeatures: ['consumer-card', 'consumer-vcard'],
    howItWorks: ['Choose from the consumer template set', 'Add your personal profile', 'Publish your VCard'],
    benefits: ['Designed for consumers', 'Your own profile', 'Separate from business cards'],
  },
  {
    id: 'consumer-vcard',
    category: 'consumer',
    name: 'Consumer VCard',
    description:
      'Your living page — wallet summary, local offers, rewards and activity in one place.',
    longDescription:
      'The Consumer VCard answers "what can this consumer do?". A personal, evolving experience bringing together wallet, rewards, cashback, local offers, campaign feed, friends, family and activity.',
    audience: 'consumer',
    icon: 'user',
    enabled: true,
    route: '/c/vcard',
    relatedFeatures: ['consumer-wallet', 'consumer-rewards', 'consumer-local-offers'],
    howItWorks: ['Open your VCard from your card', 'See wallet, rewards and offers', 'Share, exchange or redeem from here'],
    benefits: ['Everything in one place', 'Updates with your activity', 'Your personal space'],
  },
  {
    id: 'consumer-wallet',
    category: 'consumer',
    name: 'Digital Wallet',
    description:
      'Carry your balance, points and vouchers in a wallet attached to your card.',
    longDescription:
      'The Consumer Card carries a digital wallet. Balance, points, cashback and vouchers are collected and viewable from your card and VCard.',
    audience: 'consumer',
    icon: 'wallet',
    enabled: true,
    route: '/c/wallet',
    relatedFeatures: ['consumer-card', 'consumer-cashback', 'consumer-rewards'],
    howItWorks: ['Rewards and cashback land in your wallet', 'View balance, points and vouchers', 'Use them where accepted'],
    benefits: ['One wallet', 'Points and cashback together', 'Visible from your card'],
  },
  {
    id: 'consumer-cashback',
    category: 'consumer',
    name: 'Cashback',
    description:
      'Earn cashback when you transact with participating businesses.',
    longDescription:
      'Cashback is collected through participating businesses and held in your wallet. Part of the consumer value story — getting more back from the places you already spend.',
    audience: 'consumer',
    icon: 'coins',
    enabled: true,
    relatedFeatures: ['consumer-wallet', 'consumer-rewards'],
    relatedCampaigns: ['Cashback campaigns'],
    howItWorks: ['Transact with a participating business', 'Cashback is added to your wallet', 'View and use it from your VCard'],
    benefits: ['More value back', 'Tracks in your wallet', 'From businesses you trust'],
  },
  {
    id: 'consumer-friends-family',
    category: 'consumer',
    name: 'Friends & Family',
    description:
      'Share additional cards and VCard access with family and friends.',
    longDescription:
      'Family and friends can receive their own additional cards and VCard access through your account — keeping the whole circle in one membership.',
    audience: 'consumer',
    icon: 'users',
    enabled: true,
    route: '/c/family',
    relatedFeatures: ['consumer-card', 'consumer-sharing-exchange-redeem'],
    howItWorks: ['Receiving an additional card? Accept it', 'Family and friends get their own access', 'Manage from the family section'],
    benefits: ['Whole-family access', 'Shared membership', 'One account to manage'],
  },
  {
    id: 'consumer-rewards',
    category: 'consumer',
    name: 'Rewards',
    description:
      'Receive rewards from businesses and track what is available to you.',
    longDescription:
      'Consumers receive rewards from the businesses they visit. Reward balances, available and redeemed items are tracked in your VCard and wallet.',
    audience: 'consumer',
    icon: 'gift',
    enabled: true,
    route: '/c/rewards',
    relatedFeatures: ['consumer-wallet', 'consumer-cashback'],
    relatedCampaigns: ['Reward campaigns'],
    howItWorks: ['Businesses issue rewards to you', 'Rewards appear in your wallet and VCard', 'Redeem where accepted'],
    benefits: ['Receive rewards', 'Available vs redeemed, tracked', 'Visit more, earn more'],
  },
  {
    id: 'consumer-gifts',
    category: 'consumer',
    name: 'Gift Vouchers & e-Cards',
    description:
      'Give and receive gifts — gift cards and vouchers shared between people.',
    longDescription:
      'Consumers can give and receive gifts through the ecosystem. Gift cards and vouchers form part of the consumer story — receiving rewards, giving rewards and giving gifts.',
    audience: 'consumer',
    icon: 'present',
    enabled: true,
    relatedFeatures: ['consumer-rewards', 'consumer-sharing-exchange-redeem'],
    relatedCampaigns: ['Seasonal gift campaigns'],
    howItWorks: ['Receive a gift card or voucher from a business or person', 'Keep it in your wallet', 'Use it before the stated expiry'],
    benefits: ['Give and receive gifts', 'Held in your wallet', 'Part of seasonal stories'],
  },
  {
    id: 'consumer-store-cards',
    category: 'consumer',
    name: 'Store Cards',
    description:
      'Keep loyalty and store cards from the businesses you shop at, together.',
    longDescription:
      'Saved store and loyalty cards are held in one place — collected from participating businesses and managed from your wallet and VCard.',
    audience: 'consumer',
    icon: 'store',
    enabled: true,
    relatedFeatures: ['consumer-wallet', 'consumer-local-offers'],
    howItWorks: ['Collect cards from businesses you use', 'View them in your wallet', 'Use them when you visit'],
    benefits: ['One place for store cards', 'Loyalty in your pocket', 'Connects to local offers'],
  },
  {
    id: 'consumer-local-offers',
    category: 'consumer',
    name: 'Local Offers & High Street',
    description:
      'Discover local offers and promotions from businesses in your area.',
    longDescription:
      'Local offers, recommended businesses and high street promotions are surfaced in your consumer VCard — a feed of what is on near you.',
    audience: 'consumer',
    icon: 'map',
    enabled: true,
    relatedFeatures: ['consumer-vcard', 'consumer-store-cards'],
    relatedCampaigns: ['Local campaigns'],
    howItWorks: ['Offers are surfaced in your VCard', 'See promotions from local businesses', 'Respond through the offer'],
    benefits: ['Discover local businesses', 'Promotions in your feed', 'Relevant to where you are'],
  },
  {
    id: 'consumer-sharing-exchange-redeem',
    category: 'consumer',
    name: 'Sharing, Exchanging & Redeeming',
    description:
      'Share your card, exchange with people and redeem what you have collected.',
    longDescription:
      'The whole consumer flow — share your card with one tap, exchange cards and connections, and redeem rewards and vouchers where they are accepted.',
    audience: 'consumer',
    icon: 'repeat',
    enabled: true,
    relatedFeatures: ['consumer-card', 'consumer-vcard', 'consumer-rewards'],
    howItWorks: ['Share your card via QR, NFC or link', 'Exchange with friends and businesses', 'Redeem rewards and vouchers you hold'],
    benefits: ['Share in one tap', 'Exchange connections', 'Redeem what you collect'],
  },
  {
    id: 'consumer-referrals',
    category: 'consumer',
    name: 'Referrals',
    description:
      'Refer friends and family and grow your circle.',
    longDescription:
      'Consumers can refer people into the ecosystem. Referral is part of the consumer experience and community updates.',
    audience: 'consumer',
    icon: 'user-plus',
    enabled: true,
    relatedFeatures: ['consumer-friends-family'],
    howItWorks: ['Share your referral with a friend', 'They join a participating business', 'Your referral is tracked in your activity'],
    benefits: ['Grow your circle', 'Track your referrals', 'Part of your activity feed'],
  },
]

/* ------------------------------------------------------------------ */
/*  Accessors                                                          */
/* ------------------------------------------------------------------ */

export const ALL_FEATURES: FeatureConfig[] = [...BUSINESS_FEATURES, ...CONSUMER_FEATURES]

export function featuresForAudience(audience: 'business' | 'consumer'): FeatureConfig[] {
  return ALL_FEATURES.filter((f) => f.enabled && (f.audience === audience || f.audience === 'both'))
}

export function featuresForCategory(category: FeatureCategoryId): FeatureConfig[] {
  return ALL_FEATURES.filter((f) => f.enabled && f.category === category)
}

export function getFeature(id: string): FeatureConfig | undefined {
  return ALL_FEATURES.find((f) => f.id === id)
}