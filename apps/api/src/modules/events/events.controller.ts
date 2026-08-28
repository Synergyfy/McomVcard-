import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { EventsService } from './events.service'
import {
  CreateEventDto,
  UpdateEventDto,
  CreateEventTicketDto,
  UpdateEventTicketDto,
  CreateEventRegistrationDto,
  UpdateEventRegistrationStatusDto,
} from './dto/event.dto'
import { EventStatus, RegistrationStatus } from './entities/event.entity'
import {
  EventResponseDto,
  EventTicketResponseDto,
  EventRegistrationResponseDto,
  EventListResponseDto,
} from './dto/event-response.dto'

function eventSchema() {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponse) },
      { properties: { data: { $ref: getSchemaPath(EventResponseDto) } } },
    ],
  }
}

function eventListSchema() {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponse) },
      { properties: { data: { $ref: getSchemaPath(EventListResponseDto) } } },
    ],
  }
}

function ticketSchema() {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponse) },
      { properties: { data: { $ref: getSchemaPath(EventTicketResponseDto) } } },
    ],
  }
}

function registrationSchema() {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponse) },
      { properties: { data: { $ref: getSchemaPath(EventRegistrationResponseDto) } } },
    ],
  }
}

function registrationArraySchema() {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponse) },
      { properties: { data: { type: 'array', items: { $ref: getSchemaPath(EventRegistrationResponseDto) } } } },
    ],
  }
}

function messageSchema() {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponse) },
      { properties: { message: { type: 'string' } } },
    ],
  }
}

function ticketArraySchema() {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponse) },
      { properties: { data: { type: 'array', items: { $ref: getSchemaPath(EventTicketResponseDto) } } } },
    ],
  }
}

@ApiTags('events')
@ApiExtraModels(ApiResponse, EventResponseDto, EventTicketResponseDto, EventRegistrationResponseDto, EventListResponseDto)
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // --- Events ---

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an event', description: 'Creates a new event for a business owned by the authenticated user.' })
  @ApiBody({ type: CreateEventDto })
  @ApiCreatedResponse({
    description: 'Event created',
    schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(EventResponseDto) } } }] },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Not owner of the business' })
  @ApiBadRequestResponse({ description: 'Invalid input or business not found' })
  async create(@CurrentUser() user: UserResponseDto, @Body() dto: CreateEventDto) {
    return this.eventsService.create(dto.business_id, user.id, dto)
  }

  @Get('public')
  @ApiOperation({ summary: 'List public events', description: 'Returns published upcoming events, optionally paginated.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({
    description: 'Public events retrieved',
    schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(EventListResponseDto) } } }] },
  })
  async listPublic(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.eventsService.listPublic(Number(page), Number(limit))
  }

  @Get('businesses/:businessId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List events for a business', description: 'Returns events for a business owned by the authenticated user.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'cancelled', 'completed'] as const })
  @ApiOkResponse({ description: 'Business events retrieved', schema: eventListSchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Not owner of the business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async listForBusiness(
    @CurrentUser() user: UserResponseDto,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: EventStatus,
  ) {
    return this.eventsService.listForBusiness(businessId, user.id, Number(page), Number(limit), status)
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an event by ID', description: 'Returns event details including tickets and registrations.' })
  @ApiOkResponse({ description: 'Event retrieved', schema: eventSchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async findOne(@CurrentUser() user: UserResponseDto, @Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id)
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get an event by slug', description: 'Public access to event by slug.' })
  @ApiOkResponse({ description: 'Event retrieved', schema: eventSchema() })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug)
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event', description: 'Updates an event owned by the authenticated user.' })
  @ApiBody({ type: UpdateEventDto })
  @ApiOkResponse({ description: 'Event updated', schema: eventSchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Not owner of the business' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(
    @CurrentUser() user: UserResponseDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, user.id, dto)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event', description: 'Deletes an event owned by the authenticated user.' })
  @ApiOkResponse({ description: 'Event deleted', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { message: { type: 'string' } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Not owner of the business' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async remove(@CurrentUser() user: UserResponseDto, @Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.remove(id, user.id)
  }

  // --- Tickets ---

  @Post(':id/tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a ticket for an event', description: 'Creates a ticket tier for an event owned by the authenticated user.' })
  @ApiBody({ type: CreateEventTicketDto })
  @ApiCreatedResponse({ description: 'Ticket created', schema: ticketSchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Not owner of the business' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async createTicket(
    @CurrentUser() user: UserResponseDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEventTicketDto,
  ) {
    return this.eventsService.createTicket(id, user.id, dto)
  }

  @Get(':id/tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List tickets for an event', description: 'Returns all ticket tiers for an event.' })
  @ApiOkResponse({ description: 'Tickets retrieved', schema: ticketArraySchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async listTickets(@CurrentUser() user: UserResponseDto, @Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.listTickets(id)
  }

  @Patch(':id/tickets/:ticketId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a ticket', description: 'Updates a ticket tier for an event owned by the authenticated user.' })
  @ApiBody({ type: UpdateEventTicketDto })
  @ApiOkResponse({ description: 'Ticket updated', schema: ticketSchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Not owner of the business' })
  @ApiNotFoundResponse({ description: 'Event or ticket not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updateTicket(
    @CurrentUser() user: UserResponseDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() dto: UpdateEventTicketDto,
  ) {
    return this.eventsService.updateTicket(id, ticketId, user.id, dto)
  }

  @Delete(':id/tickets/:ticketId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a ticket', description: 'Deletes a ticket tier if it has no registrations.' })
  @ApiOkResponse({ description: 'Ticket deleted', schema: messageSchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Not owner of the business' })
  @ApiNotFoundResponse({ description: 'Event or ticket not found' })
  @ApiBadRequestResponse({ description: 'Ticket has existing registrations' })
  async removeTicket(
    @CurrentUser() user: UserResponseDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
  ) {
    return this.eventsService.removeTicket(id, ticketId, user.id)
  }

  // --- Registrations ---

  @Post(':id/register')
  @ApiOperation({ summary: 'Register for an event', description: 'Public registration for an event ticket.' })
  @ApiBody({ type: CreateEventRegistrationDto })
  @ApiCreatedResponse({ description: 'Registration successful', schema: registrationSchema() })
  @ApiBadRequestResponse({ description: 'Event not open, sold out, or already registered' })
  @ApiNotFoundResponse({ description: 'Event or ticket not found' })
  async register(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateEventRegistrationDto) {
    return this.eventsService.register(id, dto)
  }

  @Get(':id/registrations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List registrations for an event', description: 'Returns all registrations for an event owned by the authenticated user.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'cancelled', 'waitlisted', 'checked_in'] as const })
  @ApiOkResponse({ description: 'Registrations retrieved', schema: eventListSchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Not owner of the business' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async listRegistrations(
    @CurrentUser() user: UserResponseDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: RegistrationStatus,
  ) {
    return this.eventsService.listRegistrations(id, user.id, Number(page), Number(limit), status)
  }

  @Get('my/registrations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my event registrations', description: 'Returns all event registrations for the authenticated user.' })
  @ApiOkResponse({ description: 'My registrations retrieved', schema: registrationArraySchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getMyRegistrations(@CurrentUser() user: UserResponseDto) {
    return this.eventsService.getMyRegistrations(user.id)
  }

  @Patch(':id/registrations/:registrationId/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update registration status', description: 'Updates the status of a registration (owner only).' })
  @ApiBody({ type: UpdateEventRegistrationStatusDto })
  @ApiOkResponse({ description: 'Registration status updated', schema: registrationSchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Not owner of the business' })
  @ApiNotFoundResponse({ description: 'Event or registration not found' })
  @ApiBadRequestResponse({ description: 'Invalid status' })
  async updateRegistrationStatus(
    @CurrentUser() user: UserResponseDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('registrationId', ParseUUIDPipe) registrationId: string,
    @Body() dto: UpdateEventRegistrationStatusDto,
  ) {
    return this.eventsService.updateRegistrationStatus(id, registrationId, user.id, dto)
  }

  @Post('registrations/:registrationId/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel my registration', description: 'Allows the registered user to cancel their own registration.' })
  @ApiOkResponse({ description: 'Registration cancelled', schema: registrationSchema() })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Registration not found or not yours' })
  @ApiBadRequestResponse({ description: 'Registration already cancelled' })
  async cancelRegistration(@CurrentUser() user: UserResponseDto, @Param('registrationId', ParseUUIDPipe) registrationId: string) {
    return this.eventsService.cancelRegistration(registrationId, user.id)
  }
}