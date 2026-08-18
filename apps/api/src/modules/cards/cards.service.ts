import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { BusinessesService } from '../businesses/businesses.service'
import { Card } from './entities/card.entity'
import { CardProfile } from './entities/card-profile.entity'
import { CardCustomization } from './entities/card-customization.entity'
import { SocialLink } from './entities/social-link.entity'
import { CardAccess } from './entities/card-access.entity'
import { Template } from './entities/template.entity'
import { CreateCardDto } from './dto/create-card.dto'
import { UpdateCardDto } from './dto/update-card.dto'
import { CreateCardProfileDto } from './dto/create-card-profile.dto'
import { UpdateCardProfileDto } from './dto/update-card-profile.dto'
import { CreateCardCustomizationDto } from './dto/create-card-customization.dto'
import { UpdateCardCustomizationDto } from './dto/update-card-customization.dto'
import { CreateSocialLinkDto } from './dto/create-social-link.dto'
import { UpdateSocialLinkDto } from './dto/update-social-link.dto'
import { CreateCardAccessDto } from './dto/create-card-access.dto'
import { UpdateCardAccessDto } from './dto/update-card-access.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import {
  CardResponseDto,
  CardProfileResponseDto,
  CardCustomizationResponseDto,
  SocialLinkResponseDto,
  CardAccessResponseDto,
  TemplateResponseDto,
} from './dto/card-response.dto'

const CARD_RELATIONS = {
  profile: true,
  customization: true,
  socialLinks: true,
  access: true,
  template: { fields: true },
} as const

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card) private cardsRepo: Repository<Card>,
    @InjectRepository(CardProfile) private profilesRepo: Repository<CardProfile>,
    @InjectRepository(CardCustomization) private customizationsRepo: Repository<CardCustomization>,
    @InjectRepository(SocialLink) private socialLinksRepo: Repository<SocialLink>,
    @InjectRepository(CardAccess) private accessRepo: Repository<CardAccess>,
    @InjectRepository(Template) private templatesRepo: Repository<Template>,
    private readonly businessesService: BusinessesService,
  ) {}

  // --- Cards ---

  async create(ownerId: string, dto: CreateCardDto) {
    if (dto.template_id) {
      await this.assertTemplateExists(dto.template_id)
    }

    if (dto.business_id) {
      await this.businessesService.findOwned(dto.business_id, ownerId)
    }

    const slug = await this.generateUniqueSlug(dto.slug)

    const saved = await this.cardsRepo.save(
      this.cardsRepo.create({
        ownerId,
        slug,
        type: dto.type ?? 'PERSONAL',
        templateId: dto.template_id ?? null,
        businessId: dto.business_id ?? null,
        status: 'active',
      }),
    )

    return ApiResponse.success(CardResponseDto.fromEntity(await this.findOne(saved.id)), 'Card created', 201)
  }

  // Public card profile: readable by any authenticated user.
  async findOne(id: string) {
    const card = await this.cardsRepo.findOne({
      where: { id },
      relations: { ...CARD_RELATIONS },
    })

    if (!card) throw new NotFoundException('Card not found')

    return card
  }

  // Returns the card if it belongs to the given user, else 403.
  async findOwned(id: string, ownerId: string) {
    const card = await this.findOne(id)

    if (card.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have access to this card')
    }

    return card
  }

  async findBySlug(slug: string) {
    const card = await this.cardsRepo.findOne({
      where: { slug },
      relations: { ...CARD_RELATIONS },
    })

    if (!card) throw new NotFoundException('Card not found')

    return card
  }

  async listForOwner(ownerId: string) {
    const cards = await this.cardsRepo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(cards.map(CardResponseDto.fromEntity), 'Cards retrieved', 200)
  }

  async update(id: string, ownerId: string, dto: UpdateCardDto) {
    await this.findOwned(id, ownerId)

    if (dto.template_id) {
      await this.assertTemplateExists(dto.template_id)
    }

    if (dto.business_id) {
      await this.businessesService.findOwned(dto.business_id, ownerId)
    }

    const patch: Partial<Card> = {}

    if (dto.slug !== undefined) patch.slug = await this.generateUniqueSlug(dto.slug, id)
    if (dto.type !== undefined) patch.type = dto.type
    if (dto.template_id !== undefined) patch.templateId = dto.template_id
    if (dto.business_id !== undefined) patch.businessId = dto.business_id

    await this.cardsRepo.update({ id }, patch)

    return ApiResponse.success(CardResponseDto.fromEntity(await this.findOne(id)), 'Card updated', 200)
  }

  async remove(id: string, ownerId: string) {
    await this.findOwned(id, ownerId)

    await this.cardsRepo.delete({ id })

    return ApiResponse.message('Card deleted', 200)
  }

  // --- Profiles ---

  async createProfile(cardId: string, ownerId: string, dto: CreateCardProfileDto) {
    await this.findOwned(cardId, ownerId)

    const existing = await this.profilesRepo.findOneBy({ cardId })
    if (existing) throw new BadRequestException('Card profile already exists for this card')

    const saved = await this.profilesRepo.save(
      this.profilesRepo.create({
        cardId,
        displayName: dto.display_name,
        bio: dto.bio ?? null,
        jobTitle: dto.job_title ?? null,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        avatar: dto.avatar ?? null,
        coverImage: dto.cover_image ?? null,
        location: dto.location ?? null,
        website: dto.website ?? null,
      }),
    )

    return ApiResponse.success(CardProfileResponseDto.fromEntity(saved), 'Card profile created', 201)
  }

  // Public profile data: readable by any authenticated user.
  async getProfile(cardId: string) {
    const profile = await this.profilesRepo.findOne({ where: { cardId } })

    if (!profile) throw new NotFoundException('Card profile not found')

    return ApiResponse.success(CardProfileResponseDto.fromEntity(profile), 'Card profile retrieved', 200)
  }

  async updateProfileByProfile(profileId: string, ownerId: string, dto: UpdateCardProfileDto) {
    const profile = await this.findOwnedProfile(profileId, ownerId)

    const patch: Partial<CardProfile> = {}

    if (dto.display_name !== undefined) patch.displayName = dto.display_name
    if (dto.bio !== undefined) patch.bio = dto.bio
    if (dto.job_title !== undefined) patch.jobTitle = dto.job_title
    if (dto.email !== undefined) patch.email = dto.email
    if (dto.phone !== undefined) patch.phone = dto.phone
    if (dto.avatar !== undefined) patch.avatar = dto.avatar
    if (dto.cover_image !== undefined) patch.coverImage = dto.cover_image
    if (dto.location !== undefined) patch.location = dto.location
    if (dto.website !== undefined) patch.website = dto.website

    await this.profilesRepo.update({ id: profileId }, patch)

    const updated = await this.profilesRepo.findOneBy({ id: profileId })
    if (!updated) throw new NotFoundException('Card profile not found')

    return ApiResponse.success(CardProfileResponseDto.fromEntity(updated), 'Card profile updated', 200)
  }

  async removeProfileByProfile(profileId: string, ownerId: string) {
    await this.findOwnedProfile(profileId, ownerId)

    await this.profilesRepo.delete({ id: profileId })

    return ApiResponse.message('Card profile deleted', 200)
  }

  // --- Customizations ---

  async createCustomization(cardId: string, ownerId: string, dto: CreateCardCustomizationDto) {
    await this.findOwned(cardId, ownerId)

    const existing = await this.customizationsRepo.findOneBy({ cardId })
    if (existing) throw new BadRequestException('Card customization already exists for this card')

    const saved = await this.customizationsRepo.save(
      this.customizationsRepo.create({
        cardId,
        logo: dto.logo ?? null,
        heroImage: dto.hero_image ?? null,
        primaryColor: dto.primary_color ?? null,
        secondaryColor: dto.secondary_color ?? null,
        font: dto.font ?? null,
        layout: dto.layout ?? null,
        configuration: dto.configuration ?? null,
      }),
    )

    return ApiResponse.success(CardCustomizationResponseDto.fromEntity(saved), 'Card customization created', 201)
  }

  // Public customization: readable by any authenticated user.
  async getCustomization(cardId: string) {
    const customization = await this.customizationsRepo.findOne({ where: { cardId } })

    if (!customization) throw new NotFoundException('Card customization not found')

    return ApiResponse.success(CardCustomizationResponseDto.fromEntity(customization), 'Card customization retrieved', 200)
  }

  async updateCustomizationByCustomization(customizationId: string, ownerId: string, dto: UpdateCardCustomizationDto) {
    await this.findOwnedCustomization(customizationId, ownerId)

    const patch: Partial<CardCustomization> = {}

    if (dto.logo !== undefined) patch.logo = dto.logo
    if (dto.hero_image !== undefined) patch.heroImage = dto.hero_image
    if (dto.primary_color !== undefined) patch.primaryColor = dto.primary_color
    if (dto.secondary_color !== undefined) patch.secondaryColor = dto.secondary_color
    if (dto.font !== undefined) patch.font = dto.font
    if (dto.layout !== undefined) patch.layout = dto.layout
    if (dto.configuration !== undefined) patch.configuration = dto.configuration

    await this.customizationsRepo.update({ id: customizationId }, patch)

    const updated = await this.customizationsRepo.findOneBy({ id: customizationId })
    if (!updated) throw new NotFoundException('Card customization not found')

    return ApiResponse.success(CardCustomizationResponseDto.fromEntity(updated), 'Card customization updated', 200)
  }

  async removeCustomizationByCustomization(customizationId: string, ownerId: string) {
    await this.findOwnedCustomization(customizationId, ownerId)

    await this.customizationsRepo.delete({ id: customizationId })

    return ApiResponse.message('Card customization deleted', 200)
  }

  // --- Social links ---

  async createSocialLink(cardId: string, ownerId: string, dto: CreateSocialLinkDto) {
    await this.findOwned(cardId, ownerId)

    const saved = await this.socialLinksRepo.save(
      this.socialLinksRepo.create({
        cardId,
        platform: dto.platform,
        url: dto.url,
        displayOrder: dto.display_order ?? 0,
        isActive: dto.is_active ?? true,
      }),
    )

    return ApiResponse.success(SocialLinkResponseDto.fromEntity(saved), 'Social link created', 201)
  }

  // Public social links: readable by any authenticated user.
  async listSocialLinks(cardId: string) {
    const links = await this.socialLinksRepo.find({
      where: { cardId },
      order: { displayOrder: 'ASC' },
    })

    return ApiResponse.success(links.map(SocialLinkResponseDto.fromEntity), 'Social links retrieved', 200)
  }

  async updateSocialLinkByLink(linkId: string, ownerId: string, dto: UpdateSocialLinkDto) {
    await this.findOwnedSocialLink(linkId, ownerId)

    const patch: Partial<SocialLink> = {}

    if (dto.platform !== undefined) patch.platform = dto.platform
    if (dto.url !== undefined) patch.url = dto.url
    if (dto.display_order !== undefined) patch.displayOrder = dto.display_order
    if (dto.is_active !== undefined) patch.isActive = dto.is_active

    await this.socialLinksRepo.update({ id: linkId }, patch)

    const updated = await this.socialLinksRepo.findOneBy({ id: linkId })
    if (!updated) throw new NotFoundException('Social link not found')

    return ApiResponse.success(SocialLinkResponseDto.fromEntity(updated), 'Social link updated', 200)
  }

  async removeSocialLinkByLink(linkId: string, ownerId: string) {
    await this.findOwnedSocialLink(linkId, ownerId)

    await this.socialLinksRepo.delete({ id: linkId })

    return ApiResponse.message('Social link deleted', 200)
  }

  // --- Card access ---

  async createAccess(cardId: string, ownerId: string, dto: CreateCardAccessDto) {
    await this.findOwned(cardId, ownerId)

    const existing = await this.accessRepo.findOneBy({ cardId })
    if (existing) throw new BadRequestException('Card access already exists for this card')

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null
    const expiresAt = this.resolveExpiresAt(dto.access_expiry, dto.expires_at)

    const saved = await this.accessRepo.save(
      this.accessRepo.create({
        cardId,
        isEnabled: dto.is_enabled ?? false,
        passwordHash,
        protectedSections: dto.protected_sections ?? null,
        accessExpiry: dto.access_expiry ?? 'never',
        expiresAt,
      }),
    )

    return ApiResponse.success(CardAccessResponseDto.fromEntity(saved), 'Card access created', 201)
  }

  async getAccess(cardId: string) {
    const access = await this.accessRepo.findOne({ where: { cardId } })

    if (!access) throw new NotFoundException('Card access not found')

    return ApiResponse.success(CardAccessResponseDto.fromEntity(access), 'Card access retrieved', 200)
  }

  async updateAccessByAccess(accessId: string, ownerId: string, dto: UpdateCardAccessDto) {
    await this.findOwnedAccess(accessId, ownerId)

    const patch: Partial<CardAccess> = {}

    if (dto.is_enabled !== undefined) patch.isEnabled = dto.is_enabled
    if (dto.password !== undefined) patch.passwordHash = await bcrypt.hash(dto.password, 10)
    if (dto.protected_sections !== undefined) patch.protectedSections = dto.protected_sections
    if (dto.access_expiry !== undefined) patch.accessExpiry = dto.access_expiry
    if (dto.expires_at !== undefined) patch.expiresAt = this.resolveExpiresAt(dto.access_expiry ?? 'never', dto.expires_at)

    await this.accessRepo.update({ id: accessId }, patch)

    const updated = await this.accessRepo.findOneBy({ id: accessId })
    if (!updated) throw new NotFoundException('Card access not found')

    return ApiResponse.success(CardAccessResponseDto.fromEntity(updated), 'Card access updated', 200)
  }

  async removeAccessByAccess(accessId: string, ownerId: string) {
    await this.findOwnedAccess(accessId, ownerId)

    await this.accessRepo.delete({ id: accessId })

    return ApiResponse.message('Card access deleted', 200)
  }

  // --- Templates (system-defined, read-only) ---

  async listTemplates() {
    const templates = await this.templatesRepo.find({
      where: { status: 'published' },
      order: { name: 'ASC' },
      relations: { fields: true },
    })

    return ApiResponse.success(templates.map(TemplateResponseDto.fromEntity), 'Templates retrieved', 200)
  }

  async findTemplate(id: string) {
    const template = await this.templatesRepo.findOne({
      where: { id },
      relations: { fields: true },
    })

    if (!template) throw new NotFoundException('Template not found')

    return ApiResponse.success(TemplateResponseDto.fromEntity(template), 'Template retrieved', 200)
  }

  // --- Helpers ---

  // Uses a user-supplied slug or generates a random one, ensuring uniqueness.
  private async generateUniqueSlug(slug: string | undefined, excludeId?: string): Promise<string> {
    const base = slug ?? randomBytes(4).toString('hex')
    let candidate = base
    let suffix = 2

    const isTaken = async (s: string): Promise<boolean> => {
      const found = await this.cardsRepo.findOne({ where: { slug: s } })

      return found !== null && found.id !== excludeId
    }

    while (await isTaken(candidate)) {
      candidate = `${base}-${suffix}`
      suffix += 1
    }

    return candidate
  }

  // Rejects a template UUID that does not exist before a FK insert/update fails.
  private async assertTemplateExists(templateId: string) {
    const template = await this.templatesRepo.findOneBy({ id: templateId })

    if (!template) {
      throw new BadRequestException('Template not found')
    }
  }

  // Resolves expires_at from the access_expiry policy; rejects "until" without a date.
  private resolveExpiresAt(accessExpiry: string | undefined, expiresAt: string | undefined): Date | null {
    if (accessExpiry === 'until' && !expiresAt) {
      throw new BadRequestException('expires_at is required when access_expiry is "until"')
    }

    if (expiresAt) return new Date(expiresAt)

    return null
  }

  private async findOwnedProfile(profileId: string, ownerId: string) {
    const profile = await this.profilesRepo.findOne({ where: { id: profileId } })
    if (!profile) throw new NotFoundException('Card profile not found')

    await this.findOwned(profile.cardId, ownerId)

    return profile
  }

  private async findOwnedCustomization(customizationId: string, ownerId: string) {
    const customization = await this.customizationsRepo.findOne({ where: { id: customizationId } })
    if (!customization) throw new NotFoundException('Card customization not found')

    await this.findOwned(customization.cardId, ownerId)

    return customization
  }

  private async findOwnedSocialLink(linkId: string, ownerId: string) {
    const link = await this.socialLinksRepo.findOne({ where: { id: linkId } })
    if (!link) throw new NotFoundException('Social link not found')

    await this.findOwned(link.cardId, ownerId)

    return link
  }

  private async findOwnedAccess(accessId: string, ownerId: string) {
    const access = await this.accessRepo.findOne({ where: { id: accessId } })
    if (!access) throw new NotFoundException('Card access not found')

    await this.findOwned(access.cardId, ownerId)

    return access
  }
}