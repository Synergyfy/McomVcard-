import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Voucher } from './voucher.entity'

export type VoucherTransactionType = 'CREATED' | 'ASSIGNED' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED'

@Entity({ name: 'voucher_transactions' })
export class VoucherTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'voucher_id', type: 'uuid' })
  voucherId!: string

  @ManyToOne(() => Voucher, (voucher) => voucher.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voucher_id' })
  voucher!: Voucher

  @Column({ type: 'varchar', length: 20 })
  type!: VoucherTransactionType

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null

  @Column({ type: 'text', nullable: true })
  note!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}