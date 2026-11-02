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
import { decideAccess, isDecisionExpired, type McomAccessDecision } from './access-decision'
import { AuthService, McomUserInfo } from '../auth/auth.service'
import { UsersService } from '../users/users.service'
import { PlansService } from '../plans/plans.service'
import { AccessPassesService, expiryTime } from '../access-passes/access-passes.service'
import { AccessPassResponseDto } from '../access-passes/dto/access-pass-response.dto'
import { SubscriptionsService } from '../subscriptions/subscriptions.service'
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
    private readonly accessPassesService: AccessPassesService,
    private readonly subscriptionsService: SubscriptionsService,
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
    // post-login redirect (e.g. back to /plans after a re-auth).
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
    return ApiResponse.success(
      { ...payload, active_plan: activePlan },
      'MCOM access status',
      200,
    )
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
   * Resolve the plan/pass that is granting access to VCard right now.
   *
   * Central is authoritative for membership and trial access:
   * - membership → `plan.planId` maps to a local Plan (published through the
   *   connector), with the membership's quotas/limits applied;
   * - trial → a synthetic "Programme Trial Access" plan carrying the trial
   *   countdown and programme tasks;
   * - local in-app purchases remain supported as a fallback.
   */
  private async resolveActivePlan(userId: string) {
    const dbUser = await this.usersService.findById(userId)
    const access = this.accessForUser(dbUser?.mcomAccess ?? null, dbUser?.mcomEntitlement ?? null)

    // A locally purchased VCard plan or access pass is the primary
    // entitlement. It must win even when Central also reports a
    // membership/trial, matching the CapabilitiesService resolution order used
    // for enforcement. If both exist, show whichever runs longer.
    try {
      const [local, localPass] = await Promise.all([
        this.subscriptionsService.findActiveForUser(userId),
        this.accessPassesService.findActivePurchaseForUser(userId),
      ])

      if (
        localPass &&
        (!local || expiryTime(localPass.expiresAt) > expiryTime(local.expiresAt))
      ) {
        const pass = await this.accessPassesService.findOne(localPass.accessPassId)
        return this.accessPassPayload(pass, localPass.expiresAt?.toISOString() ?? null)
      }

      if (local) {
        const plan = await this.plansService.findOne(local.planId)
        return this.planPayload(plan, local.expiresAt?.toISOString() ?? null, { source: 'local' })
      }
    } catch {
      // fall through to Central membership/trial/legacy package lookup
    }

    // A membership that bundles VCard: show the included plan, not the
    // membership bundle's marketing name.
    if (access?.allowed && access.source === 'membership') {
      const plan = await this.findPlan(access.planId, access.planName)
      if (plan) {
        return this.planPayload(plan, access.expiresAt, {
          source: 'membership',
          membershipName: access.membershipName,
          membershipLevel: access.membershipLevel,
          quotas: access.quotas,
          limits: access.limits,
          features: access.features,
        })
      }

      // The local catalogue may not contain the ID yet (e.g. an old plan was
      // renamed). Still surface the Central plan and its entitlements.
      return this.entitlementPlanPayload(access)
    }

    if (access?.allowed && access.source === 'trial') {
      return this.entitlementPlanPayload(access)
    }

    // Legacy Central package lookup (pre-entitlement integrations).
    try {
      if (!dbUser?.mcomUserId) return null

      const pkg = await this.mcomService.getActiveVcardPackage(dbUser.mcomUserId)
      if (!pkg?.externalPlanId) return null

      const plan = await this.plansService.findOne(pkg.externalPlanId)
      return this.planPayload(plan, pkg.expiresAt ?? null, { source: 'direct' })
    } catch {
      return null
    }
  }

  /** Stored decision, or derive one from the raw entitlement snapshot. */
  private accessForUser(
    stored: McomAccessDecision | null,
    entitlement: Record<string, unknown> | null,
  ): McomAccessDecision | null {
    const decision = stored ?? (entitlement ? decideAccess(entitlement as McomEntitlement) : null)
    if (!decision || !isDecisionExpired(decision)) return decision

    // Revoke locally the moment a pass/trial window ends.
    return {
      ...decision,
      allowed: false,
      reason: decision.source === 'trial' ? 'TRIAL_EXPIRED' : 'NO_ACTIVE_ENTITLEMENT',
    }
  }

  /** Resolve a Central `planId` to a local Plan, falling back to the name. */
  private async findPlan(planId: string | null, planName: string | null) {
    if (planId) {
      try {
        return await this.plansService.findOne(planId)
      } catch {
        // Not a local plan UUID — try the human-readable name below.
      }
    }

    if (!planName) return null

    try {
      const plans = await this.plansService.findAll('business')
      const target = planName.toLowerCase()
      const withoutVariant = planName.replace(/\s+(standard|pro\+?|pro)$/i, '').trim().toLowerCase()
      return (
        plans.find((candidate) => {
          const name = candidate.name?.toLowerCase()
          return name === target || (withoutVariant !== target && name === withoutVariant)
        }) ?? null
      )
    } catch {
      return null
    }
  }

  private planPayload(
    plan: Awaited<ReturnType<PlansService['findOne']>>,
    expiresAt: string | null,
    overrides?: {
      source?: string
      membershipName?: string | null
      membershipLevel?: string | null
      quotas?: Record<string, unknown>
      limits?: Record<string, unknown>
      features?: string[]
    },
  ) {
    const standard = plan.variants.find((variant) => variant.key === 'standard')
    const pro = plan.variants.find((variant) => variant.key === 'pro')
    const proPlus = plan.variants.find((variant) => variant.key === 'pro_plus')

    const localFeatures = (plan.features ?? []).map((f) => f.text)
    const features =
      overrides?.features && overrides.features.length > 0 ? overrides.features : localFeatures
    const quotas = this.nonEmpty(overrides?.quotas) ?? plan.configuration?.quotas ?? {}
    const limits = this.nonEmpty(overrides?.limits) ?? {}

    return {
      id: plan.id,
      name: plan.name,
      level: plan.level,
      audience: plan.audience,
      status: plan.status,
      isDefault: plan.isDefault,
      monthlyPrice: standard ? Math.round(standard.price / 3) : undefined,
      quarterlyPrice: standard?.price,
      semiannualPrice: pro?.price,
      annualPrice: proPlus?.price,
      variants: plan.variants,
      configuration: plan.configuration ?? undefined,
      features,
      quotas,
      limits,
      source: overrides?.source ?? 'local',
      membershipName: overrides?.membershipName ?? null,
      membershipLevel: overrides?.membershipLevel ?? null,
      expiresAt: expiresAt ?? undefined,
    }
  }

  /** Payload for a locally purchased access pass. */
  private accessPassPayload(pass: AccessPassResponseDto, expiresAt: string | null) {
    return {
      id: pass.id,
      name: pass.name,
      level: pass.name,
      audience: 'business',
      status: pass.status,
      isDefault: false,
      variants: [],
      configuration: pass.configuration ?? undefined,
      features: (pass.features ?? []).map((feature) => feature.text),
      quotas: pass.configuration?.quotas ?? {},
      limits: pass.configuration?.featureFlags ?? {},
      price: pass.price,
      durationDays: pass.durationDays,
      currency: pass.currency,
      source: 'access_pass',
      membershipName: null,
      membershipLevel: null,
      expiresAt: expiresAt ?? undefined,
    }
  }

  /** Synthetic plan payload for a Central plan/trial not stored locally. */
  private entitlementPlanPayload(access: McomAccessDecision) {
    const isTrial = access.source === 'trial'
    const quotas = access.quotas ?? {}
    const featureFlags: Record<string, boolean> = {}
    for (const [key, value] of Object.entries(access.limits ?? {})) {
      if (typeof value === 'boolean') featureFlags[key] = value
    }

    return {
      id: access.planId ?? `trial_${this.mcomService.platformSlugName}`,
      name: access.planName ?? (isTrial ? 'Programme Trial Access' : 'MCOM VCard plan'),
      level: access.membershipLevel ?? access.planName ?? null,
      audience: 'business',
      status: isTrial ? 'trial' : 'active',
      isDefault: false,
      trialDays: isTrial ? access.trialDaysRemaining : undefined,
      variants: [],
      configuration: { quotas, featureFlags },
      features: access.features ?? [],
      quotas,
      limits: access.limits ?? {},
      source: access.source,
      membershipName: access.membershipName,
      membershipLevel: access.membershipLevel,
      trialDaysRemaining: isTrial ? access.trialDaysRemaining : 0,
      trialTasks: isTrial ? access.tasks : [],
      expiresAt: access.expiresAt ?? undefined,
    }
  }

  private nonEmpty(value?: Record<string, unknown>): Record<string, unknown> | null {
    if (!value) return null
    return Object.keys(value).length > 0 ? value : null
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
      access: user.access ?? null,
      trial_tasks: user.access?.tasks ?? [],
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