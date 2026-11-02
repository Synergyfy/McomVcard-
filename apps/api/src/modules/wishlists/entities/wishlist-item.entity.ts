import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Wishlist } from './wishlist.entity'
import { Product } from '../../products/entities/product.entity'
import { User } from '../../users/entities/user.entity'

@Entity({ name: 'wishlist_items' })
@Unique('uq_wishlist_items_product', ['wishlistId', 'productId'])
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'wishlist_id', type: 'uuid' })
  wishlistId!: string

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist!: Wishlist

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId!: string | null

  @ManyToOne(() => Product, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product!: Product | null

  // Free-form items (used by the Friends & Family wish list) do not need a
  // catalogue product. These display fields mirror Product's shape.
  @Column({ type: 'varchar', length: 200, nullable: true })
  title!: string | null

  @Column({ type: 'varchar', length: 50, nullable: true })
  price!: string | null

  @Column({ type: 'text', nullable: true })
  image!: string | null

  @Column({ type: 'varchar', length: 20, default: '🎁' })
  emoji!: string

  @Column({ type: 'varchar', length: 120, default: 'from-rose-50 to-pink-100 dark:from-rose-500/10 dark:to-pink-500/10' })
  gradient!: string

  @Column({ type: 'text', nullable: true })
  note!: string | null

  @Column({ default: 0 })
  position!: number

  @Column({ name: 'fulfilled_by', type: 'uuid', nullable: true })
  fulfilledBy!: string | null

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'fulfilled_by' })
  fulfilledByUser!: User | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}