import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
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
import { WishlistsService } from './wishlists.service'
import { WishlistResponseDto, WishlistItemResponseDto } from './dto/wishlist-response.dto'
import { CreateWishlistDto, UpdateWishlistDto, AddWishlistItemDto } from './dto/wishlist.dto'

@ApiTags('wishlists')
@ApiExtraModels(ApiResponse, WishlistResponseDto, WishlistItemResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post('wishlists')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a wishlist', description: 'Creates a wishlist owned by the authenticated user.' })
  @ApiBody({ type: CreateWishlistDto, examples: { default: { summary: 'Create list', value: { name: 'Birthday gifts', is_private: false } } } })
  @ApiCreatedResponse({
    description: 'Wishlist created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(WishlistResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@CurrentUser() user: UserResponseDto, @Body() body: CreateWishlistDto) {
    return this.wishlistsService.create(user.id, body)
  }

  @Get('wishlists')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my wishlists', description: 'Returns the authenticated user\'s wishlists (newest first), each with its ordered items.' })
  @ApiOkResponse({
    description: 'Wishlists list',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(WishlistResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMyWishlists(@CurrentUser() user: UserResponseDto) {
    return this.wishlistsService.listForUser(user.id)
  }

  @Get('wishlists/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a wishlist', description: 'Returns a single wishlist (with its ordered items) the authenticated user owns. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Wishlist found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(WishlistResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wishlist not found' })
  @ApiForbiddenResponse({ description: 'You do not own this wishlist' })
  async getWishlist(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.wishlistsService.getOne(user.id, id)
  }

  @Patch('wishlists/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a wishlist', description: 'Updates the name or privacy of a wishlist the authenticated user owns.' })
  @ApiBody({ type: UpdateWishlistDto, examples: { default: { summary: 'Rename + make private', value: { name: 'Holiday list', is_private: true } } } })
  @ApiOkResponse({
    description: 'Wishlist updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(WishlistResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wishlist not found' })
  @ApiForbiddenResponse({ description: 'You do not own this wishlist' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updateWishlist(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateWishlistDto) {
    return this.wishlistsService.update(user.id, id, body)
  }

  @Delete('wishlists/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a wishlist', description: 'Deletes a wishlist (and its items) the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Wishlist removed',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Wishlist removed' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wishlist not found' })
  @ApiForbiddenResponse({ description: 'You do not own this wishlist' })
  async removeWishlist(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.wishlistsService.remove(user.id, id)
  }

  @Post('wishlists/:id/items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an item to a wishlist', description: 'Adds a product to a wishlist the authenticated user owns. A product may appear once per wishlist.' })
  @ApiBody({ type: AddWishlistItemDto, examples: { default: { summary: 'Add product', value: { product_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', note: 'The blue one' } } } })
  @ApiCreatedResponse({
    description: 'Item added',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(WishlistItemResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wishlist or product not found' })
  @ApiForbiddenResponse({ description: 'You do not own this wishlist' })
  @ApiBadRequestResponse({ description: 'Product already in wishlist or invalid input' })
  async addItem(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: AddWishlistItemDto) {
    return this.wishlistsService.addItem(user.id, id, body)
  }

  @Get('wishlists/:id/items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List items in a wishlist', description: 'Returns the items of a wishlist the authenticated user owns, ordered by position.' })
  @ApiOkResponse({
    description: 'Wishlist items',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(WishlistItemResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wishlist not found' })
  @ApiForbiddenResponse({ description: 'You do not own this wishlist' })
  async listItems(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.wishlistsService.listItems(user.id, id)
  }

  @Delete('wishlists/:id/items/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove an item from a wishlist', description: 'Removes a single item from a wishlist the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Wishlist item removed',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Wishlist item removed' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wishlist or item not found' })
  @ApiForbiddenResponse({ description: 'You do not own this wishlist' })
  async removeItem(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Param('itemId', new ParseUUIDPipe()) itemId: string) {
    return this.wishlistsService.removeItem(user.id, id, itemId)
  }
}