import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Service } from '../entities/service.entity'

export class ServiceResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  business_id!: string

  @ApiProperty({ example: 'Haircut & Style' })
  name!: string

  @ApiPropertyOptional({ example: 'A signature cut with styling and finishing' })
  description!: string | null

  @ApiPropertyOptional({ example: 75 })
  price!: number | null

  @ApiProperty({ example: 'USD' })
  currency!: string

  @ApiPropertyOptional({ example: 45 })
  duration!: number | null

  @ApiPropertyOptional({ example: 'https://cdn.example.com/service.png' })
  image!: string | null

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(service: Service): ServiceResponseDto {
    const dto = new ServiceResponseDto()

    dto.id = service.id
    dto.business_id = service.businessId
    dto.name = service.name
    dto.description = service.description ?? null
    dto.price = service.price ?? null
    dto.currency = service.currency
    dto.duration = service.duration ?? null
    dto.image = service.image ?? null
    dto.status = service.status
    dto.created_at = service.createdAt
    dto.updated_at = service.updatedAt

    return dto
  }
}