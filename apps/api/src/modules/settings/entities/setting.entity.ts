import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity({ name: 'settings' })
@Index(['key'], { unique: true })
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', unique: true })
  key!: string

  @Column({ type: 'text', default: '' })
  value!: string

  @Column({ type: 'varchar', default: 'general' })
  group!: string

  @Column({ type: 'varchar', default: 'string' })
  type!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
