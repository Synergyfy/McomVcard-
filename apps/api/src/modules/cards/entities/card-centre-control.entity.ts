import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Card } from './card.entity'

@Entity({ name: 'card_centre_controls' })
export class CardCentreControl {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'card_id', type: 'uuid' })
  cardId!: string

  @ManyToOne(() => Card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card!: Card

  @Column({ name: 'centre_id', type: 'varchar', length: 30 })
  centreId!: string

  @Column({ type: 'boolean', default: true })
  enabled!: boolean

  @Column({ name: 'edit_allowed', type: 'boolean', default: true })
  editAllowed!: boolean

  @Column({ type: 'jsonb', default: '{}' })
  settings!: Record<string, unknown>

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
