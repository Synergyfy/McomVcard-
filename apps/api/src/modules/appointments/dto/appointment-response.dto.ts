import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Availability } from '../entities/availability.entity'
import { BookingRule } from '../entities/booking-rule.entity'
import { Appointment } from '../entities/appointment.entity'
import { Service } from '../../services/entities/service.entity'

const toTime = (value: string): string => value.slice(0, 5)

export class AvailabilityResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  business_id!: string

  @ApiProperty({ example: 1 })
  day_of_week!: number

  @ApiProperty({ example: '09:00' })
  start_time!: string

  @ApiProperty({ example: '17:00' })
  end_time!: string

  @ApiProperty({ example: false })
  is_closed!: boolean

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(slot: Availability): AvailabilityResponseDto {
    const dto = new AvailabilityResponseDto()

    dto.id = slot.id
    dto.business_id = slot.businessId
    dto.day_of_week = slot.dayOfWeek
    dto.start_time = toTime(slot.startTime)
    dto.end_time = toTime(slot.endTime)
    dto.is_closed = slot.isClosed
    dto.created_at = slot.createdAt
    dto.updated_at = slot.updatedAt

    return dto
  }
}

export class BookingRuleResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  business_id!: string

  @ApiProperty({ example: true })
  enabled!: boolean

  @ApiProperty({ example: 60 })
  default_duration!: number

  @ApiProperty({ example: 15 })
  buffer!: number

  @ApiProperty({ example: 24 })
  lead_time_hours!: number

  @ApiProperty({ example: 30 })
  advance_window_days!: number

  @ApiProperty({ example: false })
  require_payment!: boolean

  @ApiPropertyOptional({ example: 'Thanks! Your booking has been received.' })
  confirmation_message!: string | null

  @ApiPropertyOptional({ example: 'Please give at least 24 hours notice to cancel.' })
  cancellation_policy!: string | null

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(rule: BookingRule): BookingRuleResponseDto {
    const dto = new BookingRuleResponseDto()

    dto.id = rule.id
    dto.business_id = rule.businessId
    dto.enabled = rule.enabled
    dto.default_duration = rule.defaultDuration
    dto.buffer = rule.buffer
    dto.lead_time_hours = rule.leadTimeHours
    dto.advance_window_days = rule.advanceWindowDays
    dto.require_payment = rule.requirePayment
    dto.confirmation_message = rule.confirmationMessage
    dto.cancellation_policy = rule.cancellationPolicy
    dto.created_at = rule.createdAt
    dto.updated_at = rule.updatedAt

    return dto
  }
}

export class AppointmentResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  business_id!: string

  @ApiPropertyOptional({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  service_id!: string | null

  @ApiPropertyOptional({ example: { id: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', name: 'Haircut & Style', price: 75, currency: 'GBP' } })
  service!: Pick<Service, 'id' | 'name' | 'price' | 'currency'> | null

  @ApiProperty({ example: 'John Miller' })
  customer_name!: string

  @ApiProperty({ example: 'john@example.com' })
  customer_email!: string

  @ApiPropertyOptional({ example: '+44 7700 900123' })
  customer_phone!: string | null

  @ApiProperty({ example: '2026-09-15' })
  date!: string

  @ApiProperty({ example: '10:30' })
  start_time!: string

  @ApiProperty({ example: '11:30' })
  end_time!: string

  @ApiProperty({ example: 'pending', enum: ['pending', 'confirmed', 'cancelled', 'completed'] })
  status!: string

  @ApiPropertyOptional({ example: 'First visit' })
  notes!: string | null

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(appointment: Appointment): AppointmentResponseDto {
    const dto = new AppointmentResponseDto()

    dto.id = appointment.id
    dto.business_id = appointment.businessId
    dto.service_id = appointment.serviceId
    dto.service = appointment.service ? { id: appointment.service.id, name: appointment.service.name, price: appointment.service.price, currency: appointment.service.currency } : null
    dto.customer_name = appointment.customerName
    dto.customer_email = appointment.customerEmail
    dto.customer_phone = appointment.customerPhone ?? null
    dto.date = appointment.date
    dto.start_time = toTime(appointment.startTime)
    dto.end_time = toTime(appointment.endTime)
    dto.status = appointment.status
    dto.notes = appointment.notes ?? null
    dto.created_at = appointment.createdAt
    dto.updated_at = appointment.updatedAt

    return dto
  }
}