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
import { RelationshipsService } from './relationships.service'
import { RelationshipResponseDto } from './dto/relationship-response.dto'
import { CreateRelationshipDto, RespondRelationshipDto } from './dto/relationship.dto'

@ApiTags('relationships')
@ApiExtraModels(ApiResponse, RelationshipResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class RelationshipsController {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  @Post('relationships')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a relationship', description: 'Sends a relationship request (FAMILY/FRIEND/CHILD) to another user. The authenticated user is the requester. A pair may have only one relationship.' })
  @ApiBody({ type: CreateRelationshipDto, examples: { default: { summary: 'Friend request', value: { recipient_id: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', relationship_type: 'FRIEND' } } } })
  @ApiCreatedResponse({
    description: 'Relationship requested',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(RelationshipResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Invalid input, self-relationship, or duplicate pair' })
  async requestRelationship(@CurrentUser() user: UserResponseDto, @Body() body: CreateRelationshipDto) {
    return this.relationshipsService.requestRelationship(user.id, body)
  }

  @Get('relationships')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my relationships', description: 'Returns relationships where the authenticated user is requester or recipient (newest first). Per-user scoped.' })
  @ApiOkResponse({
    description: 'Relationships list',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(RelationshipResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMyRelationships(@CurrentUser() user: UserResponseDto) {
    return this.relationshipsService.listMyRelationships(user.id)
  }

  @Get('relationships/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a relationship', description: 'Returns a single relationship the authenticated user is part of. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Relationship found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(RelationshipResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Relationship not found' })
  @ApiForbiddenResponse({ description: 'You are not part of this relationship' })
  async getRelationship(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.relationshipsService.getRelationship(user.id, id)
  }

  @Patch('relationships/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to a relationship request', description: 'The recipient accepts or declines a pending relationship request. Only the recipient can respond, and only while pending.' })
  @ApiBody({ type: RespondRelationshipDto, examples: { default: { summary: 'Accept', value: { status: 'accepted' } } } })
  @ApiOkResponse({
    description: 'Relationship updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(RelationshipResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Relationship not found' })
  @ApiForbiddenResponse({ description: 'Only the recipient can respond' })
  @ApiBadRequestResponse({ description: 'Relationship is no longer pending' })
  async respondToRelationship(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: RespondRelationshipDto) {
    return this.relationshipsService.respondToRelationship(user.id, id, body)
  }

  @Delete('relationships/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a relationship', description: 'Removes a relationship the authenticated user is part of. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Relationship removed',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Relationship removed' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Relationship not found' })
  @ApiForbiddenResponse({ description: 'You are not part of this relationship' })
  async removeRelationship(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.relationshipsService.removeRelationship(user.id, id)
  }
}