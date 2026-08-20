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
import { ReviewsService } from './reviews.service'
import { CreateReviewDto, UpdateReviewDto, ModerateReviewDto } from './dto/review.dto'
import { ReviewResponseDto, BusinessReviewStatsDto } from './dto/review-response.dto'

@ApiTags('reviews')
@ApiExtraModels(ApiResponse, ReviewResponseDto, BusinessReviewStatsDto)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review', description: 'Authenticated user reviews a business (one review per user per business). You cannot review your own business.' })
  @ApiBody({
    type: CreateReviewDto,
    examples: { review: { summary: '5-star review', value: { business_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', rating: 5, comment: 'Lovely service, would recommend!' } } },
  })
  @ApiCreatedResponse({ description: 'Review created', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(ReviewResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiBadRequestResponse({ description: 'Own business / duplicate review / invalid rating' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async create(@CurrentUser() user: UserResponseDto, @Body() body: CreateReviewDto) {
    return this.reviewsService.create(user, body)
  }

  @Get('businesses/:businessId')
  @ApiOperation({ summary: 'List approved reviews for a business', description: 'Public: returns the approved reviews of a business, newest first, with author summaries.' })
  @ApiOkResponse({ description: 'Reviews', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(ReviewResponseDto) } } } }] } })
  async listForBusiness(@Param('businessId', new ParseUUIDPipe()) businessId: string) {
    return this.reviewsService.listForBusiness(businessId)
  }

  @Get('businesses/:businessId/stats')
  @ApiOperation({ summary: 'Get review stats for a business', description: 'Public: average rating, total reviews, and rating distribution for a business.' })
  @ApiOkResponse({ description: 'Review stats', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(BusinessReviewStatsDto) } } }] } })
  async statsForBusiness(@Param('businessId', new ParseUUIDPipe()) businessId: string) {
    return this.reviewsService.statsForBusiness(businessId)
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my reviews', description: 'Returns every review the authenticated user has written, newest first.' })
  @ApiOkResponse({ description: 'Reviews', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(ReviewResponseDto) } } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMine(@CurrentUser() user: UserResponseDto) {
    return this.reviewsService.listMine(user)
  }

  @Get('businesses/:businessId/owner')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all reviews on my business', description: 'Business owner: returns every review on one of their businesses, including pending/rejected (moderation view).' })
  @ApiOkResponse({ description: 'Reviews', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(ReviewResponseDto) } } } }] } })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listForBusinessOwner(@CurrentUser() user: UserResponseDto, @Param('businessId', new ParseUUIDPipe()) businessId: string) {
    return this.reviewsService.listForBusinessOwner(user, businessId)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my review', description: 'Authenticated user updates their own review (rating and/or comment).' })
  @ApiBody({ type: UpdateReviewDto, examples: { update: { summary: 'Change rating', value: { rating: 4, comment: 'Updated after follow-up visit' } } } })
  @ApiOkResponse({ description: 'Review updated', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(ReviewResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async update(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateReviewDto) {
    return this.reviewsService.update(user, id, body)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete my review', description: 'Authenticated user deletes their own review.' })
  @ApiOkResponse({ description: 'Review deleted', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'null', nullable: true } } }] } })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async remove(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.reviewsService.remove(user, id)
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderate a review', description: 'Moderation (admin in a later phase): approve or reject a review. Rejected reviews are hidden from public listing.' })
  @ApiBody({ type: ModerateReviewDto, examples: { approve: { summary: 'Approve', value: { status: 'approved' } }, reject: { summary: 'Reject', value: { status: 'rejected' } } } })
  @ApiOkResponse({ description: 'Review moderated', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(ReviewResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async moderate(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: ModerateReviewDto) {
    return this.reviewsService.moderate(id, body)
  }
}