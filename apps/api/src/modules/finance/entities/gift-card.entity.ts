import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'

@Entity({ name: 'gift_cards' })
export class GiftCard {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ type: 'varchar', length: 150 })
  title!: string

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: {
    to: (v: number) => v,
    from: (v: string) => Number(v),
  } })
  value!: number

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: {
    to: (v: number) => v,
    from: (v: string) => Number(v),
  } })
  price!: number

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string

  @Column({ type: 'int', default: 0 })
  sold!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
