import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Campaign, CampaignStatus, CampaignType } from '../entities/campaign.entity'
import { Offer, DiscountType } from '../entities/offer.entity'
import { Coupon, CouponStatus } from '../entities/coupon.entity'
import { CampaignTemplate } from '../entities/campaign-template.entity'

const toIso = (d: Date | string | null): string | null =>
  d === null || d === undefined ? null : d instanceof Date ? d.toISOString() : (d as string)

export class CampaignResponseDto {
  @ApiProperty({ description: 'Campaign ID', example: 'c1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Business the campaign belongs to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  business_id!: string

  @ApiPropertyOptional({ description: 'Season the campaign is associated with', example: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d', nullable: true })
  season_id!: string | null

  @ApiProperty({ description: 'Campaign name', example: 'Spring Expo Promo' })
  name!: string

  @ApiProperty({ description: 'Campaign type', enum: CampaignType, example: CampaignType.SEASONAL })
  type!: CampaignType

  @ApiProperty({ description: 'Campaign status', enum: CampaignStatus, example: CampaignStatus.ACTIVE })
  status!: CampaignStatus

  @ApiPropertyOptional({ description: 'Campaign description', example: 'Seasonal push timed to the Spring Expo', nullable: true })
  description!: string | null

  @ApiPropertyOptional({ description: 'Campaign budget in GBP', example: 2500, nullable: true })
  budget!: number | null

  @ApiPropertyOptional({ description: 'Start date ISO', example: '2026-09-01T00:00:00.000Z', nullable: true })
  starts_at!: string | null

  @ApiPropertyOptional({ description: 'End date ISO', example: '2026-10-31T23:59:59.000Z', nullable: true })
  ends_at!: string | null

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string | null

  @ApiProperty({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string | null

  @ApiPropertyOptional({ description: 'Offers in this campaign', type: () => [OfferResponseDto], nullable: true })
  offers?: OfferResponseDto[]

  static fromEntity(campaign: Campaign): CampaignResponseDto {
    const dto = new CampaignResponseDto()

    dto.id = campaign.id
    dto.business_id = campaign.businessId
    dto.season_id = campaign.seasonId
    dto.name = campaign.name
    dto.type = campaign.type
    dto.status = campaign.status
    dto.description = campaign.description
    dto.budget = campaign.budget
    dto.starts_at = toIso(campaign.startsAt)
    dto.ends_at = toIso(campaign.endsAt)
    dto.created_at = toIso(campaign.createdAt)
    dto.updated_at = toIso(campaign.updatedAt)
    dto.offers = campaign.offers?.map((offer) => OfferResponseDto.fromEntity(offer))

    return dto
  }
}

export class OfferResponseDto {
  @ApiProperty({ description: 'Offer ID', example: 'd2e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Campaign the offer belongs to', example: 'c1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  campaign_id!: string

  @ApiProperty({ description: 'Business the offer belongs to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  business_id!: string

  @ApiProperty({ description: 'Offer title', example: '20% off all treatments' })
  title!: string

  @ApiPropertyOptional({ description: 'Offer description', example: 'Valid on all beauty treatments this month', nullable: true })
  description!: string | null

  @ApiProperty({ description: 'Discount type', enum: DiscountType, example: DiscountType.PERCENT })
  discount_type!: DiscountType

  @ApiProperty({ description: 'Discount value', example: 20 })
  discount_value!: number

  @ApiProperty({ description: 'Whether the offer is live', example: true })
  is_active!: boolean

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string | null

  @ApiProperty({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string | null

  @ApiPropertyOptional({ description: 'Coupons attached to this offer', type: () => [CouponResponseDto], nullable: true })
  coupons?: CouponResponseDto[]

  static fromEntity(offer: Offer): OfferResponseDto {
    const dto = new OfferResponseDto()

    dto.id = offer.id
    dto.campaign_id = offer.campaignId
    dto.business_id = offer.businessId
    dto.title = offer.title
    dto.description = offer.description
    dto.discount_type = offer.discountType
    dto.discount_value = offer.discountValue
    dto.is_active = offer.isActive
    dto.created_at = toIso(offer.createdAt)
    dto.updated_at = toIso(offer.updatedAt)
    dto.coupons = offer.coupons?.map((coupon) => CouponResponseDto.fromEntity(coupon))

    return dto
  }
}

export class CouponResponseDto {
  @ApiProperty({ description: 'Coupon ID', example: 'e3e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Offer the coupon belongs to', example: 'd2e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  offer_id!: string

  @ApiProperty({ description: 'Business the coupon belongs to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  business_id!: string

  @ApiProperty({ description: 'Coupon code', example: 'BLOOM20' })
  code!: string

  @ApiProperty({ description: 'Discount type', enum: DiscountType, example: DiscountType.PERCENT })
  discount_type!: DiscountType

  @ApiProperty({ description: 'Discount value', example: 20 })
  discount_value!: number

  @ApiProperty({ description: 'Maximum redemptions (0 = unlimited)', example: 100 })
  max_uses!: number

  @ApiProperty({ description: 'Times redeemed', example: 5 })
  used_count!: number

  @ApiPropertyOptional({ description: 'Coupon expiry ISO', example: '2026-12-31T23:59:59.000Z', nullable: true })
  expires_at!: string | null

  @ApiProperty({ description: 'Coupon status', enum: CouponStatus, example: CouponStatus.ACTIVE })
  status!: CouponStatus

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string | null

  @ApiProperty({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string | null

  static fromEntity(coupon: Coupon): CouponResponseDto {
    const dto = new CouponResponseDto()

    dto.id = coupon.id
    dto.offer_id = coupon.offerId
    dto.business_id = coupon.businessId
    dto.code = coupon.code
    dto.discount_type = coupon.discountType as DiscountType
    dto.discount_value = coupon.discountValue
    dto.max_uses = coupon.maxUses
    dto.used_count = coupon.usedCount
    dto.expires_at = toIso(coupon.expiresAt)
    dto.status = coupon.status
    dto.created_at = toIso(coupon.createdAt)
    dto.updated_at = toIso(coupon.updatedAt)

    return dto
  }
}

export class CouponRedemptionResponseDto {
  @ApiProperty({ description: 'Coupon code', example: 'BLOOM20' })
  code!: string

  @ApiProperty({ description: 'Discount type', enum: DiscountType, example: DiscountType.PERCENT })
  discount_type!: DiscountType

  @ApiProperty({ description: 'Discount value', example: 20 })
  discount_value!: number

  @ApiProperty({ description: 'Times redeemed after this redemption', example: 6 })
  used_count!: number

  @ApiProperty({ description: 'Whether the redemption was accepted', example: true })
  accepted!: boolean

  static fromCoupon(coupon: Coupon): CouponRedemptionResponseDto {
    const dto = new CouponRedemptionResponseDto()

    dto.code = coupon.code
    dto.discount_type = coupon.discountType as DiscountType
    dto.discount_value = coupon.discountValue
    dto.used_count = coupon.usedCount
    dto.accepted = true

    return dto
  }
}

export class CampaignTemplateResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string

  @ApiProperty({ example: 'Spring Expo Promo' })
  name!: string

  @ApiProperty({ example: 'Seasonal' })
  type!: string

  @ApiProperty({ example: 'Seasonal push timed to the Spring Expo' })
  description!: string | null

  @ApiProperty({ example: 'Seasonal vouchers and limited-time discounts' })
  suggested_reward!: string | null

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiProperty({ example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string

  static fromEntity(t: CampaignTemplate): CampaignTemplateResponseDto {
    const dto = new CampaignTemplateResponseDto()
    dto.id = t.id
    dto.name = t.name
    dto.type = t.type
    dto.description = t.description
    dto.suggested_reward = t.suggestedReward
    dto.status = t.status
    dto.created_at = t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt
    dto.updated_at = t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt
    return dto
  }
}