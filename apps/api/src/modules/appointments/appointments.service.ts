import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BusinessesService } from '../businesses/businesses.service'
import { ServicesService } from '../services/services.service'
import { Appointment } from './entities/appointment.entity'
import { Availability } from './entities/availability.entity'
import { BookingRule } from './entities/booking-rule.entity'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto'
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto'
import { CreateAvailabilityDto } from './dto/create-availability.dto'
import { UpdateAvailabilityDto } from './dto/update-availability.dto'
import { CreateBookingRuleDto } from './dto/create-booking-rule.dto'
import { UpdateBookingRuleDto } from './dto/update-booking-rule.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { AppointmentResponseDto, AvailabilityResponseDto, BookingRuleResponseDto } from './dto/appointment-response.dto'

const DEFAULT_RULE: Omit<BookingRule, 'id' | 'businessId' | 'business' | 'createdAt' | 'updatedAt'> = {
  enabled: true,
  defaultDuration: 60,
  buffer: 15,
  leadTimeHours: 24,
  advanceWindowDays: 30,
  requirePayment: false,
  confirmationMessage: null,
  cancellationPolicy: null,
}

const DEFAULT_RULE_RESPONSE = {
  id: null,
  business_id: null,
  enabled: true,
  default_duration: 60,
  buffer: 15,
  lead_time_hours: 24,
  advance_window_days: 30,
  require_payment: false,
  confirmation_message: null,
  cancellation_policy: null,
  created_at: null,
  updated_at: null,
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private appointmentsRepo: Repository<Appointment>,
    @InjectRepository(Availability) private availabilityRepo: Repository<Availability>,
    @InjectRepository(BookingRule) private bookingRulesRepo: Repository<BookingRule>,
    private readonly businessesService: BusinessesService,
    private readonly servicesService: ServicesService,
  ) {}

  // --- Booking rules ---

  async getRules(businessId: string) {
    await this.businessesService.findOne(businessId)

    const rule = await this.bookingRulesRepo.findOne({ where: { businessId } })

    return ApiResponse.success(rule ? BookingRuleResponseDto.fromEntity(rule) : DEFAULT_RULE_RESPONSE, 'Booking rules retrieved', 200)
  }

  async createRules(businessId: string, ownerId: string, dto: CreateBookingRuleDto) {
    await this.businessesService.findOwned(businessId, ownerId)

    const existing = await this.bookingRulesRepo.findOne({ where: { businessId } })

    if (existing) throw new BadRequestException('Booking rules already exist for this business')

    const saved = await this.bookingRulesRepo.save(
      this.bookingRulesRepo.create({
        businessId,
        enabled: dto.enabled ?? true,
        defaultDuration: dto.default_duration ?? 60,
        buffer: dto.buffer ?? 15,
        leadTimeHours: dto.lead_time_hours ?? 24,
        advanceWindowDays: dto.advance_window_days ?? 30,
        requirePayment: dto.require_payment ?? false,
        confirmationMessage: dto.confirmation_message ?? null,
        cancellationPolicy: dto.cancellation_policy ?? null,
      }),
    )

    return ApiResponse.success(BookingRuleResponseDto.fromEntity(saved), 'Booking rules created', 201)
  }

  async updateRules(ruleId: string, ownerId: string, dto: UpdateBookingRuleDto) {
    const rule = await this.bookingRulesRepo.findOne({ where: { id: ruleId } })

    if (!rule) throw new NotFoundException('Booking rules not found')

    await this.businessesService.findOwned(rule.businessId, ownerId)

    const patch: Partial<BookingRule> = {}

    if (dto.enabled !== undefined) patch.enabled = dto.enabled
    if (dto.default_duration !== undefined) patch.defaultDuration = dto.default_duration
    if (dto.buffer !== undefined) patch.buffer = dto.buffer
    if (dto.lead_time_hours !== undefined) patch.leadTimeHours = dto.lead_time_hours
    if (dto.advance_window_days !== undefined) patch.advanceWindowDays = dto.advance_window_days
    if (dto.require_payment !== undefined) patch.requirePayment = dto.require_payment
    if (dto.confirmation_message !== undefined) patch.confirmationMessage = dto.confirmation_message
    if (dto.cancellation_policy !== undefined) patch.cancellationPolicy = dto.cancellation_policy

    await this.bookingRulesRepo.update({ id: ruleId }, patch)

    const updated = await this.bookingRulesRepo.findOneBy({ id: ruleId })
    if (!updated) throw new NotFoundException('Booking rules not found')

    return ApiResponse.success(BookingRuleResponseDto.fromEntity(updated), 'Booking rules updated', 200)
  }

  // --- Availability ---

  async listAvailability(businessId: string) {
    await this.businessesService.findOne(businessId)

    const slots = await this.availabilityRepo.find({
      where: { businessId },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    })

    return ApiResponse.success(slots.map(AvailabilityResponseDto.fromEntity), 'Availability retrieved', 200)
  }

  async createAvailability(businessId: string, ownerId: string, dto: CreateAvailabilityDto) {
    await this.businessesService.findOwned(businessId, ownerId)

    this.assertValidTimeRange(dto.start_time, dto.end_time)

    const saved = await this.availabilityRepo.save(
      this.availabilityRepo.create({
        businessId,
        dayOfWeek: dto.day_of_week,
        startTime: dto.start_time,
        endTime: dto.end_time,
        isClosed: dto.is_closed ?? false,
      }),
    )

    return ApiResponse.success(AvailabilityResponseDto.fromEntity(saved), 'Availability created', 201)
  }

  async updateAvailability(slotId: string, ownerId: string, dto: UpdateAvailabilityDto) {
    const slot = await this.availabilityRepo.findOne({ where: { id: slotId } })

    if (!slot) throw new NotFoundException('Availability not found')

    await this.businessesService.findOwned(slot.businessId, ownerId)

    if (dto.start_time !== undefined && dto.end_time !== undefined) {
      this.assertValidTimeRange(dto.start_time, dto.end_time)
    } else if (dto.start_time !== undefined && dto.start_time >= slot.endTime) {
      throw new BadRequestException('start_time must be earlier than end_time')
    } else if (dto.end_time !== undefined && dto.end_time <= slot.startTime) {
      throw new BadRequestException('end_time must be later than start_time')
    }

    const patch: Partial<Availability> = {}

    if (dto.day_of_week !== undefined) patch.dayOfWeek = dto.day_of_week
    if (dto.start_time !== undefined) patch.startTime = dto.start_time
    if (dto.end_time !== undefined) patch.endTime = dto.end_time
    if (dto.is_closed !== undefined) patch.isClosed = dto.is_closed

    await this.availabilityRepo.update({ id: slotId }, patch)

    const updated = await this.availabilityRepo.findOneBy({ id: slotId })
    if (!updated) throw new NotFoundException('Availability not found')

    return ApiResponse.success(AvailabilityResponseDto.fromEntity(updated), 'Availability updated', 200)
  }

  async removeAvailability(slotId: string, ownerId: string) {
    const slot = await this.availabilityRepo.findOne({ where: { id: slotId } })

    if (!slot) throw new NotFoundException('Availability not found')

    await this.businessesService.findOwned(slot.businessId, ownerId)

    await this.availabilityRepo.delete({ id: slotId })

    return ApiResponse.message('Availability deleted', 200)
  }

  // --- Appointments ---

  // Public booking: any authenticated user can request an appointment at a business.
  async book(businessId: string, dto: CreateAppointmentDto) {
    const business = await this.businessesService.findOne(businessId)

    const rule = await this.bookingRulesRepo.findOne({ where: { businessId } })
    const config = rule ? rule : (DEFAULT_RULE as BookingRule)

    if (!config.enabled) throw new BadRequestException('Booking is not enabled for this business')

    let duration = config.defaultDuration

    let service = null

    if (dto.service_id) {
      service = await this.servicesService.findOne(dto.service_id)

      if (service.businessId !== businessId) {
        throw new BadRequestException('Service does not belong to this business')
      }

      duration = service.duration ?? duration
    }

    const startMinutes = this.toMinutes(dto.start_time)
    const endMinutes = startMinutes + duration

    if (endMinutes > 23 * 60 + 59) throw new BadRequestException('Appointment end time would exceed 23:59')

    this.assertWithinBookingWindow(dto.date, dto.start_time, config)
    await this.assertWithinAvailability(businessId, dto.date, startMinutes, endMinutes)

    const endTime = this.fromMinutes(endMinutes)

    await this.assertNoConflict(businessId, dto.date, startMinutes, endMinutes, config.buffer)

    const saved = await this.appointmentsRepo.save(
      this.appointmentsRepo.create({
        businessId,
        serviceId: dto.service_id ?? null,
        customerName: dto.customer_name,
        customerEmail: dto.customer_email,
        customerPhone: dto.customer_phone ?? null,
        date: dto.date,
        startTime: dto.start_time,
        endTime,
        status: 'pending',
        notes: dto.notes ?? null,
      }),
    )

    const withService = await this.findOne(saved.id)

    return ApiResponse.success(AppointmentResponseDto.fromEntity(withService), 'Appointment requested', 201)
  }

  async listForBusiness(businessId: string, ownerId: string) {
    await this.businessesService.findOwned(businessId, ownerId)

    const appointments = await this.appointmentsRepo.find({
      where: { businessId },
      relations: { service: true },
      order: { date: 'ASC', startTime: 'ASC' },
    })

    return ApiResponse.success(appointments.map(AppointmentResponseDto.fromEntity), 'Appointments retrieved', 200)
  }

  async findOne(id: string) {
    const appointment = await this.appointmentsRepo.findOne({
      where: { id },
      relations: { service: true },
    })

    if (!appointment) throw new NotFoundException('Appointment not found')

    return appointment
  }

  async getForOwner(id: string, ownerId: string) {
    const appointment = await this.findOne(id)

    await this.businessesService.findOwned(appointment.businessId, ownerId)

    return ApiResponse.success(AppointmentResponseDto.fromEntity(appointment), 'Appointment retrieved', 200)
  }

  async updateStatus(id: string, ownerId: string, dto: UpdateAppointmentStatusDto) {
    const appointment = await this.findOne(id)

    await this.businessesService.findOwned(appointment.businessId, ownerId)

    await this.appointmentsRepo.update({ id }, { status: dto.status })

    const updated = await this.findOne(id)

    return ApiResponse.success(AppointmentResponseDto.fromEntity(updated), 'Appointment updated', 200)
  }

  async reschedule(id: string, ownerId: string, dto: RescheduleAppointmentDto) {
    const appointment = await this.findOne(id)

    await this.businessesService.findOwned(appointment.businessId, ownerId)

    if (appointment.status === 'cancelled') throw new BadRequestException('Cancelled appointments cannot be rescheduled')

    const rule = await this.bookingRulesRepo.findOne({ where: { businessId: appointment.businessId } })
    const config = rule ? rule : (DEFAULT_RULE as BookingRule)

    const startMinutes = this.toMinutes(dto.start_time)
    const endMinutes = startMinutes + (appointment.endTime ? this.minutesBetween(appointment.startTime, appointment.endTime) : config.defaultDuration)

    if (endMinutes > 23 * 60 + 59) throw new BadRequestException('Appointment end time would exceed 23:59')

    this.assertWithinBookingWindow(dto.date, dto.start_time, config)
    await this.assertWithinAvailability(appointment.businessId, dto.date, startMinutes, endMinutes)
    await this.assertNoConflict(appointment.businessId, dto.date, startMinutes, endMinutes, config.buffer, id)

    await this.appointmentsRepo.update({ id }, { date: dto.date, startTime: dto.start_time, endTime: this.fromMinutes(endMinutes) })

    const updated = await this.findOne(id)

    return ApiResponse.success(AppointmentResponseDto.fromEntity(updated), 'Appointment rescheduled', 200)
  }

  async remove(id: string, ownerId: string) {
    const appointment = await this.findOne(id)

    await this.businessesService.findOwned(appointment.businessId, ownerId)

    await this.appointmentsRepo.delete({ id })

    return ApiResponse.message('Appointment deleted', 200)
  }

  // --- Booking engine helpers ---

  // Rejects a booking that is before the lead time or beyond the advance window.
  private assertWithinBookingWindow(date: string, startTime: string, config: BookingRule) {
    const now = new Date()

    const bookingStart = this.parseDateTime(date, startTime)

    if (bookingStart.getTime() < now.getTime()) {
      throw new BadRequestException('Appointment time is in the past')
    }

    const earliest = new Date(now.getTime() + config.leadTimeHours * 60 * 60 * 1000)

    if (bookingStart.getTime() < earliest.getTime()) {
      throw new BadRequestException(`Bookings require at least ${config.leadTimeHours} hours notice`)
    }

    const latest = new Date(now.getFullYear(), now.getMonth(), now.getDate() + config.advanceWindowDays)

    if (bookingStart.getTime() > latest.getTime()) {
      throw new BadRequestException(`Bookings can only be made up to ${config.advanceWindowDays} days in advance`)
    }
  }

  // Rejects a booking that falls outside the business weekly availability slots.
  private async assertWithinAvailability(businessId: string, date: string, startMinutes: number, endMinutes: number) {
    const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay()

    const slots = await this.availabilityRepo.find({ where: { businessId, dayOfWeek } })

    const open = slots.find((slot) => !slot.isClosed && this.toMinutes(slot.startTime) <= startMinutes && this.toMinutes(slot.endTime) >= endMinutes)

    if (!open) {
      throw new BadRequestException('No availability for the requested slot')
    }
  }

  // Rejects a booking that overlaps an existing appointment (respecting the buffer).
  private async assertNoConflict(businessId: string, date: string, startMinutes: number, endMinutes: number, buffer: number, excludeId?: string) {
    const existing = await this.appointmentsRepo.find({
      where: { businessId, date },
    })

    const conflicting = existing.some((appt) => {
      if (appt.id === excludeId) return false
      if (appt.status === 'cancelled') return false

      const apptStart = this.toMinutes(appt.startTime)
      const apptEnd = this.toMinutes(appt.endTime)

      const paddedStart = startMinutes - buffer
      const paddedEnd = endMinutes + buffer

      return paddedStart < apptEnd && paddedEnd > apptStart
    })

    if (conflicting) {
      throw new BadRequestException('Slot conflicts with an existing appointment')
    }
  }

  // --- Time helpers ---

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number)

    return h * 60 + m
  }

  private fromMinutes(total: number): string {
    const h = Math.floor(total / 60)
    const m = total % 60

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  private minutesBetween(from: string, to: string): number {
    return this.toMinutes(to) - this.toMinutes(from)
  }

  private parseDateTime(date: string, time: string): Date {
    const [y, mo, d] = date.split('-').map(Number)
    const [h, mi] = time.split(':').map(Number)

    return new Date(y, mo - 1, d, h, mi)
  }

  private assertValidTimeRange(startTime: string, endTime: string) {
    if (this.toMinutes(startTime) >= this.toMinutes(endTime)) {
      throw new BadRequestException('start_time must be earlier than end_time')
    }
  }
}