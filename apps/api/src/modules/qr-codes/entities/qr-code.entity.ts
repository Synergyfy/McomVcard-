import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Card } from '../../cards/entities/card.entity'

export enum QrDestinationType {
  VCARD = 'VCARD',
  BUSINESS_PROFILE = 'BUSINESS_PROFILE',
  OFFER = 'OFFER',
  CAMPAIGN = 'CAMPAIGN',
}

export const QR_PUBLIC_BASE_URL = 'https://mcomvcard.link/qr'

@Entity({ name: 'qr_codes' })
export class QrCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'card_id', type: 'uuid' })
  cardId!: string

  @ManyToOne(() => Card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card!: Card

  @Column({ name: 'destination_type', type: 'varchar', length: 40 })
  destinationType!: QrDestinationType

  @Column({ type: 'varchar', length: 500 })
  destination!: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}