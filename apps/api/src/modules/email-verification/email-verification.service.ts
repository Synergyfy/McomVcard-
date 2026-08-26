import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { generateSixDigitCode, sha256Hex } from '../../lib/utils/crypto.util'
import { MailService } from '../mail/mail.service'
import { VerificationCode } from './entities/verification-code.entity'
import { User } from '../users/entities/user.entity'

const LINK_TTL = '24h'
const CODE_TTL_MS = 15 * 60 * 1000

interface EmailVerifyJwt {
  sub: string
  type: 'email_verify'
}

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger('EmailVerification')

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private config: ConfigService,
    @InjectRepository(VerificationCode) private verificationCodesRepo: Repository<VerificationCode>,
  ) {}


  // Sends a signed verification link to the user's email (dev: logged instead of sent).
  async sendVerificationLink(user: User): Promise<void> {
    const token = this.jwtService.sign({ sub: user.id, type: 'email_verify' } satisfies EmailVerifyJwt, {
      expiresIn: LINK_TTL,
    })

    const baseUrl = this.config.get('API_PUBLIC_URL') || 'http://localhost:3001/api'
    const link = `${baseUrl}/email/verify/${token}`

    try {
      await this.mailService.sendVerificationLink(user.email, user.firstName, link)
    } catch (err) {
      this.logger.error(`Failed to send verification link to ${user.email}`, err instanceof Error ? err.stack : undefined)
    }
  }


  // Sends a 6-digit one-time code (dev: logged instead of sent).
  async sendVerificationCode(user: User): Promise<void> {
    const code = generateSixDigitCode()

    await this.verificationCodesRepo.save(
      this.verificationCodesRepo.create({
        userId: user.id,
        codeHash: this.hashCode(code),
        type: 'email_verify',
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      }),
    )

    try {
      await this.mailService.sendVerificationCode(user.email, user.firstName, code)
    } catch (err) {
      this.logger.error(`Failed to send verification code to ${user.email}`, err instanceof Error ? err.stack : undefined)
    }
  }


  // Resends the verification link for an authenticated user.
  async resendLink(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new BadRequestException('User not found')
    if (user.isVerified) throw new BadRequestException('Email already verified')

    await this.sendVerificationLink(user)

    return ApiResponse.message('Verification email sent', 200)
  }


  // Sends a 6-digit code for an authenticated user.
  async resendCode(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new BadRequestException('User not found')
    if (user.isVerified) throw new BadRequestException('Email already verified')

    await this.sendVerificationCode(user)

    return ApiResponse.message('Verification code sent', 200)
  }


  // Verifies the emailed link token and marks the user verified.
  async verifyLink(token: string) {
    let payload: EmailVerifyJwt

    try {
      payload = this.jwtService.verify(token) as EmailVerifyJwt
    } catch {
      throw new BadRequestException('Invalid verification link')
    }

    if (payload.type !== 'email_verify') {
      throw new BadRequestException('Invalid verification link')
    }

    return this.markVerified(payload.sub)
  }


  // Verifies a 6-digit code owned by the authenticated user.
  async verifyCode(userId: string, code: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new BadRequestException('User not found')

    const record = await this.verificationCodesRepo.findOne({
      where: { userId, type: 'email_verify', consumedAt: IsNull() },
      order: { createdAt: 'DESC' },
    })

    if (!record || this.hashCode(code) !== record.codeHash) {
      throw new BadRequestException('Invalid verification code')
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification code has expired')
    }

    record.consumedAt = new Date()
    await this.verificationCodesRepo.save(record)

    return this.markVerified(user.id)
  }


  private async markVerified(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new BadRequestException('User not found')

    if (user.isVerified) throw new BadRequestException('Email already verified')

    await this.usersService.update(userId, { isVerified: true, emailVerifiedAt: new Date() })

    const updated = await this.usersService.findById(userId)

    return ApiResponse.success(
      updated ? { user: UserResponseDto.fromEntity(updated) } : null,
      'Email verified',
      200,
    )
  }


  private hashCode(code: string): string {
    return sha256Hex(code)
  }
}