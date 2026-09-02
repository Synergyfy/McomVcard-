import { IsString, IsOptional, IsNotEmpty, IsUUID, IsIn, IsDateString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSubscribedPlanDto {
  @ApiProperty({ example: 'uuid-of-user', description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string

  @ApiProperty({ example: 'uuid-of-plan', description: 'Plan ID' })
  @IsUUID()
  @IsNotEmpty()
  planId!: string

  @ApiPropertyOptional({ enum: ['active', 'cancelled', 'expired'], default: 'active' })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'cancelled', 'expired'])
  status?: string

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z', description: 'Start date' })
  @IsDateString()
  @IsNotEmpty()
  startedAt!: string

  @ApiPropertyOptional({ example: '2027-01-15T10:00:00.000Z', description: 'Expiry date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string
}

export class UpdateSubscribedPlanDto {
  @ApiPropertyOptional({ enum: ['active', 'cancelled', 'expired'] })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'cancelled', 'expired'])
  status?: string

  @ApiPropertyOptional({ example: '2027-01-15T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string
}

export class CancelSubscribedPlanDto {
  @ApiPropertyOptional({ example: 'Cancelled by admin' })
  @IsOptional()
  @IsString()
  reason?: string
}
