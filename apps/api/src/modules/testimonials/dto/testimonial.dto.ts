import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsNotEmpty, IsEmail, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTestimonialDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  authorName!: string

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  authorEmail?: string

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  authorAvatar?: string

  @ApiProperty({ example: 'This service has transformed my business!' })
  @IsString()
  @IsNotEmpty()
  content!: string

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number
}

export class UpdateTestimonialDto {
  @ApiPropertyOptional({ example: 'Jane Smith' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  authorName?: string

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  authorEmail?: string

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  authorAvatar?: string

  @ApiPropertyOptional({ example: 'This service has transformed my business!' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number
}

export class ReorderTestimonialDto {
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2', 'uuid3'], description: 'Ordered list of Testimonial IDs' })
  @IsArray()
  @IsString({ each: true })
  ids!: string[]
}
