import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Card } from '../entities/card.entity'
import { CardProfile } from '../entities/card-profile.entity'
import { CardCustomization } from '../entities/card-customization.entity'
import { SocialLink } from '../entities/social-link.entity'
import { CardAccess } from '../entities/card-access.entity'
import { Template } from '../entities/template.entity'
import { TemplateField } from '../entities/template-field.entity'

export class CardProfileResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  card_id!: string

  @ApiProperty({ example: 'Jane Doe' })
  display_name!: string

  @ApiPropertyOptional({ example: 'Digital marketer & coffee lover' })
  bio!: string | null

  @ApiPropertyOptional({ example: 'Marketing Lead' })
  job_title!: string | null

  @ApiPropertyOptional({ example: 'jane@example.com' })
  email!: string | null

  @ApiPropertyOptional({ example: '+15551234567' })
  phone!: string | null

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png' })
  avatar!: string | null

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.png' })
  cover_image!: string | null

  @ApiPropertyOptional({ example: 'San Francisco, CA' })
  location!: string | null

  @ApiPropertyOptional({ example: 'https://janedoe.com' })
  website!: string | null

  static fromEntity(profile: CardProfile): CardProfileResponseDto {
    const dto = new CardProfileResponseDto()

    dto.id = profile.id
    dto.card_id = profile.cardId
    dto.display_name = profile.displayName
    dto.bio = profile.bio ?? null
    dto.job_title = profile.jobTitle ?? null
    dto.email = profile.email ?? null
    dto.phone = profile.phone ?? null
    dto.avatar = profile.avatar ?? null
    dto.cover_image = profile.coverImage ?? null
    dto.location = profile.location ?? null
    dto.website = profile.website ?? null

    return dto
  }
}

export class CardCustomizationResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  card_id!: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  logo!: string | null

  @ApiPropertyOptional({ example: 'https://cdn.example.com/hero.png' })
  hero_image!: string | null

  @ApiPropertyOptional({ example: '#0f172a' })
  primary_color!: string | null

  @ApiPropertyOptional({ example: '#f59e0b' })
  secondary_color!: string | null

  @ApiPropertyOptional({ example: 'Poppins' })
  font!: string | null

  @ApiPropertyOptional({ example: 'modern' })
  layout!: string | null

  @ApiPropertyOptional({ example: { wallet: true, rewards: false } })
  configuration!: Record<string, unknown> | null

  static fromEntity(customization: CardCustomization): CardCustomizationResponseDto {
    const dto = new CardCustomizationResponseDto()

    dto.id = customization.id
    dto.card_id = customization.cardId
    dto.logo = customization.logo ?? null
    dto.hero_image = customization.heroImage ?? null
    dto.primary_color = customization.primaryColor ?? null
    dto.secondary_color = customization.secondaryColor ?? null
    dto.font = customization.font ?? null
    dto.layout = customization.layout ?? null
    dto.configuration = customization.configuration ?? null

    return dto
  }
}

export class SocialLinkResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  card_id!: string

  @ApiProperty({ example: 'instagram' })
  platform!: string

  @ApiProperty({ example: 'https://instagram.com/janedoe' })
  url!: string

  @ApiProperty({ example: 0 })
  display_order!: number

  @ApiProperty({ example: true })
  is_active!: boolean

  static fromEntity(link: SocialLink): SocialLinkResponseDto {
    const dto = new SocialLinkResponseDto()

    dto.id = link.id
    dto.card_id = link.cardId
    dto.platform = link.platform
    dto.url = link.url
    dto.display_order = link.displayOrder
    dto.is_active = link.isActive

    return dto
  }
}

export class CardAccessResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  card_id!: string

  @ApiProperty({ example: false })
  is_enabled!: boolean

  @ApiProperty({ example: 'never' })
  access_expiry!: string

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  expires_at!: Date | null

  static fromEntity(access: CardAccess): CardAccessResponseDto {
    const dto = new CardAccessResponseDto()

    dto.id = access.id
    dto.card_id = access.cardId
    dto.is_enabled = access.isEnabled
    dto.access_expiry = access.accessExpiry
    dto.expires_at = access.expiresAt ?? null

    return dto
  }
}

export class TemplateFieldResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'display_name' })
  field_key!: string

  @ApiProperty({ example: 'Name' })
  label!: string

  @ApiProperty({ example: 'text' })
  field_type!: string

  @ApiProperty({ example: true })
  is_editable!: boolean

  @ApiProperty({ example: true })
  is_required!: boolean

  @ApiProperty({ example: 1 })
  display_order!: number

  @ApiPropertyOptional({ example: null })
  options!: Record<string, unknown> | null

  static fromEntity(field: TemplateField): TemplateFieldResponseDto {
    const dto = new TemplateFieldResponseDto()

    dto.id = field.id
    dto.field_key = field.fieldKey
    dto.label = field.label
    dto.field_type = field.fieldType
    dto.is_editable = field.isEditable
    dto.is_required = field.isRequired
    dto.display_order = field.displayOrder
    dto.options = field.options ?? null

    return dto
  }
}

export class TemplateResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'Minimal' })
  name!: string

  @ApiProperty({ example: 'minimal' })
  slug!: string

  @ApiPropertyOptional({ example: '/templates/minimal' })
  path!: string | null

  @ApiPropertyOptional({ example: null })
  preview_url!: string | null

  @ApiPropertyOptional({ example: 'Business' })
  category!: string | null

  @ApiProperty({ example: 'published' })
  status!: string

  @ApiProperty({ example: true })
  is_business!: boolean

  @ApiProperty({ example: true })
  is_consumer!: boolean

  @ApiPropertyOptional({ example: 'Inter' })
  font_family!: string | null

  @ApiPropertyOptional({ example: '#1e293b' })
  primary_color!: string | null

  @ApiPropertyOptional({ example: '#94a3b8' })
  secondary_color!: string | null

  @ApiPropertyOptional({ example: 'rounded' })
  button_style!: string | null

  @ApiPropertyOptional({ example: 'center' })
  logo_position!: string | null

  @ApiPropertyOptional({ example: 'plain' })
  bg_style!: string | null

  @ApiPropertyOptional({ example: { wallet: false, rewards: false, services: true, appointments: false } })
  sections!: Record<string, boolean> | null

  @ApiProperty({ example: 0 })
  usage!: number

  @ApiProperty({ type: [TemplateFieldResponseDto] })
  fields!: TemplateFieldResponseDto[]

  static fromEntity(template: Template): TemplateResponseDto {
    const dto = new TemplateResponseDto()

    dto.id = template.id
    dto.name = template.name
    dto.slug = template.slug
    dto.path = template.path ?? null
    dto.preview_url = template.previewUrl ?? null
    dto.category = template.category ?? null
    dto.status = template.status
    dto.is_business = template.isBusiness
    dto.is_consumer = template.isConsumer
    dto.font_family = template.fontFamily ?? null
    dto.primary_color = template.primaryColor ?? null
    dto.secondary_color = template.secondaryColor ?? null
    dto.button_style = template.buttonStyle ?? null
    dto.logo_position = template.logoPosition ?? null
    dto.bg_style = template.bgStyle ?? null
    dto.sections = template.sections ?? null
    dto.usage = template.usage
    dto.fields = (template.fields ?? []).map(TemplateFieldResponseDto.fromEntity)

    return dto
  }
}

export class CardResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  owner_id!: string

  @ApiPropertyOptional({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  business_id!: string | null

  @ApiPropertyOptional({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  template_id!: string | null

  @ApiProperty({ example: 'PERSONAL' })
  type!: string

  @ApiProperty({ example: 'jane-doe' })
  slug!: string

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiPropertyOptional({ type: CardProfileResponseDto })
  profile!: CardProfileResponseDto | null

  @ApiPropertyOptional({ type: CardCustomizationResponseDto })
  customization!: CardCustomizationResponseDto | null

  @ApiProperty({ type: [SocialLinkResponseDto] })
  social_links!: SocialLinkResponseDto[]

  @ApiPropertyOptional({ type: CardAccessResponseDto })
  access!: CardAccessResponseDto | null

  @ApiPropertyOptional({ type: TemplateResponseDto })
  template!: TemplateResponseDto | null

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(card: Card): CardResponseDto {
    const dto = new CardResponseDto()

    dto.id = card.id
    dto.owner_id = card.ownerId
    dto.business_id = card.businessId ?? null
    dto.template_id = card.templateId ?? null
    dto.type = card.type
    dto.slug = card.slug
    dto.status = card.status
    dto.profile = card.profile ? CardProfileResponseDto.fromEntity(card.profile) : null
    dto.customization = card.customization ? CardCustomizationResponseDto.fromEntity(card.customization) : null
    dto.social_links = (card.socialLinks ?? []).map(SocialLinkResponseDto.fromEntity)
    dto.access = card.access ? CardAccessResponseDto.fromEntity(card.access) : null
    dto.template = card.template ? TemplateResponseDto.fromEntity(card.template) : null
    dto.created_at = card.createdAt
    dto.updated_at = card.updatedAt

    return dto
  }
}