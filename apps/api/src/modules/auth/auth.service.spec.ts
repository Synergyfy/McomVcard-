import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { QueryFailedError } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { AuthService } from './auth.service'
import { RefreshToken } from './entities/refresh-token.entity'
import { UsersService } from '../users/users.service'
import { RolesService } from '../roles/roles.service'
import { MailService } from '../mail/mail.service'
import { AffiliatesService } from '../affiliates/affiliates.service'
import { EmailVerificationService } from '../email-verification/email-verification.service'
import { User } from '../users/entities/user.entity'

jest.mock('bcryptjs')

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

function createMockRepo<T = any>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    manager: {
      transaction: jest.fn(),
    } as any,
  }
}

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'test@example.com',
    passwordHash: 'hashed-pw',
    firstName: 'John',
    lastName: 'Doe',
    phone: null,
    status: 'active',
    isVerified: false,
    emailVerifiedAt: null,
    language: 'en',
    themeMode: 'light',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as User
}

describe('AuthService', () => {
  let service: AuthService
  let usersService: { findByEmail: jest.Mock; findById: jest.Mock; create: jest.Mock; update: jest.Mock }
  let jwtService: { sign: jest.Mock; verify: jest.Mock }
  let refreshTokensRepo: MockRepo<RefreshToken>
  let rolesService: { ensureDefaultRole: jest.Mock; assignDefaultRole: jest.Mock; getRoleNamesForUser: jest.Mock }
  let mailService: { sendPasswordResetLink: jest.Mock }
  let affiliatesService: { recordReferral: jest.Mock }
  let emailVerificationService: { sendVerificationLink: jest.Mock }
  let configService: { get: jest.Mock }

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }
    jwtService = { sign: jest.fn().mockReturnValue('jwt-token'), verify: jest.fn() }
    refreshTokensRepo = createMockRepo<RefreshToken>()
    rolesService = {
      ensureDefaultRole: jest.fn().mockResolvedValue(undefined),
      assignDefaultRole: jest.fn().mockResolvedValue(undefined),
      getRoleNamesForUser: jest.fn().mockResolvedValue(['user']),
    }
    mailService = { sendPasswordResetLink: jest.fn().mockResolvedValue(undefined) }
    affiliatesService = { recordReferral: jest.fn().mockResolvedValue(undefined) }
    emailVerificationService = { sendVerificationLink: jest.fn().mockResolvedValue(undefined) }
    configService = { get: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshTokensRepo },
        { provide: ConfigService, useValue: configService },
        { provide: EmailVerificationService, useValue: emailVerificationService },
        { provide: RolesService, useValue: rolesService },
        { provide: MailService, useValue: mailService },
        { provide: AffiliatesService, useValue: affiliatesService },
      ],
    }).compile()

    service = module.get(AuthService)

    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw')
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
  })

  afterEach(() => jest.clearAllMocks())

  describe('register', () => {
    it('registers a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null)
      usersService.create.mockResolvedValue(createMockUser())
      refreshTokensRepo.create!.mockReturnValue({ id: 'rt1' })
      refreshTokensRepo.save!.mockResolvedValue({ id: 'rt1' })

      const result = await service.register('test@example.com', 'password123', 'John', 'Doe')

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(usersService.create).toHaveBeenCalled()
      expect(rolesService.ensureDefaultRole).toHaveBeenCalled()
      expect(rolesService.assignDefaultRole).toHaveBeenCalledWith('u1')
      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('throws BadRequestException for duplicate email', async () => {
      usersService.findByEmail.mockResolvedValue(createMockUser())

      await expect(service.register('test@example.com', 'password123')).rejects.toThrow(BadRequestException)
    })

    it('throws BadRequestException on unique constraint violation', async () => {
      usersService.findByEmail.mockResolvedValue(null)
      const queryError = new QueryFailedError('INSERT', [], { code: '23505' } as any)
      usersService.create.mockRejectedValue(queryError)

      await expect(service.register('test@example.com', 'pw')).rejects.toThrow(BadRequestException)
    })

    it('records referral when referralCode is provided', async () => {
      usersService.findByEmail.mockResolvedValue(null)
      usersService.create.mockResolvedValue(createMockUser())
      refreshTokensRepo.create!.mockReturnValue({ id: 'rt1' })
      refreshTokensRepo.save!.mockResolvedValue({ id: 'rt1' })

      await service.register('test@example.com', 'pw', undefined, undefined, 'ref-123')

      expect(affiliatesService.recordReferral).toHaveBeenCalledWith('ref-123', 'u1')
    })

    it('does not block registration when referral recording fails', async () => {
      usersService.findByEmail.mockResolvedValue(null)
      usersService.create.mockResolvedValue(createMockUser())
      refreshTokensRepo.create!.mockReturnValue({ id: 'rt1' })
      refreshTokensRepo.save!.mockResolvedValue({ id: 'rt1' })
      affiliatesService.recordReferral.mockRejectedValue(new Error('bad code'))

      const result = await service.register('test@example.com', 'pw', undefined, undefined, 'bad')

      expect(result.success).toBe(true)
    })
  })

  describe('login', () => {
    it('logs in with valid credentials', async () => {
      const user = createMockUser()
      usersService.findByEmail.mockResolvedValue(user)
      refreshTokensRepo.create!.mockReturnValue({ id: 'rt1' })
      refreshTokensRepo.save!.mockResolvedValue({ id: 'rt1' })

      const result = await service.login('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
    })

    it('throws UnauthorizedException for unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null)

      await expect(service.login('unknown@example.com', 'pw')).rejects.toThrow(UnauthorizedException)
    })

    it('throws UnauthorizedException for wrong password', async () => {
      const user = createMockUser()
      usersService.findByEmail.mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(UnauthorizedException)
    })

    it('throws UnauthorizedException for deactivated account', async () => {
      const user = createMockUser({ status: 'deactivated' })
      usersService.findByEmail.mockResolvedValue(user)

      await expect(service.login('test@example.com', 'pw')).rejects.toThrow(UnauthorizedException)
    })

    it('normalizes email to lowercase and trims', async () => {
      usersService.findByEmail.mockResolvedValue(null)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      try {
        await service.login('  TEST@Example.COM  ', 'pw')
      } catch {
        // Expected UnauthorizedException since user doesn't exist
      }

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com')
    })
  })

  describe('refresh', () => {
    it('throws UnauthorizedException when token is undefined', async () => {
      await expect(service.refresh(undefined)).rejects.toThrow(UnauthorizedException)
    })

    it('throws UnauthorizedException for invalid token', async () => {
      refreshTokensRepo.findOne!.mockResolvedValue(null)

      await expect(service.refresh('invalid-token')).rejects.toThrow(UnauthorizedException)
    })

    it('revokes all sessions when token is already revoked', async () => {
      const stored = { id: 'rt1', userId: 'u1', revokedAt: new Date(), replacedBy: null, expiresAt: new Date(Date.now() + 100000) }
      refreshTokensRepo.findOne!.mockResolvedValue(stored)
      refreshTokensRepo.update!.mockResolvedValue(undefined)

      await expect(service.refresh('revoked-token')).rejects.toThrow(UnauthorizedException)
      expect(refreshTokensRepo.update).toHaveBeenCalledWith(
        { userId: 'u1' },
        { revokedAt: expect.any(Date) },
      )
    })

    it('throws UnauthorizedException for expired token', async () => {
      const stored = { id: 'rt1', userId: 'u1', revokedAt: null, replacedBy: null, expiresAt: new Date('2020-01-01') }
      refreshTokensRepo.findOne!.mockResolvedValue(stored)
      refreshTokensRepo.save!.mockResolvedValue(stored)

      await expect(service.refresh('expired-token')).rejects.toThrow(UnauthorizedException)
    })

    it('revokes all sessions when user is deactivated', async () => {
      const futureDate = new Date(Date.now() + 100000)
      const stored = { id: 'rt1', userId: 'u1', revokedAt: null, replacedBy: null, expiresAt: futureDate }
      refreshTokensRepo.findOne!.mockResolvedValue(stored)
      usersService.findById.mockResolvedValue(createMockUser({ status: 'deactivated' }))
      refreshTokensRepo.update!.mockResolvedValue(undefined)

      await expect(service.refresh('valid-token')).rejects.toThrow(UnauthorizedException)
    })

    it('returns new tokens on successful refresh', async () => {
      const futureDate = new Date(Date.now() + 100000)
      const stored = { id: 'rt1', userId: 'u1', revokedAt: null, replacedBy: null, expiresAt: futureDate }
      const user = createMockUser()
      refreshTokensRepo.findOne!.mockResolvedValue(stored)
      usersService.findById.mockResolvedValue(user)
      const mockTransaction = jest.fn(async (cb: any) => {
        const fakeManager = {
          create: jest.fn().mockReturnValue({ id: 'rt2' }),
          save: jest.fn().mockResolvedValue({ id: 'rt2' }),
        }
        return cb(fakeManager)
      })
      ;(refreshTokensRepo.manager as any).transaction = mockTransaction

      const result = await service.refresh('valid-token')

      expect(result.success).toBe(true)
    })
  })

  describe('logout', () => {
    it('revokes the refresh token if found and not already revoked', async () => {
      const stored = { id: 'rt1', revokedAt: null }
      refreshTokensRepo.findOne!.mockResolvedValue(stored)
      refreshTokensRepo.save!.mockResolvedValue({ ...stored, revokedAt: new Date() })

      const result = await service.logout('some-token')

      expect(stored.revokedAt).toBeInstanceOf(Date)
      expect(refreshTokensRepo.save).toHaveBeenCalledWith(stored)
      expect(result.message).toBe('Logged out')
    })

    it('does nothing if token not found', async () => {
      refreshTokensRepo.findOne!.mockResolvedValue(null)

      const result = await service.logout('unknown-token')

      expect(refreshTokensRepo.save).not.toHaveBeenCalled()
      expect(result.message).toBe('Logged out')
    })

    it('does nothing if token already revoked', async () => {
      const stored = { id: 'rt1', revokedAt: new Date() }
      refreshTokensRepo.findOne!.mockResolvedValue(stored)

      const result = await service.logout('revoked-token')

      expect(refreshTokensRepo.save).not.toHaveBeenCalled()
      expect(result.message).toBe('Logged out')
    })

    it('returns success even without a token', async () => {
      const result = await service.logout()

      expect(result.message).toBe('Logged out')
    })
  })

  describe('forgotPassword', () => {
    it('always returns the same message regardless of user existence', async () => {
      usersService.findByEmail.mockResolvedValue(null)

      const result = await service.forgotPassword('unknown@example.com')

      expect(result.message).toContain('If an account exists')
      expect(mailService.sendPasswordResetLink).not.toHaveBeenCalled()
    })

    it('sends reset link when user exists', async () => {
      const user = createMockUser()
      usersService.findByEmail.mockResolvedValue(user)
      jwtService.sign.mockReturnValue('reset-token')
      configService.get.mockReturnValue('http://localhost:3000')

      const result = await service.forgotPassword('test@example.com')

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'u1', type: 'password_reset' },
        { expiresIn: '30m' },
      )
      expect(mailService.sendPasswordResetLink).toHaveBeenCalled()
      expect(result.message).toContain('If an account exists')
    })

    it('does not fail if sending email fails', async () => {
      const user = createMockUser()
      usersService.findByEmail.mockResolvedValue(user)
      jwtService.sign.mockReturnValue('reset-token')
      configService.get.mockReturnValue('http://localhost:3000')
      mailService.sendPasswordResetLink.mockRejectedValue(new Error('SMTP error'))

      const result = await service.forgotPassword('test@example.com')

      expect(result.message).toContain('If an account exists')
    })
  })

  describe('resetPassword', () => {
    it('throws BadRequestException when passwords do not match', async () => {
      await expect(service.resetPassword('a@b.com', 'token', 'pw1', 'pw2')).rejects.toThrow(BadRequestException)
    })

    it('throws BadRequestException for invalid token', async () => {
      jwtService.verify.mockImplementation(() => { throw new Error('invalid') })

      await expect(service.resetPassword('a@b.com', 'bad', 'pw', 'pw')).rejects.toThrow(BadRequestException)
    })

    it('throws BadRequestException when token type is wrong', async () => {
      jwtService.verify.mockReturnValue({ sub: 'u1', type: 'not_password_reset' })

      await expect(service.resetPassword('a@b.com', 'token', 'pw', 'pw')).rejects.toThrow(BadRequestException)
    })

    it('throws BadRequestException when user not found', async () => {
      jwtService.verify.mockReturnValue({ sub: 'u1', type: 'password_reset' })
      usersService.findById.mockResolvedValue(null)

      await expect(service.resetPassword('a@b.com', 'token', 'pw', 'pw')).rejects.toThrow(BadRequestException)
    })

    it('throws BadRequestException when email does not match', async () => {
      jwtService.verify.mockReturnValue({ sub: 'u1', type: 'password_reset' })
      usersService.findById.mockResolvedValue(createMockUser({ email: 'other@example.com' }))

      await expect(service.resetPassword('a@b.com', 'token', 'pw', 'pw')).rejects.toThrow(BadRequestException)
    })

    it('resets password successfully', async () => {
      jwtService.verify.mockReturnValue({ sub: 'u1', type: 'password_reset' })
      const user = createMockUser()
      usersService.findById.mockResolvedValue(user)
      usersService.update.mockResolvedValue(user)
      refreshTokensRepo.update!.mockResolvedValue(undefined)

      const result = await service.resetPassword('test@example.com', 'token', 'newpw', 'newpw')

      expect(usersService.update).toHaveBeenCalledWith('u1', { passwordHash: 'hashed-pw' })
      expect(refreshTokensRepo.update).toHaveBeenCalledWith(
        { userId: 'u1' },
        { revokedAt: expect.any(Date) },
      )
      expect(result.message).toContain('Password has been reset')
    })
  })

  describe('changePassword', () => {
    it('throws BadRequestException when new passwords do not match', async () => {
      await expect(service.changePassword('u1', 'old', 'pw1', 'pw2')).rejects.toThrow(BadRequestException)
    })

    it('throws UnauthorizedException when user not found', async () => {
      usersService.findById.mockResolvedValue(null)

      await expect(service.changePassword('u1', 'old', 'pw', 'pw')).rejects.toThrow(UnauthorizedException)
    })

    it('throws BadRequestException when current password is wrong', async () => {
      const user = createMockUser()
      usersService.findById.mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.changePassword('u1', 'wrong', 'pw', 'pw')).rejects.toThrow(BadRequestException)
    })

    it('changes password successfully', async () => {
      const user = createMockUser()
      usersService.findById.mockResolvedValue(user)
      usersService.update.mockResolvedValue(user)
      refreshTokensRepo.update!.mockResolvedValue(undefined)

      const result = await service.changePassword('u1', 'current', 'newpw', 'newpw')

      expect(usersService.update).toHaveBeenCalledWith('u1', { passwordHash: 'hashed-pw' })
      expect(refreshTokensRepo.update).toHaveBeenCalledWith(
        { userId: 'u1' },
        { revokedAt: expect.any(Date) },
      )
      expect(result.message).toContain('Password changed successfully')
    })
  })

  describe('refreshTokenTtl', () => {
    it('parses days format', () => {
      configService.get.mockReturnValue('7d')
      expect(service.refreshTokenTtl()).toBe(7 * 86400000)
    })

    it('parses hours format', () => {
      configService.get.mockReturnValue('2h')
      expect(service.refreshTokenTtl()).toBe(2 * 3600000)
    })

    it('parses minutes format', () => {
      configService.get.mockReturnValue('30m')
      expect(service.refreshTokenTtl()).toBe(30 * 60000)
    })

    it('parses seconds format', () => {
      configService.get.mockReturnValue('60s')
      expect(service.refreshTokenTtl()).toBe(60000)
    })

    it('returns 7 days for unrecognised format', () => {
      configService.get.mockReturnValue('abc')
      expect(service.refreshTokenTtl()).toBe(7 * 86400000)
    })

    it('returns 7 days when config is empty', () => {
      configService.get.mockReturnValue('')
      expect(service.refreshTokenTtl()).toBe(7 * 86400000)
    })
  })
})
