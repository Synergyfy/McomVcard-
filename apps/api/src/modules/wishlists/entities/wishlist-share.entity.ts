import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { Wishlist } from './wishlist.entity'
import { User } from '../../users/entities/user.entity'

@Entity({ name: 'wishlist_shares' })
@Unique('uq_wishlist_shares', ['wishlistId', 'sharedWithUserId'])
export class WishlistShare {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'wishlist_id', type: 'uuid' })
  wishlistId!: string

  @ManyToOne(() => Wishlist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist!: Wishlist

  @Column({ name: 'shared_with_user_id', type: 'uuid' })
  sharedWithUserId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_with_user_id' })
  sharedWithUser!: User

  @Column({ type: 'varchar', length: 10, default: 'view' })
  permission!: 'view' | 'fulfill'

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}
