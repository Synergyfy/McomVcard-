import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsISO8601, IsOptional, IsUUID } from 'class-validator'

export class CreateMembershipDto {
  @ApiProperty({ description: 'The membership tier to assign', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  @IsUUID('4', { message: 'membership_tier_id must be a valid UUID' })
  membership_tier_id!: string

  @ApiPropertyOptional({ description: 'Start date (ISO 8601). Defaults to now.', example: '2026-08-19T09:00:00.000Z' })
  @IsOptional()
  @IsISO8601({}, { message: 'started_at must be a valid ISO 8601 date' })
  started_at?: string

  @ApiPropertyOptional({ description: 'Expiry date (ISO 8601). Nullable for open-ended memberships.', example: '2027-08-19T09:00:00.000Z' })
  @IsOptional()
  @IsISO8601({}, { message: 'expires_at must be a valid ISO 8601 date' })
  expires_at?: string | null
}