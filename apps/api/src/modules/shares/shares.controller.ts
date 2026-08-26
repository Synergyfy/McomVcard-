import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common'
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
import { SharesService } from './shares.service'
import { CreateShareDto } from './dto/share.dto'
import { ShareResponseDto, ShareStatsResponseDto } from './dto/share-response.dto'

@ApiTags('shares')
@ApiExtraModels(ApiResponse, ShareResponseDto, ShareStatsResponseDto)
@UseGuards(JwtAuthGuard)
@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a card share', description: 'Records that the authenticated user shared one of their own cards on a platform. If the user is an active affiliate, their affiliate_id and referral_code are attached automatically so the code travels with the share.' })
  @ApiBody({
    type: CreateShareDto,
    examples: { default: { summary: 'Share a card on WhatsApp', value: { card_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', platform: 'whatsapp' } } },
  })
  @ApiCreatedResponse({
    description: 'Share recorded',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ShareResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiForbiddenResponse({ description: 'Card belongs to a different user' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async create(@CurrentUser() user: UserResponseDto, @Body() body: CreateShareDto) {
    return this.sharesService.create(user, body)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my card shares', description: 'Returns every share the authenticated user has recorded, newest first. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Shares',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(ShareResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listForUser(@CurrentUser() user: UserResponseDto) {
    return this.sharesService.listForUser(user)
  }

  @Get('cards/:cardId/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get share stats for a card', description: 'Returns lightweight share analytics for one of the authenticated user\'s cards: total shares, shares grouped by platform, and shares carrying affiliate attribution.' })
  @ApiOkResponse({
    description: 'Share stats',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ShareStatsResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiForbiddenResponse({ description: 'Card belongs to a different user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async statsForCard(@CurrentUser() user: UserResponseDto, @Param('cardId', new ParseUUIDPipe()) cardId: string) {
    return this.sharesService.statsForCard(user, cardId)
  }
}