import { Transform } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBookingRuleDto {
  @ApiPropertyOptional({ example: true, default: true, description: 'Whether booking is enabled for this business' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean

  @ApiPropertyOptional({ example: 60, default: 60, description: 'Default appointment duration in minutes' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(5)
  @Max(1440)
  default_duration?: number

  @ApiPropertyOptional({ example: 15, default: 15, description: 'Buffer minutes between consecutive appointments' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  @Max(1440)
  buffer?: number

  @ApiPropertyOptional({ example: 24, default: 24, description: 'Minimum hours of notice required before a booking' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  @Max(8760)
  lead_time_hours?: number

  @ApiPropertyOptional({ example: 30, default: 30, description: 'How far in advance (days) bookings can be made' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(365)
  advance_window_days?: number

  @ApiPropertyOptional({ example: false, default: false, description: 'Require payment at booking time' })
  @IsOptional()
  @IsBoolean()
  require_payment?: boolean

  @ApiPropertyOptional({ example: 'Thanks! Your booking has been received.', description: 'Confirmation message shown to customers' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  confirmation_message?: string

  @ApiPropertyOptional({ example: 'Please give at least 24 hours notice to cancel.', description: 'Cancellation policy text' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellation_policy?: string
}