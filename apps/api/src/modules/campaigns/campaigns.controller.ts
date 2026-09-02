import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { CampaignsService } from './campaigns.service'
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
  CampaignTemplateResponseDto,
} from './dto/campaign-response.dto'
import { NearbyOfferResponseDto } from './dto/nearby-offer-response.dto'

@ApiTags('campaigns')
@ApiExtraModels(ApiResponse, CampaignResponseDto, OfferResponseDto, CouponResponseDto, CouponRedemptionResponseDto, NearbyOfferResponseDto)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // --- Campaigns ---

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a campaign', description: 'Creates a campaign owned by one of the authenticated user\'s businesses (Business → Campaign). New campaigns start in draft.' })
  @ApiBody({
    type: CreateCampaignDto,
    examples: { spring: { summary: 'Spring seasonal campaign', value: { business_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', name: 'Spring Expo Promo', type: 'Seasonal', description: 'Seasonal push timed to the Spring Expo', budget: 2500, starts_at: '2026-09-01T00:00:00.000Z', ends_at: '2026-10-31T23:59:59.000Z' } } },
  })
  @ApiCreatedResponse({ description: 'Campaign created', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(CampaignResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async createCampaign(@CurrentUser() user: UserResponseDto, @Body() body: CreateCampaignDto) {
    return this.campaignsService.createCampaign(user, body)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my campaigns', description: 'Returns every campaign across the authenticated user\'s businesses, newest first.' })
  @ApiOkResponse({ description: 'Campaigns', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(CampaignResponseDto) } } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listCampaigns(@CurrentUser() user: UserResponseDto) {
    return this.campaignsService.listCampaigns(user)
  }

  @Get('businesses/:businessId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List campaigns for a business', description: 'Returns every campaign of one of the authenticated user\'s businesses, newest first.' })
  @ApiOkResponse({ description: 'Campaigns', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(CampaignResponseDto) } } } }] } })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listCampaignsForBusiness(@CurrentUser() user: UserResponseDto, @Param('businessId', new ParseUUIDPipe()) businessId: string) {
    return this.campaignsService.listCampaignsForBusiness(user, businessId)
  }

  // --- Campaign Templates (must come before :id routes) ---

  @Get('templates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List campaign templates', description: 'Returns all available campaign templates. Any authenticated user can read.' })
  @ApiOkResponse({ description: 'Campaign templates', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(CampaignTemplateResponseDto) } } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listTemplates() {
    return this.campaignsService.listTemplates()
  }

  @Get('templates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a campaign template' })
  @ApiOkResponse({ description: 'Campaign template', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(CampaignTemplateResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Campaign template not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getTemplate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.campaignsService.getTemplate(id)
  }

  // --- Consumer discovery (must come before :id routes) ---

  @Get('nearby')
  @ApiOperation({
    summary: 'List nearby active offers',
    description: 'Public consumer endpoint: returns the 20 most recent active offers across all businesses.',
  })
  @ApiOkResponse({
    description: 'Nearby active offers',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(NearbyOfferResponseDto) } },
          },
        },
      ],
    },
  })
  async listNearbyOffers() {
    return this.campaignsService.listNearbyOffers()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a campaign', description: 'Returns one campaign of the authenticated user, with its offers and coupons.' })
  @ApiOkResponse({ description: 'Campaign', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(CampaignResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Campaign not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getCampaign(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.campaignsService.getCampaign(user, id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a campaign', description: 'Updates a campaign of the authenticated user (name, type, status, season, budget, dates).' })
  @ApiBody({ type: UpdateCampaignDto, examples: { activate: { summary: 'Activate a campaign', value: { status: 'active' } } } })
  @ApiOkResponse({ description: 'Campaign updated', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(CampaignResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Campaign not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async updateCampaign(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateCampaignDto) {
    return this.campaignsService.updateCampaign(user, id, body)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a campaign', description: 'Permanently deletes a campaign of the authenticated user (cascades to offers and coupons).' })
  @ApiOkResponse({ description: 'Campaign deleted', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'null', nullable: true } } }] } })
  @ApiNotFoundResponse({ description: 'Campaign not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async deleteCampaign(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.campaignsService.deleteCampaign(user, id)
  }

  // --- Offers ---

  @Post(':id/offers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an offer to a campaign', description: 'Creates an offer inside one of the authenticated user\'s campaigns (Campaign → Offer).' })
  @ApiBody({ type: CreateOfferDto, examples: { offer: { summary: '20% off treatments', value: { title: '20% off all treatments', description: 'Valid on all beauty treatments this month', discount_type: 'PERCENT', discount_value: 20 } } } })
  @ApiCreatedResponse({ description: 'Offer created', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(OfferResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Campaign not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async createOffer(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: CreateOfferDto) {
    return this.campaignsService.createOffer(user, id, body)
  }

  @Get(':id/offers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List offers in a campaign', description: 'Returns every offer inside one of the authenticated user\'s campaigns.' })
  @ApiOkResponse({ description: 'Offers', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(OfferResponseDto) } } } }] } })
  @ApiNotFoundResponse({ description: 'Campaign not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listOffers(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.campaignsService.listOffers(user, id)
  }

  @Patch('offers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an offer', description: 'Updates an offer of the authenticated user (title, description, discount, active state).' })
  @ApiBody({ type: UpdateOfferDto, examples: { pause: { summary: 'Pause an offer', value: { is_active: false } } } })
  @ApiOkResponse({ description: 'Offer updated', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(OfferResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async updateOffer(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateOfferDto) {
    return this.campaignsService.updateOffer(user, id, body)
  }

  @Delete('offers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an offer', description: 'Permanently deletes an offer of the authenticated user (cascades to its coupons).' })
  @ApiOkResponse({ description: 'Offer deleted', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'null', nullable: true } } }] } })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async deleteOffer(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.campaignsService.deleteOffer(user, id)
  }

  // --- Coupons ---

  @Post('offers/:id/coupons')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a coupon to an offer', description: 'Creates a redeemable coupon inside one of the authenticated user\'s offers (Offer → Coupon). Coupon codes are unique.' })
  @ApiBody({ type: CreateCouponDto, examples: { coupon: { summary: 'BLOOM20 coupon', value: { code: 'BLOOM20', discount_type: 'PERCENT', discount_value: 20, max_uses: 100, expires_at: '2026-12-31T23:59:59.000Z' } } } })
  @ApiCreatedResponse({ description: 'Coupon created', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(CouponResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiConflictResponse({ description: 'Coupon code already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async createCoupon(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: CreateCouponDto) {
    return this.campaignsService.createCoupon(user, id, body)
  }

  @Get('offers/:id/coupons')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List coupons in an offer', description: 'Returns every coupon inside one of the authenticated user\'s offers.' })
  @ApiOkResponse({ description: 'Coupons', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(CouponResponseDto) } } } }] } })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listCoupons(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.campaignsService.listCoupons(user, id)
  }

  @Patch('coupons/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a coupon', description: 'Updates a coupon of the authenticated user (code, discount, usage cap, expiry, status).' })
  @ApiBody({ type: UpdateCouponDto, examples: { extend: { summary: 'Extend a coupon', value: { expires_at: '2027-01-31T23:59:59.000Z', max_uses: 200 } } } })
  @ApiOkResponse({ description: 'Coupon updated', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(CouponResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  @ApiConflictResponse({ description: 'Coupon code already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async updateCoupon(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateCouponDto) {
    return this.campaignsService.updateCoupon(user, id, body)
  }

  @Delete('coupons/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a coupon', description: 'Permanently deletes a coupon of the authenticated user.' })
  @ApiOkResponse({ description: 'Coupon deleted', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'null', nullable: true } } }] } })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async deleteCoupon(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.campaignsService.deleteCoupon(user, id)
  }

  // --- Redemption & public discovery ---

  @Post('offers/:id/coupons/:code/redeem')
  @ApiOperation({ summary: 'Redeem a coupon (public)', description: 'Public redemption: validates the coupon is active, unexpired, and under its usage cap, then increments used_count. Returns 409 if expired or exhausted.' })
  @ApiOkResponse({ description: 'Coupon redeemed', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(CouponRedemptionResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Offer or coupon not found' })
  @ApiConflictResponse({ description: 'Coupon expired or usage limit reached' })
  async redeemCoupon(@Param('id', new ParseUUIDPipe()) id: string, @Param('code') code: string) {
    return this.campaignsService.redeemCoupon(id, code)
  }

  @Get('businesses/:businessId/offers/active')
  @ApiOperation({ summary: 'List active offers for a business (public)', description: 'Public consumer endpoint: returns the live offers of a business by slug or id — powers the NearbyOffers consumer experience.' })
  @ApiOkResponse({ description: 'Active offers', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(OfferResponseDto) } } } }] } })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async listActiveOffersForBusiness(@Param('businessId') businessId: string) {
    return this.campaignsService.listActiveOffersForBusiness(businessId)
  }
}