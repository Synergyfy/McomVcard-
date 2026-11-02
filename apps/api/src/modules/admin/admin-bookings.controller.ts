import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe, NotFoundException } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { Appointment } from '../appointments/entities/appointment.entity'

function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if ([sh, sm, eh, em].some((value) => !Number.isFinite(value))) return 0
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
}

@ApiTags('admin-bookings')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all bookings (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiOkResponse({ description: 'List of bookings' })
  async findAll(@Query() query: any) {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
    const status = typeof query.status === 'string' && query.status !== 'All' ? query.status : undefined
    const search = typeof query.search === 'string' ? query.search.trim() : ''

    const qb = this.appointmentRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.business', 'business')
      .leftJoinAndSelect('a.service', 'service')

    if (search) {
      qb.andWhere(
        '(a.customerName ILIKE :search OR a.customerEmail ILIKE :search OR business.name ILIKE :search)',
        { search: `%${search}%` },
      )
    }
    if (status) qb.andWhere('a.status = :status', { status })

    const total = await qb.getCount()
    const rows = await qb
      .orderBy('a.date', 'DESC')
      .addOrderBy('a.startTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    return ApiResponse.success(
      { data: rows.map((appointment) => this.toResponse(appointment)), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } },
      'Bookings retrieved',
      200,
    )
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Booking found' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const appointment = await this.appointmentRepo.findOne({ where: { id }, relations: { business: true, service: true } })
    if (!appointment) throw new NotFoundException('Booking not found')
    return ApiResponse.success(this.toResponse(appointment), 'Booking retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking status (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] } } } })
  @ApiOkResponse({ description: 'Booking updated' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: { status?: string; notes?: string }) {
    const appointment = await this.appointmentRepo.findOne({ where: { id }, relations: { business: true, service: true } })
    if (!appointment) throw new NotFoundException('Booking not found')

    if (body.status) appointment.status = body.status
    if (body.notes !== undefined) appointment.notes = body.notes

    const saved = await this.appointmentRepo.save(appointment)
    return ApiResponse.success(this.toResponse(saved), 'Booking updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Booking deleted' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const appointment = await this.appointmentRepo.findOne({ where: { id } })
    if (!appointment) throw new NotFoundException('Booking not found')
    await this.appointmentRepo.remove(appointment)
    return ApiResponse.message('Booking deleted', 200)
  }

  private toResponse(appointment: Appointment) {
    return {
      id: appointment.id,
      customer_name: appointment.customerName,
      customer_email: appointment.customerEmail,
      customer_phone: appointment.customerPhone,
      business_id: appointment.businessId,
      business_name: appointment.business?.name ?? '',
      vcard_id: 0,
      type: 'Appointment',
      date: appointment.date,
      time: appointment.startTime,
      duration_minutes: minutesBetween(appointment.startTime, appointment.endTime),
      status: appointment.status,
      amount: 0,
      notes: appointment.notes,
      service_name: appointment.service?.name ?? null,
      created_at: appointment.createdAt,
    }
  }
}
