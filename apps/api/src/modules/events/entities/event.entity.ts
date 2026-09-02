import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'
import { Card } from '../../cards/entities/card.entity'
import { EventTicket } from './event-ticket.entity'
import { EventRegistration } from './event-registration.entity'

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  WAITLISTED = 'waitlisted',
  CHECKED_IN = 'checked_in',
}

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ name: 'card_id', type: 'uuid', nullable: true })
  cardId!: string | null

  @ManyToOne(() => Card, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'card_id' })
  card!: Card | null

  @Column()
  name!: string

  @Column({ unique: true })
  slug!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ name: 'hero_image', type: 'text', nullable: true })
  heroImage!: string | null

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date

  @Column({ default: 'UTC' })
  timezone!: string

  @Column({ type: 'text', nullable: true })
  location!: string | null

  @Column({ name: 'is_virtual', default: false })
  isVirtual!: boolean

  @Column({ name: 'virtual_url', type: 'text', nullable: true })
  virtualUrl!: string | null

  @Column({ default: EventStatus.DRAFT })
  status!: EventStatus

  @Column({ name: 'max_attendees', type: 'int', nullable: true })
  maxAttendees!: number | null

  @Column({ name: 'waitlist_enabled', default: false })
  waitlistEnabled!: boolean

  @Column({ name: 'cancellation_policy', type: 'text', nullable: true })
  cancellationPolicy!: string | null

  @Column({ name: 'requires_approval', default: false })
  requiresApproval!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => EventTicket, (ticket) => ticket.event)
  tickets!: EventTicket[]

  @OneToMany(() => EventRegistration, (registration) => registration.event)
  registrations!: EventRegistration[]
}