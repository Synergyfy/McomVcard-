import { IsInt, IsOptional, IsUrl, Max, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateProductImageDto {
  @ApiProperty({ example: 'https://cdn.example.com/product/gallery-1.png' })
  @IsUrl()
  image_url: string

  @ApiPropertyOptional({ example: 0, description: 'Gallery display order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  position?: number
}