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
import { User } from '../../users/entities/user.entity'

@Entity({ name: 'referrals' })
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'affiliate_id', type: 'uuid' })
  affiliateId!: string

  @ManyToOne(() => Affiliate, (affiliate) => affiliate.referrals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_id' })
  affiliate!: Affiliate

  @Column({ name: 'referred_user_id', type: 'uuid', unique: true })
  referredUserId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referred_user_id' })
  referredUser!: User

  @Column({ type: 'varchar', length: 50, default: 'register' })
  source!: string

  @Column({ type: 'varchar', length: 20, default: 'TRACKED' })
  status!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}