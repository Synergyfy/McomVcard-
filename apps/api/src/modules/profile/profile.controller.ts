import { Controller, Get, Patch, Delete, Body, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { ProfileService } from './profile.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdateSettingsDto } from './dto/update-settings.dto'

@ApiTags('profile')
@ApiExtraModels(ApiResponse, UserResponseDto)
@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}


  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user profile', description: 'Requires a Bearer token. Returns the profile of the currently authenticated user.' })
  @ApiOkResponse({
    description: 'Authenticated user profile',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(UserResponseDto) },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getProfile(@CurrentUser() user: UserResponseDto) {
    return this.profileService.getProfile(user.id)
  }


  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the authenticated user profile', description: 'Updates first/last name, phone, and optionally email. Changing the email resets verification.' })
  @ApiBody({
    type: UpdateProfileDto,
    examples: {
      default: {
        summary: 'Update profile',
        value: { first_name: 'John', last_name: 'Doe', phone: '+15551234567' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Updated user profile',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(UserResponseDto) },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Email already in use or invalid input' })
  async updateProfile(@CurrentUser() user: UserResponseDto, @Body() body: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, body)
  }


  @Get('settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user settings', description: 'Returns UI settings (language and theme mode) for the current user.' })
  @ApiOkResponse({
    description: 'Authenticated user settings',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                theme_mode: { type: 'string', example: 'light' },
              },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getSettings(@CurrentUser() user: UserResponseDto) {
    return this.profileService.getSettings(user.id)
  }


  @Patch('settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the authenticated user settings', description: 'Updates UI settings (language and theme mode) for the current user.' })
  @ApiBody({
    type: UpdateSettingsDto,
    examples: {
      default: {
        summary: 'Update settings',
        value: { language: 'en', theme_mode: 'dark' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Updated user settings',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                theme_mode: { type: 'string', example: 'dark' },
              },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Invalid language or theme_mode value' })
  async updateSettings(@CurrentUser() user: UserResponseDto, @Body() body: UpdateSettingsDto) {
    return this.profileService.updateSettings(user.id, body)
  }


  @Delete()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deactivate the authenticated user account',
    description: 'Soft-deactivates the account: the record is kept, all sessions are revoked, and the user can no longer log in or access the application.',
  })
  @ApiOkResponse({
    description: 'Account deactivated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            message: { type: 'string', example: 'Account deactivated' },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async deactivate(@CurrentUser() user: UserResponseDto) {
    return this.profileService.deactivate(user.id)
  }


  @Get('business-permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get business permissions for the authenticated user', description: 'Returns the user\'s role flags, owned businesses, and derived permission booleans.' })
  @ApiOkResponse({
    description: 'Business permissions',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                is_admin: { type: 'boolean', example: false },
                owned_businesses: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'string', example: 'Acme Corp' },
                      slug: { type: 'string', example: 'acme-corp' },
                    },
                  },
                },
                can_manage_cards: { type: 'boolean', example: true },
                can_manage_businesses: { type: 'boolean', example: true },
              },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getBusinessPermissions(@CurrentUser() user: UserResponseDto) {
    return this.profileService.getBusinessPermissions(user.id)
  }


  @Get('usage-stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get usage statistics for the authenticated user', description: 'Returns real usage counts across all resource types for the current user, including card counts, child-card allocations, and total wallet balance of linked children.' })
  @ApiOkResponse({
    description: 'Usage statistics',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                business_vcards: { type: 'number', example: 5, description: 'Count of BUSINESS_VCARD cards owned by the user' },
                consumer_vcards: { type: 'number', example: 42, description: 'Total CONSUMER_VCARD cards in the system' },
                business_cards: { type: 'number', example: 3, description: 'Count of BUSINESS_CARD cards owned by the user' },
                consumer_cards: { type: 'number', example: 18, description: 'Total CONSUMER_STORE_CARD cards in the system' },
                family_allocations: { type: 'number', example: 2, description: 'Count of child_card allocations with kind=FAMILY' },
                friend_allocations: { type: 'number', example: 1, description: 'Count of child_card allocations with kind=FRIEND' },
                additional_cards: { type: 'number', example: 4, description: 'Total child_card allocations owned by the user' },
                total_wallet_balance: { type: 'number', example: 125.50, description: 'Sum of wallet balances for all child users linked via child_cards' },
              },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getUsageStats(@CurrentUser() user: UserResponseDto) {
    return this.profileService.getUsageStats(user.id)
  }
}
