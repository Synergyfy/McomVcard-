import {
  Plan,
  PlanConfiguration,
  PlanFeature,
  PlanRule,
  PlanTierPricingMap,
  PlanVariants,
  PlanVariant,
  PlanVariantKey,
} from './entities/plan.entity'

/**
 * Every plan has exactly three purchasable variants. The duration is fixed by
 * the variant — administrators configure the price and entitlements, not the
 * length of access.
 */
export const PLAN_VARIANT_DEFINITIONS: Record<
  PlanVariantKey,
  { name: string; durationDays: number; blurb: string }
> = {
  standard: { name: 'Standard', durationDays: 90, blurb: '90 days of access' },
  pro: { name: 'Pro', durationDays: 180, blurb: '180 days of access' },
  pro_plus: { name: 'Pro+', durationDays: 365, blurb: '1 year of access' },
}

export const PLAN_VARIANT_KEYS: PlanVariantKey[] = ['standard', 'pro', 'pro_plus']

export type PartialPlanVariant = Partial<Omit<PlanVariant, 'key'>> & { key?: PlanVariantKey }

function emptyVariant(key: PlanVariantKey): PlanVariant {
  const definition = PLAN_VARIANT_DEFINITIONS[key]
  return {
    key,
    name: definition.name,
    durationDays: definition.durationDays,
    price: 0,
    description: definition.blurb,
    features: null,
    rules: null,
    configuration: null,
    stripePriceId: null,
    paypalPlanId: null,
    isActive: true,
  }
}

/** Three empty variants — Standard (90d), Pro (180d), Pro+ (365d). */
export function defaultVariants(): PlanVariants {
  return {
    standard: emptyVariant('standard'),
    pro: emptyVariant('pro'),
    pro_plus: emptyVariant('pro_plus'),
  }
}

function coerceNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

function coerceString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function normalizeVariant(input: PartialPlanVariant | undefined, key: PlanVariantKey): PlanVariant {
  const base = emptyVariant(key)
  if (!input) return base
  const definition = PLAN_VARIANT_DEFINITIONS[key]

  return {
    key,
    // Name and duration are fixed by the variant; never trust overrides.
    name: definition.name,
    durationDays: definition.durationDays,
    price: coerceNumber(input.price, base.price),
    description: coerceString(input.description, base.description) || base.description,
    features: Array.isArray(input.features) && input.features.length > 0 ? input.features : null,
    rules: Array.isArray(input.rules) && input.rules.length > 0 ? input.rules : null,
    configuration: input.configuration ?? null,
    stripePriceId: input.stripePriceId ?? null,
    paypalPlanId: input.paypalPlanId ?? null,
    isActive: input.isActive !== false,
  }
}

/**
 * Normalise an array or keyed map into the canonical three-variant record.
 * Missing variants are filled with defaults.
 */
export function normalizeVariants(
  input?: PartialPlanVariant[] | Partial<Record<PlanVariantKey, PartialPlanVariant>> | null,
): PlanVariants {
  const byKey: Partial<Record<PlanVariantKey, PartialPlanVariant>> = {}

  if (Array.isArray(input)) {
    for (const variant of input) {
      if (variant?.key && PLAN_VARIANT_KEYS.includes(variant.key)) {
        byKey[variant.key] = variant
      }
    }
  } else if (input) {
    for (const key of PLAN_VARIANT_KEYS) {
      if (input[key]) byKey[key] = input[key]
    }
  }

  return {
    standard: normalizeVariant(byKey.standard, 'standard'),
    pro: normalizeVariant(byKey.pro, 'pro'),
    pro_plus: normalizeVariant(byKey.pro_plus, 'pro_plus'),
  }
}

/**
 * Derive the three variants from the legacy `tiers` pricing map so existing
 * plans keep working after the model change.
 *
 * Standard -> 90 days (quarterly price)
 * Pro      -> 180 days (semiannual price)
 * Pro+     -> 1 year   (annual price)
 */
export function variantsFromLegacyTiers(
  tiers: PlanTierPricingMap | null | undefined,
  stripeIds?: { quarterly?: string | null; annual?: string | null },
  paypalIds?: { quarterly?: string | null; annual?: string | null },
): PlanVariants {
  const standard = tiers?.Normal ?? tiers?.Pro
  const pro = tiers?.Pro ?? tiers?.Normal
  const proPlus = tiers?.['Pro+'] ?? tiers?.Pro ?? tiers?.Normal

  const standardPrice =
    coerceNumber(standard?.quarterly, 0) || coerceNumber(standard?.monthly, 0) * 3
  const proPrice =
    coerceNumber(pro?.semiannual, 0) ||
    coerceNumber(pro?.quarterly, 0) * 2 ||
    coerceNumber(pro?.monthly, 0) * 6
  const proPlusPrice =
    coerceNumber(proPlus?.annual, 0) || coerceNumber(proPlus?.quarterly, 0) * 4

  const variant = (
    key: PlanVariantKey,
    source: typeof standard,
    price: number,
    stripePriceId?: string | null,
    paypalPlanId?: string | null,
  ): PlanVariant => ({
    ...emptyVariant(key),
    price,
    description: coerceString(source?.description, PLAN_VARIANT_DEFINITIONS[key].blurb),
    stripePriceId: stripePriceId ?? null,
    paypalPlanId: paypalPlanId ?? null,
    isActive: true,
  })

  return {
    standard: variant('standard', standard, standardPrice, stripeIds?.quarterly, paypalIds?.quarterly),
    pro: variant('pro', pro, proPrice),
    pro_plus: variant('pro_plus', proPlus, proPlusPrice, stripeIds?.annual, paypalIds?.annual),
  }
}

/** Resolve a plan's variants, falling back to the legacy tiers when needed. */
export function resolvePlanVariants(plan: Plan): PlanVariants {
  if (plan.variants) return normalizeVariants(plan.variants)

  return variantsFromLegacyTiers(
    plan.tiers,
    { quarterly: plan.stripeQuarterlyPriceId, annual: plan.stripeAnnualPriceId },
    { quarterly: plan.paypalQuarterlyPlanId, annual: plan.paypalAnnualPlanId },
  )
}

/** Merge base configuration with a variant's override (variant wins). */
export function mergeConfiguration(
  base: PlanConfiguration | null | undefined,
  override: PlanConfiguration | null | undefined,
): PlanConfiguration | null {
  if (!base && !override) return null

  const quotas = { ...(base?.quotas ?? {}), ...(override?.quotas ?? {}) }
  const featureFlags = { ...(base?.featureFlags ?? {}), ...(override?.featureFlags ?? {}) }

  return {
    ...(Object.keys(quotas).length > 0 ? { quotas } : {}),
    ...(Object.keys(featureFlags).length > 0 ? { featureFlags } : {}),
  }
}

/**
 * The entitlements a buyer of a specific variant receives: the plan's shared
 * features/rules plus the variant's own overrides/configuration.
 */
export function resolveVariantEntitlements(plan: Plan, variant: PlanVariant) {
  return {
    features: variant.features?.length ? variant.features : (plan.features ?? []),
    rules: variant.rules?.length ? variant.rules : (plan.rules ?? []),
    configuration: mergeConfiguration(plan.configuration, variant.configuration),
  }
}

export function blankFeature(): PlanFeature {
  return { text: '', description: '', scope: 'All' }
}

export function blankRule(): PlanRule {
  return { label: '', values: {}, description: '', scope: 'All' }
}
