import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Business } from '../entities/business.entity'
import { BusinessLocation } from '../entities/business-location.entity'
import { BusinessHour } from '../entities/business-hour.entity'
import { Brand } from '../entities/brand.entity'

export class BusinessCategoryResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'Restaurant' })
  name!: string

  @ApiPropertyOptional({ example: 'Restaurants, cafes, and food services' })
  description!: string | null
}

export class BusinessLocationResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  business_id!: string

  @ApiPropertyOptional({ example: '123 Main St' })
  address!: string | null

  @ApiPropertyOptional({ example: 'San Francisco' })
  city!: string | null

  @ApiPropertyOptional({ example: 'CA' })
  state!: string | null

  @ApiPropertyOptional({ example: 'USA' })
  country!: string | null

  @ApiPropertyOptional({ example: 37.7749 })
  latitude!: number | null

  @ApiPropertyOptional({ example: -122.4194 })
  longitude!: number | null

  static fromEntity(location: BusinessLocation): BusinessLocationResponseDto {
    const dto = new BusinessLocationResponseDto()

    dto.id = location.id
    dto.business_id = location.businessId
    dto.address = location.address ?? null
    dto.city = location.city ?? null
    dto.state = location.state ?? null
    dto.country = location.country ?? null
    dto.latitude = location.latitude ?? null
    dto.longitude = location.longitude ?? null

    return dto
  }
}

export class BusinessHourResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  business_id!: string

  @ApiProperty({ example: 1, description: '0 = Sunday, 6 = Saturday' })
  day_of_week!: number

  @ApiPropertyOptional({ example: '09:00:00' })
  opens_at!: string | null

  @ApiPropertyOptional({ example: '17:00:00' })
  closes_at!: string | null

  @ApiProperty({ example: false })
  is_closed!: boolean

  static fromEntity(hour: BusinessHour): BusinessHourResponseDto {
    const dto = new BusinessHourResponseDto()

    dto.id = hour.id
    dto.business_id = hour.businessId
    dto.day_of_week = hour.dayOfWeek
    dto.opens_at = hour.opensAt ?? null
    dto.closes_at = hour.closesAt ?? null
    dto.is_closed = hour.isClosed

    return dto
  }
}

export class BrandResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  business_id!: string

  @ApiProperty({ example: 'Acme Signature' })
  name!: string

  @ApiPropertyOptional({ example: 'Premium line of coffee' })
  description!: string | null

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  logo_url!: string | null

  static fromEntity(brand: Brand): BrandResponseDto {
    const dto = new BrandResponseDto()

    dto.id = brand.id
    dto.business_id = brand.businessId
    dto.name = brand.name
    dto.description = brand.description ?? null
    dto.logo_url = brand.logoUrl ?? null

    return dto
  }
}

export class BusinessResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  owner_id!: string

  @ApiPropertyOptional({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  category_id!: string | null

  @ApiPropertyOptional({ type: BusinessCategoryResponseDto })
  category!: BusinessCategoryResponseDto | null

  @ApiProperty({ example: 'Acme Cafe' })
  name!: string

  @ApiPropertyOptional({ example: 'A cozy coffee shop downtown' })
  description!: string | null

  @ApiPropertyOptional({ example: 'hello@acmecafe.com' })
  email!: string | null

  @ApiPropertyOptional({ example: '+15551234567' })
  phone!: string | null

  @ApiPropertyOptional({ example: 'https://acmecafe.com' })
  website!: string | null

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ type: [BusinessLocationResponseDto] })
  locations!: BusinessLocationResponseDto[]

  @ApiProperty({ type: [BusinessHourResponseDto] })
  hours!: BusinessHourResponseDto[]

  @ApiProperty({ type: [BrandResponseDto] })
  brands!: BrandResponseDto[]

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(business: Business): BusinessResponseDto {
    const dto = new BusinessResponseDto()

    dto.id = business.id
    dto.owner_id = business.ownerId
    dto.category_id = business.categoryId ?? null
    dto.category = business.category
      ? {
          id: business.category.id,
          name: business.category.name,
          description: business.category.description ?? null,
        }
      : null
    dto.name = business.name
    dto.description = business.description ?? null
    dto.email = business.email ?? null
    dto.phone = business.phone ?? null
    dto.website = business.website ?? null
    dto.status = business.status
    dto.locations = (business.locations ?? []).map(BusinessLocationResponseDto.fromEntity)
    dto.hours = (business.hours ?? []).map(BusinessHourResponseDto.fromEntity)
    dto.brands = (business.brands ?? []).map(BrandResponseDto.fromEntity)
    dto.created_at = business.createdAt
    dto.updated_at = business.updatedAt

    return dto
  }
}