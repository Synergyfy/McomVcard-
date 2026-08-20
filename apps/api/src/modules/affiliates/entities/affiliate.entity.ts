import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Referral } from './referral.entity'
import { AffiliateTransaction } from './affiliate-transaction.entity'

@Entity({ name: 'affiliates' })
export class Affiliate {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string

  @OneToOne(() => User, (user) => user.affiliate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'affiliate_code', type: 'varchar', length: 50, unique: true })
  affiliateCode!: string

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string

  @Column({ name: 'joined_at', type: 'timestamptz' })
  joinedAt!: Date

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => Referral, (referral) => referral.affiliate)
  referrals!: Referral[]

  @OneToMany(() => AffiliateTransaction, (transaction) => transaction.affiliate)
  transactions!: AffiliateTransaction[]
}