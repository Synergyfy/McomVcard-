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

  @Column({ name: 'job_title', nullable: true })
  jobTitle!: string | null

  @Column({ nullable: true })
  email!: string | null

  @Column({ nullable: true })
  phone!: string | null

  @Column({ nullable: true })
  avatar!: string | null

  @Column({ name: 'cover_image', nullable: true })
  coverImage!: string | null

  @Column({ nullable: true })
  location!: string | null

  @Column({ nullable: true })
  website!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}