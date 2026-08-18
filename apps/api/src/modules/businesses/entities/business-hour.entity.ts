import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Business } from './business.entity'

@Entity({ name: 'business_hours' })
export class BusinessHour {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, (business) => business.hours, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek!: number

  @Column({ name: 'opens_at', type: 'time', nullable: true })
  opensAt!: string | null

  @Column({ name: 'closes_at', type: 'time', nullable: true })
  closesAt!: string | null

  @Column({ name: 'is_closed', default: false })
  isClosed!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}