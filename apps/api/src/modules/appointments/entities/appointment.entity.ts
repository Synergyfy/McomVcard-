import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'
import { Service } from '../../services/entities/service.entity'

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, (business) => business.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ name: 'service_id', type: 'uuid', nullable: true })
  serviceId!: string | null

  @ManyToOne(() => Service, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_id' })
  service!: Service | null

  @Column({ name: 'customer_name' })
  customerName!: string

  @Column({ name: 'customer_email' })
  customerEmail!: string

  @Column({ name: 'customer_phone', nullable: true })
  customerPhone!: string | null

  @Column({ type: 'date' })
  date!: string

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string

  @Column({ default: 'pending' })
  status!: string

  @Column({ type: 'text', nullable: true })
  notes!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}