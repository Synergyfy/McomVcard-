import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Card } from '../entities/card.entity'
import { CardProfile } from '../entities/card-profile.entity'
import { CardCustomization } from '../entities/card-customization.entity'
import { SocialLink } from '../entities/social-link.entity'
import { CardAccess } from '../entities/card-access.entity'
import { CardSection } from '../entities/card-section.entity'
import { CardCentreControl } from '../entities/card-centre-control.entity'
import { Template } from '../entities/template.entity'
import { TemplateField } from '../entities/template-field.entity'
import { CardSectionResponseDto } from './card-section-response.dto'
import { CardCentreControlResponseDto } from './card-centre-control-response.dto'

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
  @ApiProperty() id!: string
  @ApiProperty() card_id!: string
  @ApiPropertyOptional() logo!: string | null
  @ApiPropertyOptional() hero_image!: string | null
  @ApiPropertyOptional() primary_color!: string | null
  @ApiPropertyOptional() secondary_color!: string | null
  @ApiPropertyOptional() font!: string | null
  @ApiPropertyOptional() layout!: string | null
  @ApiPropertyOptional() configuration!: Record<string, unknown> | null

  static fromEntity(c: CardCustomization): CardCustomizationResponseDto {
    const dto = new CardCustomizationResponseDto()
    dto.id = c.id
    dto.card_id = c.cardId
    dto.logo = c.logo ?? null
    dto.hero_image = c.heroImage ?? null
    dto.primary_color = c.primaryColor ?? null
    dto.secondary_color = c.secondaryColor ?? null
    dto.font = c.font ?? null
    dto.layout = c.layout ?? null
    dto.configuration = c.configuration ?? null
    return dto
  }
}

export class SocialLinkResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() card_id!: string
  @ApiProperty() platform!: string
  @ApiProperty() url!: string
  @ApiProperty() display_order!: number
  @ApiProperty() is_active!: boolean

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
  @ApiProperty() id!: string
  @ApiProperty() card_id!: string
  @ApiProperty() is_enabled!: boolean
  @ApiPropertyOptional() hint!: string | null
  @ApiPropertyOptional() protected_section_ids!: string[] | null
  @ApiProperty() access_expiry!: string
  @ApiPropertyOptional() expires_at!: Date | null

  static fromEntity(access: CardAccess): CardAccessResponseDto {
    const dto = new CardAccessResponseDto()
    dto.id = access.id
    dto.card_id = access.cardId
    dto.is_enabled = access.isEnabled
    dto.hint = access.hint ?? null
    dto.protected_section_ids = access.protectedSectionIds ?? null
    dto.access_expiry = access.accessExpiry
    dto.expires_at = access.expiresAt ?? null
    return dto
  }
}

export class TemplateFieldResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() field_key!: string
  @ApiProperty() label!: string
  @ApiProperty() field_type!: string
  @ApiProperty() is_editable!: boolean
  @ApiProperty() is_required!: boolean
  @ApiProperty() display_order!: number
  @ApiPropertyOptional() options!: Record<string, unknown> | null

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
  @ApiProperty() id!: string
  @ApiProperty() name!: string
  @ApiProperty() slug!: string
  @ApiPropertyOptional() path!: string | null
  @ApiPropertyOptional() preview_url!: string | null
  @ApiPropertyOptional() category!: string | null
  @ApiProperty() status!: string
  @ApiProperty() is_business!: boolean
  @ApiProperty() is_consumer!: boolean
  @ApiPropertyOptional() font_family!: string | null
  @ApiPropertyOptional() primary_color!: string | null
  @ApiPropertyOptional() secondary_color!: string | null
  @ApiPropertyOptional() button_style!: string | null
  @ApiPropertyOptional() logo_position!: string | null
  @ApiPropertyOptional() bg_style!: string | null
  @ApiPropertyOptional() sections!: Record<string, boolean> | null
  @ApiProperty() usage!: number
  @ApiProperty({ type: [TemplateFieldResponseDto] }) fields!: TemplateFieldResponseDto[]

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
  @ApiProperty() id!: string
  @ApiProperty() owner_id!: string
  @ApiPropertyOptional() business_id!: string | null
  @ApiPropertyOptional() template_id!: string | null
  @ApiProperty() type!: string
  @ApiProperty() slug!: string
  @ApiProperty() status!: string
  @ApiPropertyOptional() name!: string | null
  @ApiPropertyOptional() description!: string | null
  @ApiPropertyOptional() category!: string | null
  @ApiPropertyOptional() url_slug!: string | null
  @ApiProperty() views!: number
  @ApiProperty() scans!: number
  @ApiProperty() shares!: number
  @ApiPropertyOptional() assigned_at!: Date | null
  @ApiPropertyOptional() last_admin_update!: Date | null
  @ApiPropertyOptional({ type: CardProfileResponseDto }) profile!: CardProfileResponseDto | null
  @ApiPropertyOptional({ type: CardCustomizationResponseDto }) customization!: CardCustomizationResponseDto | null
  @ApiProperty({ type: [SocialLinkResponseDto] }) social_links!: SocialLinkResponseDto[]
  @ApiPropertyOptional({ type: CardAccessResponseDto }) access!: CardAccessResponseDto | null
  @ApiPropertyOptional({ type: TemplateResponseDto }) template!: TemplateResponseDto | null
  @ApiProperty({ type: Array }) sections!: any[]
  @ApiProperty({ type: Array }) centre_controls!: any[]
  @ApiProperty() created_at!: Date
  @ApiProperty() updated_at!: Date

  static fromEntity(card: Card): CardResponseDto {
    const dto = new CardResponseDto()
    dto.id = card.id
    dto.owner_id = card.ownerId
    dto.business_id = card.businessId ?? null
    dto.template_id = card.templateId ?? null
    dto.type = card.type
    dto.slug = card.slug
    dto.status = card.status
    dto.name = card.name ?? null
    dto.description = card.description ?? null
    dto.category = card.category ?? null
    dto.url_slug = card.urlSlug ?? null
    dto.views = card.views ?? 0
    dto.scans = card.scans ?? 0
    dto.shares = card.shares ?? 0
    dto.assigned_at = card.assignedAt ?? null
    dto.last_admin_update = card.lastAdminUpdate ?? null
    dto.profile = card.profile ? CardProfileResponseDto.fromEntity(card.profile) : null
    dto.customization = card.customization ? CardCustomizationResponseDto.fromEntity(card.customization) : null
    dto.social_links = (card.socialLinks ?? []).map(SocialLinkResponseDto.fromEntity)
    dto.access = card.access ? CardAccessResponseDto.fromEntity(card.access) : null
    dto.template = card.template ? TemplateResponseDto.fromEntity(card.template) : null
    dto.sections = (card.sections ?? []).map(CardSectionResponseDto.fromEntity)
    dto.centre_controls = (card.centreControls ?? []).map(CardCentreControlResponseDto.fromEntity)
    dto.created_at = card.createdAt
    dto.updated_at = card.updatedAt
    return dto
  }
}
