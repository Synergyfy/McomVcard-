import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { ConsumerService } from './consumer.service'
import {
  ConsumerActivityQueryDto,
  ConsumerClaimCardDto,
  ConsumerInviteDto,
  ConsumerNotificationQueryDto,
  ConsumerNotificationUpdateDto,
  ConsumerOffersQueryDto,
  ConsumerPageQueryDto,
  ConsumerRewardQueryDto,
} from './dto/consumer-query.dto'
import {
  CreateConsumerWishlistItemDto,
  UpdateConsumerWishlistItemDto,
} from './dto/consumer-wishlist.dto'
import { UpdateConsumerProfileDto } from './dto/update-consumer-profile.dto'

/**
 * Customer (consumer) dashboard API.
 *
 * Every route is guarded by JwtAuthGuard + RolesGuard and restricted to the
 * CUSTOMER role, so business and admin accounts can never read or mutate a
 * customer's profile, wallet, cards, family, referrals or notifications.
 */
@ApiTags('consumer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
@Controller('consumer')
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @Get('access')
  @ApiOperation({
    summary: 'Check customer-dashboard access',
    description: 'Returns 200 only for a CUSTOMER account. Used by the frontend route guard.',
  })
  @ApiOkResponse({ description: 'Access granted' })
  @ApiForbiddenResponse({ description: 'Caller is not a customer account' })
  async access(@CurrentUser() user: UserResponseDto) {
    return ApiResponse.success(await this.consumerService.getAccess(user.id), 'Customer access granted', 200)
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Get my customer profile',
    description: 'Aggregated customer profile: identity, membership, wallet, cards, referrals and activity summary.',
  })
  @ApiOkResponse({ description: 'Customer profile' })
  async profile(@CurrentUser() user: UserResponseDto) {
    return ApiResponse.success(await this.consumerService.getProfile(user.id), 'Customer profile retrieved', 200)
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update my customer profile', description: 'Updates the editable profile fields after server-side validation.' })
  @ApiBody({ type: UpdateConsumerProfileDto })
  @ApiOkResponse({ description: 'Profile updated' })
  async updateProfile(@CurrentUser() user: UserResponseDto, @Body() body: UpdateConsumerProfileDto) {
    return ApiResponse.success(await this.consumerService.updateProfile(user.id, body), 'Customer profile updated', 200)
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get my customer dashboard',
    description: 'One round trip for profile, wallet, stats, cards, activity and nearby offers (Redis-cached for 30s).',
  })
  @ApiOkResponse({ description: 'Dashboard payload' })
  async dashboard(@CurrentUser() user: UserResponseDto) {
    return ApiResponse.success(await this.consumerService.getDashboard(user.id), 'Dashboard retrieved', 200)
  }

  @Get('wallet')
  @ApiOperation({
    summary: 'Get my customer wallet',
    description: 'Central MCOM Wallet balance plus local card balance, reward points, cashback and voucher counts.',
  })
  @ApiOkResponse({ description: 'Wallet summary' })
  async wallet(@CurrentUser() user: UserResponseDto) {
    return ApiResponse.success(await this.consumerService.getWallet(user.id), 'Wallet retrieved', 200)
  }

  @Get('wallet/transactions')
  @ApiOperation({ summary: 'List my card-ledger transactions', description: 'Paginated local card ledger (separate from the central wallet ledger).' })
  @ApiOkResponse({ description: 'Wallet transactions' })
  async walletTransactions(@CurrentUser() user: UserResponseDto, @Query() query: ConsumerPageQueryDto) {
    return ApiResponse.success(await this.consumerService.getWalletTransactions(user.id, query), 'Wallet transactions retrieved', 200)
  }

  @Get('cards')
  @ApiOperation({ summary: 'List my cards', description: 'Paginated cards owned by the customer with business, template and engagement counters.' })
  @ApiOkResponse({ description: 'Cards' })
  async cards(@CurrentUser() user: UserResponseDto, @Query() query: ConsumerPageQueryDto) {
    return ApiResponse.success(await this.consumerService.getCards(user.id, query), 'Cards retrieved', 200)
  }

  @Post('cards/claim')
  @ApiOperation({ summary: 'Add a card to my account', description: 'Adds an existing card (by ID or public slug) or a published template to the customer account. Used by card invite links.' })
  @ApiBody({ type: ConsumerClaimCardDto })
  @ApiCreatedResponse({ description: 'Card added' })
  async claimCard(@CurrentUser() user: UserResponseDto, @Body() body: ConsumerClaimCardDto) {
    return ApiResponse.success(await this.consumerService.claimCard(user.id, body), 'Card added', 201)
  }

  @Get('membership')
  @ApiOperation({ summary: 'Get my membership', description: 'Active purchased plan, membership tier and membership history.' })
  @ApiOkResponse({ description: 'Membership' })
  async membership(@CurrentUser() user: UserResponseDto) {
    return ApiResponse.success(await this.consumerService.getMembership(user.id), 'Membership retrieved', 200)
  }

  @Get('rewards')
  @ApiOperation({ summary: 'List my reward transactions', description: 'Paginated reward ledger, optionally filtered by status (available / redeemed / expired).' })
  @ApiOkResponse({ description: 'Rewards' })
  async rewards(@CurrentUser() user: UserResponseDto, @Query() query: ConsumerRewardQueryDto) {
    return ApiResponse.success(await this.consumerService.getRewards(user.id, query), 'Rewards retrieved', 200)
  }

  @Get('activity')
  @ApiOperation({ summary: 'List my activity', description: 'Paginated, filtered feed merged from wallet, rewards, shares, family, membership, bookings and vouchers.' })
  @ApiOkResponse({ description: 'Activity feed' })
  async activity(@CurrentUser() user: UserResponseDto, @Query() query: ConsumerActivityQueryDto) {
    return ApiResponse.success(await this.consumerService.getActivity(user.id, query), 'Activity retrieved', 200)
  }

  @Get('referrals')
  @ApiOperation({ summary: 'List my referrals', description: 'Paginated referrals attributed to the customer.' })
  @ApiOkResponse({ description: 'Referrals' })
  async referrals(@CurrentUser() user: UserResponseDto, @Query() query: ConsumerPageQueryDto) {
    return ApiResponse.success(await this.consumerService.getReferrals(user.id, query), 'Referrals retrieved', 200)
  }

  @Post('referrals/invite')
  @ApiOperation({ summary: 'Invite a friend by email', description: 'Sends a transactional referral invitation through Resend (or SMTP fallback).' })
  @ApiBody({ type: ConsumerInviteDto })
  @ApiCreatedResponse({ description: 'Invitation queued' })
  async invite(@CurrentUser() user: UserResponseDto, @Body() body: ConsumerInviteDto) {
    return ApiResponse.success(await this.consumerService.inviteReferral(user.id, body.email), 'Invitation sent', 201)
  }

  @Get('notifications')
  @ApiOperation({ summary: 'List my notifications', description: 'Paginated notifications with unread count; filter by all / unread / read.' })
  @ApiQuery({ name: 'filter', required: false, enum: ['all', 'unread', 'read'] })
  @ApiOkResponse({ description: 'Notifications' })
  async notifications(@CurrentUser() user: UserResponseDto, @Query() query: ConsumerNotificationQueryDto) {
    return ApiResponse.success(await this.consumerService.getNotifications(user.id, query), 'Notifications retrieved', 200)
  }

  @Patch('notifications/read-all')
  @ApiOperation({ summary: 'Mark all notifications read' })
  @ApiOkResponse({ description: 'All notifications marked read' })
  async markAllNotificationsRead(@CurrentUser() user: UserResponseDto) {
    return ApiResponse.success(await this.consumerService.markAllNotificationsRead(user.id), 'Notifications updated', 200)
  }

  @Patch('notifications/:id')
  @ApiOperation({ summary: 'Mark a notification read/unread', description: 'Owner-scoped notification update.' })
  @ApiBody({ schema: { properties: { read: { type: 'boolean', example: true } } } })
  @ApiOkResponse({ description: 'Notification updated' })
  async updateNotification(
    @CurrentUser() user: UserResponseDto,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: ConsumerNotificationUpdateDto,
  ) {
    return ApiResponse.success(
      await this.consumerService.markNotification(user.id, id, body.read !== false),
      'Notification updated',
      200,
    )
  }

  @Delete('notifications/:id')
  @ApiOperation({ summary: 'Dismiss a notification', description: 'Owner-scoped delete.' })
  @ApiOkResponse({ description: 'Notification removed' })
  async removeNotification(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success(await this.consumerService.removeNotification(user.id, id), 'Notification removed', 200)
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List my appointments', description: 'Paginated appointments booked with the customer email.' })
  @ApiOkResponse({ description: 'Bookings' })
  async bookings(@CurrentUser() user: UserResponseDto, @Query() query: ConsumerPageQueryDto) {
    return ApiResponse.success(await this.consumerService.getBookings(user.id, query), 'Bookings retrieved', 200)
  }

  @Get('offers')
  @ApiOperation({ summary: 'List nearby offers', description: 'Paginated active offers from active campaigns (public business promotions).' })
  @ApiOkResponse({ description: 'Offers' })
  async offers(@Query() query: ConsumerOffersQueryDto) {
    return ApiResponse.success(await this.consumerService.getNearbyOffers(query), 'Offers retrieved', 200)
  }

  @Get('exchange-items')
  @ApiOperation({ summary: 'List exchangeable offers', description: 'Paginated offers the customer can exchange for.' })
  @ApiOkResponse({ description: 'Exchange items' })
  async exchangeItems(@Query() query: ConsumerPageQueryDto) {
    return ApiResponse.success(await this.consumerService.getExchangeItems(query), 'Exchange items retrieved', 200)
  }

  @Get('redeem-items')
  @ApiOperation({ summary: 'List vouchers ready to redeem', description: 'Paginated vouchers assigned to the customer.' })
  @ApiOkResponse({ description: 'Redeem items' })
  async redeemItems(@CurrentUser() user: UserResponseDto, @Query() query: ConsumerPageQueryDto) {
    return ApiResponse.success(await this.consumerService.getRedeemItems(user.id, query), 'Redeem items retrieved', 200)
  }

  @Get('wishlist')
  @ApiOperation({ summary: 'Get my wish list', description: 'Consumer-owned free-form wish list (separate from business storefront wishlists).' })
  @ApiOkResponse({ description: 'Wish list' })
  async wishlist(@CurrentUser() user: UserResponseDto) {
    return ApiResponse.success(await this.consumerService.getWishlist(user.id), 'Wish list retrieved', 200)
  }

  @Post('wishlist')
  @ApiOperation({ summary: 'Add a wish-list item' })
  @ApiBody({ type: CreateConsumerWishlistItemDto })
  @ApiCreatedResponse({ description: 'Wish added' })
  async addWish(@CurrentUser() user: UserResponseDto, @Body() body: CreateConsumerWishlistItemDto) {
    return ApiResponse.success(await this.consumerService.addWish(user.id, body), 'Wish added', 201)
  }

  @Patch('wishlist/:id')
  @ApiOperation({ summary: 'Update a wish-list item' })
  @ApiBody({ type: UpdateConsumerWishlistItemDto })
  @ApiOkResponse({ description: 'Wish updated' })
  async updateWish(
    @CurrentUser() user: UserResponseDto,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateConsumerWishlistItemDto,
  ) {
    return ApiResponse.success(await this.consumerService.updateWish(user.id, id, body), 'Wish updated', 200)
  }

  @Delete('wishlist/:id')
  @ApiOperation({ summary: 'Remove a wish-list item' })
  @ApiOkResponse({ description: 'Wish removed' })
  async removeWish(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success(await this.consumerService.removeWish(user.id, id), 'Wish removed', 200)
  }
}
