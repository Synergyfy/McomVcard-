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

export type RelationshipType = 'FAMILY' | 'FRIEND' | 'CHILD'
export type RelationshipStatus = 'pending' | 'accepted' | 'declined'

@Entity({ name: 'user_relationships' })
@Unique('uq_user_relationships_pair', ['requesterId', 'recipientId'])
export class UserRelationship {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId!: string

  @ManyToOne(() => User, (user) => user.sentRelationships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester!: User

  @Column({ name: 'recipient_id', type: 'uuid' })
  recipientId!: string

  @ManyToOne(() => User, (user) => user.receivedRelationships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient!: User

  @Column({ name: 'relationship_type', type: 'varchar', length: 20 })
  relationshipType!: RelationshipType

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: RelationshipStatus

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}