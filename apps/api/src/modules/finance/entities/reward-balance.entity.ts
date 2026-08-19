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
import { User } from '../../users/entities/user.entity'
import { RewardTransaction } from './reward-transaction.entity'

@Entity({ name: 'reward_balances' })
export class RewardBalance {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string

  @ManyToOne(() => User, (user) => user.rewardBalance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  } })
  balance!: number

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string

  @OneToMany(() => RewardTransaction, (transaction) => transaction.balance)
  transactions!: RewardTransaction[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}