import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { GiftCardsService } from './gift-cards.service'
import { CreateGiftCardDto } from './dto/create-gift-card.dto'
import { UpdateGiftCardDto } from './dto/update-gift-card.dto'
import { GiftCardResponseDto } from './dto/gift-card-response.dto'

@ApiTags('gift-cards')
@ApiExtraModels(ApiResponse, GiftCardResponseDto)
@UseGuards(JwtAuthGuard)
@Controller('gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a gift card', description: 'Creates a gift card for a business owned by the authenticated user.' })
  @ApiBody({
    type: CreateGiftCardDto,
    examples: {
      default: {
        summary: 'Create gift card',
        value: { business_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', title: 'Summer Gift Card', value: 100, price: 90 },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Gift card created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(GiftCardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiBadRequestResponse({ description: 'Invalid input or business not found' })
  async create(@CurrentUser() user: UserResponseDto, @Body() body: CreateGiftCardDto) {
    return this.giftCardsService.create(user.id, body)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my gift cards', description: 'Returns all gift cards for businesses owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Gift cards',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { type: 'array', items: { $ref: getSchemaPath(GiftCardResponseDto) } } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMine(@CurrentUser() user: UserResponseDto) {
    const giftCards = await this.giftCardsService.listForOwner(user.id)
    return giftCards.map((c) => GiftCardResponseDto.fromEntity(c))
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a gift card', description: 'Returns a single gift card.' })
  @ApiOkResponse({
    description: 'Gift card found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(GiftCardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Gift card not found' })
  async findOne(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    const giftCard = await this.giftCardsService.findOne(id)
    await this.giftCardsService['businessesService'].findOwned(giftCard.businessId, user.id)
    return GiftCardResponseDto.fromEntity(giftCard)
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a gift card', description: 'Updates a gift card owned by the authenticated user.' })
  @ApiBody({
    type: UpdateGiftCardDto,
    examples: { default: { summary: 'Update gift card', value: { status: 'paused' } } },
  })
  @ApiOkResponse({
    description: 'Gift card updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(GiftCardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Gift card not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateGiftCardDto) {
    const giftCard = await this.giftCardsService.update(user.id, id, body)
    return GiftCardResponseDto.fromEntity(giftCard)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a gift card', description: 'Permanently deletes a gift card owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Gift card deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Gift card deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Gift card not found' })
  async remove(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    await this.giftCardsService.remove(user.id, id)
    return ApiResponse.message('Gift card deleted', 200)
  }
}