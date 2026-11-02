import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AccessPass } from '../entities/access-pass.entity'
import { PlanConfiguration, PlanFeature } from '../../plans/entities/plan.entity'

export class AccessPassResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string

  @ApiProperty({ example: '70-Day Business Boost' })
  name!: string

  @ApiProperty({ example: 'Everything you need to run your business for 70 days.' })
  description!: string

  @ApiProperty({ example: 30 })
  price!: number

  @ApiProperty({ example: 70 })
  durationDays!: number

  @ApiProperty({ example: 'GBP' })
  currency!: string

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ type: [Object], description: 'Checklist shown on the pass card' })
  features!: PlanFeature[]

  @ApiPropertyOptional({
    example: { quotas: { maxVCards: 50 }, featureFlags: { customDomains: true } },
    nullable: true,
  })
  configuration!: PlanConfiguration | null

  @ApiPropertyOptional({ example: 'price_123' })
  stripePriceId!: string | null

  @ApiPropertyOptional({ example: 'P-123' })
  paypalPlanId!: string | null

  @ApiProperty({ example: false })
  popular!: boolean

  @ApiProperty({ example: 0 })
  sortOrder!: number

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt!: Date

  static fromEntity(entity: AccessPass): AccessPassResponseDto {
    const dto = new AccessPassResponseDto()
    dto.id = entity.id
    dto.name = entity.name
    dto.description = entity.description ?? ''
    dto.price = Number(entity.price) || 0
    dto.durationDays = entity.durationDays
    dto.currency = entity.currency
    dto.status = entity.status
    dto.features = entity.features ?? []
    dto.configuration = entity.configuration ?? null
    dto.stripePriceId = entity.stripePriceId ?? null
    dto.paypalPlanId = entity.paypalPlanId ?? null
    dto.popular = entity.popular === true
    dto.sortOrder = entity.sortOrder ?? 0
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt
    return dto
  }
}
