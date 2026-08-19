import { PartialType } from '@nestjs/swagger'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsISO8601, IsOptional, IsUUID } from 'class-validator'
import { CreateMembershipDto } from './create-membership.dto'

export class UpdateMembershipDto extends PartialType(CreateMembershipDto) {
  @ApiPropertyOptional({ description: 'Membership status', enum: ['active', 'cancelled', 'expired'], example: 'cancelled' })
  @IsOptional()
  @IsIn(['active', 'cancelled', 'expired'], { message: 'status must be active, cancelled, or expired' })
  status?: string

  @ApiPropertyOptional({ description: 'Expiry date (ISO 8601). Pass null to clear.', example: null })
  @IsOptional()
  @IsISO8601({}, { message: 'expires_at must be a valid ISO 8601 date' })
  expires_at?: string | null

  @IsOptional()
  @IsUUID('4', { message: 'membership_tier_id must be a valid UUID' })
  membership_tier_id?: string

  @IsOptional()
  @IsISO8601({}, { message: 'started_at must be a valid ISO 8601 date' })
  started_at?: string
}