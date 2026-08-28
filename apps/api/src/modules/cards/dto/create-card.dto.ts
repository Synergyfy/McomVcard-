import { Matches, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { CardType, CardProduct, CardAudience } from '../entities/card.entity'

export class CreateCardDto {
  @ApiPropertyOptional({ example: 'jane-doe', description: 'Public URL slug for the card. Auto-generated if omitted.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by single hyphens (e.g. jane-doe)',
  })
  slug?: string

  @ApiPropertyOptional({ example: CardType.CONSUMER_VCARD, description: 'Card type', enum: CardType })
  @IsOptional()
  @IsIn(Object.values(CardType))
  type?: CardType

  @ApiPropertyOptional({ example: CardProduct.VCARD, description: 'Card product (long-form VCard or short-form Card)', enum: CardProduct })
  @IsOptional()
  @IsIn(Object.values(CardProduct))
  card_product?: CardProduct

  @ApiPropertyOptional({ example: CardAudience.CONSUMER, description: 'Target audience', enum: CardAudience })
  @IsOptional()
  @IsIn(Object.values(CardAudience))
  audience?: CardAudience

  @ApiPropertyOptional({ example: 'b3f2c1d4-...-uuid', description: 'Optional template UUID' })
  @IsOptional()
  @IsUUID()
  template_id?: string

  @ApiPropertyOptional({ example: 'b3f2c1d4-...-uuid', description: 'Optional linked business UUID' })
  @IsOptional()
  @IsUUID()
  business_id?: string
}