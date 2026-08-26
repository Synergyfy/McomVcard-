import { PartialType } from '@nestjs/swagger'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'
import { CreateCardDto } from './create-card.dto'

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @ApiPropertyOptional({ example: 'My Store Card', description: 'Display name of the card' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string

  @ApiPropertyOptional({ example: 'In-store loyalty card for regulars', description: 'Short description of the card' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ example: 'Loyalty', description: 'Card category label' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string

  @ApiPropertyOptional({ enum: ['active', 'needs_update', 'locked', 'suspended'], description: 'Card lifecycle status' })
  @IsOptional()
  @IsIn(['active', 'needs_update', 'locked', 'suspended'])
  status?: string
}
