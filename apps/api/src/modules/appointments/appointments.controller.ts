import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { AppointmentsService } from './appointments.service'
import { AppointmentResponseDto, AvailabilityResponseDto, BookingRuleResponseDto } from './dto/appointment-response.dto'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto'
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto'
import { CreateAvailabilityDto } from './dto/create-availability.dto'
import { UpdateAvailabilityDto } from './dto/update-availability.dto'
import { CreateBookingRuleDto } from './dto/create-booking-rule.dto'
import { UpdateBookingRuleDto } from './dto/update-booking-rule.dto'

@ApiTags('appointments')
@ApiExtraModels(ApiResponse, AppointmentResponseDto, AvailabilityResponseDto, BookingRuleResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // --- Booking rules ---

  @Get('businesses/:id/booking-rules')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get business booking rules', description: 'Returns the booking engine configuration for a business. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Booking rules',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BookingRuleResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async getRules(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appointmentsService.getRules(id)
  }

  @Post('businesses/:id/booking-rules')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Configure business booking rules', description: 'Creates the booking engine configuration for a business owned by the authenticated user. One set of rules per business.' })
  @ApiBody({ type: CreateBookingRuleDto, examples: { default: { summary: 'Default rules', value: { enabled: true, default_duration: 60, buffer: 15, lead_time_hours: 24, advance_window_days: 30, require_payment: false, confirmation_message: 'Thanks! Your booking has been received.', cancellation_policy: 'Please give at least 24 hours notice to cancel.' } } } })
  @ApiCreatedResponse({
    description: 'Booking rules created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BookingRuleResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiBadRequestResponse({ description: 'Invalid input or rules already exist' })
  async createRules(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateBookingRuleDto) {
    return this.appointmentsService.createRules(id, user.id, body)
  }

  @Patch('booking-rules/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update business booking rules', description: 'Updates the booking engine configuration for a business owned by the authenticated user.' })
  @ApiBody({ type: UpdateBookingRuleDto, examples: { default: { summary: 'Tighten window', value: { lead_time_hours: 48, advance_window_days: 14 } } } })
  @ApiOkResponse({
    description: 'Booking rules updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BookingRuleResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Booking rules not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updateRules(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateBookingRuleDto) {
    return this.appointmentsService.updateRules(id, user.id, body)
  }

  // --- Availability ---

  @Get('businesses/:id/availability')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List business availability', description: 'Returns the weekly availability slots for a business. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Business availability',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(AvailabilityResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async listAvailability(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appointmentsService.listAvailability(id)
  }

  @Post('businesses/:id/availability')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a weekly availability slot', description: 'Creates a weekly availability slot for a business owned by the authenticated user.' })
  @ApiBody({ type: CreateAvailabilityDto, examples: { default: { summary: 'Monday 9-5', value: { day_of_week: 1, start_time: '09:00', end_time: '17:00' } } } })
  @ApiCreatedResponse({
    description: 'Availability created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(AvailabilityResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async createAvailability(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateAvailabilityDto) {
    return this.appointmentsService.createAvailability(id, user.id, body)
  }

  @Patch('businesses/:id/availability')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk upsert weekly availability slots', description: 'Creates or updates multiple weekly availability slots for a business owned by the authenticated user. Slots are matched by day_of_week.' })
  @ApiBody({ type: [CreateAvailabilityDto], examples: { default: { summary: 'Full week schedule', value: [ { day_of_week: 1, start_time: '09:00', end_time: '17:00' }, { day_of_week: 2, start_time: '09:00', end_time: '17:00' }, { day_of_week: 3, start_time: '09:00', end_time: '17:00' }, { day_of_week: 4, start_time: '09:00', end_time: '17:00' }, { day_of_week: 5, start_time: '09:00', end_time: '17:00' } ] } } })
  @ApiOkResponse({
    description: 'Availability bulk upserted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { type: 'array', items: { $ref: getSchemaPath(AvailabilityResponseDto) } } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async bulkUpsertAvailability(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateAvailabilityDto[]) {
    return this.appointmentsService.bulkUpsertAvailability(id, user.id, body)
  }

  @Patch('availability/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a weekly availability slot', description: 'Updates an availability slot for a business owned by the authenticated user.' })
  @ApiBody({ type: UpdateAvailabilityDto, examples: { default: { summary: 'Shorten to half day', value: { end_time: '13:00' } } } })
  @ApiOkResponse({
    description: 'Availability updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(AvailabilityResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Availability not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updateAvailability(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateAvailabilityDto) {
    return this.appointmentsService.updateAvailability(id, user.id, body)
  }

  @Delete('availability/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a weekly availability slot', description: 'Removes an availability slot for a business owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Availability deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Availability deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Availability not found' })
  async removeAvailability(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.appointmentsService.removeAvailability(id, user.id)
  }

  // --- Appointments ---

  @Post('businesses/:id/appointments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book an appointment', description: 'Requests an appointment at a business. Any authenticated user can book, subject to the business booking rules and availability.' })
  @ApiBody({ type: CreateAppointmentDto, examples: { default: { summary: 'Book a slot', value: { customer_name: 'John Miller', customer_email: 'john@example.com', customer_phone: '+44 7700 900123', date: '2026-09-15', start_time: '10:30' } } } })
  @ApiCreatedResponse({
    description: 'Appointment requested',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(AppointmentResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiBadRequestResponse({ description: 'Invalid input, no availability, or booking rules violated' })
  async book(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: CreateAppointmentDto) {
    return this.appointmentsService.book(id, body)
  }

  @Get('businesses/:id/appointments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List business appointments', description: 'Returns all appointments for a business owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Business appointments',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(AppointmentResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async listForBusiness(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.appointmentsService.listForBusiness(id, user.id)
  }

  @Get('appointments/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an appointment', description: 'Returns a single appointment for a business owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Appointment found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(AppointmentResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  async getForOwner(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.appointmentsService.getForOwner(id, user.id)
  }

  @Patch('appointments/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update appointment status', description: 'Updates the status of an appointment (pending, confirmed, cancelled, completed) for a business owned by the authenticated user.' })
  @ApiBody({ type: UpdateAppointmentStatusDto, examples: { default: { summary: 'Confirm booking', value: { status: 'confirmed' } } } })
  @ApiOkResponse({
    description: 'Appointment updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(AppointmentResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiBadRequestResponse({ description: 'Invalid status' })
  async updateStatus(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, user.id, body)
  }

  @Patch('appointments/:id/reschedule')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reschedule an appointment', description: 'Moves an appointment to a new date/time, re-validating availability and conflicts, for a business owned by the authenticated user.' })
  @ApiBody({ type: RescheduleAppointmentDto, examples: { default: { summary: 'Move to next week', value: { date: '2026-09-20', start_time: '14:00' } } } })
  @ApiOkResponse({
    description: 'Appointment rescheduled',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(AppointmentResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiBadRequestResponse({ description: 'Invalid input, no availability, or slot conflict' })
  async reschedule(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: RescheduleAppointmentDto) {
    return this.appointmentsService.reschedule(id, user.id, body)
  }

  @Delete('appointments/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an appointment', description: 'Deletes an appointment for a business owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Appointment deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Appointment deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.appointmentsService.remove(id, user.id)
  }
}