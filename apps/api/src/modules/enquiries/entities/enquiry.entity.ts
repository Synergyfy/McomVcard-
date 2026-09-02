import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'enquiries' })
export class Enquiry {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'varchar', length: 255 })
  email!: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null

  @Column({ type: 'varchar', length: 500 })
  subject!: string

  @Column({ type: 'text' })
  message!: string

  @Column({ type: 'varchar', length: 20, default: 'new' })
  status!: string

  @Column({ type: 'text', nullable: true, name: 'admin_notes' })
  adminNotes!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
