import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Product } from '../entities/product.entity'
import { ProductImage } from '../entities/product-image.entity'

export class ProductImageResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  product_id!: string

  @ApiProperty({ example: 'https://cdn.example.com/product/gallery-1.png' })
  image_url!: string

  @ApiProperty({ example: 0 })
  position!: number

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(image: ProductImage): ProductImageResponseDto {
    const dto = new ProductImageResponseDto()

    dto.id = image.id
    dto.product_id = image.productId
    dto.image_url = image.imageUrl
    dto.position = image.position
    dto.created_at = image.createdAt
    dto.updated_at = image.updatedAt

    return dto
  }
}

export class ExchangeItemResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'Signature Skincare Set' })
  name!: string

  @ApiPropertyOptional({ example: 'A curated set of skincare essentials' })
  description!: string | null

  @ApiPropertyOptional({ example: 49.99 })
  price!: number | null

  @ApiProperty({ example: 'GBP' })
  currency!: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/product.png' })
  image!: string | null

  @ApiProperty({ example: 'The Glow Studio' })
  business_name!: string | null

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  business_id!: string
}

export class ProductResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  business_id!: string

  @ApiProperty({ example: 'Signature Skincare Set' })
  name!: string

  @ApiPropertyOptional({ example: 'A curated set of skincare essentials' })
  description!: string | null

  @ApiPropertyOptional({ example: 49.99 })
  price!: number | null

  @ApiProperty({ example: 'USD' })
  currency!: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/product.png' })
  image!: string | null

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiPropertyOptional({ type: [ProductImageResponseDto] })
  images?: ProductImageResponseDto[]

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto()

    dto.id = product.id
    dto.business_id = product.businessId
    dto.name = product.name
    dto.description = product.description ?? null
    dto.price = product.price ?? null
    dto.currency = product.currency
    dto.image = product.image ?? null
    dto.status = product.status
    dto.created_at = product.createdAt
    dto.updated_at = product.updatedAt

    if (product.images) {
      dto.images = product.images
        .slice()
        .sort((a, b) => a.position - b.position)
        .map(ProductImageResponseDto.fromEntity)
    }

    return dto
  }
}