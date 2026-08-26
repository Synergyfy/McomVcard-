import { IsBoolean, IsIn, IsOptional, IsString, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

export class CreateBusinessHourDto {
  @ApiProperty({ example: 1, description: 'Day of week (0 = Sunday, 6 = Saturday)', minimum: 0, maximum: 6 })
  @IsIn([0, 1, 2, 3, 4, 5, 6])
  day_of_week: number

  @ApiPropertyOptional({ example: '09:00', description: 'Opening time (24h HH:MM)', pattern: 'HH:MM' })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'opens_at must be a valid 24h time like 09:00' })
  opens_at?: string

  @ApiPropertyOptional({ example: '17:00', description: 'Closing time (24h HH:MM)', pattern: 'HH:MM' })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'closes_at must be a valid 24h time like 17:00' })
  closes_at?: string

  @ApiPropertyOptional({ example: false, description: 'Whether the business is closed all day' })
  @IsOptional()
  @IsBoolean()
  is_closed?: boolean
}