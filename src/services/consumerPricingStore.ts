/* ------------------------------------------------------------------ */
/*  Consumer membership pricing & rules.                               */
/*                                                                     */
/*  Mirrors the business membershipPricingStore so admins can          */
/*  configure consumer pricing exactly like business pricing:          */
/*  the 4 levels (Bronze, Silver, Gold, Platinum) each with Standard / */
/*  Pro / Pro+ access tiers and 90-day / 180-day / Annual billing.     */
/*                                                                     */
/*  Consumer membership is issued by participating businesses (never   */
/*  bought on the consumer landing), but levels, tiers and any prices  */
/*  shown anywhere ARE configured here — nothing landing-side is       */
/*  hard-coded. Persisted in its own localStorage key.                 */
/* ------------------------------------------------------------------ */

import {
  PLAN_LEVELS, PLAN_TIERS, RULE_SCOPES,
  formatPounds,
  type BillingCycle, type MembershipPricingState, type PlanCard,
  type PlanLevel, type PlanRule, type PlanTierPricing, type PlanTier, type RuleScope,
} from './membershipPricingStore'

export function consumerDescribe(scope: RuleScope): string {
  return scope
}

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

const r = (label: string, n: string, pro: string, proPlus: string, description: string, scope: RuleScope = 'All'): PlanRule => ({
  label,
  values: { Normal: n, Pro: pro, 'Pro+': proPlus },
  description,
  scope,
})

export function defaultConsumerPricing(): MembershipPricingState {
  return {
    currency: 'GBP',
    updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    sections: {
      price: { description: 'Consumer access prices for the selected tier, per billing cycle.' },
      feature: { description: 'Consumer membership feature check-list items.' },
      rule: { description: 'Consumer usage limits shown on cards and the public comparison.' },
    },
    annualDiscount: { type: 'months', value: 2 },
    plans: [
      {
        id: 'Bronze',
        name: 'Bronze',
        tagline: 'The entry membership for consumers, issued by the businesses they trust.',
        features: [
          { text: '1 Digital membership card', description: 'Your membership card in the MCOM app.', scope: 'All' },
          { text: '2 Family cards', description: 'Cards you can allocate to family.', scope: 'All' },
          { text: '1 Friend card', description: 'Cards you can allocate to a friend.', scope: 'All' },
          { text: 'Points on every tap, scan & purchase', description: 'Earn points across participating businesses.', scope: 'All' },
          { text: '£50 e-Card face value', description: 'Total e-card value available.', scope: 'All' },
          { text: 'Basic cashback', description: 'Cashback on eligible spending.', scope: 'All' },
          { text: 'Standard support', description: 'Standard support response times.', scope: 'Public page' },
        ],
        rules: [
          r('Store Cards collectable', '10', '20', '40', 'Number of business store cards you can collect.', 'All'),
          r('Family Cards', '2', '4', '6', 'Cards allocated to family members on your membership.', 'All'),
          r('Friend Cards', '1', '2', '3', 'Cards allocated to friends on your membership.', 'All'),
          r('Cashback rate', '1%', '2%', '3%', 'Cashback earned on eligible spend.', 'All'),
          r('e-Card face value', '£50', '£100', '£250', 'Total e-card value available.', 'All'),
          r('Vouchers & Coupons', '10', '25', '50', 'Vouchers and coupons you can hold.', 'All'),
          r('Deals & offers nearby', 'Local', 'City-wide', 'All', 'Scope of deals shown in your wallet.', 'All'),
          r('Rewards & redeemables', 'Standard', 'Pro', 'Pro+', 'Reward catalogue tier you can redeem from.', 'All'),
          r('Loyalty points multiplier', '1x', '2x', '3x', 'Points earned per purchase, multiplied by level.', 'All'),
          r('Wishlist size', '25', '50', '100', 'Saved businesses and cards in your wishlist.', 'All'),
        ],
        tiers: { Normal: t(0, 0), Pro: t(9, 90), 'Pro+': t(19, 190, 7) },
      },
      {
        id: 'Silver',
        name: 'Silver',
        tagline: 'More room for family, friends and the businesses you love.',
        features: [
          { text: '1 Digital membership card', description: 'Your membership card in the MCOM app.', scope: 'All' },
          { text: '4 Family cards', description: 'Cards you can allocate to family.', scope: 'All' },
          { text: '2 Friend cards', description: 'Cards you can allocate to friends.', scope: 'All' },
          { text: 'Higher cashback rate', description: 'Earn more cashback on eligible spend.', scope: 'All' },
          { text: '£100 e-Card face value', description: 'Total e-card value available.', scope: 'All' },
          { text: 'Priority offers', description: 'Early access to member-only deals.', scope: 'All' },
          { text: 'Priority support', description: 'Priority support response times.', scope: 'Public page' },
        ],
        rules: [
          r('Store Cards collectable', '20', '40', '80', 'Number of business store cards you can collect.', 'All'),
          r('Family Cards', '4', '6', '8', 'Cards allocated to family members on your membership.', 'All'),
          r('Friend Cards', '2', '3', '4', 'Cards allocated to friends on your membership.', 'All'),
          r('Cashback rate', '2%', '3%', '4%', 'Cashback earned on eligible spend.', 'All'),
          r('e-Card face value', '£100', '£250', '£500', 'Total e-card value available.', 'All'),
          r('Vouchers & Coupons', '25', '50', '100', 'Vouchers and coupons you can hold.', 'All'),
          r('Deals & offers nearby', 'City-wide', 'City-wide', 'All', 'Scope of deals shown in your wallet.', 'All'),
          r('Rewards & redeemables', 'Standard', 'Pro', 'Pro+', 'Reward catalogue tier you can redeem from.', 'All'),
          r('Loyalty points multiplier', '2x', '3x', '4x', 'Points earned per purchase, multiplied by level.', 'All'),
          r('Wishlist size', '50', '100', '200', 'Saved businesses and cards in your wishlist.', 'All'),
        ],
        tiers: { Normal: t(0, 0), Pro: t(19, 190), 'Pro+': t(29, 290, 7) },
      },
      {
        id: 'Gold',
        name: 'Gold',
        tagline: 'Premium access with guest passes and first-in-line campaigns.',
        popular: true,
        features: [
          { text: '1 Digital membership card', description: 'Your membership card in the MCOM app.', scope: 'All' },
          { text: '6 Family cards', description: 'Cards you can allocate to family.', scope: 'All' },
          { text: '3 Friend cards', description: 'Cards you can allocate to friends.', scope: 'All' },
          { text: 'Premium cashback rate', description: 'Top cashback rates on eligible spend.', scope: 'All' },
          { text: 'Guest passes', description: 'One-off passes for friends to try benefits.', scope: 'All' },
          { text: 'Early access to campaigns', description: 'Join seasonal campaigns first.', scope: 'All' },
          { text: 'Priority support', description: 'Priority support response times.', scope: 'Public page' },
        ],
        rules: [
          r('Store Cards collectable', '40', '80', '160', 'Number of business store cards you can collect.', 'All'),
          r('Family Cards', '6', '8', '10', 'Cards allocated to family members on your membership.', 'All'),
          r('Friend Cards', '3', '4', '5', 'Cards allocated to friends on your membership.', 'All'),
          r('Cashback rate', '3%', '4%', '5%', 'Cashback earned on eligible spend.', 'All'),
          r('e-Card face value', '£250', '£500', '£1,000', 'Total e-card value available.', 'All'),
          r('Vouchers & Coupons', '50', '100', '200', 'Vouchers and coupons you can hold.', 'All'),
          r('Deals & offers nearby', 'All', 'All', 'All', 'Scope of deals shown in your wallet.', 'All'),
          r('Rewards & redeemables', 'Pro', 'Pro', 'Pro+', 'Reward catalogue tier you can redeem from.', 'All'),
          r('Loyalty points multiplier', '3x', '4x', '5x', 'Points earned per purchase, multiplied by level.', 'All'),
          r('Wishlist size', '100', '200', '400', 'Saved businesses and cards in your wishlist.', 'All'),
        ],
        tiers: { Normal: t(0, 0), Pro: t(29, 290), 'Pro+': t(39, 390, 7) },
      },
      {
        id: 'Platinum',
        name: 'Platinum',
        tagline: 'The ultimate consumer membership — VIP support and first access to new MCOM features.',
        features: [
          { text: '1 Digital membership card', description: 'Your membership card in the MCOM app.', scope: 'All' },
          { text: '8 Family cards', description: 'Cards you can allocate to family.', scope: 'All' },
          { text: '4 Friend cards', description: 'Cards you can allocate to friends.', scope: 'All' },
          { text: 'VIP cashback rate', description: 'Highest cashback on eligible spend.', scope: 'All' },
          { text: 'Unlimited e-Card value', description: 'No cap on your e-card.', scope: 'All' },
          { text: 'VIP support', description: 'Priority help when you need it.', scope: 'Public page' },
          { text: 'Preview new MCOM features', description: 'Be first to try new tools.', scope: 'All' },
        ],
        rules: [
          r('Store Cards collectable', '80', '160', 'Unlimited', 'Number of business store cards you can collect.', 'All'),
          r('Family Cards', '8', '10', '12', 'Cards allocated to family members on your membership.', 'All'),
          r('Friend Cards', '4', '5', '6', 'Cards allocated to friends on your membership.', 'All'),
          r('Cashback rate', '4%', '5%', '6%', 'Cashback earned on eligible spend.', 'All'),
          r('e-Card face value', '£500', '£1,000', 'Unlimited', 'Total e-card value available.', 'All'),
          r('Vouchers & Coupons', '100', '200', 'Unlimited', 'Vouchers and coupons you can hold.', 'All'),
          r('Deals & offers nearby', 'All', 'All', 'All', 'Scope of deals shown in your wallet.', 'All'),
          r('Rewards & redeemables', 'Pro+', 'Pro+', 'Pro+', 'Reward catalogue tier you can redeem from.', 'All'),
          r('Loyalty points multiplier', '4x', '5x', '6x', 'Points earned per purchase, multiplied by level.', 'All'),
          r('Wishlist size', '200', '400', 'Unlimited', 'Saved businesses and cards in your wishlist.', 'All'),
        ],
        tiers: { Normal: t(0, 0), Pro: t(49, 490), 'Pro+': t(69, 690, 7) },
      },
    ],
  }
}

/* ── Persistence ──────────────────────────────────────────────────── */

const KEY = 'mcom_consumer_pricing'

function normalizePlan(raw: any): PlanCard | null {
  if (!raw || typeof raw !== 'object') return null
  const id = (PLAN_LEVELS.includes(raw.id) ? raw.id : PLAN_LEVELS[0]) as PlanLevel
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
  const normalizeFeature = (f: any) =>
    typeof f === 'string'
      ? { text: f, description: '', scope: 'All' as RuleScope }
      : {
          text: typeof f?.text === 'string' ? f.text : '',
          description: typeof f?.description === 'string' ? f.description : '',
          scope: RULE_SCOPES.includes(f?.scope) ? f.scope : 'All' as RuleScope,
        }
  const normalizeRule = (rawRule: any): PlanRule => {
    const legacy = typeof rawRule?.value === 'string' ? rawRule.value : ''
    const tier = (k: PlanTier): string => {
      const v = rawRule?.values?.[k]
      return typeof v === 'string' ? v : legacy
    }
    return {
      label: typeof rawRule?.label === 'string' ? rawRule.label : '',
      values: { Normal: tier('Normal'), Pro: tier('Pro'), 'Pro+': tier('Pro+') },
      description: typeof rawRule?.description === 'string' ? rawRule.description : '',
      scope: RULE_SCOPES.includes(rawRule?.scope) ? rawRule.scope : 'All',
    }
  }
  const features = Array.isArray(raw.features) ? raw.features.map(normalizeFeature) : []
  const rules = Array.isArray(raw.rules) ? raw.rules.map(normalizeRule) : []
  const tiers = (Object.fromEntries(PLAN_TIERS.map((tr) => [tr, normalizeTier(raw?.tiers?.[tr])])) as unknown) as Record<PlanTier, PlanTierPricing>
  if (!PLAN_TIERS.every((tr) => tiers[tr])) return null
  return {
    id,
    name: (PLAN_LEVELS.includes(raw.name) ? raw.name : id) as PlanLevel,
    tagline: typeof raw.tagline === 'string' ? raw.tagline : '',
    popular: Boolean(raw.popular),
    features,
    rules,
    tiers,
  }
}

export function loadConsumerPricing(): MembershipPricingState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultConsumerPricing()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaultConsumerPricing()
    const plans = ((Array.isArray(parsed.plans) ? parsed.plans : []) as any[])
      .map(normalizePlan)
      .filter((p): p is PlanCard => p !== null)
    if (plans.length === 0) return defaultConsumerPricing()
    const s = parsed?.sections
    const ad = parsed?.annualDiscount
    return {
      currency: typeof parsed.currency === 'string' ? parsed.currency : 'GBP',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      plans,
      sections: {
        price: { description: typeof s?.price?.description === 'string' ? s.price.description : defaultConsumerPricing().sections.price.description },
        feature: { description: typeof s?.feature?.description === 'string' ? s.feature.description : defaultConsumerPricing().sections.feature.description },
        rule: { description: typeof s?.rule?.description === 'string' ? s.rule.description : defaultConsumerPricing().sections.rule.description },
      },
      annualDiscount:
        ad && (ad.type === 'months' || ad.type === 'percent') && typeof ad.value === 'number'
          ? { type: ad.type, value: ad.value }
          : { type: 'months', value: 2 },
    }
  } catch {
    return defaultConsumerPricing()
  }
}

export function saveConsumerPricing(state: MembershipPricingState) {
  const next = { ...state, updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore quota errors */
  }
  return next
}

export function resetConsumerPricing() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  return defaultConsumerPricing()
}

export function consumerFormatPounds(value: number): string {
  return formatPounds(value)
}

/* Re-exported so consumer flows share the same level/tier vocabulary. */
export const CONSUMER_PRICING_LEVELS = PLAN_LEVELS
export const CONSUMER_PRICING_TIERS = PLAN_TIERS
export type { BillingCycle }