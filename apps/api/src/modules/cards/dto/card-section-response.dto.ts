import { ApiProperty } from '@nestjs/swagger'
import { CardSection } from '../entities/card-section.entity'

export class CardSectionResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() card_id!: string
  @ApiProperty() schema_id!: string
  @ApiProperty() name!: string
  @ApiProperty() locked!: boolean
  @ApiProperty() enabled!: boolean
  @ApiProperty() sort_order!: number
  @ApiProperty() content!: Record<string, unknown>
  @ApiProperty() created_at!: Date
  @ApiProperty() updated_at!: Date

  static fromEntity(s: CardSection): CardSectionResponseDto {
    const dto = new CardSectionResponseDto()
    dto.id = s.id
    dto.card_id = s.cardId
    dto.schema_id = s.schemaId
    dto.name = s.name
    dto.locked = s.locked
    dto.enabled = s.enabled
    dto.sort_order = s.sortOrder
    dto.content = s.content
    dto.created_at = s.createdAt
    dto.updated_at = s.updatedAt
    return dto
  }
}
