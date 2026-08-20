import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Affiliate } from './affiliate.entity'
import { Referral } from './referral.entity'

export type AffiliateTransactionType = 'COMMISSION' | 'PAYOUT' | 'ADJUST'
export type AffiliateTransactionStatus = 'pending' | 'approved' | 'rejected'

@Entity({ name: 'affiliate_transactions' })
export class AffiliateTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'affiliate_id', type: 'uuid' })
  affiliateId!: string

  @ManyToOne(() => Affiliate, (affiliate) => affiliate.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_id' })
  affiliate!: Affiliate

  @Column({ name: 'referral_id', type: 'uuid', nullable: true })
  referralId!: string | null

  @ManyToOne(() => Referral, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'referral_id' })
  referral!: Referral | null

  @Column({ type: 'varchar', length: 20, default: 'COMMISSION' })
  type!: AffiliateTransactionType

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  } })
  amount!: number

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: AffiliateTransactionStatus

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}