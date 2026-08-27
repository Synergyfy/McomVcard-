import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
  ApiExtraModels,
  ApiPropertyOptional,
  ApiParam,
} from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IsIn, IsOptional, IsString, IsBoolean, IsNumber, IsDateString, MaxLength } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { Campaign } from '../campaigns/entities/campaign.entity'
import { Offer } from '../campaigns/entities/offer.entity'
import { Coupon } from '../campaigns/entities/coupon.entity'
import { Business } from '../businesses/entities/business.entity'
import { ApiResponse } from '../../lib/utils/api-response'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'


class UpdateCampaignBodyDto {
  @ApiPropertyOptional({ example: 'Summer Sale 2026', description: 'Campaign name' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string

  @ApiPropertyOptional({ enum: ['Seasonal', 'Evergreen', 'Referral'], example: 'Seasonal', description: 'Campaign type' })
  @IsOptional()
  @IsIn(['Seasonal', 'Evergreen', 'Referral'])
  type?: string

  @ApiPropertyOptional({ enum: ['draft', 'active', 'paused', 'ended'], example: 'active', description: 'Campaign status' })
  @IsOptional()
  @IsIn(['draft', 'active', 'paused', 'ended'])
  status?: string

  @ApiPropertyOptional({ example: 'Huge discounts on all products', description: 'Campaign description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ example: 5000, description: 'Campaign budget' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  budget?: number

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z', description: 'Campaign start date' })
  @IsOptional()
  @IsDateString()
  starts_at?: string

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59.999Z', description: 'Campaign end date' })
  @IsOptional()
  @IsDateString()
  ends_at?: string
}


class UpdateOfferBodyDto {
  @ApiPropertyOptional({ example: '20% Off Everything', description: 'Offer title' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string

  @ApiPropertyOptional({ example: 'Valid on all categories', description: 'Offer description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ enum: ['PERCENT', 'FIXED'], example: 'PERCENT', description: 'Discount type' })
  @IsOptional()
  @IsIn(['PERCENT', 'FIXED'])
  discount_type?: string

  @ApiPropertyOptional({ example: 20, description: 'Discount value' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount_value?: number

  @ApiPropertyOptional({ example: true, description: 'Whether the offer is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean
}


@ApiTags('admin-campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiExtraModels(ApiResponse)
@Controller('admin/campaigns')
export class AdminCampaignsController {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}


  @Get()
  @ApiOperation({
    summary: 'List all campaigns (admin)',
    description: 'Returns a paginated list of campaigns with business relation. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Paginated list of campaigns' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listCampaigns(@Query() query: AdminPaginatedQueryDto) {
    const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'c.createdAt', updated_at: 'c.updatedAt', name: 'c.name', id: 'c.id', status: 'c.status' }
    const sortField = sortMap[sort] || 'c.createdAt'

    const qb = this.campaignRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.business', 'b')

    if (search) {
      qb.andWhere(
        '(c.name ILIKE :search OR c.description ILIKE :search OR b.name ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (status) {
      qb.andWhere('c.status = :status', { status })
    }

    const total = await qb.getCount()

    const campaigns = await qb
      .orderBy(sortField, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    const data = campaigns.map((c) => ({
      id: c.id,
      business_id: c.businessId,
      business: c.business ? {
        id: c.business.id,
        name: c.business.name,
      } : null,
      season_id: c.seasonId,
      name: c.name,
      type: c.type,
      status: c.status,
      description: c.description,
      budget: c.budget,
      starts_at: c.startsAt,
      ends_at: c.endsAt,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }))

    return ApiResponse.success(
      {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Campaigns retrieved',
      200,
    )
  }


  @Get(':id')
  @ApiOperation({
    summary: 'Get a single campaign',
    description: 'Returns campaign details with offers. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Campaign UUID', type: String })
  @ApiOkResponse({ description: 'Campaign details with offers' })
  @ApiNotFoundResponse({ description: 'Campaign not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getCampaign(@Param('id', ParseUUIDPipe) id: string) {
    const campaign = await this.campaignRepo.findOne({
      where: { id },
      relations: ['business', 'offers'],
    })

    if (!campaign) {
      throw new NotFoundException('Campaign not found')
    }

    const data = {
      id: campaign.id,
      business_id: campaign.businessId,
      business: campaign.business ? {
        id: campaign.business.id,
        name: campaign.business.name,
      } : null,
      season_id: campaign.seasonId,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      description: campaign.description,
      budget: campaign.budget,
      starts_at: campaign.startsAt,
      ends_at: campaign.endsAt,
      offers: (campaign.offers || []).map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        discount_type: o.discountType,
        discount_value: o.discountValue,
        is_active: o.isActive,
        created_at: o.createdAt,
        updated_at: o.updatedAt,
      })),
      created_at: campaign.createdAt,
      updated_at: campaign.updatedAt,
    }

    return ApiResponse.success(data, 'Campaign retrieved', 200)
  }


  @Patch(':id')
  @ApiOperation({
    summary: 'Update a campaign',
    description: 'Updates campaign fields. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Campaign UUID', type: String })
  @ApiBody({ type: UpdateCampaignBodyDto })
  @ApiOkResponse({ description: 'Updated campaign' })
  @ApiNotFoundResponse({ description: 'Campaign not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updateCampaign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCampaignBodyDto,
  ) {
    const campaign = await this.campaignRepo.findOne({ where: { id } })

    if (!campaign) {
      throw new NotFoundException('Campaign not found')
    }

    if (body.name !== undefined) campaign.name = body.name
    if (body.type !== undefined) campaign.type = body.type as any
    if (body.status !== undefined) campaign.status = body.status as any
    if (body.description !== undefined) campaign.description = body.description ?? null
    if (body.budget !== undefined) campaign.budget = body.budget
    if (body.starts_at !== undefined) campaign.startsAt = new Date(body.starts_at)
    if (body.ends_at !== undefined) campaign.endsAt = new Date(body.ends_at)

    const saved = await this.campaignRepo.save(campaign)

    const data = {
      id: saved.id,
      business_id: saved.businessId,
      name: saved.name,
      type: saved.type,
      status: saved.status,
      description: saved.description,
      budget: saved.budget,
      starts_at: saved.startsAt,
      ends_at: saved.endsAt,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    }

    return ApiResponse.success(data, 'Campaign updated', 200)
  }


  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a campaign',
    description: 'Permanently removes a campaign. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Campaign UUID', type: String })
  @ApiOkResponse({ description: 'Deletion confirmation' })
  @ApiNotFoundResponse({ description: 'Campaign not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async deleteCampaign(@Param('id', ParseUUIDPipe) id: string) {
    const campaign = await this.campaignRepo.findOne({ where: { id } })

    if (!campaign) {
      throw new NotFoundException('Campaign not found')
    }

    await this.campaignRepo.remove(campaign)

    return ApiResponse.success(
      { success: true, message: 'Campaign deleted' },
      'Campaign deleted',
      200,
    )
  }


  @Get(':id/offers')
  @ApiOperation({
    summary: 'List offers for a campaign',
    description: 'Returns all offers belonging to a campaign. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Campaign UUID', type: String })
  @ApiOkResponse({ description: 'List of offers' })
  @ApiNotFoundResponse({ description: 'Campaign not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listOffers(@Param('id', ParseUUIDPipe) id: string) {
    const campaign = await this.campaignRepo.findOne({ where: { id } })

    if (!campaign) {
      throw new NotFoundException('Campaign not found')
    }

    const offers = await this.offerRepo.find({
      where: { campaignId: id },
      relations: ['coupons'],
      order: { createdAt: 'DESC' },
    })

    const data = offers.map((o) => ({
      id: o.id,
      campaign_id: o.campaignId,
      business_id: o.businessId,
      title: o.title,
      description: o.description,
      discount_type: o.discountType,
      discount_value: o.discountValue,
      is_active: o.isActive,
      coupon_count: o.coupons?.length ?? 0,
      created_at: o.createdAt,
      updated_at: o.updatedAt,
    }))

    return ApiResponse.success(data, 'Offers retrieved', 200)
  }


  @Get('offers/:id')
  @ApiOperation({
    summary: 'Get a single offer',
    description: 'Returns offer details with coupons. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Offer UUID', type: String })
  @ApiOkResponse({ description: 'Offer details with coupons' })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getOffer(@Param('id', ParseUUIDPipe) id: string) {
    const offer = await this.offerRepo.findOne({
      where: { id },
      relations: ['campaign', 'business', 'coupons'],
    })

    if (!offer) {
      throw new NotFoundException('Offer not found')
    }

    const data = {
      id: offer.id,
      campaign_id: offer.campaignId,
      campaign: offer.campaign ? {
        id: offer.campaign.id,
        name: offer.campaign.name,
        status: offer.campaign.status,
      } : null,
      business_id: offer.businessId,
      business: offer.business ? {
        id: offer.business.id,
        name: offer.business.name,
      } : null,
      title: offer.title,
      description: offer.description,
      discount_type: offer.discountType,
      discount_value: offer.discountValue,
      is_active: offer.isActive,
      coupons: (offer.coupons || []).map((c) => ({
        id: c.id,
        code: c.code,
        discount_type: c.discountType,
        discount_value: c.discountValue,
        max_uses: c.maxUses,
        used_count: c.usedCount,
        expires_at: c.expiresAt,
        status: c.status,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      })),
      created_at: offer.createdAt,
      updated_at: offer.updatedAt,
    }

    return ApiResponse.success(data, 'Offer retrieved', 200)
  }


  @Patch('offers/:id')
  @ApiOperation({
    summary: 'Update an offer',
    description: 'Updates offer fields. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Offer UUID', type: String })
  @ApiBody({ type: UpdateOfferBodyDto })
  @ApiOkResponse({ description: 'Updated offer' })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updateOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateOfferBodyDto,
  ) {
    const offer = await this.offerRepo.findOne({ where: { id } })

    if (!offer) {
      throw new NotFoundException('Offer not found')
    }

    if (body.title !== undefined) offer.title = body.title
    if (body.description !== undefined) offer.description = body.description ?? null
    if (body.discount_type !== undefined) offer.discountType = body.discount_type as any
    if (body.discount_value !== undefined) offer.discountValue = body.discount_value
    if (body.is_active !== undefined) offer.isActive = body.is_active

    const saved = await this.offerRepo.save(offer)

    const data = {
      id: saved.id,
      campaign_id: saved.campaignId,
      business_id: saved.businessId,
      title: saved.title,
      description: saved.description,
      discount_type: saved.discountType,
      discount_value: saved.discountValue,
      is_active: saved.isActive,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    }

    return ApiResponse.success(data, 'Offer updated', 200)
  }


  @Delete('offers/:id')
  @ApiOperation({
    summary: 'Delete an offer',
    description: 'Permanently removes an offer. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Offer UUID', type: String })
  @ApiOkResponse({ description: 'Deletion confirmation' })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async deleteOffer(@Param('id', ParseUUIDPipe) id: string) {
    const offer = await this.offerRepo.findOne({ where: { id } })

    if (!offer) {
      throw new NotFoundException('Offer not found')
    }

    await this.offerRepo.remove(offer)

    return ApiResponse.success(
      { success: true, message: 'Offer deleted' },
      'Offer deleted',
      200,
    )
  }
}
