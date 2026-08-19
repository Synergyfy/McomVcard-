import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Benefit } from '../entities/benefit.entity'

export class BenefitResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'Free delivery' })
  name!: string

  @ApiPropertyOptional({ example: 'Complimentary delivery on all orders' })
  description!: string | null

  @ApiProperty({ example: 'perk' })
  benefit_type!: string

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(benefit: Benefit): BenefitResponseDto {
    const dto = new BenefitResponseDto()

    dto.id = benefit.id
    dto.name = benefit.name
    dto.description = benefit.description ?? null
    dto.benefit_type = benefit.benefitType
    dto.status = benefit.status
    dto.created_at = benefit.createdAt
    dto.updated_at = benefit.updatedAt

    return dto
  }
}