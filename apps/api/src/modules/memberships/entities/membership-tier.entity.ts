import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { MembershipBenefit } from './membership-benefit.entity'
import { Membership } from './membership.entity'

@Entity({ name: 'membership_tiers' })
export class MembershipTier {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ name: 'discount_type', default: 'percentage' })
  discountType!: string

  @Column({ name: 'discount_value', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  } })
  discountValue!: number

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number

  @Column({ default: 'active' })
  status!: string

  @OneToMany(() => MembershipBenefit, (membershipBenefit) => membershipBenefit.tier)
  benefits!: MembershipBenefit[]

  @OneToMany(() => Membership, (membership) => membership.tier)
  memberships!: Membership[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}