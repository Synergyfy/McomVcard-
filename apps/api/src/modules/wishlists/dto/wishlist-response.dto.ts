import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Wishlist } from '../entities/wishlist.entity'
import { WishlistItem } from '../entities/wishlist-item.entity'

export class WishlistItemProductDto {
  @ApiProperty({ description: 'Product ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Product name', example: 'Espresso machine' })
  name!: string

  @ApiPropertyOptional({ description: 'Product price', example: 249.99, nullable: true })
  price!: number | null

  @ApiProperty({ description: 'Product currency', example: 'GBP' })
  currency!: string

  @ApiPropertyOptional({ description: 'Product cover image URL', example: 'https://example.com/espresso.jpg', nullable: true })
  image!: string | null
}

export class WishlistItemResponseDto {
  @ApiProperty({ description: 'Wishlist item ID', example: 'c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f' })
  id!: string

  @ApiProperty({ description: 'Product in the wishlist', type: WishlistItemProductDto })
  product!: WishlistItemProductDto

  @ApiPropertyOptional({ description: 'Optional note', example: 'The blue one', nullable: true })
  note!: string | null

  @ApiProperty({ description: 'Display order', example: 0 })
  position!: number

  @ApiProperty({ description: 'Added at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  static fromEntity(item: WishlistItem): WishlistItemResponseDto {
    const dto = new WishlistItemResponseDto()

    dto.id = item.id
    dto.product = {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      currency: item.product.currency,
      image: item.product.image,
    }
    dto.note = item.note
    dto.position = item.position
    dto.created_at = item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt

    return dto
  }
}

export class WishlistResponseDto {
  @ApiProperty({ description: 'Wishlist ID', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d' })
  id!: string

  @ApiProperty({ description: 'Wishlist name', example: 'Birthday gifts' })
  name!: string

  @ApiProperty({ description: 'Whether the wishlist is private', example: false })
  is_private!: boolean

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiProperty({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string

  @ApiProperty({ description: 'Wishlist items (ordered by position)', type: [WishlistItemResponseDto] })
  items!: WishlistItemResponseDto[]

  static fromEntity(wishlist: Wishlist, items: WishlistItem[] = []): WishlistResponseDto {
    const dto = new WishlistResponseDto()

    dto.id = wishlist.id
    dto.name = wishlist.name
    dto.is_private = wishlist.isPrivate
    dto.created_at = wishlist.createdAt instanceof Date ? wishlist.createdAt.toISOString() : wishlist.createdAt
    dto.updated_at = wishlist.updatedAt instanceof Date ? wishlist.updatedAt.toISOString() : wishlist.updatedAt
    dto.items = items.map((item) => WishlistItemResponseDto.fromEntity(item))

    return dto
  }
}