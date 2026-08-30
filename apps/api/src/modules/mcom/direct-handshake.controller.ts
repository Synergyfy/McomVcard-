import { BadRequestException, Controller, Get, HttpCode, Query, Req, Res, UnauthorizedException } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse as SwaggerApiResponse, ApiTags } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { ApiResponse } from '../../lib/utils/api-response'
import { setRefreshTokenCookie } from '../../lib/utils/refresh-cookie.util'
import { AuthService, DirectHandshakeJwt } from '../auth/auth.service'

/**
 * Direct Dashboard Handshake (spec §3.3).
 *
 * When a logged-in user in MCOM Solutions clicks this platform's app card,
 * Central signs a short-lived (60s) JWT with a shared secret (`SSO_SECRET`,
 * issuer `mcom-central`) and redirects the browser to
 * `https://vcard.mcomsolutions.com/sso-login?token=<JWT>`. The SPA hands that
 * token to this endpoint, which validates it and establishes a local session.
 */
@ApiTags('auth/sso-login (MCOM Solutions handshake)')
@Controller('v1/auth/sso-login')
export class DirectHandshakeController {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Complete the Direct Dashboard Handshake', description: 'Verifies the shared-secret JWT issued by MCOM Central and provisions/logs in the user.' })
  @ApiQuery({ name: 'token', required: true, description: 'Short-lived JWT signed by MCOM Central (issuer mcom-central)' })
  @SwaggerApiResponse({ status: 200, description: 'Local session established' })
  @SwaggerApiResponse({ status: 401, description: 'Missing, malformed, or expired token' })
  async handshake(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('token') token?: string,
  ) {
    const secret = this.config.get<string>('SSO_SECRET')
    if (!secret) {
      throw new UnauthorizedException('SSO_SECRET is not configured on this server')
    }
    if (!token) {
      throw new BadRequestException('Missing handshake token')
    }

    let identity: DirectHandshakeJwt
    try {
      identity = jwt.verify(token, secret, { issuer: 'mcom-central' }) as DirectHandshakeJwt
    } catch {
      throw new UnauthorizedException('Invalid or expired handshake token')
    }

    if (!identity?.email) {
      throw new BadRequestException('Handshake token is missing an email')
    }

    const result = await this.authService.provisionFromHandshake(identity, {
      userAgent: req.get('user-agent'),
      ip: req.ip,
    })

    setRefreshTokenCookie(res, result.refreshToken, this.authService.refreshTokenTtl())

    return ApiResponse.success(
      {
        token: result.accessToken,
        refresh_token: result.refreshToken,
        user: result.user,
        role: identity.role ?? null,
      },
      'MCOM handshake successful',
      200,
    )
  }
}