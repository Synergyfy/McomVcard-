import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { RewardBalance } from './reward-balance.entity'

export type RewardTransactionType = 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST'

@Entity({ name: 'reward_transactions' })
export class RewardTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'reward_balance_id', type: 'uuid' })
  rewardBalanceId!: string

  @ManyToOne(() => RewardBalance, (balance) => balance.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reward_balance_id' })
  balance!: RewardBalance

  @Column({ type: 'varchar', length: 10 })
  type!: RewardTransactionType

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  } })
  amount!: number

  @Column({ name: 'balance_after', type: 'numeric', precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  } })
  balanceAfter!: number

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}