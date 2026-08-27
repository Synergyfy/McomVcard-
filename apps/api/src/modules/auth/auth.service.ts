import { Injectable, BadRequestException, UnauthorizedException, Logger, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryFailedError, Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { RolesService } from '../roles/roles.service'
import { MailService } from '../mail/mail.service'
import { AffiliatesService } from '../affiliates/affiliates.service'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { generateOpaqueToken, sha256Hex } from '../../lib/utils/crypto.util'
import { RefreshToken } from './entities/refresh-token.entity'
import { EmailVerificationService } from '../email-verification/email-verification.service'

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

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth')

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken) private refreshTokensRepo: Repository<RefreshToken>,
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


  async refresh(refreshToken: string | undefined, meta?: TokenMeta) {
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
    const accessToken = this.jwtService.sign({ user_id: user.id, roles })
    const newRefreshToken = await this.rotateRefreshToken(stored, meta)

    return ApiResponse.success(
      { token: accessToken, refresh_token: newRefreshToken, user: UserResponseDto.fromEntity(user) },
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


  private async issueTokens(userId: string, meta?: TokenMeta) {
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