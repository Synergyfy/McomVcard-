import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSeasonDto {
  @ApiProperty({ example: 'Autumn 2026', description: 'Season name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z', description: 'Season start date' })
  @IsDateString()
  starts_at: string

  @ApiProperty({ example: '2026-11-30T23:59:59.000Z', description: 'Season end date' })
  @IsDateString()
  ends_at: string
}