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
  @ApiProperty({ description: 'Product ID to add to the wishlist', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  @IsUUID('4', { message: 'product_id must be a valid UUID' })
  product_id!: string

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