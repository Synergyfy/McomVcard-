import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'
import { CampaignStatus, CampaignType } from '../entities/campaign.entity'
import { DiscountType } from '../entities/offer.entity'
import { CouponStatus } from '../entities/coupon.entity'

export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign name', example: 'Spring Expo Promo' })
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters' })
  @MaxLength(150, { message: 'name must be at most 150 characters' })
  name!: string

  @ApiPropertyOptional({ description: 'Campaign type', enum: CampaignType, example: CampaignType.SEASONAL, default: CampaignType.EVERGREEN })
  @IsOptional()
  @IsEnum(CampaignType, { message: 'type must be Seasonal, Evergreen, or Referral' })
  type?: CampaignType

  @ApiProperty({ description: 'Business the campaign belongs to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  @IsUUID('4', { message: 'business_id must be a valid UUID' })
  business_id!: string

  @ApiPropertyOptional({ description: 'Optional season the campaign is associated with', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d', nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'season_id must be a valid UUID' })
  season_id?: string

  @ApiPropertyOptional({ description: 'Campaign description', example: 'Seasonal push timed to the Spring Expo' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'description must be at most 2000 characters' })
  description?: string

  @ApiPropertyOptional({ description: 'Campaign budget in GBP', example: 2500 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'budget must be a number with at most 2 decimal places' })
  @Min(0, { message: 'budget cannot be negative' })
  budget?: number

  @ApiPropertyOptional({ description: 'Start date ISO', example: '2026-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  starts_at?: string

  @ApiPropertyOptional({ description: 'End date ISO', example: '2026-10-31T23:59:59.000Z' })
  @IsOptional()
  @IsISO8601()
  ends_at?: string
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({ description: 'Campaign name', example: 'Spring Expo Promo 2026' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters' })
  @MaxLength(150, { message: 'name must be at most 150 characters' })
  name?: string

  @ApiPropertyOptional({ description: 'Campaign type', enum: CampaignType, example: CampaignType.REFERRAL })
  @IsOptional()
  @IsEnum(CampaignType, { message: 'type must be Seasonal, Evergreen, or Referral' })
  type?: CampaignType

  @ApiPropertyOptional({ description: 'Campaign status', enum: CampaignStatus, example: CampaignStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CampaignStatus, { message: 'status must be draft, active, paused, or ended' })
  status?: CampaignStatus

  @ApiPropertyOptional({ description: 'Optional season the campaign is associated with', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d', nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'season_id must be a valid UUID' })
  season_id?: string

  @ApiPropertyOptional({ description: 'Campaign description', example: 'Seasonal push timed to the Spring Expo' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'description must be at most 2000 characters' })
  description?: string

  @ApiPropertyOptional({ description: 'Campaign budget in GBP', example: 3000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'budget must be a number with at most 2 decimal places' })
  @Min(0, { message: 'budget cannot be negative' })
  budget?: number

  @ApiPropertyOptional({ description: 'Start date ISO', example: '2026-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  starts_at?: string

  @ApiPropertyOptional({ description: 'End date ISO', example: '2026-10-31T23:59:59.000Z' })
  @IsOptional()
  @IsISO8601()
  ends_at?: string
}

export class CreateOfferDto {
  @ApiProperty({ description: 'Offer title', example: '20% off all treatments' })
  @IsString()
  @MinLength(2, { message: 'title must be at least 2 characters' })
  @MaxLength(150, { message: 'title must be at most 150 characters' })
  title!: string

  @ApiPropertyOptional({ description: 'Offer description', example: 'Valid on all beauty treatments this month' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'description must be at most 2000 characters' })
  description?: string

  @ApiProperty({ description: 'Discount type', enum: DiscountType, example: DiscountType.PERCENT })
  @IsEnum(DiscountType, { message: 'discount_type must be PERCENT or FIXED' })
  discount_type!: DiscountType

  @ApiProperty({ description: 'Discount value (percent or fixed GBP)', example: 20 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'discount_value must be a number with at most 2 decimal places' })
  @Min(0, { message: 'discount_value cannot be negative' })
  discount_value!: number
}

export class UpdateOfferDto {
  @ApiPropertyOptional({ description: 'Offer title', example: '25% off all treatments' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'title must be at least 2 characters' })
  @MaxLength(150, { message: 'title must be at most 150 characters' })
  title?: string

  @ApiPropertyOptional({ description: 'Offer description', example: 'Valid on all beauty treatments this month' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'description must be at most 2000 characters' })
  description?: string

  @ApiPropertyOptional({ description: 'Discount type', enum: DiscountType, example: DiscountType.FIXED })
  @IsOptional()
  @IsEnum(DiscountType, { message: 'discount_type must be PERCENT or FIXED' })
  discount_type?: DiscountType

  @ApiPropertyOptional({ description: 'Discount value (percent or fixed GBP)', example: 10 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'discount_value must be a number with at most 2 decimal places' })
  @Min(0, { message: 'discount_value cannot be negative' })
  discount_value?: number

  @ApiPropertyOptional({ description: 'Whether the offer is live', example: false })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean' })
  is_active?: boolean
}

export class CreateCouponDto {
  @ApiProperty({ description: 'Coupon code (unique)', example: 'BLOOM20' })
  @IsString()
  @MinLength(3, { message: 'code must be at least 3 characters' })
  @MaxLength(50, { message: 'code must be at most 50 characters' })
  code!: string

  @ApiProperty({ description: 'Discount type', enum: DiscountType, example: DiscountType.PERCENT })
  @IsEnum(DiscountType, { message: 'discount_type must be PERCENT or FIXED' })
  discount_type!: DiscountType

  @ApiProperty({ description: 'Discount value (percent or fixed GBP)', example: 20 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'discount_value must be a number with at most 2 decimal places' })
  @Min(0, { message: 'discount_value cannot be negative' })
  discount_value!: number

  @ApiPropertyOptional({ description: 'Maximum number of redemptions (0 = unlimited)', example: 100, default: 0 })
  @IsOptional()
  @IsInt({ message: 'max_uses must be an integer' })
  @Min(0, { message: 'max_uses cannot be negative' })
  max_uses?: number

  @ApiPropertyOptional({ description: 'Coupon expiry ISO', example: '2026-12-31T23:59:59.000Z', nullable: true })
  @IsOptional()
  @IsISO8601()
  expires_at?: string

  @ApiPropertyOptional({ description: 'Coupon status', enum: CouponStatus, example: CouponStatus.ACTIVE, default: CouponStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CouponStatus, { message: 'status must be draft, active, or expired' })
  status?: CouponStatus
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ description: 'Coupon code (unique)', example: 'BLOOM25' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'code must be at least 3 characters' })
  @MaxLength(50, { message: 'code must be at most 50 characters' })
  code?: string

  @ApiPropertyOptional({ description: 'Discount type', enum: DiscountType, example: DiscountType.FIXED })
  @IsOptional()
  @IsEnum(DiscountType, { message: 'discount_type must be PERCENT or FIXED' })
  discount_type?: DiscountType

  @ApiPropertyOptional({ description: 'Discount value (percent or fixed GBP)', example: 10 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'discount_value must be a number with at most 2 decimal places' })
  @Min(0, { message: 'discount_value cannot be negative' })
  discount_value?: number

  @ApiPropertyOptional({ description: 'Maximum number of redemptions (0 = unlimited)', example: 200 })
  @IsOptional()
  @IsInt({ message: 'max_uses must be an integer' })
  @Min(0, { message: 'max_uses cannot be negative' })
  max_uses?: number

  @ApiPropertyOptional({ description: 'Coupon expiry ISO', example: '2027-01-31T23:59:59.000Z', nullable: true })
  @IsOptional()
  @IsISO8601()
  expires_at?: string

  @ApiPropertyOptional({ description: 'Coupon status', enum: CouponStatus, example: CouponStatus.EXPIRED })
  @IsOptional()
  @IsEnum(CouponStatus, { message: 'status must be draft, active, or expired' })
  status?: CouponStatus
}

export class RedeemCouponDto {
  @ApiProperty({ description: 'Optional note about the redemption', example: 'Redeemed at counter', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'note must be at most 500 characters' })
  note?: string
}