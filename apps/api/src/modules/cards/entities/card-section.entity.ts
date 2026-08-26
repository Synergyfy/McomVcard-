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

@Entity({ name: 'card_sections' })
export class CardSection {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'card_id', type: 'uuid' })
  cardId!: string

  @ManyToOne(() => Card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card!: Card

  @Column({ name: 'schema_id', type: 'varchar', length: 80 })
  schemaId!: string

  @Column({ type: 'varchar', length: 150 })
  name!: string

  @Column({ type: 'boolean', default: false })
  locked!: boolean

  @Column({ type: 'boolean', default: true })
  enabled!: boolean

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @Column({ type: 'jsonb', default: '{}' })
  content!: Record<string, unknown>

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
