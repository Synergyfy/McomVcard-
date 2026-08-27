import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { CardsService } from './cards.service'
import { Card } from './entities/card.entity'
import { CardProfile } from './entities/card-profile.entity'
import { CardCustomization } from './entities/card-customization.entity'
import { SocialLink } from './entities/social-link.entity'
import { CardAccess } from './entities/card-access.entity'
import { CardSection } from './entities/card-section.entity'
import { CardCentreControl } from './entities/card-centre-control.entity'
import { Template } from './entities/template.entity'
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity'
import { BusinessesService } from '../businesses/businesses.service'
import { CreateCardDto } from './dto/create-card.dto'
import { CreateCardProfileDto } from './dto/create-card-profile.dto'
import { CreateCardCustomizationDto } from './dto/create-card-customization.dto'
import { CreateSocialLinkDto } from './dto/create-social-link.dto'
import { CreateCardAccessDto } from './dto/create-card-access.dto'

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

function createMockRepo<T = any>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-1',
    ownerId: 'u1',
    slug: 'my-card',
    type: 'PERSONAL',
    status: 'active',
    templateId: null,
    businessId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    profile: null,
    customization: null,
    socialLinks: [],
    access: null,
    template: null,
    ...overrides,
  } as Card
}

function makeProfile(overrides: Partial<CardProfile> = {}): CardProfile {
  return {
    id: 'prof-1',
    cardId: 'card-1',
    displayName: 'Jane Doe',
    bio: null,
    jobTitle: null,
    email: null,
    phone: null,
    avatar: null,
    coverImage: null,
    location: null,
    website: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as CardProfile
}

function makeCustomization(overrides: Partial<CardCustomization> = {}): CardCustomization {
  return {
    id: 'cust-1',
    cardId: 'card-1',
    logo: null,
    heroImage: null,
    primaryColor: null,
    secondaryColor: null,
    font: null,
    layout: null,
    configuration: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as CardCustomization
}

function makeSocialLink(overrides: Partial<SocialLink> = {}): SocialLink {
  return {
    id: 'link-1',
    cardId: 'card-1',
    platform: 'instagram',
    url: 'https://instagram.com/test',
    displayOrder: 0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as SocialLink
}

function makeAccess(overrides: Partial<CardAccess> = {}): CardAccess {
  return {
    id: 'acc-1',
    cardId: 'card-1',
    isEnabled: false,
    passwordHash: null,
    protectedSections: null,
    accessExpiry: 'never',
    expiresAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as CardAccess
}

describe('CardsService', () => {
  let service: CardsService
  let cardsRepo: MockRepo<Card>
  let profilesRepo: MockRepo<CardProfile>
  let customizationsRepo: MockRepo<CardCustomization>
  let socialLinksRepo: MockRepo<SocialLink>
  let accessRepo: MockRepo<CardAccess>
  let sectionsRepo: MockRepo<CardSection>
  let centreControlsRepo: MockRepo<CardCentreControl>
  let templatesRepo: MockRepo<Template>
  let analyticsRepo: MockRepo<AnalyticsEvent>
  let businessesService: { findOwned: jest.Mock }

  beforeEach(async () => {
    cardsRepo = createMockRepo<Card>()
    profilesRepo = createMockRepo<CardProfile>()
    customizationsRepo = createMockRepo<CardCustomization>()
    socialLinksRepo = createMockRepo<SocialLink>()
    accessRepo = createMockRepo<CardAccess>()
    sectionsRepo = createMockRepo<CardSection>()
    centreControlsRepo = createMockRepo<CardCentreControl>()
    templatesRepo = createMockRepo<Template>()
    analyticsRepo = createMockRepo<AnalyticsEvent>()
    businessesService = { findOwned: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: cardsRepo },
        { provide: getRepositoryToken(CardProfile), useValue: profilesRepo },
        { provide: getRepositoryToken(CardCustomization), useValue: customizationsRepo },
        { provide: getRepositoryToken(SocialLink), useValue: socialLinksRepo },
        { provide: getRepositoryToken(CardAccess), useValue: accessRepo },
        { provide: getRepositoryToken(CardSection), useValue: sectionsRepo },
        { provide: getRepositoryToken(CardCentreControl), useValue: centreControlsRepo },
        { provide: getRepositoryToken(Template), useValue: templatesRepo },
        { provide: getRepositoryToken(AnalyticsEvent), useValue: analyticsRepo },
        { provide: BusinessesService, useValue: businessesService },
      ],
    }).compile()

    service = module.get(CardsService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('create', () => {
    it('creates a card successfully', async () => {
      const card = makeCard()
      cardsRepo.findOne!.mockResolvedValueOnce(null) // slug check
      cardsRepo.create!.mockReturnValue(card)
      cardsRepo.save!.mockResolvedValue(card)
      cardsRepo.findOne!.mockResolvedValueOnce(card) // findOne after save

      const result = await service.create('u1', { slug: 'my-card' } as CreateCardDto)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
      expect(cardsRepo.save).toHaveBeenCalled()
    })

    it('generates random slug when not provided', async () => {
      cardsRepo.findOne!.mockResolvedValueOnce(null) // slug check
      const card = makeCard()
      cardsRepo.create!.mockReturnValue(card)
      cardsRepo.save!.mockResolvedValue(card)
      cardsRepo.findOne!.mockResolvedValueOnce(card) // findOne after save

      const result = await service.create('u1', {} as CreateCardDto)

      expect(result.success).toBe(true)
    })

    it('validates template exists when template_id provided', async () => {
      templatesRepo.findOneBy!.mockResolvedValue(null)

      await expect(
        service.create('u1', { template_id: 'tpl-1' } as CreateCardDto),
      ).rejects.toThrow(BadRequestException)
    })

    it('validates business ownership when business_id provided', async () => {
      businessesService.findOwned.mockRejectedValue(new ForbiddenException())

      await expect(
        service.create('u1', { business_id: 'biz-1' } as CreateCardDto),
      ).rejects.toThrow(ForbiddenException)
    })

    it('appends numeric suffix when slug is taken', async () => {
      cardsRepo.findOne!.mockResolvedValueOnce(makeCard()) // slug taken
      cardsRepo.findOne!.mockResolvedValueOnce(null) // slug-2 available
      cardsRepo.create!.mockReturnValue(makeCard({ slug: 'my-card-2' }))
      cardsRepo.save!.mockResolvedValue(makeCard({ slug: 'my-card-2' }))
      cardsRepo.findOne!.mockResolvedValueOnce(makeCard({ slug: 'my-card-2' }))

      const result = await service.create('u1', { slug: 'my-card' } as CreateCardDto)

      expect(result.success).toBe(true)
    })
  })

  describe('findOne', () => {
    it('returns a card when found', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard())

      const result = await service.findOne('card-1')

      expect(result.id).toBe('card-1')
    })

    it('throws NotFoundException when not found', async () => {
      cardsRepo.findOne!.mockResolvedValue(null)

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findOwned', () => {
    it('returns the card when owner matches', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))

      const result = await service.findOwned('card-1', 'u1')

      expect(result.ownerId).toBe('u1')
    })

    it('throws ForbiddenException when owner does not match', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'other' }))

      await expect(service.findOwned('card-1', 'u1')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('findBySlug', () => {
    it('returns a card by slug', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ slug: 'my-card' }))

      const result = await service.findBySlug('my-card')

      expect(result.slug).toBe('my-card')
    })

    it('throws NotFoundException when slug not found', async () => {
      cardsRepo.findOne!.mockResolvedValue(null)

      await expect(service.findBySlug('missing')).rejects.toThrow(NotFoundException)
    })
  })

  describe('listForOwner', () => {
    it('returns cards for the owner', async () => {
      cardsRepo.find!.mockResolvedValue([makeCard()])

      const result = await service.listForOwner('u1')

      expect(result.success).toBe(true)
      expect(cardsRepo.find).toHaveBeenCalledWith({
        where: { ownerId: 'u1' },
        order: { createdAt: 'DESC' },
      })
    })

    it('returns empty array when no cards', async () => {
      cardsRepo.find!.mockResolvedValue([])

      const result = await service.listForOwner('u1')

      expect(result.data).toEqual([])
    })
  })

  describe('update', () => {
    it('updates a card successfully', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      cardsRepo.update!.mockResolvedValue(undefined as any)
      cardsRepo.findOne!.mockResolvedValueOnce(makeCard())
      cardsRepo.findOne!.mockResolvedValueOnce(makeCard())

      const result = await service.update('card-1', 'u1', { slug: 'new-slug' } as any)

      expect(result.success).toBe(true)
      expect(cardsRepo.update).toHaveBeenCalled()
    })

    it('throws ForbiddenException when not owner', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'other' }))

      await expect(service.update('card-1', 'u1', {} as any)).rejects.toThrow(ForbiddenException)
    })

    it('validates template on update', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      templatesRepo.findOneBy!.mockResolvedValue(null)

      await expect(
        service.update('card-1', 'u1', { template_id: 'bad-tpl' } as any),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('remove', () => {
    it('deletes a card successfully', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      cardsRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.remove('card-1', 'u1')

      expect(result.success).toBe(true)
      expect(cardsRepo.delete).toHaveBeenCalledWith({ id: 'card-1' })
    })

    it('throws ForbiddenException when not owner', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'other' }))

      await expect(service.remove('card-1', 'u1')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('createProfile', () => {
    it('creates a profile successfully', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      profilesRepo.findOneBy!.mockResolvedValue(null)
      profilesRepo.create!.mockReturnValue(makeProfile())
      profilesRepo.save!.mockResolvedValue(makeProfile())

      const result = await service.createProfile('card-1', 'u1', {
        display_name: 'Jane Doe',
      } as CreateCardProfileDto)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('throws BadRequestException when profile already exists', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      profilesRepo.findOneBy!.mockResolvedValue(makeProfile())

      await expect(
        service.createProfile('card-1', 'u1', { display_name: 'Jane' } as CreateCardProfileDto),
      ).rejects.toThrow(BadRequestException)
    })

    it('throws ForbiddenException when not card owner', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'other' }))

      await expect(
        service.createProfile('card-1', 'u1', { display_name: 'Jane' } as CreateCardProfileDto),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('getProfile', () => {
    it('returns profile when found', async () => {
      profilesRepo.findOne!.mockResolvedValue(makeProfile())

      const result = await service.getProfile('card-1')

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when not found', async () => {
      profilesRepo.findOne!.mockResolvedValue(null)

      await expect(service.getProfile('card-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateProfileByProfile', () => {
    it('updates profile successfully', async () => {
      profilesRepo.findOne!.mockResolvedValue(makeProfile())
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      profilesRepo.update!.mockResolvedValue(undefined as any)
      profilesRepo.findOneBy!.mockResolvedValue(makeProfile({ displayName: 'Updated' }))

      const result = await service.updateProfileByProfile('prof-1', 'u1', {
        display_name: 'Updated',
      } as any)

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when profile not found', async () => {
      profilesRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.updateProfileByProfile('prof-1', 'u1', {} as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeProfileByProfile', () => {
    it('deletes profile successfully', async () => {
      profilesRepo.findOne!.mockResolvedValue(makeProfile())
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      profilesRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.removeProfileByProfile('prof-1', 'u1')

      expect(result.success).toBe(true)
      expect(profilesRepo.delete).toHaveBeenCalledWith({ id: 'prof-1' })
    })
  })

  describe('createCustomization', () => {
    it('creates customization successfully', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      customizationsRepo.findOneBy!.mockResolvedValue(null)
      customizationsRepo.create!.mockReturnValue(makeCustomization())
      customizationsRepo.save!.mockResolvedValue(makeCustomization())

      const result = await service.createCustomization('card-1', 'u1', {
        primary_color: '#0f172a',
      } as CreateCardCustomizationDto)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('throws BadRequestException when customization already exists', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      customizationsRepo.findOneBy!.mockResolvedValue(makeCustomization())

      await expect(
        service.createCustomization('card-1', 'u1', {} as CreateCardCustomizationDto),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('getCustomization', () => {
    it('returns customization when found', async () => {
      customizationsRepo.findOne!.mockResolvedValue(makeCustomization())

      const result = await service.getCustomization('card-1')

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when not found', async () => {
      customizationsRepo.findOne!.mockResolvedValue(null)

      await expect(service.getCustomization('card-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateCustomizationByCustomization', () => {
    it('updates customization successfully', async () => {
      customizationsRepo.findOne!.mockResolvedValue(makeCustomization())
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      customizationsRepo.update!.mockResolvedValue(undefined as any)
      customizationsRepo.findOneBy!.mockResolvedValue(makeCustomization({ primaryColor: '#fff' }))

      const result = await service.updateCustomizationByCustomization('cust-1', 'u1', {
        primary_color: '#fff',
      } as any)

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when customization not found', async () => {
      customizationsRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.updateCustomizationByCustomization('cust-1', 'u1', {} as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeCustomizationByCustomization', () => {
    it('deletes customization successfully', async () => {
      customizationsRepo.findOne!.mockResolvedValue(makeCustomization())
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      customizationsRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.removeCustomizationByCustomization('cust-1', 'u1')

      expect(result.success).toBe(true)
      expect(customizationsRepo.delete).toHaveBeenCalledWith({ id: 'cust-1' })
    })
  })

  describe('createSocialLink', () => {
    it('creates a social link successfully', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      socialLinksRepo.create!.mockReturnValue(makeSocialLink())
      socialLinksRepo.save!.mockResolvedValue(makeSocialLink())

      const result = await service.createSocialLink('card-1', 'u1', {
        platform: 'instagram',
        url: 'https://instagram.com/test',
      } as CreateSocialLinkDto)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('throws ForbiddenException when not card owner', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'other' }))

      await expect(
        service.createSocialLink('card-1', 'u1', {
          platform: 'instagram',
          url: 'https://instagram.com/test',
        } as CreateSocialLinkDto),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('listSocialLinks', () => {
    it('returns social links for a card', async () => {
      socialLinksRepo.find!.mockResolvedValue([makeSocialLink()])

      const result = await service.listSocialLinks('card-1')

      expect(result.success).toBe(true)
    })

    it('returns empty array when no links', async () => {
      socialLinksRepo.find!.mockResolvedValue([])

      const result = await service.listSocialLinks('card-1')

      expect(result.data).toEqual([])
    })
  })

  describe('updateSocialLinkByLink', () => {
    it('updates a social link successfully', async () => {
      socialLinksRepo.findOne!.mockResolvedValue(makeSocialLink())
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      socialLinksRepo.update!.mockResolvedValue(undefined as any)
      socialLinksRepo.findOneBy!.mockResolvedValue(makeSocialLink({ platform: 'facebook' }))

      const result = await service.updateSocialLinkByLink('link-1', 'u1', {
        platform: 'facebook',
      } as any)

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when link not found', async () => {
      socialLinksRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.updateSocialLinkByLink('link-1', 'u1', {} as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeSocialLinkByLink', () => {
    it('deletes a social link successfully', async () => {
      socialLinksRepo.findOne!.mockResolvedValue(makeSocialLink())
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      socialLinksRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.removeSocialLinkByLink('link-1', 'u1')

      expect(result.success).toBe(true)
      expect(socialLinksRepo.delete).toHaveBeenCalledWith({ id: 'link-1' })
    })
  })

  describe('createAccess', () => {
    it('creates access successfully', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      accessRepo.findOneBy!.mockResolvedValue(null)
      accessRepo.create!.mockReturnValue(makeAccess())
      accessRepo.save!.mockResolvedValue(makeAccess())

      const result = await service.createAccess('card-1', 'u1', {
        is_enabled: false,
      } as CreateCardAccessDto)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('throws BadRequestException when access already exists', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      accessRepo.findOneBy!.mockResolvedValue(makeAccess())

      await expect(
        service.createAccess('card-1', 'u1', {} as CreateCardAccessDto),
      ).rejects.toThrow(BadRequestException)
    })

    it('throws BadRequestException for "until" without expires_at', async () => {
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      accessRepo.findOneBy!.mockResolvedValue(null)

      await expect(
        service.createAccess('card-1', 'u1', {
          access_expiry: 'until',
        } as CreateCardAccessDto),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('getAccess', () => {
    it('returns access when found', async () => {
      accessRepo.findOne!.mockResolvedValue(makeAccess())

      const result = await service.getAccess('card-1')

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when not found', async () => {
      accessRepo.findOne!.mockResolvedValue(null)

      await expect(service.getAccess('card-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateAccessByAccess', () => {
    it('updates access successfully', async () => {
      accessRepo.findOne!.mockResolvedValue(makeAccess())
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      accessRepo.update!.mockResolvedValue(undefined as any)
      accessRepo.findOneBy!.mockResolvedValue(makeAccess({ isEnabled: true }))

      const result = await service.updateAccessByAccess('acc-1', 'u1', {
        is_enabled: true,
      } as any)

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when access not found', async () => {
      accessRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.updateAccessByAccess('acc-1', 'u1', {} as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeAccessByAccess', () => {
    it('deletes access successfully', async () => {
      accessRepo.findOne!.mockResolvedValue(makeAccess())
      cardsRepo.findOne!.mockResolvedValue(makeCard({ ownerId: 'u1' }))
      accessRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.removeAccessByAccess('acc-1', 'u1')

      expect(result.success).toBe(true)
      expect(accessRepo.delete).toHaveBeenCalledWith({ id: 'acc-1' })
    })
  })

  describe('listTemplates', () => {
    it('returns published templates', async () => {
      templatesRepo.find!.mockResolvedValue([])

      const result = await service.listTemplates()

      expect(result.success).toBe(true)
      expect(templatesRepo.find).toHaveBeenCalledWith({
        where: { status: 'published' },
        order: { name: 'ASC' },
        relations: { fields: true },
      })
    })
  })

  describe('findTemplate', () => {
    it('returns a template when found', async () => {
      const template = {
        id: 'tpl-1', name: 'Minimal', slug: 'minimal', status: 'published',
        path: null, previewUrl: null, category: null, isBusiness: false,
        isConsumer: true, fontFamily: null, primaryColor: null,
        secondaryColor: null, buttonStyle: null, logoPosition: null,
        bgStyle: null, sections: null, usage: 0, fields: [],
        createdAt: new Date(), updatedAt: new Date(),
      }
      templatesRepo.findOne!.mockResolvedValue(template)

      const result = await service.findTemplate('tpl-1')

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when not found', async () => {
      templatesRepo.findOne!.mockResolvedValue(null)

      await expect(service.findTemplate('bad')).rejects.toThrow(NotFoundException)
    })
  })
})
