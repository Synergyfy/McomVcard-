import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Card } from './card.entity'
import { TemplateField } from './template-field.entity'

@Entity({ name: 'templates' })
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ unique: true })
  slug!: string

  @Column({ nullable: true })
  path!: string | null

  @Column({ name: 'preview_url', nullable: true })
  previewUrl!: string | null

  @Column({ nullable: true })
  category!: string | null

  @Column({ default: 'published' })
  status!: string

  @Column({ name: 'is_business', default: false })
  isBusiness!: boolean

  @Column({ name: 'is_consumer', default: true })
  isConsumer!: boolean

  @Column({ name: 'font_family', nullable: true })
  fontFamily!: string | null

  @Column({ name: 'primary_color', nullable: true })
  primaryColor!: string | null

  @Column({ name: 'secondary_color', nullable: true })
  secondaryColor!: string | null

  @Column({ name: 'button_style', nullable: true })
  buttonStyle!: string | null

  @Column({ name: 'logo_position', nullable: true })
  logoPosition!: string | null

  @Column({ name: 'bg_style', nullable: true })
  bgStyle!: string | null

  @Column({ type: 'jsonb', nullable: true })
  sections!: Record<string, boolean> | null

  @Column({ default: 0 })
  usage!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => TemplateField, (field) => field.template)
  fields!: TemplateField[]

  @OneToMany(() => Card, (card) => card.template)
  cards!: Card[]
}