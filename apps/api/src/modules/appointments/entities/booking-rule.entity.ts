import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'

@Entity({ name: 'booking_rules' })
export class BookingRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, (business) => business.bookingRules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ default: true })
  enabled!: boolean

  @Column({ name: 'default_duration', default: 60 })
  defaultDuration!: number

  @Column({ default: 15 })
  buffer!: number

  @Column({ name: 'lead_time_hours', default: 24 })
  leadTimeHours!: number

  @Column({ name: 'advance_window_days', default: 30 })
  advanceWindowDays!: number

  @Column({ name: 'require_payment', default: false })
  requirePayment!: boolean

  @Column({ type: 'text', nullable: true, name: 'confirmation_message' })
  confirmationMessage!: string | null

  @Column({ type: 'text', nullable: true, name: 'cancellation_policy' })
  cancellationPolicy!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}