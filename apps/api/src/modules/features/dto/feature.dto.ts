import { IsString, IsOptional, IsBoolean, IsInt, Min, IsNotEmpty, IsUrl, IsArray } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateFeatureDto {
  @ApiProperty({ example: 'Digital Business Card' })
  @IsString()
  @IsNotEmpty()
  title!: string

  @ApiPropertyOptional({ example: 'Share your contact details instantly with a digital card.' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 'card-outline' })
  @IsOptional()
  @IsString()
  icon?: string

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateFeatureDto {
  @ApiPropertyOptional({ example: 'Digital Business Card' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string

  @ApiPropertyOptional({ example: 'Share your contact details instantly with a digital card.' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 'card-outline' })
  @IsOptional()
  @IsString()
  icon?: string

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class ReorderFeatureDto {
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2', 'uuid3'], description: 'Ordered list of Feature IDs' })
  @IsArray()
  @IsString({ each: true })
  ids!: string[]
}
