import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Card } from './card.entity'

@Entity({ name: 'card_access' })
export class CardAccess {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'card_id', type: 'uuid', unique: true })
  cardId!: string

  @ManyToOne(() => Card, (card) => card.access, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card!: Card

  @Column({ name: 'is_enabled', default: false })
  isEnabled!: boolean

  @Column({ name: 'password_hash', nullable: true })
  passwordHash!: string | null

  @Column({ name: 'protected_sections', type: 'jsonb', nullable: true })
  protectedSections!: Record<string, boolean> | null

  @Column({ name: 'access_expiry', default: 'never' })
  accessExpiry!: string

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}