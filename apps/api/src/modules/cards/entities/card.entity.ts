import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Business } from '../../businesses/entities/business.entity'
import { Template } from './template.entity'
import { CardProfile } from './card-profile.entity'
import { CardCustomization } from './card-customization.entity'
import { SocialLink } from './social-link.entity'
import { CardAccess } from './card-access.entity'

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
  type!: string

  @Column({ unique: true })
  slug!: string

  @Column({ default: 'active' })
  status!: string

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
}