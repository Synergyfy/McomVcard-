import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Event } from './event.entity'
import { EventRegistration } from './event-registration.entity'

@Entity({ name: 'event_tickets' })
export class EventTicket {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string

  @ManyToOne(() => Event, (event) => event.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: Event

  @Column()
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  price!: number

  @Column({ length: 3, default: 'GBP' })
  currency!: string

  @Column({ type: 'int', nullable: true })
  quantity!: number | null

  @Column({ name: 'sold', type: 'int', default: 0 })
  sold!: number

  @Column({ name: 'max_per_order', type: 'int', default: 10 })
  maxPerOrder!: number

  @Column({ name: 'sales_starts_at', type: 'timestamptz', nullable: true })
  salesStartsAt!: Date | null

  @Column({ name: 'sales_ends_at', type: 'timestamptz', nullable: true })
  salesEndsAt!: Date | null

  @Column({ name: 'is_active', default: true })
  isActive!: boolean

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => EventRegistration, (registration) => registration.ticket)
  registrations!: EventRegistration[]

  get available(): number | null {
    if (this.quantity === null) return null
    return Math.max(0, this.quantity - this.sold)
  }

  get isSoldOut(): boolean {
    if (this.quantity === null) return false
    return this.sold >= this.quantity
  }
}