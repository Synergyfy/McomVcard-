import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'

@Entity({ name: 'availability' })
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, (business) => business.availability, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ name: 'day_of_week' })
  dayOfWeek!: number

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string

  @Column({ name: 'is_closed', default: false })
  isClosed!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}