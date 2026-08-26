import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'
import { Season } from '../../seasons/entities/season.entity'
import { Offer } from './offer.entity'

export enum CampaignType {
  SEASONAL = 'Seasonal',
  EVERGREEN = 'Evergreen',
  REFERRAL = 'Referral',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

@Entity({ name: 'campaigns' })
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ name: 'season_id', type: 'uuid', nullable: true })
  seasonId!: string | null

  @ManyToOne(() => Season, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'season_id' })
  season!: Season | null

  @Column({ type: 'varchar', length: 150 })
  name!: string

  @Column({ type: 'varchar', length: 40, default: CampaignType.EVERGREEN })
  type!: CampaignType

  @Column({ type: 'varchar', length: 40, default: CampaignStatus.DRAFT })
  status!: CampaignStatus

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: { to: (v: number | null) => (v === null ? null : v), from: (v: string | null) => (v === null ? null : Number(v)) } })
  budget!: number | null

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt!: Date | null

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => Offer, (offer) => offer.campaign)
  offers!: Offer[]
}