import { Transform } from 'class-transformer'
import { IsIn, IsInt, IsNumber, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateProductDto {
  @ApiProperty({ example: 'Signature Skincare Set', description: 'Product name' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string

  @ApiPropertyOptional({ example: 'A curated set of skincare essentials' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ example: 49.99, description: 'Price in the business currency (2 decimal places)' })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined || value === '' ? undefined : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  price?: number

  @ApiPropertyOptional({ example: 'GBP', description: 'ISO 4217 currency code', default: 'GBP' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/product.png', description: 'Main/cover image URL' })
  @IsOptional()
  @IsUrl()
  image?: string
}