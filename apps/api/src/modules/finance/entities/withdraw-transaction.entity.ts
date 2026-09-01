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

@Entity({ name: 'withdraw_transactions' })
@Index(['userId'])
@Index(['status'])
export class WithdrawTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  } })
  amount!: number

  @Column({ type: 'varchar', length: 3, default: 'GBP' })
  currency!: string

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: 'pending' | 'approved' | 'rejected' | 'paid'

  @Column({ type: 'jsonb', nullable: true })
  bankDetails!: Record<string, any> | null

  @Column({ type: 'text', nullable: true })
  notes!: string | null

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
