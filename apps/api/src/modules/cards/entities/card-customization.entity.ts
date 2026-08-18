import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Card } from './card.entity'

@Entity({ name: 'card_customizations' })
export class CardCustomization {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'card_id', type: 'uuid', unique: true })
  cardId!: string

  @ManyToOne(() => Card, (card) => card.customization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card!: Card

  @Column({ nullable: true })
  logo!: string | null

  @Column({ name: 'hero_image', nullable: true })
  heroImage!: string | null

  @Column({ name: 'primary_color', nullable: true })
  primaryColor!: string | null

  @Column({ name: 'secondary_color', nullable: true })
  secondaryColor!: string | null

  @Column({ nullable: true })
  font!: string | null

  @Column({ nullable: true })
  layout!: string | null

  @Column({ type: 'jsonb', nullable: true })
  configuration!: Record<string, unknown> | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}