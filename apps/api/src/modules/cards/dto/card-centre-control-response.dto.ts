import { ApiProperty } from '@nestjs/swagger'
import { CardCentreControl } from '../entities/card-centre-control.entity'

export class CardCentreControlResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() card_id!: string
  @ApiProperty() centre_id!: string
  @ApiProperty() enabled!: boolean
  @ApiProperty() edit_allowed!: boolean
  @ApiProperty() settings!: Record<string, unknown>
  @ApiProperty() created_at!: Date
  @ApiProperty() updated_at!: Date

  static fromEntity(c: CardCentreControl): CardCentreControlResponseDto {
    const dto = new CardCentreControlResponseDto()
    dto.id = c.id
    dto.card_id = c.cardId
    dto.centre_id = c.centreId
    dto.enabled = c.enabled
    dto.edit_allowed = c.editAllowed
    dto.settings = c.settings
    dto.created_at = c.createdAt
    dto.updated_at = c.updatedAt
    return dto
  }
}
