import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity({ name: 'faqs' })
@Index(['category', 'displayOrder'])
export class Faq {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'text' })
  question!: string

  @Column({ type: 'text' })
  answer!: string

  @Column({ type: 'varchar', length: 100, default: 'General' })
  category!: string

  @Column({ type: 'int', default: 0, name: 'display_order' })
  displayOrder!: number

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
