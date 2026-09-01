import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity({ name: 'coupon_codes' })
export class CouponCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string

  @Column({ type: 'varchar', length: 20, name: 'discount_type' })
  discountType!: string

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'discount_value' })
  discountValue!: number

  @Column({ type: 'int', nullable: true, name: 'max_uses' })
  maxUses!: number | null

  @Column({ type: 'int', default: 0, name: 'used_count' })
  usedCount!: number

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expiresAt!: Date | null

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
