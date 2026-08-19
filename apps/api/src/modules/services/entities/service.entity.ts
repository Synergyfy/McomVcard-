import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'

@Entity({ name: 'services' })
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, (business) => business.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column()
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: string | null) => (value === null ? null : Number(value)),
  } })
  price!: number | null

  @Column({ length: 3, default: 'USD' })
  currency!: string

  @Column({ nullable: true })
  duration!: number | null

  @Column({ nullable: true })
  image!: string | null

  @Column({ default: 'active' })
  status!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}