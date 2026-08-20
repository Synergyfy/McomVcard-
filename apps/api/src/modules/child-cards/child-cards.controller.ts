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
import { ChildCardsService } from './child-cards.service'
import { ChildCardResponseDto } from './dto/child-card-response.dto'
import { CreateChildCardDto, UpdateChildCardDto } from './dto/child-card.dto'

@ApiTags('child-cards')
@ApiExtraModels(ApiResponse, ChildCardResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class ChildCardsController {
  constructor(private readonly childCardsService: ChildCardsService) {}

  @Post('child-cards')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Share a card with a child', description: 'Grants a child user access to a card the authenticated user owns, with explicit permission flags and an optional wallet allocation. Access is never auto-inherited.' })
  @ApiBody({ type: CreateChildCardDto, examples: { default: { summary: 'Share with wallet allocation', value: { card_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', child_id: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', can_view: true, can_use_wallet: true, can_manage: false, wallet_allocation: 50 } } } })
  @ApiCreatedResponse({
    description: 'Card shared with child',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ChildCardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Card or child user not found' })
  @ApiBadRequestResponse({ description: 'Invalid input, duplicate share, or missing wallet allocation' })
  @ApiForbiddenResponse({ description: 'You do not own the card' })
  async create(@CurrentUser() user: UserResponseDto, @Body() body: CreateChildCardDto) {
    return this.childCardsService.create(user.id, body)
  }

  @Get('child-cards')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my child cards', description: 'Returns cards the authenticated user shared with children, plus cards shared with them by a parent (newest first).' })
  @ApiOkResponse({
    description: 'Child cards list',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(ChildCardResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMyChildCards(@CurrentUser() user: UserResponseDto) {
    return this.childCardsService.listForUser(user.id)
  }

  @Get('child-cards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a child card share', description: 'Returns a single child-card share the authenticated user is part of (parent or child).' })
  @ApiOkResponse({
    description: 'Child card found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ChildCardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Child card not found' })
  @ApiForbiddenResponse({ description: 'You are not part of this share' })
  async getChildCard(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.childCardsService.findOne(user.id, id)
  }

  @Patch('child-cards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a child card share', description: 'Updates the permission flags or wallet allocation. Only the card owner (parent) can update.' })
  @ApiBody({ type: UpdateChildCardDto, examples: { default: { summary: 'Enable wallet use', value: { can_use_wallet: true, wallet_allocation: 75 } } } })
  @ApiOkResponse({
    description: 'Child card updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ChildCardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Child card not found' })
  @ApiForbiddenResponse({ description: 'Only the card owner can update permissions' })
  @ApiBadRequestResponse({ description: 'Missing wallet allocation when enabling can_use_wallet' })
  async updateChildCard(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateChildCardDto) {
    return this.childCardsService.update(user.id, id, body)
  }

  @Delete('child-cards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a child card share', description: 'Revokes the share. The card owner or the child may remove it.' })
  @ApiOkResponse({
    description: 'Child card removed',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Child card removed' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Child card not found' })
  @ApiForbiddenResponse({ description: 'You are not part of this share' })
  async removeChildCard(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.childCardsService.remove(user.id, id)
  }
}