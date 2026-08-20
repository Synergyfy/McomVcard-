import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'varchar', length: 50 })
  type!: string

  @Column({ type: 'varchar', length: 150 })
  title!: string

  @Column({ type: 'varchar', length: 2000, nullable: true })
  message!: string | null

  @Column({ type: 'jsonb', nullable: true })
  data!: Record<string, unknown> | null

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}