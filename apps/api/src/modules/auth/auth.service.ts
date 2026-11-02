import { Injectable, BadRequestException, UnauthorizedException, Logger, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryFailedError, Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { RolesService } from '../roles/roles.service'
import { MailService } from '../mail/mail.service'
import { AffiliatesService } from '../affiliates/affiliates.service'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { generateOpaqueToken, sha256Hex } from '../../lib/utils/crypto.util'
import { encryptMcomToken } from '../../lib/utils/mcom-crypto.util'
import { User } from '../users/entities/user.entity'
import { RefreshToken } from './entities/refresh-token.entity'
import { SubscribedPlan } from '../subscriptions/entities/subscribed-plan.entity'
import { EmailVerificationService } from '../email-verification/email-verification.service'
import { type McomEntitlement, type McomUserInfo, hasVcardAccess } from '../mcom/mcom.service'

const DUMMY_PASSWORD_HASH = '$2a$10$RF/CnYUA.cgdY7yxwC5m3ejBtM4Oqnj1Ka.LUGy7j29woMBj4B2HW'

const PASSWORD_RESET_TTL = '30m'

interface TokenMeta {
  userAgent?: string | null
  ip?: string | null
}

interface PasswordResetJwt {
  sub: string
  type: 'password_reset'
}

// Re-exported for existing imports (controllers/tests) that read it from here.
export type { McomUserInfo } from '../mcom/mcom.service'

/** Identity carried by the shared-JWT Direct Dashboard Handshake (spec §3.3). */
export interface DirectHandshakeJwt {
  userId: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth')

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken) private refreshTokensRepo: Repository<RefreshToken>,
    @InjectRepository(SubscribedPlan) private subscribedPlansRepo: Repository<SubscribedPlan>,
    private config: ConfigService,
    private emailVerificationService: EmailVerificationService,
    private rolesService: RolesService,
    private mailService: MailService,
    @Inject(forwardRef(() => AffiliatesService)) private affiliatesService: AffiliatesService,
  ) {}


  async register(email: string, password: string, firstName?: string, lastName?: string, referralCode?: string, meta?: TokenMeta) {
    email = email.trim().toLowerCase()

    const existing = await this.usersService.findByEmail(email)
    if (existing) throw new BadRequestException('Email already in use')

    const hashed = await bcrypt.hash(password, 10)

    try {
      const saved = await this.usersService.create({ email, passwordHash: hashed, firstName, lastName })

      // The server assigns roles; clients cannot submit a role during registration.
      await this.rolesService.ensureDefaultRole()
      await this.rolesService.assignDefaultRole(saved.id)

      // Deterministic referral attribution (spec §39): a valid referral code at
      // registration links the new user to the affiliate. Best-effort — a stale
      // or invalid code must not block account creation.
      if (referralCode) {
        try {
          await this.affiliatesService.recordReferral(referralCode, saved.id)
        } catch (err) {
          this.logger.warn(`Referral attribution skipped for ${email}: ${err instanceof Error ? err.message : err}`)
        }
      }

      const auth = await this.issueTokens(saved.id, meta)

      // Best-effort: a failed verification email must not block registration
      await this.emailVerificationService.sendVerificationLink(saved)

      return ApiResponse.success(
        { token: auth.accessToken, refresh_token: auth.refreshToken, user: UserResponseDto.fromEntity(saved) },
        'Registration successful',
        201,
      )
    } catch (err) {
      // Concurrent registration with the same email hits the DB unique constraint
      if (this.isUniqueViolation(err)) throw new BadRequestException('Email already in use')

      throw err
    }
  }


  async login(email: string, password: string, meta?: TokenMeta) {
    email = email.trim().toLowerCase()

    const user = await this.usersService.findByEmail(email)

    // Run a dummy compare when the user is missing so response timing is identical
    // for "unknown email" and "wrong password" (prevents user enumeration).
    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH)
      throw new UnauthorizedException('Invalid credentials')
    }

    const ok = await bcrypt.compare(password, user.passwordHash || '')
    if (!ok) throw new UnauthorizedException('Invalid credentials')

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is deactivated')
    }

    const auth = await this.issueTokens(user.id, meta)

    return ApiResponse.success(
      { token: auth.accessToken, refresh_token: auth.refreshToken, user: UserResponseDto.fromEntity(user) },
      'Login successful',
      200,
    )
  }


  /**
   * Dedicated admin-dashboard login. It validates the same credentials as the
   * standard login, then enforces the ADMIN role before any token is issued so
   * a normal platform account can never obtain an admin session.
   */
  async adminLogin(email: string, password: string, meta?: TokenMeta) {
    email = email.trim().toLowerCase()

    const user = await this.usersService.findByEmail(email)

    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH)
      throw new UnauthorizedException('Invalid email or password')
    }

    const ok = await bcrypt.compare(password, user.passwordHash || '')
    if (!ok) throw new UnauthorizedException('Invalid email or password')

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is deactivated')
    }

    const roles = await this.rolesService.getRoleNamesForUser(user.id)
    if (!roles.includes('ADMIN')) {
      // Deliberately identical to bad credentials so the endpoint cannot be
      // used to discover which accounts hold admin privileges.
      throw new UnauthorizedException('Invalid email or password')
    }

    const auth = await this.issueTokens(user.id, meta)

    return ApiResponse.success(
      {
        token: auth.accessToken,
        refresh_token: auth.refreshToken,
        user: UserResponseDto.fromEntity(user),
        roles,
      },
      'Admin login successful',
      200,
    )
  }


  async impersonate(userId: string, meta?: TokenMeta) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new UnauthorizedException('User not found')

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is deactivated')
    }

    const auth = await this.issueTokens(user.id, meta)

    return ApiResponse.success(
      { token: auth.accessToken, refresh_token: auth.refreshToken, user: UserResponseDto.fromEntity(user) },
      'Impersonation successful',
      200,
    )
  }


  async refresh(refreshToken: string | undefined, meta?: TokenMeta, requiredRole?: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token is required')

    const stored = await this.refreshTokensRepo.findOne({ where: { tokenHash: this.hashToken(refreshToken) } })

    if (!stored) throw new UnauthorizedException('Invalid refresh token')

    // A revoked or already-rotated token being used again is a likely theft signal:
    // kill every session the user has.
    if (stored.revokedAt || stored.replacedBy) {
      await this.revokeAllForUser(stored.userId)
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      stored.revokedAt = new Date()
      await this.refreshTokensRepo.save(stored)
      throw new UnauthorizedException('Refresh token has expired')
    }

    const user = await this.usersService.findById(stored.userId)
    if (!user) throw new UnauthorizedException('Invalid refresh token')

    if (user.status !== 'active') {
      // Deactivated accounts must not keep sessions alive.
      await this.revokeAllForUser(user.id)
      throw new UnauthorizedException('Account is deactivated')
    }

    const roles = await this.rolesService.getRoleNamesForUser(user.id)

    if (requiredRole && !roles.includes(requiredRole)) {
      await this.revokeAllForUser(user.id)
      throw new UnauthorizedException('Admin privileges are required')
    }

    const accessToken = this.jwtService.sign({ user_id: user.id, roles })
    const newRefreshToken = await this.rotateRefreshToken(stored, meta)

    // A paid local VCard plan is an entitlement in its own right (partner apps
    // own their subscriptions — see the MCOM Partner Integration Guide, Part C).
    const currentUser = await this.reconcileLocalPlanAccess(user)

    return ApiResponse.success(
      { token: accessToken, refresh_token: newRefreshToken, user: UserResponseDto.fromEntity(currentUser) },
      'Token refreshed',
      200,
    )
  }


  async logout(refreshToken?: string) {
    if (refreshToken) {
      const stored = await this.refreshTokensRepo.findOne({ where: { tokenHash: this.hashToken(refreshToken) } })

      if (stored && !stored.revokedAt) {
        stored.revokedAt = new Date()
        await this.refreshTokensRepo.save(stored)
      }
    }

    return ApiResponse.message('Logged out', 200)
  }


  // Requests a password reset link. Always returns the same message so the
  // response cannot be used to enumerate which emails have accounts.
  async forgotPassword(email: string) {
    email = email.trim().toLowerCase()

    const user = await this.usersService.findByEmail(email)

    if (user) {
      const token = this.jwtService.sign({ sub: user.id, type: 'password_reset' } satisfies PasswordResetJwt, {
        expiresIn: PASSWORD_RESET_TTL,
      })

      const webUrl = this.config.get('WEB_PUBLIC_URL') || 'http://localhost:3000'
      const link = `${webUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`

      try {
        await this.mailService.sendPasswordResetLink(user.email, user.firstName, link)
      } catch (err) {
        this.logger.error(`Failed to send password reset link to ${user.email}`, err instanceof Error ? err.stack : undefined)
      }
    }

    return ApiResponse.message('If an account exists for that email, a password reset link has been sent', 200)
  }


  // Resets the password using the token from the emailed link.
  async resetPassword(email: string, token: string, password: string, passwordConfirmation: string) {
    email = email.trim().toLowerCase()

    if (password !== passwordConfirmation) {
      throw new BadRequestException('Passwords do not match')
    }

    let payload: PasswordResetJwt

    try {
      payload = this.jwtService.verify(token) as PasswordResetJwt
    } catch {
      throw new BadRequestException('Invalid or expired password reset link')
    }

    if (payload.type !== 'password_reset') {
      throw new BadRequestException('Invalid or expired password reset link')
    }

    const user = await this.usersService.findById(payload.sub)
    if (!user || user.email !== email) {
      throw new BadRequestException('Invalid or expired password reset link')
    }

    const hashed = await bcrypt.hash(password, 10)

    await this.usersService.update(user.id, { passwordHash: hashed })

    // A password reset invalidates every active session.
    await this.revokeAllForUser(user.id)

    return ApiResponse.message('Password has been reset. You can now log in.', 200)
  }


  // Changes the password for an authenticated user.
  async changePassword(userId: string, currentPassword: string, newPassword: string, passwordConfirmation: string) {
    if (newPassword !== passwordConfirmation) {
      throw new BadRequestException('Passwords do not match')
    }

    const user = await this.usersService.findById(userId)
    if (!user) throw new UnauthorizedException('Authentication required')

    const ok = await bcrypt.compare(currentPassword, user.passwordHash || '')
    if (!ok) throw new BadRequestException('Current password is incorrect')

    const hashed = await bcrypt.hash(newPassword, 10)

    await this.usersService.update(user.id, { passwordHash: hashed })

    // A password change invalidates every other active session.
    await this.revokeAllForUser(user.id)

    return ApiResponse.message('Password changed successfully', 200)
  }


  // ── MCOM Solutions SSO ─────────────────────────────────────────────────────

  /**
   * Just-In-Time (JIT) user provisioning from a MCOM Central profile.
   * Upserts the local user by email, stamps the MCOM linkage/permissions, then
   * issues a local session (JWT + refresh token). Never trusts client-supplied
   * roles — the default USER role is assigned on first creation.
   */
async mcomProvisionAndIssue(
    userInfo: McomUserInfo,
    mcomAccessToken: string,
    mcomRefreshToken: string,
    meta?: TokenMeta,
    accessTokenExpiresIn?: number,
    entitlement?: McomEntitlement | null,
  ) {
    const email = userInfo.email?.trim().toLowerCase()
    if (!email) throw new BadRequestException('Central Hub Solution profile is missing an email')

    let user = await this.usersService.findByEmail(email)

    const patch: Partial<User> = {
      ...this.buildMcomIdentityPatch(userInfo, user, entitlement),
      mcomAccessToken: encryptMcomToken(mcomAccessToken),
      mcomRefreshToken: encryptMcomToken(mcomRefreshToken),
      mcomTokenExpiresAt: this.tokenExpiry(accessTokenExpiresIn),
      mcomTokensUpdatedAt: new Date(),
    }

    // Local paid plans survive a Central sync that reports no platform package.
    if (user && patch.mcomCanAccessVcard !== true) {
      patch.mcomCanAccessVcard = await this.hasActiveLocalPlan(user.id)
    }

    if (user) {
      user = (await this.usersService.update(user.id, patch)) ?? user
    } else {
      const hashed = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
      const saved = await this.usersService.create({ email, passwordHash: hashed, ...patch })

      await this.rolesService.ensureDefaultRole()
      await this.rolesService.assignDefaultRole(saved.id)
      user = saved
    }

    // Central is the source of truth for the dashboard identity. Customers get
    // the CUSTOMER role (and lose business/staff roles if they changed), which
    // is what the customer API guards enforce.
    const profileType = userInfo.profileType ?? userInfo.role
    if (profileType) {
      await this.rolesService.syncCanonicalRole(user.id, profileType)
    }

    const auth = await this.issueTokens(user.id, meta)

    return {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      user: UserResponseDto.fromEntity(user),
    }
  }

  /**
   * Persist freshly synchronized Central profile state for an MCOM-linked user
   * (used after /auth/sso/refresh and /auth/sso/status?sync=1).
   */
async syncMcomSession(
    userId: string,
    mcomAccessToken: string,
    userInfo: McomUserInfo,
    accessTokenExpiresIn?: number,
    entitlement?: McomEntitlement | null,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId)
    if (!user) throw new UnauthorizedException('Authentication required')

    const patch: Partial<User> = {
      ...this.buildMcomIdentityPatch(userInfo, user, entitlement),
      mcomAccessToken: encryptMcomToken(mcomAccessToken),
      mcomTokenExpiresAt: this.tokenExpiry(accessTokenExpiresIn),
      mcomTokensUpdatedAt: new Date(),
    }

    if (patch.mcomCanAccessVcard !== true) {
      patch.mcomCanAccessVcard = await this.hasActiveLocalPlan(user.id)
    }

    const updated = (await this.usersService.update(userId, patch)) ?? user

    const profileType = userInfo.profileType ?? userInfo.role
    if (profileType) {
      await this.rolesService.syncCanonicalRole(userId, profileType)
    }

    return UserResponseDto.fromEntity(updated)
  }

  /** True when the user has a locally paid, unexpired VCard plan. */
  private async hasActiveLocalPlan(userId: string): Promise<boolean> {
    const active = await this.subscribedPlansRepo.findOne({
      where: { userId, status: 'active' },
      order: { expiresAt: 'DESC' },
    })
    if (!active) return false
    return !active.expiresAt || active.expiresAt.getTime() > Date.now()
  }

  /**
   * Reconcile the local access flag with the paid-plan ledger.
   *
   * - An unexpired local plan grants access (even if Central reports none).
   * - Once it expires, revoke only when Central explicitly reports no access;
   *   when entitlement is unknown, keep the existing flag rather than risk
   *   locking out a Central-granted user.
   */
  private async reconcileLocalPlanAccess(user: User): Promise<User> {
    const localAccess = await this.hasActiveLocalPlan(user.id)

    if (localAccess) {
      if (user.mcomCanAccessVcard === true) return user
      return (
        (await this.usersService.update(user.id, {
          mcomCanAccessVcard: true,
          mcomMembershipStatus: 'active',
        })) ?? user
      )
    }

    const entitlement = (user.mcomEntitlement ?? null) as McomEntitlement | null
    if (entitlement?.access?.hasAccess === false && user.mcomCanAccessVcard === true) {
      return (
        (await this.usersService.update(user.id, {
          mcomCanAccessVcard: false,
          mcomMembershipStatus: 'expired',
        })) ?? user
      )
    }

    return user
  }

  /**
   * Build the local identity snapshot from Central's canonical user object.
   * Central is the source of truth: explicit `null` values clear local data,
   * while fields the response omits preserve the existing value.
   */
  private buildMcomIdentityPatch(
    userInfo: McomUserInfo,
    current: User | null,
    entitlement?: McomEntitlement | null,
  ): Partial<User> {
    const keep = <T>(incoming: T | null | undefined, existing: T | null): T | null =>
      incoming === undefined ? existing : incoming

    const business = (userInfo.businessProfile ?? null) as Record<string, unknown> | null
    const roleProfile =
      userInfo.businessProfile ??
      userInfo.customerProfile ??
      userInfo.agentProfile ??
      userInfo.consultantProfile ??
      userInfo.accountManagerProfile ??
      null

    const businessField = (key: string): string | null => {
      const value = business?.[key]
      return typeof value === 'string' && value.length > 0 ? value : null
    }

    const fullName = userInfo.fullName?.trim() || userInfo.name?.trim() || null
    const nameParts = fullName ? fullName.split(/\s+/) : []
    const firstFromFullName = nameParts[0] ?? null
    const lastFromFullName = nameParts.slice(1).join(' ') || null

    // Central's unified entitlement wins over the legacy permission map. If
    // neither is present (e.g. a transient lookup failure) keep the existing
    // local value rather than revoking access accidentally.
    const accessGranted =
      entitlement?.access?.hasAccess === true ||
      (entitlement?.access?.hasAccess !== false &&
        (hasVcardAccess(userInfo.permissions) ||
          (entitlement?.whitelabel?.enabled === true && entitlement.whitelabel?.granted === true))) ||
      (entitlement == null &&
        userInfo.permissions === undefined &&
        current?.mcomCanAccessVcard === true)

    return {
      firstName: keep(userInfo.firstName, current?.firstName ?? null) ?? firstFromFullName,
      lastName: keep(userInfo.lastName, current?.lastName ?? null) ?? lastFromFullName,
      phone: keep(userInfo.phone ?? businessField('phone'), current?.phone ?? null),
      jobTitle: keep(userInfo.jobTitle, current?.jobTitle ?? null),
      address: keep(userInfo.address ?? businessField('address'), current?.address ?? null),
      postcode: keep(userInfo.postcode ?? businessField('postcode'), current?.postcode ?? null),
      country: keep(userInfo.country ?? businessField('country'), current?.country ?? null),
      isVerified: true,
      status: 'active',
      mcomUserId: userInfo.id ?? userInfo.sub,
      mcomRole: keep(userInfo.role, current?.mcomRole ?? null),
      mcomProfileType: keep(userInfo.profileType, current?.mcomProfileType ?? null),
      isAffiliate: userInfo.isAffiliate ?? current?.isAffiliate ?? false,
      companyName: keep(userInfo.businessName ?? businessField('businessName'), current?.companyName ?? null),
      companyType: keep(businessField('businessType'), current?.companyType ?? null),
      companyIndustry: keep(businessField('industry'), current?.companyIndustry ?? null),
      companyWebsite: keep(businessField('website'), current?.companyWebsite ?? null),
      companyLogo: keep(userInfo.avatarUrl ?? businessField('logoUrl'), current?.companyLogo ?? null),
      mcomBusinessId: keep(userInfo.businessId, current?.mcomBusinessId ?? null),
      mcomMembershipLevel: keep(
        userInfo.membershipLevel ?? businessField('membershipLevel'),
        current?.mcomMembershipLevel ?? null,
      ),
      mcomMembershipTier: keep(
        userInfo.membershipTier ?? businessField('membershipTier'),
        current?.mcomMembershipTier ?? null,
      ),
      mcomMembershipStatus: keep(
        userInfo.membershipStatus ?? businessField('membershipStatus'),
        current?.mcomMembershipStatus ?? null,
      ),
      mcomCanAccessVcard: accessGranted,
      mcomProfile: keep(roleProfile as Record<string, unknown> | null, current?.mcomProfile ?? null),
      mcomEntitlement: entitlement
        ? (entitlement as Record<string, unknown>)
        : current?.mcomEntitlement ?? null,
      mcomLastSyncAt: new Date(),
    }
  }

  private tokenExpiry(expiresIn?: number): Date | null {
    if (!expiresIn || !Number.isFinite(expiresIn) || expiresIn <= 0) return null
    return new Date(Date.now() + expiresIn * 1000)
  }

  /**
   * Just-In-Time (JIT) provisioning from the Direct Dashboard Handshake
   * (spec §3.3). MCOM Central signs a short-lived JWT with a shared secret
   * (`SSO_SECRET`) and redirects the browser here with `?token=...`. The
   * identity is upserted by email and a local session is issued.
   *
   * Unlike the OAuth flow, the handshake carries NO Central OAuth tokens, so a
   * handshake-provisioned user cannot proxy payments until they complete a
   * full SSO authorization.
   */
  async provisionFromHandshake(identity: DirectHandshakeJwt, meta?: TokenMeta) {
    const email = identity.email?.trim().toLowerCase()
    if (!email) throw new BadRequestException('MCOM handshake token is missing an email')

    let user = await this.usersService.findByEmail(email)

    const patch: Partial<User> = {
      firstName: identity.firstName ?? null,
      lastName: identity.lastName ?? null,
      isVerified: true,
      status: 'active',
      mcomUserId: identity.userId,
      mcomLastSyncAt: new Date(),
      ...(identity.role ? { mcomRole: identity.role, mcomProfileType: identity.role } : {}),
    }

    if (user) {
      user = (await this.usersService.update(user.id, patch)) ?? user
    } else {
      const hashed = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
      const saved = await this.usersService.create({ email, passwordHash: hashed, ...patch })

      await this.rolesService.ensureDefaultRole()
      await this.rolesService.assignDefaultRole(saved.id)
      user = saved
    }

    if (identity.role) {
      await this.rolesService.syncCanonicalRole(user.id, identity.role)
    }

    const auth = await this.issueTokens(user.id, meta)

    return {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      user: UserResponseDto.fromEntity(user),
    }
  }

  async issueTokens(userId: string, meta?: TokenMeta) {
    const roles = await this.rolesService.getRoleNamesForUser(userId)
    const accessToken = this.jwtService.sign({ user_id: userId, roles })
    const { token } = await this.createRefreshToken(userId, meta)

    return { accessToken, refreshToken: token }
  }


  private async createRefreshToken(userId: string, meta?: TokenMeta) {
    const token = generateOpaqueToken()

    const record = this.refreshTokensRepo.create({
      userId,
      tokenHash: this.hashToken(token),
      expiresAt: new Date(Date.now() + this.refreshTokenTtlMs()),
      userAgent: meta?.userAgent ?? null,
      ip: meta?.ip ?? null,
    })

    const saved = await this.refreshTokensRepo.save(record)

    return { id: saved.id, token }
  }


  // Revokes the current token and issues its replacement in one DB transaction.
  private async rotateRefreshToken(current: RefreshToken, meta?: TokenMeta) {
    return this.refreshTokensRepo.manager.transaction(async (manager) => {
      const token = generateOpaqueToken()

      const record = manager.create(RefreshToken, {
        userId: current.userId,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + this.refreshTokenTtlMs()),
        userAgent: meta?.userAgent ?? null,
        ip: meta?.ip ?? null,
      })

      const saved = await manager.save(record)

      current.revokedAt = new Date()
      current.replacedBy = saved.id
      await manager.save(current)

      return token
    })
  }


  private async revokeAllForUser(userId: string) {
    await this.refreshTokensRepo.update({ userId }, { revokedAt: new Date() })
  }

  // Public wrapper used by account deactivation to kill every active session.
  async revokeAllSessions(userId: string) {
    await this.revokeAllForUser(userId)
  }


  private refreshTokenTtlMs(): number {
    const raw = this.config.get('REFRESH_TOKEN_EXPIRES_IN') || '7d'
    const match = /^(\d+)(s|m|h|d)$/.exec(raw.trim())

    if (!match) return 7 * 24 * 60 * 60 * 1000

    const multiplier: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    }

    return parseInt(match[1], 10) * multiplier[match[2]]
  }

  // Public wrapper used by the controller to size the refresh-token cookie.
  refreshTokenTtl(): number {
    return this.refreshTokenTtlMs()
  }


  private hashToken(token: string): string {
    return sha256Hex(token)
  }


  private isUniqueViolation(err: unknown): boolean {
    if (err instanceof QueryFailedError) {
      const driverError = err.driverError as { code?: string } | undefined

      return driverError?.code === '23505'
    }

    return false
  }
}