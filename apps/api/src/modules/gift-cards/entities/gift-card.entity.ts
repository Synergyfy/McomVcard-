import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'

export enum GiftCardStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
}

@Entity({ name: 'gift_cards' })
@Index(['businessId'])
export class GiftCard {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ length: 200 })
  title!: string

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  value!: number

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price!: number

  @Column({ default: GiftCardStatus.ACTIVE })
  status!: GiftCardStatus

  @Column({ default: 0 })
  sold!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}