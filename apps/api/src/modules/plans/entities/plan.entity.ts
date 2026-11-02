import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

/**
 * Legacy plan levels are kept as optional metadata only. Plans may have any
 * free-form name — the level is no longer a fixed enum.
 */
export type PlanLevel = string
export type PlanAudience = 'business' | 'consumer'
/** Legacy tier labels (pre-variant plans). */
export type PlanAccessTier = 'Normal' | 'Pro' | 'Pro+'
/** Canonical purchasable variants — fixed durations of 90/180/365 days. */
export type PlanVariantKey = 'standard' | 'pro' | 'pro_plus'
export type PlanType = 'STANDARD' | 'TRIAL' | 'SEASONAL'
export type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual'
export type RuleScope = 'All' | 'Admin setup' | 'Business usage' | 'Consumer usage' | 'Public page'

export interface PlanFeature {
  text: string
  description: string
  scope: RuleScope
}

export interface PlanRule {
  label: string
  /** Per-variant values keyed by Standard/Pro/Pro+ (legacy keys also accepted). */
  values: Record<string, string>
  description: string
  scope: RuleScope
}

export interface PlanTierPricing {
  monthly: number
  quarterly: number
  semiannual: number
  annual: number
  description: string
  scope: RuleScope
}

export interface PlanTierPricingMap {
  Normal: PlanTierPricing
  Pro: PlanTierPricing
  'Pro+': PlanTierPricing
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

/**
 * MCOM Solutions connector-facing configuration. Mirrors the mall's Tier
 * `configuration` payload consumed by the Generic Connector: per-plan quotas
 * (e.g. maxVCards, maxTeamMembers) and boolean feature flags.
 */
export interface PlanConfiguration {
  quotas?: Record<string, number | boolean>
  featureFlags?: Record<string, boolean>
}

/**
 * A purchasable variant of a plan. Every plan exposes exactly three:
 * Standard (90 days), Pro (180 days) and Pro+ (365 days).
 *
 * `features`, `rules` and `configuration` are optional overrides. When absent,
 * the buyer inherits the plan-level entitlements.
 */
export interface PlanVariant {
  key: PlanVariantKey
  name: string
  durationDays: number
  price: number
  description: string
  features: PlanFeature[] | null
  rules: PlanRule[] | null
  configuration: PlanConfiguration | null
  stripePriceId: string | null
  paypalPlanId: string | null
  isActive: boolean
}

export type PlanVariants = Record<PlanVariantKey, PlanVariant>

@Entity({ name: 'plans' })
@Index(['audience', 'sortOrder'])
@Index('uq_plans_name', ['name'], { unique: true })
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  // Optional legacy label. Free-form plan names are the identity now.
  @Column({ type: 'varchar', length: 40, nullable: true })
  level!: PlanLevel | null

  @Column({ type: 'varchar', length: 20 })
  audience!: PlanAudience

  @Column({ type: 'text', nullable: true })
  name!: string | null

  @Column({ type: 'text', nullable: true })
  tagline!: string | null

  @Column({ default: false })
  popular!: boolean

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @Column({ type: 'jsonb', nullable: true })
  features!: PlanFeature[] | null

  @Column({ type: 'jsonb', nullable: true })
  rules!: PlanRule[] | null

  // Legacy pricing matrix (pre-variant plans). Still read as a fallback.
  @Column({ type: 'jsonb', nullable: true })
  tiers!: PlanTierPricingMap | null

  // Canonical three-variant offering: Standard 90d, Pro 180d, Pro+ 365d.
  @Column({ type: 'jsonb', nullable: true })
  variants!: PlanVariants | null

  @Column({ type: 'jsonb', nullable: true })
  sections!: PricingSections | null

  @Column({ name: 'annual_discount', type: 'jsonb', nullable: true })
  annualDiscount!: AnnualDiscount | null

  @Column({ default: 'GBP' })
  currency!: string

  @Column({ default: 'active' })
  status!: string

  // ── MCOM SOLUTIONS CONNECTOR FIELDS (additive — safe migration) ──────────
  @Column({ name: 'type', type: 'varchar', length: 20, default: 'STANDARD' })
  type!: PlanType

  @Column({ name: 'season_id', type: 'varchar', nullable: true })
  seasonId!: string | null

  @Column({ name: 'configuration', type: 'jsonb', nullable: true })
  configuration!: PlanConfiguration | null

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean

  @Column({ name: 'stripe_monthly_price_id', type: 'varchar', nullable: true })
  stripeMonthlyPriceId!: string | null

  @Column({ name: 'stripe_quarterly_price_id', type: 'varchar', nullable: true })
  stripeQuarterlyPriceId!: string | null

  @Column({ name: 'stripe_annual_price_id', type: 'varchar', nullable: true })
  stripeAnnualPriceId!: string | null

  @Column({ name: 'paypal_monthly_plan_id', type: 'varchar', nullable: true })
  paypalMonthlyPlanId!: string | null

  @Column({ name: 'paypal_quarterly_plan_id', type: 'varchar', nullable: true })
  paypalQuarterlyPlanId!: string | null

  @Column({ name: 'paypal_annual_plan_id', type: 'varchar', nullable: true })
  paypalAnnualPlanId!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}