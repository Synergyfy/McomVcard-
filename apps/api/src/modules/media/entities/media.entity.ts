import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity({ name: 'media' })
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaded_by' })
  user!: User

  @Column({ type: 'varchar', length: 50, default: 'local' })
  provider!: string

  @Column({ type: 'varchar', length: 500 })
  key!: string

  @Column({ type: 'varchar', length: 1000 })
  url!: string

  @Column({ name: 'mime_type', type: 'varchar', length: 120 })
  mimeType!: string

  @Column({ type: 'bigint' })
  size!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}