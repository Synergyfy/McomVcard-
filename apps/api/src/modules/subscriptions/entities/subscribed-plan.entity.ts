import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Plan, PlanVariantKey } from '../../plans/entities/plan.entity'

@Entity({ name: 'subscribed_plans' })
@Index(['userId', 'status'])
@Index(['planId'])
export class SubscribedPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string

  @ManyToOne(() => Plan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: Plan

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'cancelled' | 'expired'

  /**
   * The purchased plan variant: standard (90d), pro (180d) or pro_plus (365d).
   * Stored so entitlements/capabilities can be resolved for the exact variant
   * the customer bought rather than guessing from the price/expiry.
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  variant!: PlanVariantKey | null

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null

  /**
   * MCOM Pay charge id that activated this period. Activation is idempotent on
   * this reference so retries / webhook replays never extend access twice.
   */
  @Column({ name: 'payment_reference', type: 'varchar', length: 255, nullable: true })
  paymentReference!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
