import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { AdminLoginDto } from './dto/admin-login.dto'
import { LogoutDto } from './dto/logout.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import {
  clearAdminRefreshTokenCookie,
  getAdminRefreshTokenCookie,
  setAdminRefreshTokenCookie,
} from '../../lib/utils/admin-refresh-cookie.util'

/**
 * Isolated admin authentication surface.
 *
 * Mounted under `/api/admin/auth`, entirely separate from the standard
 * Central Hub Solution login (`/api/login`). A successful response only exists
 * when the account holds the ADMIN role.
 */
@ApiTags('admin-auth')
@ApiExtraModels(ApiResponse, UserResponseDto)
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Sign in to the admin dashboard',
    description:
      'Dedicated admin login. Credentials must belong to an active account with the ADMIN role. Issues an admin session that is isolated from the standard user session.',
  })
  @ApiBody({ type: AdminLoginDto })
  @ApiOkResponse({ description: 'Admin session issued' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or account is not an administrator' })
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: AdminLoginDto,
  ) {
    const result = await this.authService.adminLogin(body.email, body.password, {
      userAgent: req.get('user-agent'),
      ip: req.ip,
    })

    setAdminRefreshTokenCookie(res, result.data!.refresh_token, this.authService.refreshTokenTtl())

    return result
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Restore an admin session',
    description: 'Exchanges the HttpOnly admin refresh cookie for a fresh admin access token. Re-checks the ADMIN role.',
  })
  @ApiOkResponse({ description: 'Admin session refreshed' })
  @ApiUnauthorizedResponse({ description: 'Invalid admin session' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = getAdminRefreshTokenCookie(req)

    const result = await this.authService.refresh(
      refreshToken ?? undefined,
      { userAgent: req.get('user-agent'), ip: req.ip },
      'ADMIN',
    )

    setAdminRefreshTokenCookie(res, result.data!.refresh_token, this.authService.refreshTokenTtl())

    return result
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign out of the admin dashboard' })
  @ApiBody({ type: LogoutDto, required: false })
  @ApiOkResponse({ description: 'Admin session revoked' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() body: LogoutDto) {
    const refreshToken = getAdminRefreshTokenCookie(req)

    await this.authService.logout(refreshToken ?? body.refresh_token)
    clearAdminRefreshTokenCookie(res)

    return ApiResponse.message('Admin logged out', 200)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current admin identity and roles' })
  @ApiOkResponse({ description: 'Current admin' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Caller is not an administrator' })
  async me(@Req() req: Request & { user?: Record<string, unknown> }) {
    const user = req.user ?? {}

    return ApiResponse.success(
      { user, roles: Array.isArray(user.roles) ? user.roles : [] },
      'Admin profile retrieved',
      200,
    )
  }
}
