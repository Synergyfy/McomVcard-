import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

@Entity({ name: 'about_us' })
@Index(['section'])
@Index(['displayOrder'])
export class AboutUs {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 50 })
  section!: string

  @Column({ type: 'varchar', length: 255 })
  title!: string

  @Column({ type: 'text' })
  content!: string

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
