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

  @Column({ type: 'text', nullable: true })
  path!: string | null

  @Column({ name: 'preview_url', type: 'text', nullable: true })
  previewUrl!: string | null

  @Column({ type: 'text', nullable: true })
  category!: string | null

  @Column({ default: 'published' })
  status!: string

  @Column({ name: 'is_business', default: false })
  isBusiness!: boolean

  @Column({ name: 'is_consumer', default: true })
  isConsumer!: boolean

  @Column({ name: 'font_family', type: 'text', nullable: true })
  fontFamily!: string | null

  @Column({ name: 'primary_color', type: 'text', nullable: true })
  primaryColor!: string | null

  @Column({ name: 'secondary_color', type: 'text', nullable: true })
  secondaryColor!: string | null

  @Column({ name: 'button_style', type: 'text', nullable: true })
  buttonStyle!: string | null

  @Column({ name: 'logo_position', type: 'text', nullable: true })
  logoPosition!: string | null

  @Column({ name: 'bg_style', type: 'text', nullable: true })
  bgStyle!: string | null

  @Column({ type: 'jsonb', nullable: true })
  sections!: Record<string, boolean> | null

  @Column({ name: 'required_membership_level', type: 'varchar', length: 50, nullable: true })
  requiredMembershipLevel!: string | null

  @Column({ name: 'is_premium', default: false })
  isPremium!: boolean

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