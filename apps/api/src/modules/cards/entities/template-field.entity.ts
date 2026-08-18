import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Template } from './template.entity'

@Entity({ name: 'template_fields' })
export class TemplateField {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'template_id', type: 'uuid' })
  templateId!: string

  @ManyToOne(() => Template, (template) => template.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template!: Template

  @Column({ name: 'field_key' })
  fieldKey!: string

  @Column()
  label!: string

  @Column({ name: 'field_type', default: 'text' })
  fieldType!: string

  @Column({ name: 'is_editable', default: true })
  isEditable!: boolean

  @Column({ name: 'is_required', default: false })
  isRequired!: boolean

  @Column({ name: 'display_order', default: 0 })
  displayOrder!: number

  @Column({ type: 'jsonb', nullable: true })
  options!: Record<string, unknown> | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}