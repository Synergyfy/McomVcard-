import { Matches, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCardDto {
  @ApiPropertyOptional({ example: 'jane-doe', description: 'Public URL slug for the card. Auto-generated if omitted.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by single hyphens (e.g. jane-doe)',
  })
  slug?: string

  @ApiPropertyOptional({ example: 'PERSONAL', description: 'Card type', default: 'PERSONAL' })
  @IsOptional()
  @IsIn(['PERSONAL', 'BUSINESS'])
  type?: string

  @ApiPropertyOptional({ example: 'b3f2c1d4-...-uuid', description: 'Optional template UUID' })
  @IsOptional()
  @IsUUID()
  template_id?: string

  @ApiPropertyOptional({ example: 'b3f2c1d4-...-uuid', description: 'Optional linked business UUID' })
  @IsOptional()
  @IsUUID()
  business_id?: string
}