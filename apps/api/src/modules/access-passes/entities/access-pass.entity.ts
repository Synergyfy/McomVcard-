import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'
import { PlanConfiguration, PlanFeature } from '../../plans/entities/plan.entity'

/**
 * An access pass is a simpler alternative to a plan: it grants exactly one
 * bundle of features/limits for a fixed number of days, bought for a single
 * one-off price. Unlike a plan there are no Standard/Pro/Pro+ variants.
 */
@Entity({ name: 'access_passes' })
@Index(['status', 'sortOrder'])
@Index('uq_access_passes_name', ['name'], { unique: true })
export class AccessPass {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'text' })
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  price!: number

  /** How long the buyer's access lasts, in whole days (e.g. 70). */
  @Column({ name: 'duration_days', type: 'int' })
  durationDays!: number

  @Column({ default: 'GBP' })
  currency!: string

  @Column({ default: 'active' })
  status!: string

  /** Checklist shown on the pass card / purchase page. */
  @Column({ type: 'jsonb', nullable: true })
  features!: PlanFeature[] | null

  /** Enforced quotas and feature flags, same shape as a plan configuration. */
  @Column({ name: 'configuration', type: 'jsonb', nullable: true })
  configuration!: PlanConfiguration | null

  @Column({ name: 'stripe_price_id', type: 'varchar', nullable: true })
  stripePriceId!: string | null

  @Column({ name: 'paypal_plan_id', type: 'varchar', nullable: true })
  paypalPlanId!: string | null

  @Column({ default: false })
  popular!: boolean

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
