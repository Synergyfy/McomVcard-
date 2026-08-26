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
import { CardSection } from './entities/card-section.entity'
import { CardCentreControl } from './entities/card-centre-control.entity'
import { Template } from './entities/template.entity'
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity'
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
import { UpsertCardSectionDto } from './dto/upsert-card-section.dto'
import { UpsertCentreControlDto } from './dto/upsert-centre-controls.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import {
  CardResponseDto,
  CardProfileResponseDto,
  CardCustomizationResponseDto,
  SocialLinkResponseDto,
  CardAccessResponseDto,
  TemplateResponseDto,
} from './dto/card-response.dto'
import { CardSectionResponseDto } from './dto/card-section-response.dto'
import { CardCentreControlResponseDto } from './dto/card-centre-control-response.dto'

const CARD_RELATIONS = {
  profile: true,
  customization: true,
  socialLinks: true,
  access: true,
  sections: true,
  centreControls: true,
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
    @InjectRepository(CardSection) private sectionsRepo: Repository<CardSection>,
    @InjectRepository(CardCentreControl) private centreControlsRepo: Repository<CardCentreControl>,
    @InjectRepository(Template) private templatesRepo: Repository<Template>,
    @InjectRepository(AnalyticsEvent) private analyticsRepo: Repository<AnalyticsEvent>,
    private readonly businessesService: BusinessesService,
  ) {}

  // --- Cards ---

  async create(ownerId: string, dto: CreateCardDto) {
    if (dto.template_id) await this.assertTemplateExists(dto.template_id)
    if (dto.business_id) await this.businessesService.findOwned(dto.business_id, ownerId)

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

  async findOne(id: string) {
    const card = await this.cardsRepo.findOne({ where: { id }, relations: { ...CARD_RELATIONS } })
    if (!card) throw new NotFoundException('Card not found')
    return card
  }

  async findOwned(id: string, ownerId: string) {
    const card = await this.findOne(id)
    if (card.ownerId !== ownerId) throw new ForbiddenException('You do not have access to this card')
    return card
  }

  async findBySlug(slug: string) {
    const card = await this.cardsRepo.findOne({ where: { slug }, relations: { ...CARD_RELATIONS } })
    if (!card) throw new NotFoundException('Card not found')
    return card
  }

  async listForOwner(ownerId: string) {
    const cards = await this.cardsRepo.find({ where: { ownerId }, order: { createdAt: 'DESC' } })
    return ApiResponse.success(cards.map(CardResponseDto.fromEntity), 'Cards retrieved', 200)
  }

  async listForBusiness(businessId: string, ownerId: string) {
    await this.businessesService.findOwned(businessId, ownerId)
    const cards = await this.cardsRepo.find({ where: { businessId }, order: { createdAt: 'DESC' }, relations: { ...CARD_RELATIONS } })
    return ApiResponse.success(cards.map(CardResponseDto.fromEntity), 'Business cards retrieved', 200)
  }

  async update(id: string, ownerId: string, dto: UpdateCardDto) {
    await this.findOwned(id, ownerId)
    if (dto.template_id) await this.assertTemplateExists(dto.template_id)
    if (dto.business_id) await this.businessesService.findOwned(dto.business_id, ownerId)

    const patch: Partial<Card> = {}
    if (dto.slug !== undefined) patch.slug = await this.generateUniqueSlug(dto.slug, id)
    if (dto.type !== undefined) patch.type = dto.type
    if (dto.template_id !== undefined) patch.templateId = dto.template_id
    if (dto.business_id !== undefined) patch.businessId = dto.business_id
    if (dto.name !== undefined) patch.name = dto.name
    if (dto.description !== undefined) patch.description = dto.description
    if (dto.category !== undefined) patch.category = dto.category
    if (dto.status !== undefined) patch.status = dto.status

    await this.cardsRepo.update({ id }, patch)
    return ApiResponse.success(CardResponseDto.fromEntity(await this.findOne(id)), 'Card updated', 200)
  }

  async remove(id: string, ownerId: string) {
    await this.findOwned(id, ownerId)
    await this.cardsRepo.delete({ id })
    return ApiResponse.message('Card deleted', 200)
  }

  // --- Template Claiming ---

  async claimTemplate(ownerId: string, businessId: string, templateId: string, customSlug?: string) {
    await this.businessesService.findOwned(businessId, ownerId)
    await this.assertTemplateExists(templateId)

    const template = await this.templatesRepo.findOne({ where: { id: templateId }, relations: { fields: true } })
    if (!template) throw new NotFoundException('Template not found')
    if (template.status !== 'published') throw new BadRequestException('Template is not published')

    const slug = await this.generateUniqueSlug(customSlug ?? template.slug)

    const card = await this.cardsRepo.save(
      this.cardsRepo.create({
        ownerId,
        businessId,
        templateId,
        slug,
        type: 'BUSINESS',
        name: template.name,
        category: template.category,
        status: 'active',
        assignedAt: new Date(),
      }),
    )

    // Increment template usage
    await this.templatesRepo.increment({ id: templateId }, 'usage', 1)

    // Create default sections from template
    if (template.sections) {
      const sectionsObj = template.sections as Record<string, boolean>
      const sectionEntries = Object.entries(sectionsObj)
        .filter(([, enabled]) => enabled)
        .map(([schemaId], index) => ({
          cardId: card.id,
          schemaId,
          name: schemaId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          locked: false,
          enabled: true,
          sortOrder: index,
          content: {} as Record<string, unknown>,
        }))

      if (sectionEntries.length) {
        await this.sectionsRepo.save(sectionEntries.map(s => this.sectionsRepo.create(s)))
      }
    }

    // Create default centre controls
    const defaultCentres = ['share', 'exchange', 'redeem']
    await this.centreControlsRepo.save(
      defaultCentres.map(centreId =>
        this.centreControlsRepo.create({
          cardId: card.id,
          centreId,
          enabled: true,
          editAllowed: true,
          settings: {},
        }),
      ),
    )

    return ApiResponse.success(CardResponseDto.fromEntity(await this.findOne(card.id)), 'Template claimed', 201)
  }

  // --- Apply template to an existing card ---

  async applyTemplate(cardId: string, ownerId: string, templateId: string) {
    await this.findOwned(cardId, ownerId)
    const template = await this.templatesRepo.findOne({ where: { id: templateId } })
    if (!template) throw new NotFoundException('Template not found')
    if (template.status !== 'published') throw new BadRequestException('Template is not published')

    // Swap the linked template and mirror its identity onto the card.
    await this.cardsRepo.update({ id: cardId }, {
      templateId,
      name: template.name,
      category: template.category,
      lastAdminUpdate: new Date(),
    })

    const existing = await this.sectionsRepo.find({ where: { cardId } })
    const sectionsMap = (template.sections ?? {}) as Record<string, boolean>
    const enabledIds = Object.entries(sectionsMap).filter(([, on]) => on).map(([schemaId]) => schemaId)

    // Enable/upsert every section the template enables — saved content is kept.
    for (const [index, schemaId] of enabledIds.entries()) {
      const match = existing.find(s => s.schemaId === schemaId)
      if (match) {
        if (!match.enabled || match.sortOrder !== index) {
          await this.sectionsRepo.update({ id: match.id }, { enabled: true, sortOrder: index })
        }
      } else {
        await this.sectionsRepo.save(
          this.sectionsRepo.create({
            cardId,
            schemaId,
            name: schemaId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            locked: false,
            enabled: true,
            sortOrder: index,
            content: {} as Record<string, unknown>,
          }),
        )
      }
    }

    // Sections that are no longer part of the template are disabled, not deleted,
    // so nothing the business typed is silently destroyed.
    for (const sec of existing) {
      if (!enabledIds.includes(sec.schemaId) && sec.enabled) {
        await this.sectionsRepo.update({ id: sec.id }, { enabled: false })
      }
    }

    // Ensure the default centre controls exist (same defaults as claiming).
    const controls = await this.centreControlsRepo.find({ where: { cardId } })
    const have = new Set(controls.map(c => c.centreId))
    const missing = ['share', 'exchange', 'redeem'].filter(c => !have.has(c))
    if (missing.length) {
      await this.centreControlsRepo.save(
        missing.map(centreId =>
          this.centreControlsRepo.create({ cardId, centreId, enabled: true, editAllowed: true, settings: {} }),
        ),
      )
    }

    return ApiResponse.success(CardResponseDto.fromEntity(await this.findOne(cardId)), 'Template applied', 200)
  }

  // --- Duplicate a card ---

  async duplicate(cardId: string, ownerId: string) {
    await this.findOwned(cardId, ownerId)
    const source = await this.findOne(cardId)

    const slug = await this.generateUniqueSlug(`${source.slug}-copy`)
    const copyName = `${source.name ?? 'Card'} (Copy)`.slice(0, 200)

    const copy = await this.cardsRepo.save(
      this.cardsRepo.create({
        ownerId: source.ownerId,
        businessId: source.businessId,
        templateId: source.templateId,
        type: source.type,
        slug,
        status: 'active',
        name: copyName,
        description: source.description,
        category: source.category,
        urlSlug: null,
        assignedAt: new Date(),
        lastAdminUpdate: null,
        views: 0,
        scans: 0,
        shares: 0,
      }),
    )

    // Copy sections and centre controls. Access settings, profile,
    // customization and social links are intentionally NOT copied —
    // they are identity-specific to the original card.
    const sections = await this.sectionsRepo.find({ where: { cardId } })
    if (sections.length) {
      await this.sectionsRepo.save(
        sections.map(s =>
          this.sectionsRepo.create({
            cardId: copy.id,
            schemaId: s.schemaId,
            name: s.name,
            locked: s.locked,
            enabled: s.enabled,
            sortOrder: s.sortOrder,
            content: s.content,
          }),
        ),
      )
    }

    const controls = await this.centreControlsRepo.find({ where: { cardId } })
    if (controls.length) {
      await this.centreControlsRepo.save(
        controls.map(c =>
          this.centreControlsRepo.create({
            cardId: copy.id,
            centreId: c.centreId,
            enabled: c.enabled,
            editAllowed: c.editAllowed,
            settings: c.settings,
          }),
        ),
      )
    }

    return ApiResponse.success(CardResponseDto.fromEntity(await this.findOne(copy.id)), 'Card duplicated', 201)
  }

  // --- Card Stats ---

  async getCardStats(cardId: string) {
    const card = await this.findOne(cardId)

    const result = await this.analyticsRepo
      .createQueryBuilder('e')
      .select('e.event_type', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('e.card_id = :cardId', { cardId })
      .groupBy('e.event_type')
      .getRawMany()

    const stats: Record<string, number> = {}
    for (const row of result) {
      stats[row.eventType] = Number(row.count)
    }

    return ApiResponse.success({
      card_id: cardId,
      views: card.views ?? 0,
      scans: card.scans ?? 0,
      shares: card.shares ?? 0,
      events: stats,
    }, 'Card stats retrieved', 200)
  }

  async incrementCardStat(cardId: string, stat: 'views' | 'scans' | 'shares') {
    await this.cardsRepo.increment({ id: cardId }, stat, 1)
  }

  async trackPublicEvent(slug: string, event: 'view' | 'scan' | 'share') {
    const card = await this.cardsRepo.findOne({ where: { slug } })
    if (!card) throw new NotFoundException('Card not found')

    const stat = event === 'view' ? 'views' : event === 'scan' ? 'scans' : 'shares'
    await this.incrementCardStat(card.id, stat)

    if (card.businessId) {
      await this.analyticsRepo.save(
        this.analyticsRepo.create({
          businessId: card.businessId,
          eventType: `card_${event}`,
          cardId: card.id,
          metadata: null,
        }),
      )
    }

    return ApiResponse.success({ slug, event, tracked: true }, 'Event tracked', 200)
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

  async listSocialLinks(cardId: string) {
    const links = await this.socialLinksRepo.find({ where: { cardId }, order: { displayOrder: 'ASC' } })
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
        hint: dto.hint ?? null,
        protectedSections: dto.protected_sections ?? null,
        protectedSectionIds: dto.protected_section_ids ?? null,
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
    if (dto.hint !== undefined) patch.hint = dto.hint
    if (dto.protected_sections !== undefined) patch.protectedSections = dto.protected_sections
    if (dto.protected_section_ids !== undefined) patch.protectedSectionIds = dto.protected_section_ids
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

  // --- Sections ---

  async listSections(cardId: string) {
    const sections = await this.sectionsRepo.find({ where: { cardId }, order: { sortOrder: 'ASC' } })
    return ApiResponse.success(sections.map(CardSectionResponseDto.fromEntity), 'Sections retrieved', 200)
  }

  async upsertSections(cardId: string, ownerId: string, dtos: UpsertCardSectionDto[]) {
    await this.findOwned(cardId, ownerId)

    const results: CardSection[] = []
    for (const dto of dtos) {
      const existing = await this.sectionsRepo.findOne({ where: { cardId, schemaId: dto.schema_id } })
      if (existing) {
        const patch: Partial<CardSection> = {}
        if (dto.name !== undefined) patch.name = dto.name
        if (dto.locked !== undefined) patch.locked = dto.locked
        if (dto.enabled !== undefined) patch.enabled = dto.enabled
        if (dto.sort_order !== undefined) patch.sortOrder = dto.sort_order
        if (dto.content !== undefined) patch.content = dto.content
        await this.sectionsRepo.update({ id: existing.id }, patch)
        results.push(await this.sectionsRepo.findOneBy({ id: existing.id }) as CardSection)
      } else {
        const saved = await this.sectionsRepo.save(
          this.sectionsRepo.create({
            cardId,
            schemaId: dto.schema_id,
            name: dto.name,
            locked: dto.locked ?? false,
            enabled: dto.enabled ?? true,
            sortOrder: dto.sort_order ?? 0,
            content: dto.content ?? {},
          }),
        )
        results.push(saved)
      }
    }

    return ApiResponse.success(results.map(CardSectionResponseDto.fromEntity), 'Sections upserted', 200)
  }

  async removeSection(sectionId: string, ownerId: string) {
    const section = await this.sectionsRepo.findOne({ where: { id: sectionId } })
    if (!section) throw new NotFoundException('Section not found')
    await this.findOwned(section.cardId, ownerId)
    await this.sectionsRepo.delete({ id: sectionId })
    return ApiResponse.message('Section deleted', 200)
  }

  // --- Centre Controls ---

  async listCentreControls(cardId: string) {
    const controls = await this.centreControlsRepo.find({ where: { cardId } })
    return ApiResponse.success(controls.map(CardCentreControlResponseDto.fromEntity), 'Centre controls retrieved', 200)
  }

  async upsertCentreControls(cardId: string, ownerId: string, dtos: UpsertCentreControlDto[]) {
    await this.findOwned(cardId, ownerId)

    const results: CardCentreControl[] = []
    for (const dto of dtos) {
      const existing = await this.centreControlsRepo.findOne({ where: { cardId, centreId: dto.centre_id } })
      if (existing) {
        const patch: Partial<CardCentreControl> = {}
        if (dto.enabled !== undefined) patch.enabled = dto.enabled
        if (dto.edit_allowed !== undefined) patch.editAllowed = dto.edit_allowed
        if (dto.settings !== undefined) patch.settings = dto.settings
        await this.centreControlsRepo.update({ id: existing.id }, patch)
        results.push(await this.centreControlsRepo.findOneBy({ id: existing.id }) as CardCentreControl)
      } else {
        const saved = await this.centreControlsRepo.save(
          this.centreControlsRepo.create({
            cardId,
            centreId: dto.centre_id,
            enabled: dto.enabled ?? true,
            editAllowed: dto.edit_allowed ?? true,
            settings: dto.settings ?? {},
          }),
        )
        results.push(saved)
      }
    }

    return ApiResponse.success(results.map(CardCentreControlResponseDto.fromEntity), 'Centre controls upserted', 200)
  }

  // --- Templates (system-defined, read-only) ---

  async listTemplates() {
    const templates = await this.templatesRepo.find({ where: { status: 'published' }, order: { name: 'ASC' }, relations: { fields: true } })
    return ApiResponse.success(templates.map(TemplateResponseDto.fromEntity), 'Templates retrieved', 200)
  }

  async findTemplate(id: string) {
    const template = await this.templatesRepo.findOne({ where: { id }, relations: { fields: true } })
    if (!template) throw new NotFoundException('Template not found')
    return ApiResponse.success(TemplateResponseDto.fromEntity(template), 'Template retrieved', 200)
  }

  // --- Helpers ---

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

  private async assertTemplateExists(templateId: string) {
    const template = await this.templatesRepo.findOneBy({ id: templateId })
    if (!template) throw new BadRequestException('Template not found')
  }

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
