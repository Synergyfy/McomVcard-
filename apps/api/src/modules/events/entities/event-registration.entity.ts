import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Event } from './event.entity'
import { EventTicket } from './event-ticket.entity'
import { User } from '../../users/entities/user.entity'

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  WAITLISTED = 'waitlisted',
  CHECKED_IN = 'checked_in',
}

@Entity({ name: 'event_registrations' })
export class EventRegistration {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string

  @ManyToOne(() => Event, (event) => event.registrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: Event

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string

  @ManyToOne(() => EventTicket, (ticket) => ticket.registrations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: EventTicket

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null

  @Column({ name: 'customer_name' })
  customerName!: string

  @Column({ name: 'customer_email' })
  customerEmail!: string

  @Column({ name: 'customer_phone', type: 'text', nullable: true })
  customerPhone!: string | null

  @Column({ type: 'int', default: 1 })
  quantity!: number

  @Column({ name: 'total_paid', type: 'numeric', precision: 10, scale: 2, default: 0 })
  totalPaid!: number

  @Column({ length: 3, default: 'GBP' })
  currency!: string

  @Column({ default: RegistrationStatus.PENDING })
  status!: RegistrationStatus

  @Column({ name: 'checked_in_at', type: 'timestamptz', nullable: true })
  checkedInAt!: Date | null

  @Column({ type: 'text', nullable: true })
  notes!: string | null

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}