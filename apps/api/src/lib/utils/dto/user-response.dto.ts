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

  @ApiProperty({
    example: 'BUSINESS',
    nullable: true,
    description: 'Canonical Central Hub Solution role',
  })
  role!: string | null

  @ApiProperty({
    example: 'TRIAL_EXPIRED',
    nullable: true,
    description: 'Reason Central denied platform access (no plan/trial/membership)',
  })
  access_reason!: string | null

  @ApiProperty({
    example: 'http://localhost:3000/dashboard/memberships',
    nullable: true,
    description: 'Central Hub Solution page where the user can buy a membership',
  })
  upgrade_url!: string | null

  @ApiProperty({ example: 'BUSINESS', nullable: true, description: 'Central profile discriminator' })
  profile_type!: string | null

  @ApiProperty({ example: false, description: 'Affiliate / partner-portal account flag' })
  is_affiliate!: boolean

  @ApiProperty({ example: 'Managing Director', nullable: true })
  job_title!: string | null

  @ApiProperty({ example: '1 High Street, London', nullable: true })
  address!: string | null

  @ApiProperty({ example: 'EC1A 1BB', nullable: true })
  postcode!: string | null

  @ApiProperty({ example: 'United Kingdom', nullable: true })
  country!: string | null

  @ApiProperty({ example: 'Acme Coffee', nullable: true, description: 'Business name for BUSINESS profiles' })
  company_name!: string | null

  @ApiProperty({ example: 'Limited Company', nullable: true })
  company_type!: string | null

  @ApiProperty({ example: 'Food & Beverage', nullable: true })
  company_industry!: string | null

  @ApiProperty({ example: 'https://acmecoffee.co.uk', nullable: true })
  company_website!: string | null

  @ApiProperty({ example: 'https://cdn.mcom.com/logo.png', nullable: true })
  company_logo!: string | null

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
    dto.role = user.mcomRole ?? null

    const entitlement = (user.mcomEntitlement ?? null) as {
      access?: { reason?: string | null; upgradeUrl?: string | null; upgrade_url?: string | null }
    } | null
    dto.access_reason = entitlement?.access?.reason ?? null
    dto.upgrade_url = entitlement?.access?.upgradeUrl ?? entitlement?.access?.upgrade_url ?? null

    dto.profile_type = user.mcomProfileType ?? null
    dto.is_affiliate = user.isAffiliate === true
    dto.job_title = user.jobTitle ?? null
    dto.address = user.address ?? null
    dto.postcode = user.postcode ?? null
    dto.country = user.country ?? null
    dto.company_name = user.companyName ?? null
    dto.company_type = user.companyType ?? null
    dto.company_industry = user.companyIndustry ?? null
    dto.company_website = user.companyWebsite ?? null
    dto.company_logo = user.companyLogo ?? null

    return dto
  }
}