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
import { Plan } from '../../plans/entities/plan.entity'

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

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
