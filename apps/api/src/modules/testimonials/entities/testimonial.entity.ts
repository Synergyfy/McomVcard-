import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity({ name: 'testimonials' })
@Index(['displayOrder'])
export class Testimonial {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255 })
  authorName!: string

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'author_email' })
  authorEmail!: string | null

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'author_avatar' })
  authorAvatar!: string | null

  @Column({ type: 'text' })
  content!: string

  @Column({ type: 'int', nullable: true })
  rating!: number | null

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean

  @Column({ type: 'int', default: 0, name: 'display_order' })
  displayOrder!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
