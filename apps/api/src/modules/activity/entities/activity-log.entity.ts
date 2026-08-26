import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'
import { User } from '../../users/entities/user.entity'

@Entity({ name: 'activity_logs' })
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null

  @Column({ type: 'varchar', length: 50 })
  type!: string

  @Column({ type: 'varchar', length: 200 })
  title!: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}
