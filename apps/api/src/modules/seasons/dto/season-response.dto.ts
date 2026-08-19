import { ApiProperty } from '@nestjs/swagger'
import { Season } from '../entities/season.entity'

export class SeasonResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'Autumn 2026' })
  name!: string

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  starts_at!: Date

  @ApiProperty({ example: '2026-11-30T23:59:59.000Z' })
  ends_at!: Date

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(season: Season): SeasonResponseDto {
    const dto = new SeasonResponseDto()

    dto.id = season.id
    dto.name = season.name
    dto.starts_at = season.startsAt
    dto.ends_at = season.endsAt
    dto.status = season.status
    dto.created_at = season.createdAt
    dto.updated_at = season.updatedAt

    return dto
  }
}