import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Event } from '../entities/event.entity'
import { EventTicket } from '../entities/event-ticket.entity'
import { EventRegistration } from '../entities/event-registration.entity'
import { EventStatus, RegistrationStatus } from '../entities/event.entity'

export class EventResponseDto {
  @ApiProperty({ example: 'evt-uuid-here' })
  id!: string

  @ApiProperty({ example: 'biz-uuid-here' })
  business_id!: string

  @ApiPropertyOptional({ example: 'card-uuid-here' })
  card_id!: string | null

  @ApiProperty({ example: 'Summer Workshop 2024' })
  name!: string

  @ApiProperty({ example: 'summer-workshop-2024' })
  slug!: string

  @ApiPropertyOptional({ example: 'Join us for an exciting summer workshop...' })
  description!: string | null

  @ApiPropertyOptional({ example: 'https://example.com/hero.jpg' })
  hero_image!: string | null

  @ApiProperty({ example: '2024-07-15T10:00:00.000Z' })
  starts_at!: string

  @ApiProperty({ example: '2024-07-15T16:00:00.000Z' })
  ends_at!: string

  @ApiProperty({ example: 'UTC' })
  timezone!: string

  @ApiPropertyOptional({ example: '123 Main St, London' })
  location!: string | null

  @ApiProperty({ example: false })
  is_virtual!: boolean

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789' })
  virtual_url!: string | null

  @ApiProperty({ enum: EventStatus, example: EventStatus.PUBLISHED })
  status!: EventStatus

  @ApiPropertyOptional({ example: 50 })
  max_attendees!: number | null

  @ApiProperty({ example: true })
  waitlist_enabled!: boolean

  @ApiPropertyOptional({ example: 'Cancellations up to 24h before event for full refund.' })
  cancellation_policy!: string | null

  @ApiProperty({ example: false })
  requires_approval!: boolean

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: string

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: string

  @ApiPropertyOptional({ type: () => [EventTicketResponseDto] })
  tickets?: EventTicketResponseDto[]

  @ApiPropertyOptional({ type: () => [EventRegistrationResponseDto] })
  registrations?: EventRegistrationResponseDto[]

  static fromEntity(event: Event): EventResponseDto {
    const dto = new EventResponseDto()
    dto.id = event.id
    dto.business_id = event.businessId
    dto.card_id = event.cardId
    dto.name = event.name
    dto.slug = event.slug
    dto.description = event.description
    dto.hero_image = event.heroImage
    dto.starts_at = event.startsAt.toISOString()
    dto.ends_at = event.endsAt.toISOString()
    dto.timezone = event.timezone
    dto.location = event.location
    dto.is_virtual = event.isVirtual
    dto.virtual_url = event.virtualUrl
    dto.status = event.status
    dto.max_attendees = event.maxAttendees
    dto.waitlist_enabled = event.waitlistEnabled
    dto.cancellation_policy = event.cancellationPolicy
    dto.requires_approval = event.requiresApproval
    dto.created_at = event.createdAt.toISOString()
    dto.updated_at = event.updatedAt.toISOString()
    dto.tickets = event.tickets?.map(EventTicketResponseDto.fromEntity)
    dto.registrations = event.registrations?.map(EventRegistrationResponseDto.fromEntity)
    return dto
  }
}

export class EventTicketResponseDto {
  @ApiProperty({ example: 'ticket-uuid-here' })
  id!: string

  @ApiProperty({ example: 'evt-uuid-here' })
  event_id!: string

  @ApiProperty({ example: 'Early Bird' })
  name!: string

  @ApiPropertyOptional({ example: 'Limited early bird tickets' })
  description!: string | null

  @ApiProperty({ example: 29.99 })
  price!: number

  @ApiProperty({ example: 'GBP' })
  currency!: string

  @ApiPropertyOptional({ example: 50 })
  quantity!: number | null

  @ApiProperty({ example: 10 })
  sold!: number

  @ApiPropertyOptional({ example: 40 })
  available!: number | null

  @ApiProperty({ example: 5 })
  max_per_order!: number

  @ApiPropertyOptional({ example: '2024-06-01T00:00:00.000Z' })
  sales_starts_at!: string | null

  @ApiPropertyOptional({ example: '2024-07-01T00:00:00.000Z' })
  sales_ends_at!: string | null

  @ApiProperty({ example: true })
  is_active!: boolean

  @ApiProperty({ example: 0 })
  sort_order!: number

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: string

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: string

  @ApiProperty({ example: false })
  is_sold_out!: boolean

  static fromEntity(ticket: EventTicket): EventTicketResponseDto {
    const dto = new EventTicketResponseDto()
    dto.id = ticket.id
    dto.event_id = ticket.eventId
    dto.name = ticket.name
    dto.description = ticket.description
    dto.price = Number(ticket.price)
    dto.currency = ticket.currency
    dto.quantity = ticket.quantity
    dto.sold = ticket.sold
    dto.available = ticket.available
    dto.max_per_order = ticket.maxPerOrder
    dto.sales_starts_at = ticket.salesStartsAt?.toISOString() ?? null
    dto.sales_ends_at = ticket.salesEndsAt?.toISOString() ?? null
    dto.is_active = ticket.isActive
    dto.sort_order = ticket.sortOrder
    dto.created_at = ticket.createdAt.toISOString()
    dto.updated_at = ticket.updatedAt.toISOString()
    dto.is_sold_out = ticket.isSoldOut
    return dto
  }
}

export class EventRegistrationResponseDto {
  @ApiProperty({ example: 'reg-uuid-here' })
  id!: string

  @ApiProperty({ example: 'evt-uuid-here' })
  event_id!: string

  @ApiProperty({ example: 'ticket-uuid-here' })
  ticket_id!: string

  @ApiPropertyOptional({ example: 'user-uuid-here' })
  user_id!: string | null

  @ApiProperty({ example: 'John Doe' })
  customer_name!: string

  @ApiProperty({ example: 'john@example.com' })
  customer_email!: string

  @ApiPropertyOptional({ example: '+44 7123 456789' })
  customer_phone!: string | null

  @ApiProperty({ example: 2 })
  quantity!: number

  @ApiProperty({ example: 59.98 })
  total_paid!: number

  @ApiProperty({ example: 'GBP' })
  currency!: string

  @ApiProperty({ enum: RegistrationStatus, example: RegistrationStatus.CONFIRMED })
  status!: RegistrationStatus

  @ApiPropertyOptional({ example: '2024-07-15T10:05:00.000Z' })
  checked_in_at!: string | null

  @ApiPropertyOptional({ example: 'Please note dietary requirements' })
  notes!: string | null

  @ApiPropertyOptional({ example: { source: 'web' } })
  metadata!: Record<string, unknown> | null

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: string

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: string

  static fromEntity(reg: EventRegistration): EventRegistrationResponseDto {
    const dto = new EventRegistrationResponseDto()
    dto.id = reg.id
    dto.event_id = reg.eventId
    dto.ticket_id = reg.ticketId
    dto.user_id = reg.userId
    dto.customer_name = reg.customerName
    dto.customer_email = reg.customerEmail
    dto.customer_phone = reg.customerPhone
    dto.quantity = reg.quantity
    dto.total_paid = Number(reg.totalPaid)
    dto.currency = reg.currency
    dto.status = reg.status
    dto.checked_in_at = reg.checkedInAt?.toISOString() ?? null
    dto.notes = reg.notes
    dto.metadata = reg.metadata
    dto.created_at = reg.createdAt.toISOString()
    dto.updated_at = reg.updatedAt.toISOString()
    return dto
  }
}

export class EventListResponseDto {
  @ApiProperty({ type: () => [EventResponseDto] })
  data!: EventResponseDto[]

  @ApiProperty({ example: 1 })
  page!: number

  @ApiProperty({ example: 20 })
  limit!: number

  @ApiProperty({ example: 100 })
  total!: number

  @ApiProperty({ example: 5 })
  total_pages!: number
}