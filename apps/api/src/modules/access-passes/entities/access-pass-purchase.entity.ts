import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { AccessPass } from './access-pass.entity'

/**
 * A purchased access pass window. Entitlements are resolved from the linked
 * pass for as long as `expiresAt` is in the future.
 */
@Entity({ name: 'access_pass_purchases' })
@Index(['userId', 'status'])
@Index(['accessPassId'])
@Index('IDX_access_pass_purchases_payment_reference', ['paymentReference'], {
  unique: true,
  where: '"payment_reference" IS NOT NULL',
})
export class AccessPassPurchase {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'access_pass_id', type: 'uuid' })
  accessPassId!: string

  @ManyToOne(() => AccessPass, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'access_pass_id' })
  accessPass!: AccessPass

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'cancelled' | 'expired'

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date

  /**
   * MCOM Pay charge id that activated this window. Activation is idempotent on
   * this reference so retries / webhook replays never extend access twice.
   */
  @Column({ name: 'payment_reference', type: 'varchar', length: 255, nullable: true })
  paymentReference!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
