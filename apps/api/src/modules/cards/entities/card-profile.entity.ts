import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Card } from './card.entity'

@Entity({ name: 'card_profiles' })
export class CardProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'card_id', type: 'uuid', unique: true })
  cardId!: string

  @ManyToOne(() => Card, (card) => card.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card!: Card

  @Column({ name: 'display_name' })
  displayName!: string

  @Column({ type: 'text', nullable: true })
  bio!: string | null

  @Column({ name: 'job_title', type: 'text', nullable: true })
  jobTitle!: string | null

  @Column({ type: 'text', nullable: true })
  email!: string | null

  @Column({ type: 'text', nullable: true })
  phone!: string | null

  @Column({ type: 'text', nullable: true })
  avatar!: string | null

  @Column({ name: 'cover_image', type: 'text', nullable: true })
  coverImage!: string | null

  @Column({ type: 'text', nullable: true })
  location!: string | null

  @Column({ type: 'text', nullable: true })
  website!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}