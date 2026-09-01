import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

export type PlanLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
export type PlanAudience = 'business' | 'consumer'
export type PlanAccessTier = 'Normal' | 'Pro' | 'Pro+'
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
  values: Record<PlanAccessTier, string>
  description: string
  scope: RuleScope
}

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

@Entity({ name: 'plans' })
@Index(['audience', 'sortOrder'])
@Index('uq_plans_name', ['name'], { unique: true })
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 20 })
  level!: PlanLevel

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

  @Column({ type: 'jsonb', nullable: true })
  tiers!: PlanTierPricingMap | null

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