import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
import { MembershipsService } from './memberships.service'
import { MembershipTierResponseDto } from './dto/membership-tier-response.dto'
import { BenefitResponseDto } from './dto/benefit-response.dto'
import { MembershipResponseDto } from './dto/membership-response.dto'
import { CreateMembershipTierDto } from './dto/create-membership-tier.dto'
import { UpdateMembershipTierDto } from './dto/update-membership-tier.dto'
import { CreateBenefitDto } from './dto/create-benefit.dto'
import { UpdateBenefitDto } from './dto/update-benefit.dto'
import { LinkBenefitDto } from './dto/link-benefit.dto'
import { CreateMembershipDto } from './dto/create-membership.dto'
import { UpdateMembershipDto } from './dto/update-membership.dto'

@ApiTags('memberships')
@ApiExtraModels(ApiResponse, MembershipTierResponseDto, BenefitResponseDto, MembershipResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // --- Tiers ---

  @Post('membership-tiers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a membership tier', description: 'Creates a platform-wide membership tier. Any authenticated user can manage tiers.' })
  @ApiBody({ type: CreateMembershipTierDto, examples: { default: { summary: 'Gold tier', value: { name: 'Gold', description: 'Premium tier with extra perks', discount_type: 'percentage', discount_value: 10, sort_order: 2 } } } })
  @ApiCreatedResponse({
    description: 'Membership tier created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(MembershipTierResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async createTier(@Body() body: CreateMembershipTierDto) {
    return this.membershipsService.createTier(body)
  }

  @Get('membership-tiers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List membership tiers', description: 'Returns all platform-wide tiers ordered by sort_order, each with its linked benefits. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Membership tiers list',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(MembershipTierResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listTiers() {
    return this.membershipsService.listTiers()
  }

  @Get('membership-tiers/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a membership tier', description: 'Returns a single membership tier with its linked benefits. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Membership tier found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(MembershipTierResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Membership tier not found' })
  async getTier(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.membershipsService.getTier(id)
  }

  @Patch('membership-tiers/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a membership tier', description: 'Updates a platform-wide membership tier. Any authenticated user can manage tiers.' })
  @ApiBody({ type: UpdateMembershipTierDto, examples: { default: { summary: 'Raise discount', value: { discount_value: 15 } } } })
  @ApiOkResponse({
    description: 'Membership tier updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(MembershipTierResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Membership tier not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updateTier(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateMembershipTierDto) {
    return this.membershipsService.updateTier(id, body)
  }

  @Delete('membership-tiers/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a membership tier', description: 'Deletes a membership tier. Any authenticated user can manage tiers.' })
  @ApiOkResponse({
    description: 'Membership tier deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Membership tier deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Membership tier not found' })
  async removeTier(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.membershipsService.removeTier(id)
  }

  // --- Benefits ---

  @Post('benefits')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a benefit', description: 'Creates a platform-wide benefit. Any authenticated user can manage benefits.' })
  @ApiBody({ type: CreateBenefitDto, examples: { default: { summary: 'Delivery perk', value: { name: 'Free delivery', description: 'Complimentary delivery on all orders', benefit_type: 'perk' } } } })
  @ApiCreatedResponse({
    description: 'Benefit created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BenefitResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async createBenefit(@Body() body: CreateBenefitDto) {
    return this.membershipsService.createBenefit(body)
  }

  @Get('benefits')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List benefits', description: 'Returns all platform-wide benefits. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Benefits list',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(BenefitResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listBenefits() {
    return this.membershipsService.listBenefits()
  }

  @Get('benefits/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a benefit', description: 'Returns a single benefit. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Benefit found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BenefitResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Benefit not found' })
  async getBenefit(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.membershipsService.getBenefit(id)
  }

  @Patch('benefits/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a benefit', description: 'Updates a platform-wide benefit. Any authenticated user can manage benefits.' })
  @ApiBody({ type: UpdateBenefitDto, examples: { default: { summary: 'Rename perk', value: { name: 'Priority delivery' } } } })
  @ApiOkResponse({
    description: 'Benefit updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BenefitResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Benefit not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updateBenefit(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateBenefitDto) {
    return this.membershipsService.updateBenefit(id, body)
  }

  @Delete('benefits/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a benefit', description: 'Deletes a benefit. Any authenticated user can manage benefits.' })
  @ApiOkResponse({
    description: 'Benefit deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Benefit deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Benefit not found' })
  async removeBenefit(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.membershipsService.removeBenefit(id)
  }

  // --- Tier ↔ Benefit linking ---

  @Post('membership-tiers/:id/benefits')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link a benefit to a tier', description: 'Links a benefit to a membership tier (DB-driven relationship). Any authenticated user can manage tiers.' })
  @ApiBody({ type: LinkBenefitDto, examples: { default: { summary: 'Link benefit', value: { benefit_id: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' } } } })
  @ApiCreatedResponse({
    description: 'Benefit linked',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { type: 'string', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Tier or benefit not found' })
  @ApiBadRequestResponse({ description: 'Benefit already linked' })
  async linkBenefit(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: LinkBenefitDto) {
    return this.membershipsService.linkBenefit(id, body.benefit_id)
  }

  @Get('membership-tiers/:id/benefits')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List a tier benefits', description: 'Returns the benefits linked to a membership tier. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Tier benefits',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(BenefitResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Membership tier not found' })
  async listTierBenefits(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.membershipsService.listTierBenefits(id)
  }

  @Delete('membership-tiers/:id/benefits/:benefitId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink a benefit from a tier', description: 'Removes the benefit link from a membership tier. Any authenticated user can manage tiers.' })
  @ApiOkResponse({
    description: 'Benefit unlinked',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Benefit unlinked from tier' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Tier, benefit, or link not found' })
  async unlinkBenefit(@Param('id', new ParseUUIDPipe()) id: string, @Param('benefitId', new ParseUUIDPipe()) benefitId: string) {
    return this.membershipsService.unlinkBenefit(id, benefitId)
  }

  // --- Memberships (per-user) ---

  @Post('memberships')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a membership', description: 'Assigns a membership tier to the authenticated user. Per-user scoped — a user manages their own memberships.' })
  @ApiBody({ type: CreateMembershipDto, examples: { default: { summary: 'Subscribe to Gold', value: { membership_tier_id: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', started_at: '2026-08-19T09:00:00.000Z', expires_at: '2027-08-19T09:00:00.000Z' } } } })
  @ApiCreatedResponse({
    description: 'Membership created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(MembershipResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Membership tier not found' })
  @ApiBadRequestResponse({ description: 'Invalid input or tier inactive' })
  async createMembership(@CurrentUser() user: UserResponseDto, @Body() body: CreateMembershipDto) {
    return this.membershipsService.createMembership(user.id, body)
  }

  @Get('memberships')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my memberships', description: 'Returns the authenticated user\'s memberships (newest first). Per-user scoped.' })
  @ApiOkResponse({
    description: 'Memberships list',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(MembershipResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMemberships(@CurrentUser() user: UserResponseDto) {
    return this.membershipsService.listMemberships(user.id)
  }

  @Get('memberships/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my membership', description: 'Returns a single membership owned by the authenticated user. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Membership found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(MembershipResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Membership not found' })
  async getMembership(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.membershipsService.getMembership(user.id, id)
  }

  @Patch('memberships/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my membership', description: 'Updates a membership owned by the authenticated user (tier, status, start/expiry). Per-user scoped.' })
  @ApiBody({ type: UpdateMembershipDto, examples: { default: { summary: 'Extend expiry', value: { expires_at: '2028-08-19T09:00:00.000Z' } } } })
  @ApiOkResponse({
    description: 'Membership updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(MembershipResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Membership not found' })
  @ApiBadRequestResponse({ description: 'Invalid input or tier inactive' })
  async updateMembership(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateMembershipDto) {
    return this.membershipsService.updateMembership(user.id, id, body)
  }

  @Delete('memberships/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete my membership', description: 'Deletes a membership owned by the authenticated user. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Membership deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Membership deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Membership not found' })
  async removeMembership(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.membershipsService.removeMembership(user.id, id)
  }
}