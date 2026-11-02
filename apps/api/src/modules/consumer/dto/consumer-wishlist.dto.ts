import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateConsumerWishlistItemDto {
  @ApiProperty({ example: 'Nike Air Max 90', description: 'What you want to save / work towards', maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string

  @ApiPropertyOptional({ example: '£89.99', description: 'Optional display price' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  price?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/shoe.png', description: 'Optional image URL or data URI' })
  @IsOptional()
  @IsString()
  @MaxLength(2_000_000)
  image?: string

  @ApiPropertyOptional({ example: '👟', description: 'Emoji shown when no image is supplied' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emoji?: string

  @ApiPropertyOptional({ example: 'from-rose-50 to-pink-100', description: 'Tailwind gradient class for the tile' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  gradient?: string
}

export class UpdateConsumerWishlistItemDto {
  @ApiPropertyOptional({ example: 'Nike Air Max 95', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string

  @ApiPropertyOptional({ example: '£120.00' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  price?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/shoe.png' })
  @IsOptional()
  @IsString()
  @MaxLength(2_000_000)
  image?: string

  @ApiPropertyOptional({ example: '👟' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emoji?: string

  @ApiPropertyOptional({ example: 'from-rose-50 to-pink-100' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  gradient?: string
}
