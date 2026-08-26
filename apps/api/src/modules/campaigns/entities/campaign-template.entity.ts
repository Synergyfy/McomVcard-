import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'campaign_templates' })
export class CampaignTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 150 })
  name!: string

  @Column({ type: 'varchar', length: 40, default: 'Evergreen' })
  type!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ name: 'suggested_reward', type: 'varchar', length: 255, nullable: true })
  suggestedReward!: string | null

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
