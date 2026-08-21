import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export class CreateAppointmentDto {
  @ApiPropertyOptional({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', description: 'Optional service to book' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'service_id must be a valid UUID' })
  service_id?: string

  @ApiProperty({ example: 'John Miller', description: 'Customer name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customer_name: string

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'customer_email must be a valid email' })
  customer_email: string

  @ApiPropertyOptional({ example: '+44 7700 900123' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  customer_phone?: string

  @ApiProperty({ example: '2026-09-15', description: 'Appointment date (YYYY-MM-DD)' })
  @IsString()
  @Matches(DATE_REGEX, { message: 'date must be in YYYY-MM-DD format' })
  date: string

  @ApiProperty({ example: '10:30', description: 'Appointment start time (HH:MM)' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'start_time must be in HH:MM format' })
  start_time: string

  @ApiPropertyOptional({ example: 'First visit', description: 'Notes for the business' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string
}