import { Transform } from 'class-transformer'
import { IsIn, IsInt, IsNumber, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateServiceDto {
  @ApiProperty({ example: 'Haircut & Style', description: 'Service name' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string

  @ApiPropertyOptional({ example: 'A signature cut with styling and finishing' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ example: 75, description: 'Price in the business currency (2 decimal places)' })
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

  @ApiPropertyOptional({ example: 45, description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10080)
  duration?: number

  @ApiPropertyOptional({ example: 'https://cdn.example.com/service.png' })
  @IsOptional()
  @IsUrl()
  image?: string
}