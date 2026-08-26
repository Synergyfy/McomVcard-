import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { MembershipTier } from './membership-tier.entity'

@Entity({ name: 'memberships' })
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'membership_tier_id', type: 'uuid' })
  membershipTierId!: string

  @ManyToOne(() => MembershipTier, (tier) => tier.memberships, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'membership_tier_id' })
  tier!: MembershipTier

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'active' })
  status!: string

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}