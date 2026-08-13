/* ------------------------------------------------------------------ */
/*  Membership pricing & rules — the 4 plan cards (Bronze, Silver,     */
/*  Gold, Platinum) each with Normal / Pro / Pro+ pricing tiers and    */
/*  90-day / 180-day / Annual billing (90-day access is the primary    */
/*  target). `monthly` is kept in the data model for promo pricing     */
/*  only and is never offered as a standard cycle. Shared by the       */
/*  admin Pricing & Plans page (editor) and the public pricing page    */
/*  (/membership). Persisted in localStorage.                          */
/*                                                                     */
/*  Rules carry a `scope` so each rule can be enforced where it is     */
/*  meant to control things: admin setup, business usage, consumer     */
/*  usage and/or the public comparison table.                          */
/* ------------------------------------------------------------------ */

export type PlanTier = 'Normal' | 'Pro' | 'Pro+'
export type PlanLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
export type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual'
export type RuleScope = 'All' | 'Admin setup' | 'Business usage' | 'Consumer usage' | 'Public page'

export const PLAN_TIERS: PlanTier[] = ['Normal', 'Pro', 'Pro+']
export const PLAN_LEVELS: PlanLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum']
export const BILLING_CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'semiannual', 'annual']
export const RULE_SCOPES: RuleScope[] = ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page']

export interface PlanTierPricing {
  monthly: number
  quarterly: number
  semiannual: number
  annual: number
  setupFee: number
  trialDays: number
  description: string
  scope: RuleScope
}

export interface PlanFeature {
  text: string
  description: string
  scope: RuleScope
}

export interface PlanRule {
  label: string
  values: Record<PlanTier, string>
  description: string
  scope: RuleScope
}

export interface PlanCard {
  id: PlanLevel
  name: PlanLevel
  tagline: string
  popular?: boolean
  features: PlanFeature[]
  rules: PlanRule[]
  tiers: Record<PlanTier, PlanTierPricing>
}

export interface PricingSections {
  price: { description: string }
  feature: { description: string }
  rule: { description: string }
}

export interface AnnualDiscount {
  type: 'months' | 'percent'
  value: number
}

export interface MembershipPricingState {
  currency: string
  updatedAt: string
  plans: PlanCard[]
  sections: PricingSections
  annualDiscount: AnnualDiscount
}

/* ── Defaults (seeded from the master plan catalogue) ─────────────── */

const t = (monthly: number, annual: number, trialDays = 14): PlanTierPricing => ({
  monthly,
  quarterly: Math.round(monthly * 2.7),
  semiannual: Math.round(monthly * 5.4),
  annual,
  setupFee: 0,
  trialDays,
  description: '',
  scope: 'All',
})

/* Rules carry a per-tier value: each plan's Normal / Pro / Pro+ get      */
/* their own offering. The same matrix is edited in Entitlements &        */
/* Allocation and enforced on the screens each rule controls.             */
const r = (label: string, n: string, pro: string, proPlus: string, description: string, scope: RuleScope = 'All'): PlanRule => ({
  label,
  values: { Normal: n, Pro: pro, 'Pro+': proPlus },
  description,
  scope,
})

export const DEFAULT_SECTIONS: PricingSections = {
  price: { description: 'Prices for the selected tier, per billing cycle. Includes the one-off setup fee and free-trial days.' },
  feature: { description: 'Check-list items shown on the plan cards.' },
  rule: { description: 'Limits enforced across admin setup, business usage and consumer usage, and shown in the public comparison table.' },
}

export const DEFAULT_ANNUAL_DISCOUNT: AnnualDiscount = { type: 'months', value: 2 }

export function annualSavingNote(d: AnnualDiscount): string {
  return d.type === 'months' ? `${d.value} ${d.value === 1 ? 'month' : 'months'} free vs monthly` : `${d.value}% off vs monthly`
}

export function defaultMembershipPricing(): MembershipPricingState {
  return {
    currency: 'GBP',
    updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    sections: { price: { ...DEFAULT_SECTIONS.price }, feature: { ...DEFAULT_SECTIONS.feature }, rule: { ...DEFAULT_SECTIONS.rule } },
    annualDiscount: { ...DEFAULT_ANNUAL_DISCOUNT },
    plans: [
      {
        id: 'Bronze',
        name: 'Bronze',
        tagline: 'The essential start for small businesses building their digital presence.',
        features: [
          { text: '10 Business VCards', description: 'Business vCards your team can create and publish.', scope: 'All' },
          { text: '50 Consumer VCards', description: 'Consumer vCards you can issue to customers.', scope: 'All' },
          { text: '25 Business Cards', description: 'Business cards you can create.', scope: 'All' },
          { text: '100 Consumer Cards', description: 'Consumer cards issued to customers.', scope: 'All' },
          { text: '10 Friends & Family allocations', description: 'F&F allocations per member.', scope: 'All' },
          { text: '£1,000 e-Card face value', description: 'Total e-card value available.', scope: 'All' },
          { text: '5 QR routing rules', description: 'Dynamic QR routing rules per plan.', scope: 'All' },
          { text: 'Basic analytics', description: 'View page and scan analytics.', scope: 'Public page' },
          { text: 'Standard support', description: 'Standard support response times.', scope: 'Public page' },
        ],
        rules: [
          r('Business VCards', '10', '25', '50', 'Business vCards the business can create and publish.'),
          r('Consumer VCards', '50', '100', '200', 'Consumer vCards the business can issue.'),
          r('Business Cards', '25', '50', '100', 'Business cards the business can create.'),
          r('Consumer Cards', '100', '250', '500', 'Consumer cards issued to customers.'),
          r('Friends & Family', '10', '25', '50', 'F&F allocations each member can use.'),
          r('e-Card face value', '£1,000', '£2,500', '£5,000', 'Total e-card value available.'),
          r('QR routing rules', '5', '10', '20', 'Dynamic QR routing rules per plan.'),
          r('QR scan rules', 'Daily:100, Seasonal:2000', 'Daily:250, Seasonal:5000', 'Daily:250, Seasonal:5000, Unlimited', 'Scan rules for business QR codes — Daily, Seasonal allowance or Unlimited.', 'Business usage'),
          r('Additional Cards', '0', '0', '2', 'Extra cards the business can issue on top of the plan and share to family & friends.', 'Business usage'),
        ],
        tiers: { Normal: t(49, 490), Pro: t(79, 790), 'Pro+': t(119, 1190, 7) },
      },
      {
        id: 'Silver',
        name: 'Silver',
        tagline: 'Mid-tier growth with more cards, consumer VCards and QR power.',
        features: [
          { text: '20 Business VCards', description: 'Business vCards your team can create and publish.', scope: 'All' },
          { text: '100 Consumer VCards', description: 'Consumer vCards you can issue to customers.', scope: 'All' },
          { text: '50 Business Cards', description: 'Business cards you can create.', scope: 'All' },
          { text: '200 Consumer Cards', description: 'Consumer cards issued to customers.', scope: 'All' },
          { text: '25 Friends & Family allocations', description: 'F&F allocations per member.', scope: 'All' },
          { text: '£2,500 e-Card face value', description: 'Total e-card value available.', scope: 'All' },
          { text: '10 QR routing rules', description: 'Dynamic QR routing rules per plan.', scope: 'All' },
          { text: 'Advanced analytics', description: 'Advanced page and scan analytics.', scope: 'Public page' },
          { text: 'Priority support', description: 'Priority support response times.', scope: 'Public page' },
        ],
        rules: [
          r('Business VCards', '20', '50', '100', 'Business vCards the business can create and publish.'),
          r('Consumer VCards', '100', '200', '400', 'Consumer vCards the business can issue.'),
          r('Business Cards', '50', '100', '200', 'Business cards the business can create.'),
          r('Consumer Cards', '200', '500', '1,000', 'Consumer cards issued to customers.'),
          r('Friends & Family', '25', '50', '100', 'F&F allocations each member can use.'),
          r('e-Card face value', '£2,500', '£5,000', '£10,000', 'Total e-card value available.'),
          r('QR routing rules', '10', '25', '50', 'Dynamic QR routing rules per plan.'),
          r('QR scan rules', 'Daily:250, Seasonal:5000', 'Daily:500, Seasonal:10000, Unlimited', 'Daily:500, Seasonal:10000, Unlimited', 'Scan rules for business QR codes — Daily, Seasonal allowance or Unlimited.', 'Business usage'),
          r('Additional Cards', '2', '3', '4', 'Extra cards the business can issue on top of the plan and share to family & friends.', 'Business usage'),
        ],
        tiers: { Normal: t(149, 1490), Pro: t(219, 2190), 'Pro+': t(299, 2990, 7) },
      },
      {
        id: 'Gold',
        name: 'Gold',
        tagline: 'High-tier access with the full VCard suite and premium QR features.',
        popular: true,
        features: [
          { text: '50 Business VCards', description: 'Business vCards your team can create and publish.', scope: 'All' },
          { text: '200 Consumer VCards', description: 'Consumer vCards you can issue to customers.', scope: 'All' },
          { text: '100 Business Cards', description: 'Business cards you can create.', scope: 'All' },
          { text: '500 Consumer Cards', description: 'Consumer cards issued to customers.', scope: 'All' },
          { text: '50 Friends & Family allocations', description: 'F&F allocations per member.', scope: 'All' },
          { text: '£5,000 e-Card face value', description: 'Total e-card value available.', scope: 'All' },
          { text: 'Unlimited QR routing rules', description: 'Unlimited dynamic QR routing rules.', scope: 'All' },
          { text: 'Advanced analytics + exports', description: 'Advanced analytics with CSV exports.', scope: 'Public page' },
          { text: 'Dedicated account manager', description: 'Named account manager for your business.', scope: 'Public page' },
        ],
        rules: [
          r('Business VCards', '50', '100', '200', 'Business vCards the business can create and publish.'),
          r('Consumer VCards', '200', '400', '800', 'Consumer vCards the business can issue.'),
          r('Business Cards', '100', '250', '500', 'Business cards the business can create.'),
          r('Consumer Cards', '500', '1,000', '2,000', 'Consumer cards issued to customers.'),
          r('Friends & Family', '50', '100', '200', 'F&F allocations each member can use.'),
          r('e-Card face value', '£5,000', '£10,000', '£20,000', 'Total e-card value available.'),
          r('QR routing rules', 'Unlimited', 'Unlimited', 'Unlimited', 'Dynamic QR routing rules per plan.'),
          r('QR scan rules', 'Daily:500, Seasonal:10000, Unlimited', 'Daily:500, Seasonal:10000, Unlimited', 'Daily:500, Seasonal:10000, Unlimited', 'Scan rules for business QR codes — Daily, Seasonal allowance or Unlimited.', 'Business usage'),
          r('Additional Cards', '4', '5', '8', 'Extra cards the business can issue on top of the plan and share to family & friends.', 'Business usage'),
        ],
        tiers: { Normal: t(449, 4490), Pro: t(649, 6490), 'Pro+': t(899, 8990, 7) },
      },
      {
        id: 'Platinum',
        name: 'Platinum',
        tagline: 'Enterprise-grade limits, API access and first access to new MCOM features.',
        features: [
          { text: 'Unlimited Business VCards', description: 'Unlimited business vCards.', scope: 'All' },
          { text: '500 Consumer VCards', description: 'Consumer vCards you can issue to customers.', scope: 'All' },
          { text: 'Unlimited Business Cards', description: 'Unlimited business cards.', scope: 'All' },
          { text: '1,000 Consumer Cards', description: 'Consumer cards issued to customers.', scope: 'All' },
          { text: '100 Friends & Family allocations', description: 'F&F allocations per member.', scope: 'All' },
          { text: 'Unlimited e-Card value', description: 'Unlimited e-card value.', scope: 'All' },
          { text: 'Unlimited QR routing rules', description: 'Unlimited dynamic QR routing rules.', scope: 'All' },
          { text: 'API access + advanced analytics', description: 'API access and advanced analytics.', scope: 'Public page' },
          { text: 'Dedicated account manager', description: 'Named account manager for your business.', scope: 'Public page' },
          { text: 'White-label options', description: 'Remove MCOM branding.', scope: 'Public page' },
        ],
        rules: [
          r('Business VCards', 'Unlimited', 'Unlimited', 'Unlimited', 'Business vCards the business can create and publish.'),
          r('Consumer VCards', '500', '1,000', '2,000', 'Consumer vCards the business can issue.'),
          r('Business Cards', 'Unlimited', 'Unlimited', 'Unlimited', 'Business cards the business can create.'),
          r('Consumer Cards', '1,000', '2,500', '5,000', 'Consumer cards issued to customers.'),
          r('Friends & Family', '100', '200', '400', 'F&F allocations each member can use.'),
          r('e-Card face value', 'Unlimited', 'Unlimited', 'Unlimited', 'Total e-card value available.'),
          r('QR routing rules', 'Unlimited', 'Unlimited', 'Unlimited', 'Dynamic QR routing rules per plan.'),
          r('QR scan rules', 'Daily:1000, Seasonal:25000, Unlimited', 'Daily:1000, Seasonal:25000, Unlimited', 'Daily:1000, Seasonal:25000, Unlimited', 'Scan rules for business QR codes — Daily, Seasonal allowance or Unlimited.', 'Business usage'),
          r('Additional Cards', '8', '10', '15', 'Extra cards the business can issue on top of the plan and share to family & friends.', 'Business usage'),
        ],
        tiers: { Normal: t(1499, 14990), Pro: t(2499, 24990), 'Pro+': t(3999, 39990, 7) },
      },
    ],
  }
}

/* ── Persistence ──────────────────────────────────────────────────── */

const KEY = 'mcom_membership_pricing'

/* Normalise any previously-saved pricing data (features used to be     */
/* plain strings, rules had no description/scope, tiers had no          */
/* quarterly price) into the current shape.                             */

function normalizePlan(raw: any): PlanCard | null {
  if (!raw || typeof raw !== 'object') return null
  const id = PLAN_LEVELS.includes(raw.id) ? raw.id : PLAN_LEVELS[0]
  const normalizeTier = (tr: any): PlanTierPricing => {
    const monthly = Number(tr?.monthly) || 0
    return {
      monthly,
      quarterly: Number(tr?.quarterly) || Math.round(monthly * 2.7),
      semiannual: Number(tr?.semiannual) || Math.round(monthly * 5.4),
      annual: Number(tr?.annual) || 0,
      setupFee: Number(tr?.setupFee) || 0,
      trialDays: Number(tr?.trialDays) || 0,
      description: typeof tr?.description === 'string' ? tr.description : '',
      scope: RULE_SCOPES.includes(tr?.scope) ? tr.scope : 'All',
    }
  }
  const normalizeFeature = (f: any): PlanFeature =>
    typeof f === 'string'
      ? { text: f, description: '', scope: 'All' }
      : {
          text: typeof f?.text === 'string' ? f.text : '',
          description: typeof f?.description === 'string' ? f.description : '',
          scope: RULE_SCOPES.includes(f?.scope) ? f.scope : 'All',
        }
  const normalizeRule = (r: any): PlanRule => {
    const legacy = typeof r?.value === 'string' ? r.value : ''
    const tier = (k: PlanTier): string => {
      const v = r?.values?.[k]
      return typeof v === 'string' ? v : legacy
    }
    return {
      label: typeof r?.label === 'string' ? r.label : '',
      values: { Normal: tier('Normal'), Pro: tier('Pro'), 'Pro+': tier('Pro+') },
      description: typeof r?.description === 'string' ? r.description : '',
      scope: RULE_SCOPES.includes(r?.scope) ? r.scope : 'All',
    }
  }
  const features = Array.isArray(raw.features) ? raw.features.map(normalizeFeature) : []
  const rules = Array.isArray(raw.rules) ? raw.rules.map(normalizeRule) : []
  const tiers = (Object.fromEntries(PLAN_TIERS.map(tr => [tr, normalizeTier(raw?.tiers?.[tr])])) as unknown) as Record<PlanTier, PlanTierPricing>
  if (!PLAN_TIERS.every(tr => tiers[tr])) return null
  return {
    id,
    name: PLAN_LEVELS.includes(raw.name) ? raw.name : id,
    tagline: typeof raw.tagline === 'string' ? raw.tagline : '',
    popular: Boolean(raw.popular),
    features,
    rules,
    tiers,
  }
}

export function loadMembershipPricing(): MembershipPricingState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultMembershipPricing()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaultMembershipPricing()
    const plans = ((Array.isArray(parsed.plans) ? parsed.plans : []) as any[])
      .map(normalizePlan)
      .filter((p): p is PlanCard => p !== null)
    if (plans.length === 0) return defaultMembershipPricing()
    const s = parsed?.sections
    const ad = parsed?.annualDiscount
    return {
      currency: typeof parsed.currency === 'string' ? parsed.currency : 'GBP',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      plans,
      sections: {
        price: { description: typeof s?.price?.description === 'string' ? s.price.description : DEFAULT_SECTIONS.price.description },
        feature: { description: typeof s?.feature?.description === 'string' ? s.feature.description : DEFAULT_SECTIONS.feature.description },
        rule: { description: typeof s?.rule?.description === 'string' ? s.rule.description : DEFAULT_SECTIONS.rule.description },
      },
      annualDiscount:
        ad && (ad.type === 'months' || ad.type === 'percent') && typeof ad.value === 'number'
          ? { type: ad.type, value: ad.value }
          : { ...DEFAULT_ANNUAL_DISCOUNT },
    }
  } catch {
    return defaultMembershipPricing()
  }
}

export function saveMembershipPricing(state: MembershipPricingState) {
  const next = { ...state, updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore quota errors */
  }
  return next
}

export function resetMembershipPricing() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  return defaultMembershipPricing()
}

export function formatPounds(value: number): string {
  return `£${value.toLocaleString('en-GB')}`
}
