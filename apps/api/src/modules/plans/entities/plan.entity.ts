import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm'

export type PlanLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
export type PlanAudience = 'business' | 'consumer'
export type PlanAccessTier = 'Normal' | 'Pro' | 'Pro+'
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

@Entity({ name: 'plans' })
@Unique(['level', 'audience'])
@Index(['audience', 'sortOrder'])
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 20 })
  level!: PlanLevel

  @Column({ type: 'varchar', length: 20 })
  audience!: PlanAudience

  @Column({ nullable: true })
  name!: string | null

  @Column({ type: 'text', nullable: true })
  tagline!: string | null

  @Column({ default: false })
  popular!: boolean

  @Column({ type: 'int', default: 0 })
  sortOrder!: number

  @Column({ type: 'jsonb', nullable: true })
  features!: PlanFeature[] | null

  @Column({ type: 'jsonb', nullable: true })
  rules!: PlanRule[] | null

  @Column({ type: 'jsonb', nullable: true })
  tiers!: PlanTierPricingMap | null

  @Column({ type: 'jsonb', nullable: true })
  sections!: PricingSections | null

  @Column({ type: 'jsonb', nullable: true })
  annualDiscount!: AnnualDiscount | null

  @Column({ default: 'GBP' })
  currency!: string

  @Column({ default: 'active' })
  status!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}