import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm'
import { MembershipTier } from './membership-tier.entity'
import { Benefit } from './benefit.entity'

@Entity({ name: 'membership_benefits' })
@Unique('uq_membership_benefits_tier_benefit', ['membershipTierId', 'benefitId'])
export class MembershipBenefit {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'membership_tier_id', type: 'uuid' })
  membershipTierId!: string

  @ManyToOne(() => MembershipTier, (tier) => tier.benefits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membership_tier_id' })
  tier!: MembershipTier

  @Column({ name: 'benefit_id', type: 'uuid' })
  benefitId!: string

  @ManyToOne(() => Benefit, (benefit) => benefit.tiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'benefit_id' })
  benefit!: Benefit

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}