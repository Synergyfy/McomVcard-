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
import { CashbackTransaction } from './cashback-transaction.entity'

@Entity({ name: 'cashback_accounts' })
export class CashbackAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string

  @ManyToOne(() => User, (user) => user.cashbackAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  } })
  balance!: number

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string

  @OneToMany(() => CashbackTransaction, (transaction) => transaction.account)
  transactions!: CashbackTransaction[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}