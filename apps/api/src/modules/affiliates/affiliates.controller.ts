import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
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
import { AffiliatesService } from './affiliates.service'
import { JoinAffiliateDto, LookupReferralDto } from './dto/affiliate.dto'
import {
  AffiliateResponseDto,
  AffiliateTransactionResponseDto,
  ReferralLookupResponseDto,
  ReferralResponseDto,
} from './dto/affiliate-response.dto'

@ApiTags('affiliates')
@ApiExtraModels(ApiResponse, AffiliateResponseDto, ReferralResponseDto, AffiliateTransactionResponseDto, ReferralLookupResponseDto)
@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Post('join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join the affiliate program', description: 'Accepts the affiliate terms and creates the authenticated user\'s affiliate profile immediately (active). Generates a unique affiliate/referral code. Per-user: one affiliate per user.' })
  @ApiBody({
    type: JoinAffiliateDto,
    examples: { default: { summary: 'Accept terms and join', value: { accept_terms: true } } },
  })
  @ApiCreatedResponse({
    description: 'Affiliate profile created (or already exists)',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(AffiliateResponseDto) } } },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Affiliate terms not accepted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async join(@CurrentUser() user: UserResponseDto, @Body() body: JoinAffiliateDto) {
    return this.affiliatesService.join(user, body.accept_terms)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my affiliate profile', description: 'Returns the authenticated user\'s affiliate profile with referral link, referred count, and earnings. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Affiliate profile',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(AffiliateResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Affiliate profile not found. Join first.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getMyProfile(@CurrentUser() user: UserResponseDto) {
    return this.affiliatesService.getMyProfile(user)
  }

  @Get('me/referrals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my affiliate referrals', description: 'Returns every user attributed to the authenticated affiliate, newest first. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Affiliate referrals',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(ReferralResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Affiliate profile not found. Join first.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMyReferrals(@CurrentUser() user: UserResponseDto) {
    return this.affiliatesService.listMyReferrals(user)
  }

  @Get('me/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my affiliate transactions', description: 'Returns the authenticated user\'s affiliate commission ledger (newest first), including pending/approved/rejected statuses. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Affiliate transactions',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(AffiliateTransactionResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Affiliate profile not found. Join first.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMyTransactions(@CurrentUser() user: UserResponseDto) {
    return this.affiliatesService.listMyTransactions(user)
  }

  @Get('referral-lookup')
  @ApiOperation({ summary: 'Resolve a referral code', description: 'Resolves an affiliate referral code to its affiliate. Used to record attribution when a new user signs up with a referral code.' })
  @ApiOkResponse({
    description: 'Affiliate code resolved',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ReferralLookupResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Affiliate code not found' })
  @ApiBadRequestResponse({ description: 'Invalid code format' })
  async lookupReferralCode(@Query() query: LookupReferralDto) {
    return this.affiliatesService.lookupReferralCode(query.code)
  }
}