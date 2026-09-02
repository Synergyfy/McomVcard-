import { Controller, Post, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UsersService } from '../users/users.service'
import { AuthService } from '../auth/auth.service'
import { setRefreshTokenCookie } from '../../lib/utils/refresh-cookie.util'
import { Response } from 'express'

@ApiTags('admin')
@ApiExtraModels(ApiResponse, UserResponseDto)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin')
export class AdminImpersonationController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('impersonate/:userId')
  @ApiOperation({
    summary: 'Impersonate a user',
    description: 'Allows an admin to impersonate another user. Returns a new token pair for the target user.',
  })
  @ApiParam({ name: 'userId', description: 'UUID of the user to impersonate' })
  @ApiOkResponse({
    description: 'Impersonation successful',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                refresh_token: { type: 'string', example: 'opaque-random-refresh-token' },
                user: { $ref: getSchemaPath(UserResponseDto) },
              },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async impersonate(
    @CurrentUser() admin: UserResponseDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param() res: Response,
  ) {
    const targetUser = await this.usersService.findById(userId)
    if (!targetUser) {
      return ApiResponse.message('User not found', 404)
    }

    const meta = { userAgent: 'admin-impersonation', ip: 'admin' }
    const auth = await this.authService.impersonate(userId, meta)

    setRefreshTokenCookie(res, auth.data!.refresh_token, this.authService.refreshTokenTtl())

    return auth
  }

  @Post('impersonate/stop')
  @ApiOperation({
    summary: 'Stop impersonation',
    description: 'Returns the admin to their original session.',
  })
  @ApiOkResponse({
    description: 'Impersonation stopped',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Impersonation stopped' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async stopImpersonating(@CurrentUser() admin: UserResponseDto) {
    return ApiResponse.message('Impersonation stopped', 200)
  }
}