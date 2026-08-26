import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { MembershipBenefit } from './membership-benefit.entity'

@Entity({ name: 'benefits' })
export class Benefit {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ name: 'benefit_type', default: 'perk' })
  benefitType!: string

  @Column({ default: 'active' })
  status!: string

  @OneToMany(() => MembershipBenefit, (membershipBenefit) => membershipBenefit.benefit)
  tiers!: MembershipBenefit[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}