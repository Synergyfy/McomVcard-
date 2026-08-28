import { ApiProperty } from '@nestjs/swagger'
import { User } from '../../../modules/users/entities/user.entity'

export class UserResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', description: 'UUID of the user' })
  id!: string

  @ApiProperty({ example: 'admin@example.com' })
  email!: string

  @ApiProperty({ example: 'John', nullable: true })
  first_name!: string | null

  @ApiProperty({ example: 'Doe', nullable: true })
  last_name!: string | null

  @ApiProperty({ example: '+15551234567', nullable: true })
  phone!: string | null

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ example: false })
  is_verified!: boolean

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', nullable: true })
  email_verified_at!: Date | null

  @ApiProperty({ example: 'en' })
  language!: string

  @ApiProperty({ example: 'light' })
  theme_mode!: string

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: Date

  // ── MCOM Solutions Central Hub linkage ──
  @ApiProperty({
    description: 'Dynamic platform access permissions synchronized from MCOM Central',
    example: { can_access_vcard: true },
    nullable: true,
  })
  permissions!: Record<string, boolean> | null

  @ApiProperty({ example: 'Gold', nullable: true, description: 'MCOM membership level (Central) or null for local accounts' })
  membership_level!: string | null

  @ApiProperty({ example: 'active', nullable: true, description: 'MCOM membership status (Central) or null for local accounts' })
  membership_status!: string | null

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto()

    dto.id = user.id
    dto.email = user.email
    dto.first_name = user.firstName ?? null
    dto.last_name = user.lastName ?? null
    dto.phone = user.phone ?? null
    dto.status = user.status
    dto.is_verified = user.isVerified
    dto.email_verified_at = user.emailVerifiedAt ?? null
    dto.language = user.language
    dto.theme_mode = user.themeMode
    dto.created_at = user.createdAt
    dto.updated_at = user.updatedAt
    dto.permissions = { can_access_vcard: user.mcomCanAccessVcard === true }
    dto.membership_level = user.mcomMembershipLevel ?? null
    dto.membership_status = user.mcomMembershipStatus ?? null

    return dto
  }
}