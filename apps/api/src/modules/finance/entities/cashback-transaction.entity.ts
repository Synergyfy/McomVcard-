import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { CashbackAccount } from './cashback-account.entity'

export type CashbackTransactionType = 'EARN' | 'REDEEM' | 'ADJUST'

@Entity({ name: 'cashback_transactions' })
export class CashbackTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'cashback_account_id', type: 'uuid' })
  cashbackAccountId!: string

  @ManyToOne(() => CashbackAccount, (account) => account.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cashback_account_id' })
  account!: CashbackAccount

  @Column({ type: 'varchar', length: 10 })
  type!: CashbackTransactionType

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