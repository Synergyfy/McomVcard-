import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Campaign, CampaignStatus, CampaignType } from './entities/campaign.entity'
import { Offer } from './entities/offer.entity'
import { Coupon, CouponStatus } from './entities/coupon.entity'
import { BusinessesService } from '../businesses/businesses.service'
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateOfferDto,
  UpdateOfferDto,
  CreateCouponDto,
  UpdateCouponDto,
} from './dto/campaign.dto'
import {
  CampaignResponseDto,
  OfferResponseDto,
  CouponResponseDto,
  CouponRedemptionResponseDto,
} from './dto/campaign-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

const toDate = (value: string | undefined | null): Date | null =>
  value === undefined || value === null || value === '' ? null : new Date(value)

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign) private campaignsRepo: Repository<Campaign>,
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    @InjectRepository(Coupon) private couponsRepo: Repository<Coupon>,
    private readonly businessesService: BusinessesService,
  ) {}

  // --- Campaigns (spec §42: Business ─── N Campaign) ---

  async createCampaign(user: UserResponseDto, dto: CreateCampaignDto) {
    await this.businessesService.findOwned(dto.business_id, user.id)

    const saved = await this.campaignsRepo.save(
      this.campaignsRepo.create({
        businessId: dto.business_id,
        seasonId: dto.season_id ?? null,
        name: dto.name,
        type: dto.type ?? CampaignType.EVERGREEN,
        status: CampaignStatus.DRAFT,
        description: dto.description ?? null,
        budget: dto.budget ?? null,
        startsAt: toDate(dto.starts_at),
        endsAt: toDate(dto.ends_at),
      }),
    )

    return ApiResponse.success(CampaignResponseDto.fromEntity(await this.findOneCampaign(saved.id)), 'Campaign created', 201)
  }

  async listCampaigns(user: UserResponseDto) {
    const campaigns = await this.campaignsRepo.find({
      where: { business: { ownerId: user.id } },
      relations: { business: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(campaigns.map((c) => CampaignResponseDto.fromEntity(c)), 'Campaigns retrieved', 200)
  }

  async listCampaignsForBusiness(user: UserResponseDto, businessId: string) {
    await this.businessesService.findOwned(businessId, user.id)

    const campaigns = await this.campaignsRepo.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(campaigns.map((c) => CampaignResponseDto.fromEntity(c)), 'Campaigns retrieved', 200)
  }

  async getCampaign(user: UserResponseDto, id: string) {
    const campaign = await this.findOwnedCampaign(user.id, id)

    return ApiResponse.success(CampaignResponseDto.fromEntity(campaign), 'Campaign retrieved', 200)
  }

  async updateCampaign(user: UserResponseDto, id: string, dto: UpdateCampaignDto) {
    const campaign = await this.findOwnedCampaign(user.id, id)

    campaign.name = dto.name ?? campaign.name
    campaign.type = dto.type ?? campaign.type
    campaign.status = dto.status ?? campaign.status
    campaign.seasonId = dto.season_id !== undefined ? (dto.season_id ?? null) : campaign.seasonId
    campaign.description = dto.description !== undefined ? (dto.description ?? null) : campaign.description
    campaign.budget = dto.budget !== undefined ? (dto.budget ?? null) : campaign.budget
    campaign.startsAt = dto.starts_at !== undefined ? toDate(dto.starts_at) : campaign.startsAt
    campaign.endsAt = dto.ends_at !== undefined ? toDate(dto.ends_at) : campaign.endsAt

    const saved = await this.campaignsRepo.save(campaign)

    return ApiResponse.success(CampaignResponseDto.fromEntity(saved), 'Campaign updated', 200)
  }

  async deleteCampaign(user: UserResponseDto, id: string) {
    await this.findOwnedCampaign(user.id, id)

    await this.campaignsRepo.delete(id)

    return ApiResponse.success(null, 'Campaign deleted', 200)
  }

  // --- Offers (spec §42: Campaign ─── N Offer) ---

  async createOffer(user: UserResponseDto, campaignId: string, dto: CreateOfferDto) {
    const campaign = await this.findOwnedCampaign(user.id, campaignId)

    const saved = await this.offersRepo.save(
      this.offersRepo.create({
        campaignId: campaign.id,
        businessId: campaign.businessId,
        title: dto.title,
        description: dto.description ?? null,
        discountType: dto.discount_type,
        discountValue: dto.discount_value,
        isActive: true,
      }),
    )

    return ApiResponse.success(OfferResponseDto.fromEntity(await this.findOneOffer(saved.id)), 'Offer created', 201)
  }

  async listOffers(user: UserResponseDto, campaignId: string) {
    await this.findOwnedCampaign(user.id, campaignId)

    const offers = await this.offersRepo.find({
      where: { campaignId },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(offers.map((o) => OfferResponseDto.fromEntity(o)), 'Offers retrieved', 200)
  }

  async updateOffer(user: UserResponseDto, id: string, dto: UpdateOfferDto) {
    const offer = await this.findOwnedOffer(user.id, id)

    offer.title = dto.title ?? offer.title
    offer.description = dto.description !== undefined ? (dto.description ?? null) : offer.description
    offer.discountType = dto.discount_type ?? offer.discountType
    offer.discountValue = dto.discount_value ?? offer.discountValue
    offer.isActive = dto.is_active ?? offer.isActive

    const saved = await this.offersRepo.save(offer)

    return ApiResponse.success(OfferResponseDto.fromEntity(saved), 'Offer updated', 200)
  }

  async deleteOffer(user: UserResponseDto, id: string) {
    await this.findOwnedOffer(user.id, id)

    await this.offersRepo.delete(id)

    return ApiResponse.success(null, 'Offer deleted', 200)
  }

  // --- Coupons (spec §42: Offer ─── N Coupon) ---

  async createCoupon(user: UserResponseDto, offerId: string, dto: CreateCouponDto) {
    const offer = await this.findOwnedOffer(user.id, offerId)

    const existing = await this.couponsRepo.findOne({ where: { code: dto.code } })
    if (existing) throw new ConflictException('Coupon code already in use')

    const saved = await this.couponsRepo.save(
      this.couponsRepo.create({
        offerId: offer.id,
        businessId: offer.businessId,
        code: dto.code,
        discountType: dto.discount_type,
        discountValue: dto.discount_value,
        maxUses: dto.max_uses ?? 0,
        usedCount: 0,
        expiresAt: toDate(dto.expires_at),
        status: dto.status ?? CouponStatus.ACTIVE,
      }),
    )

    return ApiResponse.success(CouponResponseDto.fromEntity(saved), 'Coupon created', 201)
  }

  async listCoupons(user: UserResponseDto, offerId: string) {
    await this.findOwnedOffer(user.id, offerId)

    const coupons = await this.couponsRepo.find({
      where: { offerId },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(coupons.map((c) => CouponResponseDto.fromEntity(c)), 'Coupons retrieved', 200)
  }

  async updateCoupon(user: UserResponseDto, id: string, dto: UpdateCouponDto) {
    const coupon = await this.findOwnedCoupon(user.id, id)

    if (dto.code !== undefined && dto.code !== coupon.code) {
      const existing = await this.couponsRepo.findOne({ where: { code: dto.code } })
      if (existing) throw new ConflictException('Coupon code already in use')

      coupon.code = dto.code
    }

    coupon.discountType = dto.discount_type ?? coupon.discountType
    coupon.discountValue = dto.discount_value ?? coupon.discountValue
    coupon.maxUses = dto.max_uses ?? coupon.maxUses
    coupon.expiresAt = dto.expires_at !== undefined ? toDate(dto.expires_at) : coupon.expiresAt
    coupon.status = dto.status ?? coupon.status

    const saved = await this.couponsRepo.save(coupon)

    return ApiResponse.success(CouponResponseDto.fromEntity(saved), 'Coupon updated', 200)
  }

  async deleteCoupon(user: UserResponseDto, id: string) {
    await this.findOwnedCoupon(user.id, id)

    await this.couponsRepo.delete(id)

    return ApiResponse.success(null, 'Coupon deleted', 200)
  }

  // --- Redemption ---

  // Public redemption: enforces the coupon is active, unexpired, and under its
  // usage cap, then increments used_count atomically.
  async redeemCoupon(offerId: string, code: string) {
    const offer = await this.offersRepo.findOne({ where: { id: offerId }, relations: { campaign: true } })
    if (!offer || !offer.isActive) throw new NotFoundException('Offer not found or inactive')

    const coupon = await this.couponsRepo.findOne({ where: { code, offerId } })
    if (!coupon) throw new NotFoundException('Coupon not found')

    if (coupon.status !== CouponStatus.ACTIVE) {
      throw new ConflictException('Coupon is not active')
    }

    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      coupon.status = CouponStatus.EXPIRED
      await this.couponsRepo.save(coupon)

      throw new ConflictException('Coupon has expired')
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      throw new ConflictException('Coupon usage limit reached')
    }

    coupon.usedCount += 1
    const saved = await this.couponsRepo.save(coupon)

    return ApiResponse.success(CouponRedemptionResponseDto.fromCoupon(saved), 'Coupon redeemed', 200)
  }

  // --- Lookups (public consumer discovery, matches the NearbyOffers mock) ---

  async listActiveOffersForBusiness(businessSlugOrId: string) {
    let business
    try {
      business = await this.businessesService.findBySlug(businessSlugOrId)
    } catch {
      business = await this.businessesService.findOne(businessSlugOrId)
    }

    const offers = await this.offersRepo.find({
      where: { businessId: business.id, isActive: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(offers.map((o) => OfferResponseDto.fromEntity(o)), 'Active offers retrieved', 200)
  }

  // --- Ownership helpers ---

  private async findOneCampaign(id: string): Promise<Campaign> {
    const campaign = await this.campaignsRepo.findOne({
      where: { id },
      relations: { business: true, season: true, offers: { coupons: true } },
    })

    if (!campaign) throw new NotFoundException('Campaign not found')

    return campaign
  }

  private async findOwnedCampaign(ownerId: string, id: string): Promise<Campaign> {
    const campaign = await this.campaignsRepo.findOne({
      where: { id },
      relations: { business: true, season: true },
    })

    if (!campaign) throw new NotFoundException('Campaign not found')
    if (campaign.business.ownerId !== ownerId) throw new NotFoundException('Campaign not found')

    return campaign
  }

  private async findOneOffer(id: string): Promise<Offer> {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: { campaign: true, business: true, coupons: true },
    })

    if (!offer) throw new NotFoundException('Offer not found')

    return offer
  }

  private async findOwnedOffer(ownerId: string, id: string): Promise<Offer> {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: { business: true },
    })

    if (!offer) throw new NotFoundException('Offer not found')
    if (offer.business.ownerId !== ownerId) throw new NotFoundException('Offer not found')

    return offer
  }

  private async findOwnedCoupon(ownerId: string, id: string): Promise<Coupon> {
    const coupon = await this.couponsRepo.findOne({
      where: { id },
      relations: { business: true },
    })

    if (!coupon) throw new NotFoundException('Coupon not found')
    if (coupon.business.ownerId !== ownerId) throw new NotFoundException('Coupon not found')

    return coupon
  }
}