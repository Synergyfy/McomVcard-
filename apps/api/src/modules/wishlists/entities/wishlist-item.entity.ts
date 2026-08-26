import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Wishlist } from './wishlist.entity'
import { Product } from '../../products/entities/product.entity'

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

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @Column({ type: 'text', nullable: true })
  note!: string | null

  @Column({ default: 0 })
  position!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}