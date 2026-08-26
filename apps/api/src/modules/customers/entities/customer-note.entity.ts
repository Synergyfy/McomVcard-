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
import { User } from '../../users/entities/user.entity'

/**
 * Private notes a business keeps about a customer.
 * Customers are derived (grouped by email across interactions), so notes
 * attach to (business_id, customer_email) rather than a customer row.
 */
@Entity({ name: 'customer_notes' })
export class CustomerNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ name: 'customer_email', type: 'varchar', length: 255 })
  customerEmail!: string

  @Column({ name: 'author_id', type: 'uuid', nullable: true })
  authorId!: string | null

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author!: User | null

  @Column({ type: 'text' })
  note!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
