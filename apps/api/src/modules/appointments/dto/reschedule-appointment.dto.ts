import { IsString, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-09-20', description: 'New appointment date (YYYY-MM-DD)' })
  @IsString()
  @Matches(DATE_REGEX, { message: 'date must be in YYYY-MM-DD format' })
  date: string

  @ApiProperty({ example: '14:00', description: 'New appointment start time (HH:MM)' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'start_time must be in HH:MM format' })
  start_time: string
}