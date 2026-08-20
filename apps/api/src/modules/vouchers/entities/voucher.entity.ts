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
import { VoucherVendor } from './voucher-vendor.entity'
import { VoucherTransaction } from './voucher-transaction.entity'

export type VoucherStatus = 'AVAILABLE' | 'ASSIGNED' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED'

@Entity({ name: 'vouchers' })
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId!: string

  @ManyToOne(() => VoucherVendor, (vendor) => vendor.vouchers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor!: VoucherVendor

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string

  @Column({ type: 'varchar', length: 100 })
  title!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  } })
  value!: number

  @Column({ type: 'varchar', length: 10, default: 'GBP' })
  currency!: string

  @Column({ type: 'varchar', length: 20, default: 'AVAILABLE' })
  status!: VoucherStatus

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null

  @Column({ name: 'assigned_to_user_id', type: 'uuid', nullable: true })
  assignedToUserId!: string | null

  @Column({ name: 'assigned_at', type: 'timestamptz', nullable: true })
  assignedAt!: Date | null

  @Column({ name: 'redeemed_at', type: 'timestamptz', nullable: true })
  redeemedAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => VoucherTransaction, (transaction) => transaction.voucher)
  transactions!: VoucherTransaction[]
}