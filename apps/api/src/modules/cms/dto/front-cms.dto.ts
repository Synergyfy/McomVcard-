import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateFrontCmsDto {
  @ApiProperty({ description: 'Unique key for the CMS entry', example: 'hero_title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  key!: string

  @ApiProperty({ description: 'Content value', example: 'Welcome to MCOM' })
  @IsString()
  value!: string

  @ApiPropertyOptional({ description: 'Group name', example: 'hero', default: 'general' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  group?: string
}

export class UpdateFrontCmsDto {
  @ApiPropertyOptional({ description: 'Content value', example: 'Updated hero title' })
  @IsOptional()
  @IsString()
  value?: string

  @ApiPropertyOptional({ description: 'Group name', example: 'hero' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  group?: string
}

export class BulkUpdateFrontCmsItemDto {
  @ApiProperty({ description: 'Unique key', example: 'hero_title' })
  @IsString()
  @IsNotEmpty()
  key!: string

  @ApiProperty({ description: 'Content value', example: 'Welcome to MCOM' })
  @IsString()
  value!: string
}

export class BulkUpdateFrontCmsDto {
  @ApiProperty({ description: 'Group name for all items', example: 'hero' })
  @IsString()
  @IsNotEmpty()
  group!: string

  @ApiProperty({ description: 'Array of key-value pairs', type: [BulkUpdateFrontCmsItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateFrontCmsItemDto)
  items!: BulkUpdateFrontCmsItemDto[]
}

export class FrontCmsResponseDto {
  @ApiProperty({ description: 'ID', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d' })
  id!: string

  @ApiProperty({ description: 'Unique key', example: 'hero_title' })
  key!: string

  @ApiProperty({ description: 'Content value', example: 'Welcome to MCOM' })
  value!: string

  @ApiProperty({ description: 'Group name', example: 'hero' })
  group!: string

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiProperty({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string

  static fromEntity(entity: FrontCmsResponseDto & { createdAt: Date; updatedAt: Date }): FrontCmsResponseDto {
    const dto = new FrontCmsResponseDto()

    dto.id = entity.id
    dto.key = entity.key
    dto.value = entity.value
    dto.group = entity.group
    dto.created_at = entity.createdAt instanceof Date ? entity.createdAt.toISOString() : String(entity.createdAt)
    dto.updated_at = entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : String(entity.updatedAt)

    return dto
  }
}
