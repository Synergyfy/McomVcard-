import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'
import { Campaign } from './campaign.entity'
import { Coupon } from './coupon.entity'

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

@Entity({ name: 'offers' })
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId!: string

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: Campaign

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ type: 'varchar', length: 150 })
  title!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ name: 'discount_type', type: 'varchar', length: 20, default: DiscountType.PERCENT })
  discountType!: DiscountType

  @Column({ name: 'discount_value', type: 'numeric', precision: 10, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => Number(v) } })
  discountValue!: number

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => Coupon, (coupon) => coupon.offer)
  coupons!: Coupon[]
}