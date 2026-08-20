import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Card } from '../../cards/entities/card.entity'
import { Affiliate } from '../../affiliates/entities/affiliate.entity'

@Entity({ name: 'shares' })
export class Share {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'card_id', type: 'uuid' })
  cardId!: string

  @ManyToOne(() => Card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card!: Card

  @Column({ type: 'varchar', length: 50 })
  platform!: string

  @Column({ name: 'affiliate_id', type: 'uuid', nullable: true })
  affiliateId!: string | null

  @ManyToOne(() => Affiliate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'affiliate_id' })
  affiliate!: Affiliate | null

  @Column({ name: 'referral_code', type: 'varchar', length: 50, nullable: true })
  referralCode!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}