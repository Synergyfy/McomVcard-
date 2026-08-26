import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpsertCardSectionDto {
  @ApiProperty({ example: 'info', description: 'Schema ID of the section (info, services, products, gallery, etc.)' })
  @IsString()
  schema_id!: string

  @ApiProperty({ example: 'About Us', description: 'Display name of the section' })
  @IsString()
  name!: string

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  locked?: boolean

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sort_order?: number

  @ApiPropertyOptional({ example: { title: 'About Us', subtitle: 'Our story', blocks: [] } })
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>
}

export class BulkUpsertCardSectionsDto {
  @ApiProperty({ type: [UpsertCardSectionDto] })
  @IsArray()
  sections!: UpsertCardSectionDto[]
}
