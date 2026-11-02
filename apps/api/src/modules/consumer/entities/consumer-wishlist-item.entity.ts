import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity({ name: 'consumer_wishlist_items' })
export class ConsumerWishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'varchar', length: 200 })
  title!: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  price!: string | null

  @Column({ type: 'text', nullable: true })
  image!: string | null

  @Column({ type: 'varchar', length: 20, default: '🎁' })
  emoji!: string

  @Column({
    type: 'varchar',
    length: 120,
    default: 'from-rose-50 to-pink-100 dark:from-rose-500/10 dark:to-pink-500/10',
  })
  gradient!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
