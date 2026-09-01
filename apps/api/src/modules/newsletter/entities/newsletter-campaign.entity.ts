import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity({ name: 'newsletter_campaigns' })
export class NewsletterCampaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 200 })
  name!: string

  @Column({ type: 'varchar', length: 500 })
  subject!: string

  @Column({ type: 'text' })
  body!: string

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: string

  @Column({ type: 'int', default: 0, name: 'sent_count' })
  sentCount!: number

  @Column({ type: 'timestamptz', nullable: true, name: 'scheduled_at' })
  scheduledAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
