import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Card } from '../../cards/entities/card.entity'

@Entity({ name: 'child_cards' })
@Unique('uq_child_cards_pair', ['cardId', 'childId'])
export class ChildCard {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'card_id', type: 'uuid' })
  cardId!: string

  @ManyToOne(() => Card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card!: Card

  @Column({ name: 'child_id', type: 'uuid' })
  childId!: string

  @ManyToOne(() => User, (user) => user.childCards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_id' })
  child!: User

  @Column({ name: 'can_view', default: true })
  canView!: boolean

  @Column({ name: 'can_use_wallet', default: false })
  canUseWallet!: boolean

  @Column({ name: 'can_manage', default: false })
  canManage!: boolean

  @Column({ name: 'wallet_allocation', type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: string | null) => (value === null ? null : Number(value)),
  } })
  walletAllocation!: number | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}