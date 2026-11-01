import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  HttpCode,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { randomBytes, timingSafeEqual } from 'crypto'
import { ConfigService } from '@nestjs/config'
import { McomEntitlement, McomService, hasVcardAccess } from './mcom.service'
import { AuthService, McomUserInfo } from '../auth/auth.service'
import { UsersService } from '../users/users.service'
import { PlansService } from '../plans/plans.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { SsoCallbackDto } from './dto/sso-callback.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { setRefreshTokenCookie } from '../../lib/utils/refresh-cookie.util'
import {
  setOauthStateCookie,
  getOauthStateCookie,
  clearOauthStateCookie,
  setOauthReturnCookie,
  getOauthReturnCookie,
  clearOauthReturnCookie,
} from '../../lib/utils/oauth-state-cookie.util'
import { decryptMcomToken } from '../../lib/utils/mcom-crypto.util'

function safeStateEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/** Accept only internal, non-protocol-relative paths for post-login redirects. */
function safeReturnPath(path?: string): string | null {
  if (!path) return null
  if (!path.startsWith('/') || path.startsWith('//')) return null
  return path
}

@ApiTags('auth/sso (MCOM Solutions)')
@Controller('v1/auth/sso')
export class McomController {
  constructor(
    private readonly mcomService: McomService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly plansService: PlansService,
  ) {}

  /**
   * Kick off the OAuth 2.0 authorization-code flow. Generates a 32-byte CSRF
   * `state`, stores it in an HttpOnly cookie, and returns the Central
   * authorize URL the browser should be redirected to.
   */
  @Get('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start MCOM SSO login', description: 'Generates a CSRF state cookie and returns the MCOM Solutions authorize URL.' })
  @ApiOkResponse({ description: 'authorizeUrl ready for a browser redirect' })
  async startLogin(
    @Res({ passthrough: true }) res: Response,
    @Query('card') card?: string,
    @Query('business') business?: string,
    @Query('redirect') redirect?: string,
  ) {
    const state = randomBytes(32).toString('hex')
    setOauthStateCookie(res, state)

    const safeRedirect = safeReturnPath(redirect)
    // Preserve the card-invite context so the SPA callback can restore the
    // consumer card-association flow after the SSO round trip, plus an optional
    // post-login redirect (e.g. back to /b/payment after a re-auth).
    if (card || business || safeRedirect) {
      setOauthReturnCookie(res, JSON.stringify({ card: card || '', business: business || '', redirect: safeRedirect || '' }))
    }

    return ApiResponse.success({ authorizeUrl: this.mcomService.getAuthorizeUrl(state) }, 'MCOM SSO login URL', 200)
  }

  /**
   * MCOM redirects the browser to the SPA callback page (see web /auth/callback),
   * which POSTs code+state here. The state is validated against the cookie
   * (CSRF), the code is exchanged server-side, the user is JIT-provisioned, and
   * a local session is issued.
   */
  @Post('callback')
  @HttpCode(200)
  @ApiOperation({ summary: 'Complete MCOM SSO callback', description: 'Validates CSRF state, exchanges the OAuth code, JIT-provisions the user and issues a local session.' })
  @ApiBody({ type: SsoCallbackDto })
  @ApiOkResponse({ description: 'Local session established' })
  @ApiBadRequestResponse({ description: 'State mismatch or bad code' })
  @ApiUnauthorizedResponse({ description: 'MCOM rejected the token exchange' })
  async callback(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() body: SsoCallbackDto) {
    const storedState = getOauthStateCookie(req)
    const returnRaw = getOauthReturnCookie(req)
    clearOauthStateCookie(res)
    clearOauthReturnCookie(res)

    if (!storedState || !body.state || !safeStateEqual(storedState, body.state)) {
      throw new BadRequestException('OAuth state mismatch — possible CSRF attempt')
    }

    const { accessToken, refreshToken, expiresIn, user, entitlement } = await this.mcomService.exchangeCode(body.code)

    // ── Unified entitlement policy ──
    // Normal platforms allow sign-in without access so the user can reach the
    // in-app purchase gate; the dashboard stays locked by RequireVcardAccess.
    // White-label platforms are grant-only and deny sign-in without a grant.
    this.assertEntitled(user, entitlement)

    const result = await this.authService.mcomProvisionAndIssue(
      user,
      accessToken,
      refreshToken,
      {
        userAgent: req.get('user-agent'),
        ip: req.ip,
      },
      expiresIn,
      entitlement,
    )

    setRefreshTokenCookie(res, result.refreshToken, this.authService.refreshTokenTtl())

    // Rebuild the post-login destination from the invite context (if any).
    let returnTo = '/b/dashboard'
    if (returnRaw) {
      try {
        const { card, business, redirect } = JSON.parse(returnRaw) as {
          card?: string
          business?: string
          redirect?: string
        }
        if (safeReturnPath(redirect)) {
          returnTo = redirect as string
        } else if (card) {
          returnTo = business
            ? `/c/setup?card=${encodeURIComponent(card)}&business=${encodeURIComponent(business)}`
            : `/c/setup?card=${encodeURIComponent(card)}`
        }
      } catch {
        // malformed return cookie — fall back to the default destination
      }
    }

    return ApiResponse.success(
      {
        token: result.accessToken,
        refresh_token: result.refreshToken,
        user: result.user,
        return_to: returnTo,
        entitlement,
      },
      'Central Hub Solution login successful',
      200,
    )
  }

  /**
   * Central entitlement policy for sign-in.
   *
   * Normal (non-white-label) platforms allow sign-in without an active plan,
   * membership or trial so the user can be taken to the purchase gate. The
   * dashboard itself is still protected by RequireVcardAccess, and the package
   * purchase endpoints only require a local session — so a user with no access
   * can choose a VCard plan or buy a Central membership.
   *
   * White-label platforms remain grant-only: no session is issued unless the
   * business has an explicit white-label grant.
   */
  private assertEntitled(
    user: { profileType?: string },
    entitlement: McomEntitlement | null,
  ): void {
    if (!entitlement) return

    const access = entitlement.access
    const whitelabel = entitlement.whitelabel
    const isWhitelabel = whitelabel?.enabled === true

    if (!isWhitelabel) {
      if (access?.hasAccess === false) {
        // Not an error: the user is allowed to sign in and choose a plan.
        console.warn(
          `[MCOM SSO] No platform access for ${user.profileType ?? 'user'} (${access.reason ?? 'ACCESS_DENIED'}) — routing to purchase gate`,
        )
      }
      return
    }

    if (access?.hasAccess === false) {
      const reason = access.reason || 'ACCESS_DENIED'
      console.warn(`[MCOM SSO] White-label access denied for ${user.profileType ?? 'user'}: ${reason}`)

      throw new ForbiddenException({
        message:
          reason === 'WHITELABEL_BUSINESS_ONLY'
            ? 'White-label access is available to business accounts only'
            : 'White-label access has not been granted for this business',
        error: reason,
        reason,
      })
    }

    // White-label admission gate (grant-only, business-only). This platform is
    // not white-label today, but the contract is honoured if Central enables it.
    const granted =
      user.profileType === 'BUSINESS' &&
      access?.accessType === 'WHITELABEL' &&
      whitelabel?.granted === true

    if (!granted) {
      throw new ForbiddenException({
        message: 'White-label access has not been granted for this business',
        error: 'WHITELABEL_ACCESS_DENIED',
        reason: 'WHITELABEL_ACCESS_DENIED',
      })
    }
  }

  /**
   * Refresh the stored MCOM access token via /api/v1/auth/sso/token/refresh and
   * resynchronize the profile/permissions from Central.
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh MCOM session', description: 'Refreshes the Central access token and syncs fresh profile/permissions.' })
  @ApiOkResponse({ description: 'Refreshed user profile' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid token or MCOM rejection' })
  async refresh(@CurrentUser() current: UserResponseDto) {
    const profile = await this.getFreshCentralProfile(current.id)
    return ApiResponse.success({ user: profile }, 'MCOM session refreshed', 200)
  }

  /**
   * Current platform access status. Cached by default; pass `?sync=1` to pull a
   * freshly synchronized profile from Central first.
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'MCOM access status', description: 'Returns canAccess_vcard + membership state. ?sync=1 forces a fresh sync from Central.' })
  @ApiOkResponse({ description: 'Access status' })
  async status(@CurrentUser() current: UserResponseDto, @Query('sync') sync?: string) {
    let payload: Record<string, unknown>
    if (sync === '1') {
      const profile = await this.getFreshCentralProfile(current.id)
      payload = this.statusPayload(profile)
    } else {
      payload = this.statusPayload(current)
    }

    const activePlan = await this.resolveActivePlan(current.id)
    return ApiResponse.success({ ...payload, active_plan: activePlan }, 'MCOM access status', 200)
  }

  /** Public (secret-free) MCOM config for the frontend — e.g. the membership upgrade URL. */
  @Get('config')
  @HttpCode(200)
  @ApiOperation({ summary: 'Public MCOM config', description: 'Secret-free configuration the SPA needs (membership upgrade URL).' })
  @ApiOkResponse({ description: 'Public configuration' })
  getConfig() {
    const configured = this.configService.get<string>('MCOM_MEMBERSHIP_URL')
    const fallback =
      this.configService.get<string>('NODE_ENV') === 'production'
        ? this.configService.get<string>('MCOM_SOLUTIONS_URL') || ''
        : 'http://localhost:3000/dashboard/memberships'

    return ApiResponse.success({ membershipUrl: configured || fallback }, 'MCOM configuration', 200)
  }

  /**
   * Server-to-server HMAC-signed fetch of the user's calculated permissions
   * from the Central data-sharing API (demonstrates Task 6 signing scheme).
   */
  @UseGuards(JwtAuthGuard)
  @Get('data/permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'MCOM permissions via signed data-sharing API', description: 'Fetches freshly calculated permissions with an HMAC-signed server-to-server request.' })
  @ApiOkResponse({ description: 'Fresh permissions map' })
  async dataPermissions(@CurrentUser() current: UserResponseDto) {
    const dbUser = await this.usersService.findById(current.id)
    if (!dbUser?.mcomUserId) {
      throw new BadRequestException('Account is not linked to MCOM Solutions')
    }

    const permissions = await this.mcomService.fetchPermissions(dbUser.mcomUserId)
    const activePlan = await this.resolveActivePlan(current.id)

    return ApiResponse.success(
      { permissions, can_access_vcard: this.permissionFromMap(permissions), active_plan: activePlan },
      'MCOM permissions via data-sharing API',
      200,
    )
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  /**
   * Resolve the user's active Vcard plan purchased on MCOM Central back to a
   * local Plan, exposing its entitlements (quotas/featureFlags/trial) so the
   * frontend can enforce permission by plan.
   */
  private async resolveActivePlan(userId: string) {
    try {
      const dbUser = await this.usersService.findById(userId)
      if (!dbUser?.mcomUserId) return null

      const pkg = await this.mcomService.getActiveVcardPackage(dbUser.mcomUserId)
      if (!pkg?.externalPlanId) return null

      const plan = await this.plansService.findOne(pkg.externalPlanId)
      const standard = plan.variants.find((variant) => variant.key === 'standard')
      const pro = plan.variants.find((variant) => variant.key === 'pro')
      const proPlus = plan.variants.find((variant) => variant.key === 'pro_plus')

      return {
        id: plan.id,
        name: plan.name,
        level: plan.level,
        audience: plan.audience,
        status: plan.status,
        isDefault: plan.isDefault,
        trialDays: standard?.trialDays ?? undefined,
        monthlyPrice: standard ? Math.round(standard.price / 3) : undefined,
        quarterlyPrice: standard?.price,
        semiannualPrice: pro?.price,
        annualPrice: proPlus?.price,
        variants: plan.variants,
        configuration: plan.configuration ?? undefined,
        features: (plan.features ?? []).map((f) => f.text),
        expiresAt: pkg.expiresAt ?? undefined,
      }
    } catch {
      return null
    }
  }

  private permissionFromMap(permissions: Record<string, boolean>): boolean {
    return permissions[this.mcomService.platformPermissionKey] === true || hasVcardAccess(permissions)
  }

  private statusPayload(user: UserResponseDto) {
    return {
      permissions: user.permissions,
      can_access_vcard: hasVcardAccess(user.permissions),
      membership_level: user.membership_level,
      membership_status: user.membership_status,
    }
  }

  private async getFreshCentralProfile(userId: string): Promise<UserResponseDto> {
    const dbUser = await this.usersService.findById(userId)
    if (!dbUser) throw new BadRequestException('User not found')
    if (!dbUser.mcomRefreshToken) throw new BadRequestException('Account is not linked to MCOM Solutions')

    const refreshToken = decryptMcomToken(dbUser.mcomRefreshToken)
    let accessToken: string | null = dbUser.mcomAccessToken ? decryptMcomToken(dbUser.mcomAccessToken) : null

    let userInfo: McomUserInfo
    let expiresIn: number | undefined
    try {
      if (!accessToken) {
        const refreshed = await this.mcomService.refreshTokens(refreshToken)
        accessToken = refreshed.accessToken
        expiresIn = refreshed.expiresIn
      }
      userInfo = await this.mcomService.getUserInfo(accessToken)
    } catch {
      // Access token expired/invalid — rotate via the Central refresh endpoint
      const refreshed = await this.mcomService.refreshTokens(refreshToken)
      accessToken = refreshed.accessToken
      expiresIn = refreshed.expiresIn
      userInfo = await this.mcomService.getUserInfo(accessToken)
    }

    let entitlement: McomEntitlement | null = null
    try {
      entitlement = await this.mcomService.getEntitlement(accessToken)
    } catch {
      entitlement = null
    }

    return this.authService.syncMcomSession(userId, accessToken, userInfo, expiresIn, entitlement)
  }
}