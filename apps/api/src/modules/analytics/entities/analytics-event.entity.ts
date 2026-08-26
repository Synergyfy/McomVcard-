import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'

@Entity({ name: 'analytics_events' })
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  eventType!: string

  @Column({ name: 'card_id', type: 'uuid', nullable: true })
  cardId!: string | null

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}
