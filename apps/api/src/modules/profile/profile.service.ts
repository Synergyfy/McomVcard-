import { Injectable, BadRequestException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { User } from '../users/entities/user.entity'
import { AuthService } from '../auth/auth.service'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdateSettingsDto } from './dto/update-settings.dto'

@Injectable()
export class ProfileService {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new BadRequestException('User not found')

    return ApiResponse.success(UserResponseDto.fromEntity(user), 'Profile retrieved', 200)
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new BadRequestException('User not found')

    const patch: Record<string, unknown> = {}

    if (dto.first_name !== undefined) patch.firstName = dto.first_name
    if (dto.last_name !== undefined) patch.lastName = dto.last_name
    if (dto.phone !== undefined) patch.phone = dto.phone

    if (dto.email !== undefined && dto.email !== user.email) {
      const taken = await this.usersService.findByEmail(dto.email)
      if (taken && taken.id !== user.id) throw new BadRequestException('Email already in use')

      patch.email = dto.email

      // A changed email must be verified again before it is trusted.
      patch.isVerified = false
      patch.emailVerifiedAt = null
    }

    const updated = await this.usersService.update(user.id, patch as Partial<User>)

    return ApiResponse.success(updated ? UserResponseDto.fromEntity(updated) : null, 'Profile updated', 200)
  }

  async getSettings(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new BadRequestException('User not found')

    return ApiResponse.success({ language: user.language, theme_mode: user.themeMode }, 'Settings retrieved', 200)
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new BadRequestException('User not found')

    const patch: Record<string, unknown> = {}

    if (dto.language !== undefined) patch.language = dto.language
    if (dto.theme_mode !== undefined) patch.themeMode = dto.theme_mode

    const updated = await this.usersService.update(user.id, patch as Partial<User>)

    return ApiResponse.success(
      updated ? { language: updated.language, theme_mode: updated.themeMode } : null,
      'Settings updated',
      200,
    )
  }

  // Soft-deactivates the account: the row is kept, every session is revoked, and
  // the user can no longer authenticate or access the application.
  async deactivate(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new BadRequestException('User not found')

    await this.usersService.update(user.id, { status: 'deactivated' })

    await this.authService.revokeAllSessions(user.id)

    return ApiResponse.message('Account deactivated', 200)
  }
}
