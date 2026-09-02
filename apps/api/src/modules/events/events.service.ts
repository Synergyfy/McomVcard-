import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { BusinessesService } from '../businesses/businesses.service'
import { CardsService } from '../cards/cards.service'
import { Event } from './entities/event.entity'
import { EventTicket } from './entities/event-ticket.entity'
import { EventRegistration } from './entities/event-registration.entity'
import { EventStatus, RegistrationStatus } from './entities/event.entity'
import { CreateEventDto, UpdateEventDto, CreateEventTicketDto, UpdateEventTicketDto, CreateEventRegistrationDto, UpdateEventRegistrationStatusDto } from './dto/event.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { EventResponseDto, EventTicketResponseDto, EventRegistrationResponseDto, EventListResponseDto } from './dto/event-response.dto'
import { slugify } from '../../lib/utils/slug.util'

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
    @InjectRepository(EventTicket) private ticketsRepo: Repository<EventTicket>,
    @InjectRepository(EventRegistration) private registrationsRepo: Repository<EventRegistration>,
    private readonly businessesService: BusinessesService,
    private readonly cardsService: CardsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(businessId: string, ownerId: string, dto: CreateEventDto) {
    await this.businessesService.findOwned(businessId, ownerId)

    let card: Event['card'] = null
    if (dto.slug) {
      card = await this.cardsRepo.findOne({ where: { slug: dto.slug, ownerId } })
      if (!card) throw new BadRequestException('Card not found or not owned by you')
    }

    const slug = await this.generateUniqueSlug(dto.slug ?? dto.name)

    const startsAt = new Date(dto.starts_at)
    const endsAt = new Date(dto.ends_at)

    if (endsAt <= startsAt) throw new BadRequestException('Ends at must be after starts at')

    const saved = await this.eventsRepo.save(
      this.eventsRepo.create({
        businessId,
        cardId: card?.id ?? null,
        name: dto.name,
        slug,
        description: dto.description ?? null,
        heroImage: dto.hero_image ?? null,
        startsAt,
        endsAt,
        timezone: dto.timezone ?? 'UTC',
        location: dto.location ?? null,
        isVirtual: dto.is_virtual ?? false,
        virtualUrl: dto.virtual_url ?? null,
        maxAttendees: dto.max_attendees ?? null,
        waitlistEnabled: dto.waitlist_enabled ?? false,
        cancellationPolicy: dto.cancellation_policy ?? null,
        requiresApproval: dto.requires_approval ?? false,
        status: EventStatus.DRAFT,
      }),
    )

    return ApiResponse.success(EventResponseDto.fromEntity(await this.findOne(saved.id)), 'Event created', 201)
  }

  async findOne(id: string) {
    const event = await this.eventsRepo.findOne({
      where: { id },
      relations: { business: true, card: true, tickets: true, registrations: true },
    })
    if (!event) throw new NotFoundException('Event not found')
    return event
  }

  async findBySlug(slug: string) {
    const event = await this.eventsRepo.findOne({
      where: { slug },
      relations: { business: true, card: true, tickets: true },
    })
    if (!event) throw new NotFoundException('Event not found')
    return event
  }

  async listForBusiness(businessId: string, ownerId: string, page = 1, limit = 20, status?: EventStatus) {
    await this.businessesService.findOwned(businessId, ownerId)

    const qb = this.eventsRepo.createQueryBuilder('event')
      .where('event.business_id = :businessId', { businessId })
      .orderBy('event.starts_at', 'DESC')

    if (status) {
      qb.andWhere('event.status = :status', { status })
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return ApiResponse.success({
      data: data.map(EventResponseDto.fromEntity),
      meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
    }, 'Events retrieved', 200)
  }

  async listPublic(page = 1, limit = 20, status = EventStatus.PUBLISHED) {
    const qb = this.eventsRepo.createQueryBuilder('event')
      .where('event.status = :status', { status })
      .andWhere('event.starts_at > :now', { now: new Date() })
      .orderBy('event.starts_at', 'ASC')
      .leftJoinAndSelect('event.tickets', 'tickets', 'tickets.is_active = true')
      .leftJoinAndSelect('event.business', 'business')

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return ApiResponse.success({
      data: data.map(EventResponseDto.fromEntity),
      meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
    }, 'Events retrieved', 200)
  }

  async update(id: string, ownerId: string, dto: UpdateEventDto) {
    const event = await this.findOne(id)
    await this.businessesService.findOwned(event.businessId, ownerId)

    const patch: Partial<Event> = {}

    if (dto.name !== undefined) patch.name = dto.name
    if (dto.slug !== undefined) patch.slug = await this.generateUniqueSlug(dto.slug, id)
    if (dto.description !== undefined) patch.description = dto.description
    if (dto.hero_image !== undefined) patch.heroImage = dto.hero_image
    if (dto.starts_at !== undefined) patch.startsAt = new Date(dto.starts_at)
    if (dto.ends_at !== undefined) patch.endsAt = new Date(dto.ends_at)
    if (dto.timezone !== undefined) patch.timezone = dto.timezone
    if (dto.location !== undefined) patch.location = dto.location
    if (dto.is_virtual !== undefined) patch.isVirtual = dto.is_virtual
    if (dto.virtual_url !== undefined) patch.virtualUrl = dto.virtual_url
    if (dto.status !== undefined) patch.status = dto.status
    if (dto.max_attendees !== undefined) patch.maxAttendees = dto.max_attendees
    if (dto.waitlist_enabled !== undefined) patch.waitlistEnabled = dto.waitlist_enabled
    if (dto.cancellation_policy !== undefined) patch.cancellationPolicy = dto.cancellation_policy
    if (dto.requires_approval !== undefined) patch.requiresApproval = dto.requires_approval

    if (patch.startsAt && patch.endsAt && patch.endsAt <= patch.startsAt) {
      throw new BadRequestException('Ends at must be after starts at')
    }

    await this.eventsRepo.update({ id }, patch as any)
    return ApiResponse.success(EventResponseDto.fromEntity(await this.findOne(id)), 'Event updated', 200)
  }

  async remove(id: string, ownerId: string) {
    const event = await this.findOne(id)
    await this.businessesService.findOwned(event.businessId, ownerId)
    await this.eventsRepo.delete({ id })
    return ApiResponse.message('Event deleted', 200)
  }

  // --- Tickets ---

  async createTicket(eventId: string, ownerId: string, dto: CreateEventTicketDto) {
    const event = await this.findOne(eventId)
    await this.businessesService.findOwned(event.businessId, ownerId)

    const saved = await this.ticketsRepo.save(
      this.ticketsRepo.create({
        eventId,
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price,
        currency: dto.currency ?? 'GBP',
        quantity: dto.quantity ?? null,
        maxPerOrder: dto.max_per_order ?? 10,
        salesStartsAt: dto.sales_starts_at ? new Date(dto.sales_starts_at) : null,
        salesEndsAt: dto.sales_ends_at ? new Date(dto.sales_ends_at) : null,
        isActive: dto.is_active ?? true,
        sortOrder: dto.sort_order ?? 0,
      }),
    )

    return ApiResponse.success(EventTicketResponseDto.fromEntity(saved), 'Ticket created', 201)
  }

  async listTickets(eventId: string) {
    await this.findOne(eventId)
    const tickets = await this.ticketsRepo.find({ where: { eventId }, order: { sortOrder: 'ASC' } })
    return ApiResponse.success(tickets.map(EventTicketResponseDto.fromEntity), 'Tickets retrieved', 200)
  }

  async updateTicket(eventId: string, ticketId: string, ownerId: string, dto: UpdateEventTicketDto) {
    const event = await this.findOne(eventId)
    await this.businessesService.findOwned(event.businessId, ownerId)

    const ticket = await this.ticketsRepo.findOne({ where: { id: ticketId, eventId } })
    if (!ticket) throw new NotFoundException('Ticket not found')

    const patch: Partial<EventTicket> = {}
    if (dto.name !== undefined) patch.name = dto.name
    if (dto.description !== undefined) patch.description = dto.description
    if (dto.price !== undefined) patch.price = dto.price
    if (dto.currency !== undefined) patch.currency = dto.currency
    if (dto.quantity !== undefined) patch.quantity = dto.quantity
    if (dto.max_per_order !== undefined) patch.maxPerOrder = dto.max_per_order
    if (dto.sales_starts_at !== undefined) patch.salesStartsAt = dto.sales_starts_at ? new Date(dto.sales_starts_at) : null
    if (dto.sales_ends_at !== undefined) patch.salesEndsAt = dto.sales_ends_at ? new Date(dto.sales_ends_at) : null
    if (dto.is_active !== undefined) patch.isActive = dto.is_active
    if (dto.sort_order !== undefined) patch.sortOrder = dto.sort_order

    await this.ticketsRepo.update({ id: ticketId }, patch as any)
    const updated = await this.ticketsRepo.findOneBy({ id: ticketId })
    return ApiResponse.success(EventTicketResponseDto.fromEntity(updated!), 'Ticket updated', 200)
  }

  async removeTicket(eventId: string, ticketId: string, ownerId: string) {
    const event = await this.findOne(eventId)
    await this.businessesService.findOwned(event.businessId, ownerId)

    const ticket = await this.ticketsRepo.findOne({ where: { id: ticketId, eventId } })
    if (!ticket) throw new NotFoundException('Ticket not found')

    // Check if ticket has registrations
    const regCount = await this.registrationsRepo.count({ where: { ticketId } })
    if (regCount > 0) throw new BadRequestException('Cannot delete ticket with existing registrations')

    await this.ticketsRepo.delete({ id: ticketId })
    return ApiResponse.message('Ticket deleted', 200)
  }

  // --- Registrations ---

  async register(eventId: string, dto: CreateEventRegistrationDto) {
    const event = await this.findOne(eventId)

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not open for registration')
    }

    if (event.startsAt < new Date()) {
      throw new BadRequestException('Event has already started')
    }

    const ticket = await this.ticketsRepo.findOne({ where: { id: dto.ticket_id, eventId, isActive: true } })
    if (!ticket) throw new NotFoundException('Ticket not found or not available')

    // Check sales window
    const now = new Date()
    if (ticket.salesStartsAt && ticket.salesStartsAt > now) {
      throw new BadRequestException('Ticket sales have not started yet')
    }
    if (ticket.salesEndsAt && ticket.salesEndsAt < now) {
      throw new BadRequestException('Ticket sales have ended')
    }

    // Check capacity
    if (ticket.quantity !== null && ticket.sold + (dto.quantity ?? 1) > ticket.quantity) {
      throw new BadRequestException('Not enough tickets available')
    }

    // Check max per order
    if ((dto.quantity ?? 1) > ticket.maxPerOrder) {
      throw new BadRequestException(`Maximum ${ticket.maxPerOrder} tickets per order`)
    }

    // Check if user already registered
    if (dto.customer_email) {
      const existing = await this.registrationsRepo.findOne({
        where: { eventId, customerEmail: dto.customer_email, status: RegistrationStatus.CONFIRMED },
      })
      if (existing) throw new BadRequestException('Already registered for this event')
    }

    const totalPaid = ticket.price * (dto.quantity ?? 1)

    return this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(
        manager.create(EventRegistration, {
          eventId,
          ticketId: dto.ticket_id,
          customerName: dto.customer_name,
          customerEmail: dto.customer_email,
          customerPhone: dto.customer_phone ?? null,
          quantity: dto.quantity ?? 1,
          totalPaid,
          currency: ticket.currency,
          status: event.requiresApproval ? RegistrationStatus.PENDING : RegistrationStatus.CONFIRMED,
          notes: dto.notes ?? null,
        }),
      )

      // Increment ticket sold count
      await manager.increment(EventTicket, { id: dto.ticket_id }, 'sold', dto.quantity ?? 1)

      return ApiResponse.success(EventRegistrationResponseDto.fromEntity(saved), 'Registration successful', 201)
    })
  }

  async listRegistrations(eventId: string, ownerId: string, page = 1, limit = 20, status?: RegistrationStatus) {
    const event = await this.findOne(eventId)
    await this.businessesService.findOwned(event.businessId, ownerId)

    const qb = this.registrationsRepo.createQueryBuilder('reg')
      .where('reg.event_id = :eventId', { eventId })
      .leftJoinAndSelect('reg.ticket', 'ticket')
      .leftJoinAndSelect('reg.user', 'user')
      .orderBy('reg.created_at', 'DESC')

    if (status) {
      qb.andWhere('reg.status = :status', { status })
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return ApiResponse.success({
      data: data.map(EventRegistrationResponseDto.fromEntity),
      meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
    }, 'Registrations retrieved', 200)
  }

  async getMyRegistrations(userId: string) {
    const regs = await this.registrationsRepo.find({
      where: { userId },
      relations: { event: { tickets: true, business: true }, ticket: true },
      order: { createdAt: 'DESC' },
    })
    return ApiResponse.success(regs.map(EventRegistrationResponseDto.fromEntity), 'My registrations retrieved', 200)
  }

  async updateRegistrationStatus(eventId: string, registrationId: string, ownerId: string, dto: UpdateEventRegistrationStatusDto) {
    const event = await this.findOne(eventId)
    await this.businessesService.findOwned(event.businessId, ownerId)

    const reg = await this.registrationsRepo.findOne({ where: { id: registrationId, eventId } })
    if (!reg) throw new NotFoundException('Registration not found')

    const oldStatus = reg.status
    reg.status = dto.status

    if (dto.status === RegistrationStatus.CHECKED_IN) {
      reg.checkedInAt = new Date()
    }

    await this.registrationsRepo.save(reg)
    return ApiResponse.success(EventRegistrationResponseDto.fromEntity(reg), 'Registration status updated', 200)
  }

  async cancelRegistration(registrationId: string, userId: string) {
    const reg = await this.registrationsRepo.findOne({ where: { id: registrationId, userId } })
    if (!reg) throw new NotFoundException('Registration not found or not yours')

    if (reg.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Registration already cancelled')
    }

    return this.dataSource.transaction(async (manager) => {
      reg.status = RegistrationStatus.CANCELLED
      await manager.save(reg)

      // Decrement ticket sold count
      await manager.decrement(EventTicket, { id: reg.ticketId }, 'sold', reg.quantity)

      return ApiResponse.success(EventRegistrationResponseDto.fromEntity(reg), 'Registration cancelled', 200)
    })
  }

  // --- Helpers ---

  private async generateUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    const base = slugify(slug)
    let candidate = base
    let suffix = 2

    while (await this.eventsRepo.findOne({ where: { slug: candidate } })) {
      const found = await this.eventsRepo.findOne({ where: { slug: candidate } })
      if (found && found.id === excludeId) break
      candidate = `${base}-${suffix}`
      suffix++
    }
    return candidate
  }

  private get cardsRepo() {
    return (this.cardsService as any).cardsRepo
  }
}