import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'
import { Offer } from './offer.entity'

export enum CouponStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

@Entity({ name: 'coupons' })
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'offer_id', type: 'uuid' })
  offerId!: string

  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_id' })
  offer!: Offer

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string

  @Column({ name: 'discount_type', type: 'varchar', length: 20, default: 'PERCENT' })
  discountType!: string

  @Column({ name: 'discount_value', type: 'numeric', precision: 10, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => Number(v) } })
  discountValue!: number

  @Column({ name: 'max_uses', type: 'integer', default: 0 })
  maxUses!: number

  @Column({ name: 'used_count', type: 'integer', default: 0 })
  usedCount!: number

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null

  @Column({ type: 'varchar', length: 40, default: CouponStatus.ACTIVE })
  status!: CouponStatus

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}