import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserActionsService } from './user-actions.service'
import { UserBasicResponseDto } from './dto/user-basic-response.dto'
import { FamilyCardResponseDto } from './dto/family-card-response.dto'
import { ShareContentResponseDto } from './dto/share-content-response.dto'

@ApiTags('users')
@ApiExtraModels(ApiResponse, UserBasicResponseDto, FamilyCardResponseDto, ShareContentResponseDto)
@Controller('users')
export class UsersController {
  constructor(private readonly userActionsService: UserActionsService) {}


  @Get('by-email/:email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Find a user by email',
    description: 'Returns basic user info (id, name, email, status, created_at) for the given email address. Used by the consumer to look up a profile before sharing or sending invites.',
  })
  @ApiOkResponse({
    description: 'User found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(UserBasicResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'No user with that email' })
  async findByEmail(@Param('email') email: string) {
    return this.userActionsService.findByEmail(email)
  }


  @Get(':id/family-cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get family/child cards for a user',
    description: 'Returns child cards shared with the specified user (where child_id = :id). Includes card details and permission flags (can_view, can_use_wallet, can_manage, wallet_allocation).',
  })
  @ApiOkResponse({
    description: 'Family cards',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(FamilyCardResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getFamilyCards(@Param('id') id: string) {
    return this.userActionsService.getFamilyCards(id)
  }


  @Get(':id/share-content')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get share content for a user',
    description: 'Returns the cards shared by the specified user with card title, source (platform), status, and timestamp.',
  })
  @ApiOkResponse({
    description: 'Share content',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(ShareContentResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getShareContent(@Param('id') id: string) {
    return this.userActionsService.getShareContent(id)
  }
}
