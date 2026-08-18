import { IsNumber, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateLocationDto {
  @ApiPropertyOptional({ example: '123 Main St', description: 'Street address' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string

  @ApiPropertyOptional({ example: 'San Francisco', description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string

  @ApiPropertyOptional({ example: 'CA', description: 'State / province' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string

  @ApiPropertyOptional({ example: 'USA', description: 'Country' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string

  @ApiPropertyOptional({ example: 37.7749, description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number

  @ApiPropertyOptional({ example: -122.4194, description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number
}