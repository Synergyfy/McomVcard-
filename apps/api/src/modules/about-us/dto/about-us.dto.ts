import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsInt, Min, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateAboutUsDto {
  @ApiProperty({ example: 'mission', description: 'Section slug (e.g. mission, team, history)' })
  @IsString()
  @IsNotEmpty()
  section!: string

  @ApiProperty({ example: 'Our Mission', description: 'Section title' })
  @IsString()
  @IsNotEmpty()
  title!: string

  @ApiProperty({ example: 'We aim to revolutionize digital networking...' })
  @IsString()
  @IsNotEmpty()
  content!: string

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateAboutUsDto {
  @ApiPropertyOptional({ example: 'mission' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  section?: string

  @ApiPropertyOptional({ example: 'Our Updated Mission' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string

  @ApiPropertyOptional({ example: 'Updated content...' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string

  @ApiPropertyOptional({ example: 'https://example.com/new-image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class ReorderAboutUsDto {
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2', 'uuid3'], description: 'Ordered list of AboutUs IDs' })
  @IsArray()
  @IsString({ each: true })
  ids!: string[]
}
