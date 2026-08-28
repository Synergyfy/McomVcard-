import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, IsNumber, IsIn, IsUUID, Min, Max, IsBoolean, IsUrl } from 'class-validator'
import { EventStatus, RegistrationStatus } from '../entities/event.entity'

export class CreateEventDto {
  @ApiProperty({ example: 'Summer Workshop 2024' })
  @IsString()
  @IsNotEmpty()
  @Min(2)
  @Max(200)
  name!: string

  @ApiPropertyOptional({ example: 'summer-workshop-2024' })
  @IsOptional()
  @IsString()
  @Min(2)
  @Max(200)
  slug?: string

  @ApiProperty({ example: 'biz-uuid-here', description: 'Business UUID that owns this event' })
  @IsUUID()
  business_id!: string

  @ApiPropertyOptional({ example: 'Join us for an exciting summer workshop...' })
  @IsOptional()
  @IsString()
  @Max(5000)
  description?: string

  @ApiPropertyOptional({ example: 'https://example.com/hero.jpg' })
  @IsOptional()
  @IsUrl()
  hero_image?: string

  @ApiProperty({ example: '2024-07-15T10:00:00Z' })
  @IsDateString()
  starts_at!: string

  @ApiProperty({ example: '2024-07-15T16:00:00Z' })
  @IsDateString()
  ends_at!: string

  @ApiPropertyOptional({ example: 'UTC' })
  @IsOptional()
  @IsString()
  @Max(50)
  timezone?: string

  @ApiPropertyOptional({ example: '123 Main St, London' })
  @IsOptional()
  @IsString()
  @Max(500)
  location?: string

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_virtual?: boolean

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789' })
  @IsOptional()
  @IsUrl()
  virtual_url?: string

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_attendees?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  waitlist_enabled?: boolean

  @ApiPropertyOptional({ example: 'Cancellations up to 24h before event for full refund.' })
  @IsOptional()
  @IsString()
  @Max(2000)
  cancellation_policy?: string

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean
}

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Summer Workshop 2024 - Updated' })
  @IsOptional()
  @IsString()
  @Min(2)
  @Max(200)
  name?: string

  @ApiPropertyOptional({ example: 'summer-workshop-2024' })
  @IsOptional()
  @IsString()
  @Min(2)
  @Max(200)
  slug?: string

  @ApiPropertyOptional({ example: 'Updated description...' })
  @IsOptional()
  @IsString()
  @Max(5000)
  description?: string

  @ApiPropertyOptional({ example: 'https://example.com/hero-new.jpg' })
  @IsOptional()
  @IsUrl()
  hero_image?: string

  @ApiPropertyOptional({ example: '2024-07-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  starts_at?: string

  @ApiPropertyOptional({ example: '2024-07-15T16:00:00Z' })
  @IsOptional()
  @IsDateString()
  ends_at?: string

  @ApiPropertyOptional({ example: 'UTC' })
  @IsOptional()
  @IsString()
  @Max(50)
  timezone?: string

  @ApiPropertyOptional({ example: '123 Main St, London' })
  @IsOptional()
  @IsString()
  @Max(500)
  location?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_virtual?: boolean

  @ApiPropertyOptional({ example: 'https://zoom.us/j/987654321' })
  @IsOptional()
  @IsUrl()
  virtual_url?: string

  @ApiPropertyOptional({ enum: EventStatus })
  @IsOptional()
  @IsIn(Object.values(EventStatus))
  status?: EventStatus

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_attendees?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  waitlist_enabled?: boolean

  @ApiPropertyOptional({ example: 'Updated cancellation policy...' })
  @IsOptional()
  @IsString()
  @Max(2000)
  cancellation_policy?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean
}

export class CreateEventTicketDto {
  @ApiProperty({ example: 'Early Bird' })
  @IsString()
  @IsNotEmpty()
  @Max(100)
  name!: string

  @ApiPropertyOptional({ example: 'Limited early bird tickets' })
  @IsOptional()
  @IsString()
  @Max(1000)
  description?: string

  @ApiProperty({ example: 29.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  @Min(3)
  @Max(3)
  currency?: string

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_per_order?: number

  @ApiPropertyOptional({ example: '2024-06-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  sales_starts_at?: string

  @ApiPropertyOptional({ example: '2024-07-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  sales_ends_at?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number
}

export class UpdateEventTicketDto {
  @ApiPropertyOptional({ example: 'Early Bird - Updated' })
  @IsOptional()
  @IsString()
  @Max(100)
  name?: string

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @Max(1000)
  description?: string

  @ApiPropertyOptional({ example: 39.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  @Min(3)
  @Max(3)
  currency?: string

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_per_order?: number

  @ApiPropertyOptional({ example: '2024-06-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  sales_starts_at?: string

  @ApiPropertyOptional({ example: '2024-07-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  sales_ends_at?: string

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number
}

export class CreateEventRegistrationDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @Max(100)
  customer_name!: string

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @IsNotEmpty()
  @Max(255)
  customer_email!: string

  @ApiPropertyOptional({ example: '+44 7123 456789' })
  @IsOptional()
  @IsString()
  @Max(30)
  customer_phone?: string

  @ApiProperty({ example: 'ticket-uuid-here' })
  @IsUUID()
  ticket_id!: string

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  quantity?: number

  @ApiPropertyOptional({ example: 'Please note dietary requirements' })
  @IsOptional()
  @IsString()
  @Max(1000)
  notes?: string
}

export class UpdateEventRegistrationStatusDto {
  @ApiProperty({ enum: RegistrationStatus })
  @IsIn(Object.values(RegistrationStatus))
  status!: RegistrationStatus
}