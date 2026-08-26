import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Matches, MaxLength, Min, MinLength } from 'class-validator'
import { AffiliateTransactionStatus } from '../entities/affiliate-transaction.entity'

export class JoinAffiliateDto {
  @ApiProperty({ description: 'Accept the affiliate terms of service', example: true })
  @IsBoolean({ message: 'accept_terms must be a boolean' })
  accept_terms!: boolean
}

export class LookupReferralDto {
  @ApiProperty({ description: 'Affiliate referral code to resolve', example: 'AFF-8K2QZ7' })
  @IsString()
  @MinLength(3, { message: 'code must be at least 3 characters' })
  @MaxLength(50, { message: 'code must be at most 50 characters' })
  @Matches(/^[A-Z0-9-]+$/, { message: 'code may only contain uppercase letters, digits, and hyphens' })
  code!: string
}

export class UpdateAffiliateTransactionStatusDto {
  @ApiProperty({ description: 'New transaction status', enum: ['pending', 'approved', 'rejected'], example: 'approved' })
  @IsEnum(['pending', 'approved', 'rejected'], { message: 'status must be pending, approved, or rejected' })
  status!: AffiliateTransactionStatus

  @ApiPropertyOptional({ description: 'Optional admin note', example: 'Commission verified', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'note must be at most 500 characters' })
  note?: string
}

export class CreateAffiliateTransactionDto {
  @ApiProperty({ description: 'Affiliate ID the transaction belongs to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  @IsUUID('4', { message: 'affiliate_id must be a valid UUID' })
  affiliate_id!: string

  @ApiPropertyOptional({ description: 'Referral ID this commission is tied to (optional)', example: 'c9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'referral_id must be a valid UUID' })
  referral_id?: string

  @ApiPropertyOptional({ description: 'Transaction type', default: 'COMMISSION', enum: ['COMMISSION', 'PAYOUT', 'ADJUST'], example: 'COMMISSION' })
  @IsOptional()
  @IsEnum(['COMMISSION', 'PAYOUT', 'ADJUST'], { message: 'type must be COMMISSION, PAYOUT, or ADJUST' })
  type?: 'COMMISSION' | 'PAYOUT' | 'ADJUST'

  @ApiProperty({ description: 'Transaction amount', example: 5 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number with at most 2 decimal places' })
  @Min(0.01, { message: 'amount must be greater than zero' })
  amount!: number

  @ApiPropertyOptional({ description: 'Transaction description', example: 'Welcome commission for referred signup', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'description must be at most 1000 characters' })
  description?: string
}