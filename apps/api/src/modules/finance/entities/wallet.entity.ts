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
import { WalletTransaction } from './wallet-transaction.entity'

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string

  @ManyToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  } })
  balance!: number

  @Column({ type: 'varchar', length: 3, default: 'GBP' })
  currency!: string

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions!: WalletTransaction[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}