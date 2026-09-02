import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Business } from '../../businesses/entities/business.entity'
import { Template } from './template.entity'
import { CardProfile } from './card-profile.entity'
import { CardCustomization } from './card-customization.entity'
import { SocialLink } from './social-link.entity'
import { CardAccess } from './card-access.entity'
import { CardSection } from './card-section.entity'
import { CardCentreControl } from './card-centre-control.entity'
import { Event } from '../../events/entities/event.entity'

export enum CardType {
  BUSINESS_VCARD = 'BUSINESS_VCARD',
  BUSINESS_CARD = 'BUSINESS_CARD',
  CONSUMER_VCARD = 'CONSUMER_VCARD',
  CONSUMER_STORE_CARD = 'CONSUMER_STORE_CARD',
  EVENT = 'EVENT',
}

export enum CardProduct {
  VCARD = 'VCARD',
  CARD = 'CARD',
}

export enum CardAudience {
  BUSINESS = 'BUSINESS',
  CONSUMER = 'CONSUMER',
}

@Entity({ name: 'cards' })
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User

  @Column({ name: 'business_id', type: 'uuid', nullable: true })
  businessId!: string | null

  @ManyToOne(() => Business, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business | null

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId!: string | null

  @ManyToOne(() => Template, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'template_id' })
  template!: Template | null

  @Column({ default: 'PERSONAL' })
  type!: CardType

  @Column({ name: 'card_product', default: 'VCARD' })
  cardProduct!: CardProduct

  @Column({ name: 'audience', default: 'BUSINESS' })
  audience!: CardAudience

  @Column({ unique: true })
  slug!: string

  @Column({ default: 'active' })
  status!: string

  @Column({ name: 'name', type: 'varchar', length: 200, nullable: true })
  name!: string | null

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ name: 'category', type: 'varchar', length: 100, nullable: true })
  category!: string | null

  @Column({ name: 'url_slug', type: 'varchar', length: 200, nullable: true })
  urlSlug!: string | null

  @Column({ name: 'assigned_at', type: 'timestamptz', nullable: true })
  assignedAt!: Date | null

  @Column({ name: 'last_admin_update', type: 'timestamptz', nullable: true })
  lastAdminUpdate!: Date | null

  @Column({ type: 'int', default: 0 })
  views!: number

  @Column({ type: 'int', default: 0 })
  scans!: number

  @Column({ type: 'int', default: 0 })
  shares!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToOne(() => CardProfile, (profile) => profile.card)
  profile!: CardProfile | null

  @OneToOne(() => CardCustomization, (customization) => customization.card)
  customization!: CardCustomization | null

  @OneToMany(() => SocialLink, (link) => link.card)
  socialLinks!: SocialLink[]

  @OneToOne(() => CardAccess, (access) => access.card)
  access!: CardAccess | null

  @OneToMany(() => CardSection, (section) => section.card)
  sections!: CardSection[]

  @OneToMany(() => CardCentreControl, (control) => control.card)
  centreControls!: CardCentreControl[]

  @OneToMany(() => Event, (event) => event.card)
  events!: Event[]
}
