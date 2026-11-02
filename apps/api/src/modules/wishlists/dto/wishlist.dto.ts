import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator'

export class CreateWishlistDto {
  @ApiProperty({ description: 'Wishlist name', example: 'Birthday gifts' })
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name!: string

  @ApiPropertyOptional({ description: 'Whether the wishlist is private (hidden from other users)', default: false, example: false })
  @IsOptional()
  @IsBoolean({ message: 'is_private must be a boolean' })
  is_private?: boolean
}

export class UpdateWishlistDto {
  @ApiPropertyOptional({ description: 'Wishlist name', example: 'Holiday list' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name?: string

  @ApiPropertyOptional({ description: 'Whether the wishlist is private', example: true })
  @IsOptional()
  @IsBoolean({ message: 'is_private must be a boolean' })
  is_private?: boolean
}

export class AddWishlistItemDto {
  @ApiPropertyOptional({ description: 'Product ID to add to the wishlist. Omit for a free-form wish.', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  @IsOptional()
  @IsUUID('4', { message: 'product_id must be a valid UUID' })
  product_id?: string

  @ApiPropertyOptional({ description: 'Free-form wish title', example: 'Nike Air Max 90' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string

  @ApiPropertyOptional({ description: 'Free-form display price', example: '£89.99' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  price?: string

  @ApiPropertyOptional({ description: 'Free-form image URL or data URI' })
  @IsOptional()
  @IsString()
  @MaxLength(2_000_000)
  image?: string

  @ApiPropertyOptional({ description: 'Emoji shown when no image is supplied', example: '🎁' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emoji?: string

  @ApiPropertyOptional({ description: 'Tailwind gradient class for the tile', example: 'from-rose-50 to-pink-100' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  gradient?: string

  @ApiPropertyOptional({ description: 'Optional note about the item', example: 'The blue one' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'note must be at most 500 characters' })
  note?: string

  @ApiPropertyOptional({ description: 'Display order within the wishlist (auto-assigned last+1 if omitted)', example: 1 })
  @IsOptional()
  @IsInt({ message: 'position must be an integer' })
  @Min(0, { message: 'position cannot be negative' })
  position?: number
}