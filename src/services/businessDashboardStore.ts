/* ------------------------------------------------------------------ */
/*  MCOMVCard Business Operations Dashboard — mock data store.         */
/*  Henry's philosophy: Business chooses, activates, lightly customises. */
/*  Admin already built everything. No design tools on the business    */
/*  side. Everything here is read/choose/activate/act.                 */
/* ------------------------------------------------------------------ */

import { mockBusinessProfile, businessVCardLink } from './businessStore'
import { getConsumerEntitlements } from './consumerMembership'

/* ── Seasons ──────────────────────────────────────────────────────── */

export interface BusinessSeason {
  id: number
  name: string
  endsInDays: number
  color: string
}

export const mockSeasons: BusinessSeason[] = [
  { id: 1, name: 'Winter Season', endsInDays: 38, color: '#38bdf8' },
  { id: 2, name: 'Spring Season', endsInDays: 128, color: '#4ade80' },
]

export const currentSeason = mockSeasons[0]

/* ── Home KPIs — three swipeable pages of four cards each ────────── */

export interface HomeKpiCard {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'flat'
  icon: string
}

const kpiIcons = {
  views: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  qr: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01',
  customers: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  redeemed: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  appointments: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  shares: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  exchanges: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  campaigns: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
  redemptions: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  offers: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  performance: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
}

export const homeKpiPages: HomeKpiCard[][] = [
  [
    { label: 'Profile Views', value: '12,480', change: '+12.4%', trend: 'up', icon: kpiIcons.views },
    { label: 'QR Scans', value: '8,342', change: '+8.1%', trend: 'up', icon: kpiIcons.qr },
    { label: 'Customers', value: '2,451', change: '+5.7%', trend: 'up', icon: kpiIcons.customers },
    { label: 'Rewards Redeemed', value: '1,208', change: '+9.2%', trend: 'up', icon: kpiIcons.redeemed },
  ],
  [
    { label: 'Appointments', value: '132', change: '+4.3%', trend: 'up', icon: kpiIcons.appointments },
    { label: 'Wallet', value: '£4,850', change: '+2.1%', trend: 'up', icon: kpiIcons.wallet },
    { label: 'Shares', value: '1,045', change: '+6.0%', trend: 'up', icon: kpiIcons.shares },
    { label: 'Exchanges', value: '342', change: '-1.2%', trend: 'down', icon: kpiIcons.exchanges },
  ],
  [
    { label: 'Campaigns', value: '6', change: '2 running', trend: 'flat', icon: kpiIcons.campaigns },
    { label: 'Redemptions', value: '892', change: '+7.8%', trend: 'up', icon: kpiIcons.redemptions },
    { label: 'Active Offers', value: '24', change: '+3', trend: 'up', icon: kpiIcons.offers },
    { label: 'Performance', value: '92%', change: '+4.4%', trend: 'up', icon: kpiIcons.performance },
  ],
]

/* ── Quick Actions ────────────────────────────────────────────────── */

export interface QuickActionItem {
  label: string
  subtitle: string
  icon: string
  to: string
  color: string
}

const qa = {
  share: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  qr: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01',
  reward: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  offer: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  book: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
}

export const quickActions: QuickActionItem[] = [
  { label: 'Share My Card', subtitle: 'Send to anyone', icon: qa.share, to: businessVCardLink('share'), color: 'from-orange-500 to-orange-600' },
  { label: 'Show QR', subtitle: 'Scan & connect', icon: qa.qr, to: '/business/qr', color: 'from-blue-500 to-blue-600' },
  { label: 'Reward Customer', subtitle: 'Points & perks', icon: qa.reward, to: '/business/rewards/issue', color: 'from-purple-500 to-purple-600' },
  { label: 'Create Offer', subtitle: 'Launch a promo', icon: qa.offer, to: '/business/rewards/campaigns', color: 'from-emerald-500 to-emerald-600' },
  { label: 'Book Appointment', subtitle: 'Manage bookings', icon: qa.book, to: '/business/appointments', color: 'from-cyan-500 to-cyan-600' },
  { label: 'View Wallet', subtitle: 'Balance & history', icon: qa.wallet, to: '/business/wallet', color: 'from-rose-500 to-rose-600' },
]

/* ── Guidance notifications ───────────────────────────────────────── */

export interface GuidanceNotification {
  id: number
  title: string
  description: string
  category: 'Membership' | 'Rewards' | 'Customers' | 'Appointments' | 'Campaigns' | 'Cards' | 'VCard' | 'Smart Money' | 'System'
  tone: 'warning' | 'info' | 'success'
  actionLabel?: string
  actionTo?: string
  time: string
}

export const mockNotifications: GuidanceNotification[] = [
  { id: 1, title: 'Your Gold Membership expires in 21 days', description: 'Keep your Premium benefits active.', category: 'Membership', tone: 'warning', actionLabel: 'Renew now', actionTo: '/business/membership', time: '2 hrs ago' },
  { id: 2, title: '23 customers redeemed rewards today', description: 'Great engagement. Rewards are working.', category: 'Rewards', tone: 'success', time: '5 hrs ago' },
  { id: 3, title: 'Your QR has been scanned 143 times', description: 'Since this morning at the King Street store.', category: 'VCard', tone: 'info', actionLabel: 'View QR', actionTo: '/business/qr', time: 'Yesterday' },
  { id: 4, title: '5 customers have not redeemed their vouchers', description: 'Consider sending a gentle reminder.', category: 'Customers', tone: 'warning', actionLabel: 'View customers', actionTo: '/business/customers', time: '2 days ago' },
  { id: 5, title: 'New booking request from Jordan Smith', description: 'Haircut · Tomorrow, 10:30 AM — confirm your slot.', category: 'Appointments', tone: 'info', actionLabel: 'View booking', actionTo: '/business/appointments', time: '1 hr ago' },
  { id: 6, title: 'Your Summer Sale campaign reached 1,200 people', description: '212 views and 39 redemptions so far.', category: 'Campaigns', tone: 'success', actionLabel: 'View campaign', actionTo: '/business/rewards/campaigns', time: '4 hrs ago' },
  { id: 7, title: 'E-Gift Card stock is running low', description: 'Fewer than 10 E-Gift Cards left on sale.', category: 'Cards', tone: 'warning', actionLabel: 'Manage cards', actionTo: '/business/cards', time: 'Yesterday' },
  { id: 8, title: 'Someone saved your VCard today', description: 'Your VCard was viewed 12 times this week.', category: 'VCard', tone: 'info', time: '6 hrs ago' },
  { id: 9, title: '£127.40 cashback earned this week', description: 'Loyalty cashback returned to your business.', category: 'Smart Money', tone: 'success', actionLabel: 'View wallet', actionTo: '/business/wallet', time: '3 hrs ago' },
  { id: 10, title: 'MCOM maintenance scheduled for Sunday 2 AM', description: 'A short downtime window is expected.', category: 'System', tone: 'info', time: '1 day ago' },
]

/* ── Templates (chosen by business, built by admin) ───────────────── */

export interface BusinessTemplate {
  id: string
  name: string
  category: string
  gradient: string
  color: string
  isActive?: boolean
}

export const mockTemplates: BusinessTemplate[] = [
  { id: 'modern', name: 'Modern', category: 'General', gradient: 'from-slate-800 to-slate-900', color: '#0f172a' },
  { id: 'professional', name: 'Professional', category: 'Corporate', gradient: 'from-blue-700 to-indigo-800', color: '#1d4ed8' },
  { id: 'luxury', name: 'Luxury', category: 'Premium', gradient: 'from-amber-600 to-yellow-900', color: '#b45309' },
  { id: 'minimal', name: 'Minimal', category: 'Clean', gradient: 'from-gray-100 to-gray-200', color: '#e5e7eb' },
  { id: 'restaurant', name: 'Restaurant', category: 'Food', gradient: 'from-rose-600 to-red-800', color: '#e11d48' },
  { id: 'retail', name: 'Retail', category: 'Shop', gradient: 'from-fuchsia-600 to-purple-800', color: '#c026d3' },
  { id: 'coach', name: 'Coach', category: 'Personal', gradient: 'from-emerald-600 to-teal-800', color: '#059669' },
  { id: 'beauty', name: 'Beauty', category: 'Salon', gradient: 'from-pink-500 to-rose-700', color: '#ec4899' },
  { id: 'health', name: 'Health', category: 'Wellness', gradient: 'from-cyan-600 to-sky-800', color: '#0891b2' },
  { id: 'construction', name: 'Construction', category: 'Trade', gradient: 'from-orange-600 to-amber-800', color: '#ea580c' },
]

export const activeCardTemplate = mockTemplates[2] // Luxury
export const activeVCardTemplate = mockTemplates[0] // Modern

/* ── Customers ────────────────────────────────────────────────────── */

export interface CustomerTransaction {
  id: number
  type: string
  amount: string
  date: string
}

export interface CustomerAppointment {
  id: number
  service: string
  date: string
  status: 'completed' | 'confirmed' | 'pending' | 'cancelled'
}

export interface CustomerOffer {
  id: number
  title: string
  status: 'redeemed' | 'active' | 'expired'
  date: string
}

export interface CustomerNote {
  id: number
  text: string
  date: string
}

export interface CustomerExchange {
  id: number
  item: string
  date: string
  status: 'pending' | 'completed' | 'cancelled'
}

export interface CustomerActivity {
  id: number
  type: 'reward' | 'purchase' | 'exchange' | 'redemption' | 'appointment' | 'upgrade' | 'card' | 'note'
  label: string
  detail: string
  date: string
}

export interface CustomerMembershipUpgrade {
  id: number
  tier: string
  reason: string
  date: string
}

export interface Customer {
  id: number
  name: string
  initials: string
  color: string
  memberSince: string
  tier: string
  rewardsCount: number
  totalSpend: string
  phone: string
  email: string
  notesCount: number
  status: 'active' | 'new' | 'at-risk'
  cardsIssued: number
  rewards: { label: string; value: string; status: 'available' | 'pending' | 'redeemed' }[]
  transactions: CustomerTransaction[]
  appointments: CustomerAppointment[]
  redeemedOffers: CustomerOffer[]
  exchanges: CustomerExchange[]
  membershipUpgrades: CustomerMembershipUpgrade[]
  activity: CustomerActivity[]
  notes: CustomerNote[]
}

export const mockCustomers: Customer[] = [
  {
    id: 1, name: 'John Miller', initials: 'JM', color: 'bg-orange-500', memberSince: 'Mar 2025', tier: 'Gold',
    rewardsCount: 12, totalSpend: '£1,240', phone: '+44 7700 900111', email: 'john.miller@mail.com', notesCount: 3, status: 'active',
    cardsIssued: 2,
    rewards: [
      { label: 'Loyalty Points', value: '420', status: 'available' },
      { label: 'Free Cold Brew', value: '1', status: 'available' },
      { label: 'Summer Voucher', value: '£5.00', status: 'pending' },
    ],
    transactions: [
      { id: 1, type: 'In-store purchase', amount: '£12.50', date: 'Today' },
      { id: 2, type: 'Gift Card top-up', amount: '£25.00', date: 'Yesterday' },
      { id: 3, type: 'In-store purchase', amount: '£8.00', date: '3 days ago' },
    ],
    appointments: [
      { id: 1, service: 'Coffee Tasting', date: 'Today · 3:00 PM', status: 'confirmed' },
      { id: 2, service: 'Barista Workshop', date: 'Sat · 11:00 AM', status: 'pending' },
    ],
    redeemedOffers: [
      { id: 1, title: 'Buy 1 Get 1 Free', status: 'redeemed', date: '12 Jul' },
      { id: 2, title: '10% off Beans', status: 'active', date: '—' },
    ],
    exchanges: [
      { id: 1, item: 'House Blend Beans', date: '2 weeks ago', status: 'completed' },
      { id: 2, item: 'Catering Package', date: 'Yesterday', status: 'pending' },
    ],
    membershipUpgrades: [
      { id: 1, tier: 'Silver', reason: 'Reward granted by business owner', date: 'Mar 2025' },
      { id: 2, tier: 'Gold', reason: 'Reward for reaching 1,000 loyalty points', date: 'Nov 2025' },
    ],
    activity: [
      { id: 1, type: 'purchase', label: 'In-store purchase', detail: '£12.50', date: 'Today' },
      { id: 2, type: 'appointment', label: 'Booked Coffee Tasting', detail: 'Confirmed · 3:00 PM', date: 'Today' },
      { id: 3, type: 'reward', label: 'Earned Loyalty Points', detail: '+420 points', date: 'Today' },
      { id: 4, type: 'exchange', label: 'Exchanged House Blend Beans', detail: 'Completed', date: '2 weeks ago' },
      { id: 5, type: 'upgrade', label: 'Upgraded to Gold', detail: 'Business owner reward', date: 'Nov 2025' },
      { id: 6, type: 'redemption', label: 'Redeemed Buy 1 Get 1 Free', detail: '12 Jul', date: '12 Jul' },
    ],
    notes: [
      { id: 1, text: 'Prefers oat milk in all drinks.', date: '2 weeks ago' },
      { id: 2, text: 'Asked about wholesale beans for office.', date: '1 month ago' },
      { id: 3, text: 'Birthday: 14 June.', date: '3 months ago' },
    ],
  },
  {
    id: 2, name: 'Mary Osei', initials: 'MO', color: 'bg-blue-500', memberSince: 'Jan 2026', tier: 'Silver',
    rewardsCount: 5, totalSpend: '£380', phone: '+44 7700 900222', email: 'mary.osei@mail.com', notesCount: 1, status: 'new',
    cardsIssued: 1,
    rewards: [
      { label: 'Loyalty Points', value: '150', status: 'available' },
      { label: 'Welcome Discount', value: '15%', status: 'available' },
    ],
    transactions: [
      { id: 1, type: 'In-store purchase', amount: '£9.40', date: 'Today' },
    ],
    appointments: [
      { id: 1, service: 'Loyalty Sign-up', date: 'Today · 5:30 PM', status: 'pending' },
    ],
    redeemedOffers: [{ id: 1, title: 'Welcome Voucher', status: 'active', date: '—' }],
    exchanges: [],
    membershipUpgrades: [],
    activity: [
      { id: 1, type: 'purchase', label: 'In-store purchase', detail: '£9.40', date: 'Today' },
      { id: 2, type: 'appointment', label: 'Booked Loyalty Sign-up', detail: 'Pending · 5:30 PM', date: 'Today' },
      { id: 3, type: 'card', label: 'Loyalty card issued', detail: 'Digital card · Silver', date: '1 week ago' },
      { id: 4, type: 'reward', label: 'Welcome Discount added', detail: '15% off next visit', date: '1 week ago' },
    ],
    notes: [{ id: 1, text: 'New customer — from Borough Market branch.', date: '1 week ago' }],
  },
  {
    id: 3, name: 'James Carter', initials: 'JC', color: 'bg-purple-500', memberSince: 'Aug 2024', tier: 'Gold',
    rewardsCount: 21, totalSpend: '£2,860', phone: '+44 7700 900333', email: 'james.carter@mail.com', notesCount: 2, status: 'active',
    cardsIssued: 3,
    rewards: [
      { label: 'Loyalty Points', value: '780', status: 'available' },
      { label: 'Free Pastry', value: '2', status: 'available' },
      { label: 'Holiday Voucher', value: '£10.00', status: 'pending' },
    ],
    transactions: [
      { id: 1, type: 'Online order', amount: '£22.00', date: '2 days ago' },
      { id: 2, type: 'In-store purchase', amount: '£6.50', date: '5 days ago' },
    ],
    appointments: [
      { id: 1, service: 'Private Roasting Session', date: 'Fri · 2:00 PM', status: 'confirmed' },
      { id: 2, service: 'Coffee Tasting', date: 'Last week', status: 'completed' },
    ],
    redeemedOffers: [
      { id: 1, title: 'Members Rewards Weekend', status: 'redeemed', date: '28 Jul' },
      { id: 2, title: 'Double Points Day', status: 'redeemed', date: '15 Jul' },
    ],
    exchanges: [
      { id: 1, item: 'Private Roasting Session', date: '1 week ago', status: 'completed' },
    ],
    membershipUpgrades: [
      { id: 1, tier: 'Silver', reason: 'Referral reward granted by owner', date: 'Aug 2024' },
      { id: 2, tier: 'Gold', reason: 'Annual VIP reward from business owner', date: 'Mar 2025' },
    ],
    activity: [
      { id: 1, type: 'purchase', label: 'Online order', detail: '£22.00', date: '2 days ago' },
      { id: 2, type: 'appointment', label: 'Booked Private Roasting Session', detail: 'Confirmed · 2:00 PM', date: '3 days ago' },
      { id: 3, type: 'exchange', label: 'Exchanged Private Roasting Session', detail: 'Completed', date: '1 week ago' },
      { id: 4, type: 'redemption', label: 'Redeemed Members Rewards Weekend', detail: '28 Jul', date: '28 Jul' },
      { id: 5, type: 'upgrade', label: 'Upgraded to Gold', detail: 'Annual VIP reward', date: 'Mar 2025' },
      { id: 6, type: 'reward', label: 'Earned Loyalty Points', detail: '+780 points', date: 'Mar 2025' },
    ],
    notes: [
      { id: 1, text: 'VIP customer — sends monthly office orders.', date: '1 month ago' },
      { id: 2, text: 'Interested in loyalty partnerships.', date: '2 months ago' },
    ],
  },
  {
    id: 4, name: 'Sophie Clarke', initials: 'SC', color: 'bg-emerald-500', memberSince: 'Nov 2025', tier: 'Bronze',
    rewardsCount: 3, totalSpend: '£210', phone: '+44 7700 900444', email: 'sophie.clarke@mail.com', notesCount: 0, status: 'at-risk',
    cardsIssued: 0,
    rewards: [{ label: 'Loyalty Points', value: '60', status: 'available' }],
    transactions: [{ id: 1, type: 'In-store purchase', amount: '£5.00', date: '2 weeks ago' }],
    appointments: [],
    redeemedOffers: [{ id: 1, title: 'First Visit Offer', status: 'redeemed', date: '5 Nov' }],
    exchanges: [],
    membershipUpgrades: [],
    activity: [
      { id: 1, type: 'purchase', label: 'In-store purchase', detail: '£5.00', date: '2 weeks ago' },
      { id: 2, type: 'redemption', label: 'Redeemed First Visit Offer', detail: '5 Nov', date: '5 Nov' },
      { id: 3, type: 'reward', label: 'Earned Loyalty Points', detail: '+60 points', date: '5 Nov' },
    ],
    notes: [],
  },
]

export function getCustomerById(id: number): Customer | undefined {
  return mockCustomers.find(c => c.id === id)
}

/* ── Rewards ──────────────────────────────────────────────────────── */

export interface RewardCampaign {
  id: number
  name: string
  type: string
  status: 'active' | 'paused' | 'ended'
  redemptions: number
  budget: string
  remaining: string
  participants: number
  reward: string
  link: string
  performance: { impressions: number; conversions: number }
}

export const mockCampaigns: RewardCampaign[] = [
  { id: 1, name: 'Winter Warmers', type: 'Seasonal', status: 'active', redemptions: 214, budget: '£1,000', remaining: '£640', participants: 380, reward: '£10 winter voucher', link: 'mcom.app/camp/winter-warmers', performance: { impressions: 6200, conversions: 214 } },
  { id: 2, name: 'Refer a Friend', type: 'Referral', status: 'active', redemptions: 89, budget: '£500', remaining: '£305', participants: 152, reward: 'Free drink with every friend', link: 'mcom.app/camp/refer-a-friend', performance: { impressions: 2400, conversions: 89 } },
  { id: 3, name: 'Double Points Weekend', type: 'Points', status: 'paused', redemptions: 0, budget: '£300', remaining: '£300', participants: 0, reward: '2× loyalty points', link: 'mcom.app/camp/double-points', performance: { impressions: 0, conversions: 0 } },
  { id: 4, name: 'Holiday Gift', type: 'Gift', status: 'ended', redemptions: 430, budget: '£1,500', remaining: '£0', participants: 510, reward: '£15 gift card', link: 'mcom.app/camp/holiday-gift', performance: { impressions: 9800, conversions: 430 } },
  { id: 5, name: 'Tier Rewards', type: 'Evergreen', status: 'active', redemptions: 156, budget: '£750', remaining: '£412', participants: 264, reward: 'Member-only perks', link: 'mcom.app/camp/tier-rewards', performance: { impressions: 4100, conversions: 156 } },
]

export interface RewardCoupon {
  id: number
  title: string
  code: string
  discount: string
  status: 'active' | 'expired' | 'draft'
  uses: number
  expires: string
}

export const mockCoupons: RewardCoupon[] = [
  { id: 1, title: '10% Off All Coffee', code: 'COFFEE10', discount: '10%', status: 'active', uses: 132, expires: '30 Nov' },
  { id: 2, title: 'Free Pastry with Drink', code: 'PASTRYFREE', discount: 'Free', status: 'active', uses: 78, expires: '15 Dec' },
  { id: 3, title: '£5 Off Orders over £30', code: 'SAVE5', discount: '£5', status: 'draft', uses: 0, expires: '—' },
  { id: 4, title: 'Summer Special', code: 'SUMMER20', discount: '20%', status: 'expired', uses: 320, expires: '31 Aug' },
]

export interface CashbackReward {
  id: number
  title: string
  rate: string
  status: 'active' | 'off'
  earned: string
}

export const mockCashback: CashbackReward[] = [
  { id: 1, title: 'Loyalty Cashback', rate: '3%', status: 'active', earned: '£127.40' },
  { id: 2, title: 'Coffee Subscription', rate: '5%', status: 'active', earned: '£54.20' },
]

export interface GiftCardOffer {
  id: number
  title: string
  value: string
  price: string
  status: 'active' | 'paused'
  sold: number
}

export const mockGiftCards: GiftCardOffer[] = [
  { id: 1, title: 'GreenLeaf £10 Gift Card', value: '£10', price: '£10', status: 'active', sold: 240 },
  { id: 2, title: 'GreenLeaf £25 Gift Card', value: '£25', price: '£25', status: 'active', sold: 96 },
  { id: 3, title: 'Experience Voucher', value: '£50', price: '£40', status: 'paused', sold: 18 },
]

export interface RedeemRecord {
  id: number
  customer: string
  item: string
  type: 'Coupon' | 'Gift Card' | 'Cashback' | 'Points' | 'Voucher'
  value: string
  status: 'completed' | 'expired' | 'pending'
  date: string
}

export const mockRedeemHistory: RedeemRecord[] = [
  { id: 1, customer: 'John Miller', item: 'Free Cold Brew', type: 'Voucher', value: '£3.50', status: 'completed', date: 'Today' },
  { id: 2, customer: 'Mary Osei', item: 'Welcome Discount', type: 'Coupon', value: '15%', status: 'pending', date: 'Today' },
  { id: 3, customer: 'James Carter', item: 'Gift Card Balance', type: 'Gift Card', value: '£25.00', status: 'completed', date: 'Yesterday' },
  { id: 4, customer: 'Sophie Clarke', item: 'First Visit Offer', type: 'Voucher', value: '£2.00', status: 'expired', date: '3 days ago' },
  { id: 5, customer: 'John Miller', item: 'Loyalty Points', type: 'Points', value: '120 pts', status: 'completed', date: '4 days ago' },
  { id: 6, customer: 'James Carter', item: 'Cashback 3%', type: 'Cashback', value: '£1.20', status: 'completed', date: '5 days ago' },
  { id: 7, customer: 'Mary Osei', item: 'Summer Voucher', type: 'Voucher', value: '£5.00', status: 'expired', date: '1 week ago' },
  { id: 8, customer: 'James Carter', item: 'Double Points', type: 'Points', value: '90 pts', status: 'completed', date: '1 week ago' },
]

/* ── Share page items ─────────────────────────────────────────────── */

export interface ShareItem {
  label: string
  subtitle: string
  icon: string
  color: string
}

const shareIcons = {
  vcard: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0',
  card: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  appointment: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  offer: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  qr: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01',
}

export const shareItems: ShareItem[] = [
  { label: 'Share VCard', subtitle: 'GreenLeaf digital profile', icon: shareIcons.vcard, color: 'from-orange-500 to-orange-600' },
  { label: 'Copy Link', subtitle: 'greenleaf.coffee', icon: shareIcons.link, color: 'from-blue-500 to-blue-600' },
  { label: 'QR Code', subtitle: 'Scan to open VCard', icon: shareIcons.qr, color: 'from-purple-500 to-purple-600' },
  { label: 'Share Business Card', subtitle: '85 × 55 mm identity', icon: shareIcons.card, color: 'from-emerald-500 to-emerald-600' },
  { label: 'Share Products', subtitle: 'Coffee & merchandise', icon: shareIcons.products, color: 'from-amber-500 to-amber-600' },
  { label: 'Share Appointment Link', subtitle: 'Book a slot directly', icon: shareIcons.appointment, color: 'from-cyan-500 to-cyan-600' },
  { label: 'Share Offer', subtitle: 'Current promotions', icon: shareIcons.offer, color: 'from-rose-500 to-rose-600' },
]

/* ── Exchange page items ──────────────────────────────────────────── */

export interface ExchangeItem {
  label: string
  subtitle: string
  icon: string
  color: string
}

const exchangeIcons = {
  products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  services: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  coupons: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  gift: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm5 3h6a1 1 0 011 1v2a1 1 0 01-1 1h-1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6H5a1 1 0 01-1-1V9a1 1 0 011-1h6',
  offers: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
}

export const exchangeItems: ExchangeItem[] = [
  { label: 'Products', subtitle: 'Coffee, beans & merch', icon: exchangeIcons.products, color: 'from-orange-500 to-orange-600' },
  { label: 'Services', subtitle: 'Tastings & workshops', icon: exchangeIcons.services, color: 'from-blue-500 to-blue-600' },
  { label: 'Coupons', subtitle: 'Shareable discounts', icon: exchangeIcons.coupons, color: 'from-purple-500 to-purple-600' },
  { label: 'Gift Cards', subtitle: 'Pre-loaded value', icon: exchangeIcons.gift, color: 'from-emerald-500 to-emerald-600' },
  { label: 'Offers', subtitle: 'Live promotions', icon: exchangeIcons.offers, color: 'from-rose-500 to-rose-600' },
]

/* ── Redeem page ──────────────────────────────────────────────────── */

export interface RedeemCategory {
  label: string
  count: number
  icon: string
  color: string
  records: RedeemRecord[]
}

const redeemIcons = {
  pending: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  gift: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm5 3h6a1 1 0 011 1v2a1 1 0 01-1 1h-1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6H5a1 1 0 01-1-1V9a1 1 0 011-1h6',
  coupon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  cashback: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  done: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
}

export const mockRedeemCategories: RedeemCategory[] = [
  { label: 'Pending Rewards', count: 3, icon: redeemIcons.pending, color: 'from-amber-500 to-orange-600', records: mockRedeemHistory.filter(r => r.status === 'pending') },
  { label: 'Redeemed Rewards', count: 5, icon: redeemIcons.done, color: 'from-emerald-500 to-green-600', records: mockRedeemHistory.filter(r => r.status === 'completed') },
  { label: 'Gift Cards', count: 1, icon: redeemIcons.gift, color: 'from-purple-500 to-purple-600', records: mockRedeemHistory.filter(r => r.type === 'Gift Card') },
  { label: 'Coupons', count: 2, icon: redeemIcons.coupon, color: 'from-blue-500 to-blue-600', records: mockRedeemHistory.filter(r => r.type === 'Coupon') },
  { label: 'Cashback', count: 1, icon: redeemIcons.cashback, color: 'from-cyan-500 to-cyan-600', records: mockRedeemHistory.filter(r => r.type === 'Cashback') },
]

/* ── Friends & Family ─────────────────────────────────────────────── */
/*  A first-class Business Dashboard function — the number of extra    */
/*  cards a business may allocate is governed by its membership        */
/*  entitlement (level + tier). The business must never be allowed to  */
/*  exceed that entitlement.                                           */

/* Current business membership — drives the entitlement below. */
export const businessMembership = `${mockBusinessProfile.membership} ${mockBusinessProfile.tier}`.trim() // "Gold Pro"

/* Card lifecycle states for a Friends & Family allocation. */
export type FamilyCardStatus = 'available' | 'allocated' | 'active' | 'suspended' | 'removed'

export interface FamilyMember {
  id: number
  name: string
  relationship: string
  initials: string
  color: string
  email: string
  phone: string
  avatar: string
  membership: string
  allocatedAt: string
  status: FamilyCardStatus
}

export const mockFamilyMembers: FamilyMember[] = [
  { id: 1, name: 'Sarah Johnson', relationship: 'Owner', initials: 'SJ', color: 'bg-orange-500', email: 'sarah@greenleaf.coffee', phone: '+44 7700 900001', avatar: '', membership: businessMembership, allocatedAt: 'Jan 2026', status: 'active' },
  { id: 2, name: 'Michael Reed', relationship: 'Manager', initials: 'MR', color: 'bg-blue-500', email: 'michael@greenleaf.coffee', phone: '+44 7700 900002', avatar: '', membership: businessMembership, allocatedAt: 'Feb 2026', status: 'active' },
  { id: 3, name: 'Emily Park', relationship: 'Staff', initials: 'EP', color: 'bg-emerald-500', email: 'emily@greenleaf.coffee', phone: '+44 7700 900003', avatar: '', membership: businessMembership, allocatedAt: 'Mar 2026', status: 'active' },
  { id: 4, name: 'James White', relationship: 'Sales', initials: 'JW', color: 'bg-purple-500', email: 'james@greenleaf.coffee', phone: '+44 7700 900004', avatar: '', membership: businessMembership, allocatedAt: 'Jul 2026', status: 'allocated' },
]

/* Included additional cards = membership entitlement (never exceed this). */
export const familyAllocationLimit = getConsumerEntitlements(businessMembership).familyCards

/* Used cards = every allocation that occupies an entitlement slot. */
export const familyAllocationUsed = mockFamilyMembers.filter(m => m.status === 'active' || m.status === 'allocated' || m.status === 'suspended').length

/* ── Appointments ─────────────────────────────────────────────────── */

export interface Appointment {
  id: number
  customer: string
  service: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  paid: boolean
  color: string
}

export const mockAppointments: Appointment[] = [
  { id: 1, customer: 'John Miller', service: 'Coffee Tasting', time: '10:00 AM', status: 'confirmed', paid: true, color: 'bg-orange-500' },
  { id: 2, customer: 'Mary Osei', service: 'Loyalty Sign-up', time: '11:30 AM', status: 'pending', paid: false, color: 'bg-blue-500' },
  { id: 3, customer: 'Laura Kim', service: 'Private Roasting', time: '1:00 PM', status: 'confirmed', paid: true, color: 'bg-emerald-500' },
  { id: 4, customer: 'Daniel Brown', service: 'Barista Workshop', time: '2:30 PM', status: 'completed', paid: true, color: 'bg-purple-500' },
  { id: 5, customer: 'Alice Green', service: 'Coffee Tasting', time: '4:00 PM', status: 'cancelled', paid: false, color: 'bg-rose-500' },
  { id: 6, customer: 'Tom Hardy', service: 'Wholesale Consult', time: '5:30 PM', status: 'pending', paid: false, color: 'bg-cyan-500' },
]

/* ── Analytics ────────────────────────────────────────────────────── */

export interface AnalyticsSeries {
  key: string
  label: string
  icon: string
  color: string
  total: string
  change: string
  tone?: 'up' | 'down'
  points: { label: string; value: number }[]
}

const anaIcons = {
  views: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  shares: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  rewards: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  customers: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  appointments: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  revenue: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  qr: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01',
  exchange: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  redeem: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  cancel: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  flag: 'M4 21V4m0 0h16l-4 4 4 4H4',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.976 9.101c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
}

export const mockAnalyticsSeries: AnalyticsSeries[] = [
  { key: 'views', label: 'Views', icon: anaIcons.views, color: 'from-orange-500 to-amber-500', total: '12,480', change: '+12.4%', points: [{ label: 'Mon', value: 1420 }, { label: 'Tue', value: 1650 }, { label: 'Wed', value: 1530 }, { label: 'Thu', value: 1820 }, { label: 'Fri', value: 1940 }, { label: 'Sat', value: 2240 }, { label: 'Sun', value: 1880 }] },
  { key: 'shares', label: 'Shares', icon: anaIcons.shares, color: 'from-blue-500 to-blue-600', total: '1,045', change: '+6.0%', points: [{ label: 'Mon', value: 120 }, { label: 'Tue', value: 148 }, { label: 'Wed', value: 132 }, { label: 'Thu', value: 165 }, { label: 'Fri', value: 178 }, { label: 'Sat', value: 190 }, { label: 'Sun', value: 112 }] },
  { key: 'rewards', label: 'Rewards', icon: anaIcons.rewards, color: 'from-purple-500 to-purple-600', total: '1,208', change: '+9.2%', points: [{ label: 'Mon', value: 130 }, { label: 'Tue', value: 160 }, { label: 'Wed', value: 144 }, { label: 'Thu', value: 172 }, { label: 'Fri', value: 190 }, { label: 'Sat', value: 226 }, { label: 'Sun', value: 186 }] },
  { key: 'customers', label: 'Customers', icon: anaIcons.customers, color: 'from-emerald-500 to-green-600', total: '2,451', change: '+5.7%', points: [{ label: 'Mon', value: 320 }, { label: 'Tue', value: 355 }, { label: 'Wed', value: 340 }, { label: 'Thu', value: 380 }, { label: 'Fri', value: 405 }, { label: 'Sat', value: 452 }, { label: 'Sun', value: 199 }] },
  { key: 'appointments', label: 'Bookings', icon: anaIcons.appointments, color: 'from-cyan-500 to-cyan-600', total: '132', change: '+4.3%', points: [{ label: 'Mon', value: 14 }, { label: 'Tue', value: 18 }, { label: 'Wed', value: 16 }, { label: 'Thu', value: 21 }, { label: 'Fri', value: 24 }, { label: 'Sat', value: 28 }, { label: 'Sun', value: 11 }] },
  { key: 'revenue', label: 'Revenue', icon: anaIcons.revenue, color: 'from-rose-500 to-rose-600', total: '£8,420', change: '+10.1%', points: [{ label: 'Mon', value: 980 }, { label: 'Tue', value: 1150 }, { label: 'Wed', value: 1080 }, { label: 'Thu', value: 1240 }, { label: 'Fri', value: 1350 }, { label: 'Sat', value: 1520 }, { label: 'Sun', value: 1100 }] },
  { key: 'qrScans', label: 'QR scans', icon: anaIcons.qr, color: 'from-violet-500 to-purple-600', total: '18,940', change: '+8.1%', points: [{ label: 'Mon', value: 2400 }, { label: 'Tue', value: 2650 }, { label: 'Wed', value: 2510 }, { label: 'Thu', value: 2890 }, { label: 'Fri', value: 3120 }, { label: 'Sat', value: 3560 }, { label: 'Sun', value: 1810 }] },
  { key: 'exchanges', label: 'Exchanges', icon: anaIcons.exchange, color: 'from-blue-500 to-indigo-600', total: '486', change: '+7.3%', points: [{ label: 'Mon', value: 54 }, { label: 'Tue', value: 62 }, { label: 'Wed', value: 58 }, { label: 'Thu', value: 71 }, { label: 'Fri', value: 80 }, { label: 'Sat', value: 96 }, { label: 'Sun', value: 65 }] },
  { key: 'redemptions', label: 'Redemptions', icon: anaIcons.redeem, color: 'from-emerald-500 to-green-600', total: '372', change: '+11.2%', points: [{ label: 'Mon', value: 42 }, { label: 'Tue', value: 48 }, { label: 'Wed', value: 45 }, { label: 'Thu', value: 53 }, { label: 'Fri', value: 60 }, { label: 'Sat', value: 74 }, { label: 'Sun', value: 50 }] },
  { key: 'bookingsCompleted', label: 'Bookings completed', icon: anaIcons.check, color: 'from-teal-500 to-emerald-600', total: '98', change: '+4.1%', points: [{ label: 'Mon', value: 11 }, { label: 'Tue', value: 13 }, { label: 'Wed', value: 12 }, { label: 'Thu', value: 16 }, { label: 'Fri', value: 18 }, { label: 'Sat', value: 22 }, { label: 'Sun', value: 6 }] },
  { key: 'bookingsCancelled', label: 'Bookings cancelled', icon: anaIcons.cancel, color: 'from-rose-500 to-rose-600', total: '11', change: '-1.5%', tone: 'down', points: [{ label: 'Mon', value: 1 }, { label: 'Tue', value: 2 }, { label: 'Wed', value: 0 }, { label: 'Thu', value: 2 }, { label: 'Fri', value: 1 }, { label: 'Sat', value: 3 }, { label: 'Sun', value: 2 }] },
  { key: 'participation', label: 'Campaign participation', icon: anaIcons.flag, color: 'from-amber-500 to-orange-600', total: '1,028', change: '+13.6%', points: [{ label: 'Mon', value: 120 }, { label: 'Tue', value: 148 }, { label: 'Wed', value: 132 }, { label: 'Thu', value: 156 }, { label: 'Fri', value: 168 }, { label: 'Sat', value: 196 }, { label: 'Sun', value: 108 }] },
  { key: 'rewardActivity', label: 'Reward activity', icon: anaIcons.star, color: 'from-purple-500 to-fuchsia-600', total: '734', change: '+9.4%', points: [{ label: 'Mon', value: 86 }, { label: 'Tue', value: 98 }, { label: 'Wed', value: 92 }, { label: 'Thu', value: 110 }, { label: 'Fri', value: 122 }, { label: 'Sat', value: 140 }, { label: 'Sun', value: 86 }] },
]

/* ── Membership benefits (from admin config) ──────────────────────── */

export interface MembershipBenefit {
  label: string
  value: string
  status: 'included' | 'active' | 'available'
}

export const mockMembershipBenefits: MembershipBenefit[] = [
  { label: 'Friends & Family', value: '5 Included', status: 'active' },
  { label: 'Duplicate Cards', value: 'Available', status: 'available' },
  { label: 'Campaign Access', value: 'Active', status: 'active' },
  { label: 'Rewards', value: 'Unlimited', status: 'included' },
  { label: 'Priority Support', value: 'Enabled', status: 'active' },
]

export const mockMembership = {
  plan: 'Gold Pro',
  season: 'Winter Membership',
  daysRemaining: 58,
  totalDays: 90,
  renewalDate: mockBusinessProfile.renewalDate,
  nextPlan: 'Platinum Elite',
}

/* ── Smart Money Solutions (MCOM ecosystem) ───────────────────────── */

export interface SmartMoneySolution {
  id: string
  name: string
  platform: string
  description: string
  status: 'active' | 'available' | 'coming-soon' | 'future'
  icon: string
}

export const mockSmartMoneySolutions: SmartMoneySolution[] = [
  {
    id: 'mcom-rewards',
    name: 'MCOM Rewards',
    platform: 'MCOM Rewards',
    description: 'Customers earn and redeem points, cashback and perks that return money and loyalty to your business.',
    status: 'active',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.085 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z',
  },
  {
    id: 'promo-expo',
    name: 'Promo / Expo',
    platform: 'MCOM Expo Center',
    description: 'Run promotions and appear at MCOM events and expos — turning attention into leads and footfall for you.',
    status: 'available',
    icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
  },
  {
    id: 'global-pay',
    name: 'Global Pay',
    platform: 'MCOM Global Pay',
    description: 'Accept secure payments from your VCard and storefront — money settles straight back to your business.',
    status: 'coming-soon',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  {
    id: 'mcom-mall',
    name: 'MCOMMall',
    platform: 'MCOMMall',
    description: 'List your products in the MCOM mall and let customers buy straight from your cards and storefront.',
    status: 'coming-soon',
    icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  },
  {
    id: 'hyperlocal-storefronts',
    name: 'Hyper-local Storefronts',
    platform: 'MCOM Hyperlocal',
    description: 'Showcase your business in hyper-local storefronts placed right in front of your nearby customers.',
    status: 'coming-soon',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  },
  {
    id: 'qr-brand-id',
    name: 'QR Brand ID',
    platform: 'MCOM Solutions · Brand ID',
    description: 'Your Brand ID powers a branded, trackable QR that routes customers straight to your business.',
    status: 'available',
    icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01',
  },
  {
    id: 'partner-programs',
    name: 'MCOM Partner Programs',
    platform: 'MCOM Partner Network',
    description: 'Join vetted MCOM partner programs and earn value back through referrals and partnership offers.',
    status: 'coming-soon',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0',
  },
  {
    id: 'b2b-share-exchange',
    name: 'B2B Share / Exchange / Barter',
    platform: 'MCOM Business Network',
    description: 'Trade products and services with other MCOM businesses through share, exchange and barter.',
    status: 'coming-soon',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
  {
    id: 'other-approved',
    name: 'Other Approved Solutions',
    platform: 'MCOM Ecosystem',
    description: 'More approved MCOM Smart Money solutions that return value to your business are added as they launch.',
    status: 'future',
    icon: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
  },
]
