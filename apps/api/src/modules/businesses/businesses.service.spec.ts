import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { BusinessesService } from './businesses.service'
import { Business } from './entities/business.entity'
import { BusinessCategory } from './entities/business-category.entity'
import { BusinessLocation } from './entities/business-location.entity'
import { BusinessHour } from './entities/business-hour.entity'
import { Brand } from './entities/brand.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { MembershipTier } from '../memberships/entities/membership-tier.entity'
import { Card } from '../cards/entities/card.entity'
import { CreateBusinessDto } from './dto/create-business.dto'
import { CreateLocationDto } from './dto/create-location.dto'
import { CreateBusinessHourDto } from './dto/create-business-hour.dto'
import { CreateBrandDto } from './dto/create-brand.dto'

type MockRepo = Partial<Record<keyof Repository<any>, jest.Mock>>

function createMockRepo(): MockRepo {
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

function makeBusiness(overrides: Partial<Business> = {}): Business {
  return {
    id: 'biz-1',
    ownerId: 'u1',
    name: 'Acme Cafe',
    slug: 'acme-cafe',
    description: null,
    categoryId: null,
    email: null,
    phone: null,
    website: null,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    category: null,
    locations: [],
    hours: [],
    brands: [],
    ...overrides,
  } as Business
}

function makeLocation(overrides: Partial<BusinessLocation> = {}): BusinessLocation {
  return {
    id: 'loc-1',
    businessId: 'biz-1',
    address: null,
    city: null,
    state: null,
    country: null,
    latitude: null,
    longitude: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as BusinessLocation
}

function makeHour(overrides: Partial<BusinessHour> = {}): BusinessHour {
  return {
    id: 'hr-1',
    businessId: 'biz-1',
    dayOfWeek: 1,
    opensAt: '09:00',
    closesAt: '17:00',
    isClosed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as BusinessHour
}

function makeBrand(overrides: Partial<Brand> = {}): Brand {
  return {
    id: 'br-1',
    businessId: 'biz-1',
    name: 'Acme Signature',
    description: null,
    logoUrl: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as Brand
}

describe('BusinessesService', () => {
  let service: BusinessesService
  let businessesRepo: MockRepo
  let categoriesRepo: MockRepo
  let locationsRepo: MockRepo
  let hoursRepo: MockRepo
  let brandsRepo: MockRepo
  let membershipsRepo: MockRepo
  let membershipTiersRepo: MockRepo
  let cardsRepo: MockRepo

  beforeEach(async () => {
    businessesRepo = createMockRepo()
    categoriesRepo = createMockRepo()
    locationsRepo = createMockRepo()
    hoursRepo = createMockRepo()
    brandsRepo = createMockRepo()
    membershipsRepo = createMockRepo()
    membershipTiersRepo = createMockRepo()
    cardsRepo = createMockRepo()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessesService,
        { provide: getRepositoryToken(Business), useValue: businessesRepo },
        { provide: getRepositoryToken(BusinessCategory), useValue: categoriesRepo },
        { provide: getRepositoryToken(BusinessLocation), useValue: locationsRepo },
        { provide: getRepositoryToken(BusinessHour), useValue: hoursRepo },
        { provide: getRepositoryToken(Brand), useValue: brandsRepo },
        { provide: getRepositoryToken(Membership), useValue: membershipsRepo },
        { provide: getRepositoryToken(MembershipTier), useValue: membershipTiersRepo },
        { provide: getRepositoryToken(Card), useValue: cardsRepo },
      ],
    }).compile()

    service = module.get(BusinessesService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('create', () => {
    it('creates a business successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(null) // slug check
      businessesRepo.findOneBy!.mockResolvedValue(null) // slug check
      businessesRepo.create!.mockReturnValue(makeBusiness())
      businessesRepo.save!.mockResolvedValue(makeBusiness())
      businessesRepo.findOne!.mockResolvedValueOnce(makeBusiness()) // findOne after save

      const result = await service.create('u1', { name: 'Acme Cafe' } as CreateBusinessDto)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
      expect(businessesRepo.save).toHaveBeenCalled()
    })

    it('validates category exists when category_id provided', async () => {
      categoriesRepo.findOneBy!.mockResolvedValue(null)

      await expect(
        service.create('u1', { name: 'Biz', category_id: 'cat-1' } as CreateBusinessDto),
      ).rejects.toThrow(BadRequestException)
    })

    it('appends numeric suffix when slug is taken', async () => {
      businessesRepo.findOneBy!.mockResolvedValueOnce(makeBusiness()) // taken
      businessesRepo.findOneBy!.mockResolvedValueOnce(null) // available
      businessesRepo.create!.mockReturnValue(makeBusiness({ slug: 'acme-cafe-2' }))
      businessesRepo.save!.mockResolvedValue(makeBusiness({ slug: 'acme-cafe-2' }))
      businessesRepo.findOne!.mockResolvedValueOnce(makeBusiness({ slug: 'acme-cafe-2' }))

      const result = await service.create('u1', { name: 'Acme Cafe' } as CreateBusinessDto)

      expect(result.success).toBe(true)
    })
  })

  describe('findOne', () => {
    it('returns a business when found', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness())

      const result = await service.findOne('biz-1')

      expect(result.id).toBe('biz-1')
      expect(businessesRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'biz-1' },
        relations: { category: true, locations: true, hours: true, brands: true },
      })
    })

    it('throws NotFoundException when not found', async () => {
      businessesRepo.findOne!.mockResolvedValue(null)

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findOwned', () => {
    it('returns the business when owner matches', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))

      const result = await service.findOwned('biz-1', 'u1')

      expect(result.ownerId).toBe('u1')
    })

    it('throws ForbiddenException when owner does not match', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'other' }))

      await expect(service.findOwned('biz-1', 'u1')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('findBySlug', () => {
    it('returns a business by slug', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ slug: 'acme-cafe' }))

      const result = await service.findBySlug('acme-cafe')

      expect(result.slug).toBe('acme-cafe')
    })

    it('throws NotFoundException when slug not found', async () => {
      businessesRepo.findOne!.mockResolvedValue(null)

      await expect(service.findBySlug('missing')).rejects.toThrow(NotFoundException)
    })
  })

  describe('listCategories', () => {
    it('returns categories', async () => {
      categoriesRepo.find!.mockResolvedValue([])

      const result = await service.listCategories()

      expect(result.success).toBe(true)
    })
  })

  describe('listForOwner', () => {
    it('returns businesses for the owner', async () => {
      businessesRepo.find!.mockResolvedValue([makeBusiness()])

      const result = await service.listForOwner('u1')

      expect(result.success).toBe(true)
      expect(businessesRepo.find).toHaveBeenCalledWith({
        where: { ownerId: 'u1' },
        order: { createdAt: 'DESC' },
      })
    })

    it('returns empty array when no businesses', async () => {
      businessesRepo.find!.mockResolvedValue([])

      const result = await service.listForOwner('u1')

      expect(result.data).toEqual([])
    })
  })

  describe('update', () => {
    it('updates a business successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      businessesRepo.update!.mockResolvedValue(undefined as any)
      businessesRepo.findOne!.mockResolvedValueOnce(makeBusiness())
      businessesRepo.findOne!.mockResolvedValueOnce(makeBusiness())

      const result = await service.update('biz-1', 'u1', { name: 'New Name' } as any)

      expect(result.success).toBe(true)
      expect(businessesRepo.update).toHaveBeenCalled()
    })

    it('throws ForbiddenException when not owner', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'other' }))

      await expect(service.update('biz-1', 'u1', {} as any)).rejects.toThrow(ForbiddenException)
    })

    it('validates category on update', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      categoriesRepo.findOneBy!.mockResolvedValue(null)

      await expect(
        service.update('biz-1', 'u1', { category_id: 'bad-cat' } as any),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('remove', () => {
    it('deletes a business successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      businessesRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.remove('biz-1', 'u1')

      expect(result.success).toBe(true)
      expect(businessesRepo.delete).toHaveBeenCalledWith({ id: 'biz-1' })
    })

    it('throws ForbiddenException when not owner', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'other' }))

      await expect(service.remove('biz-1', 'u1')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('createLocation', () => {
    it('creates a location successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      locationsRepo.create!.mockReturnValue(makeLocation())
      locationsRepo.save!.mockResolvedValue(makeLocation())

      const result = await service.createLocation('biz-1', 'u1', {
        address: '123 Main St',
        city: 'SF',
      } as CreateLocationDto)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('throws ForbiddenException when not business owner', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'other' }))

      await expect(
        service.createLocation('biz-1', 'u1', {} as CreateLocationDto),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('listLocations', () => {
    it('returns locations for a business', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      locationsRepo.find!.mockResolvedValue([makeLocation()])

      const result = await service.listLocations('biz-1', 'u1')

      expect(result.success).toBe(true)
    })

    it('returns empty array when no locations', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      locationsRepo.find!.mockResolvedValue([])

      const result = await service.listLocations('biz-1', 'u1')

      expect(result.data).toEqual([])
    })
  })

  describe('updateLocation', () => {
    it('updates a location successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      locationsRepo.findOne!.mockResolvedValue(makeLocation())
      locationsRepo.update!.mockResolvedValue(undefined as any)
      locationsRepo.findOneBy!.mockResolvedValue(makeLocation({ city: 'LA' }))

      const result = await service.updateLocation('biz-1', 'loc-1', 'u1', { city: 'LA' } as any)

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when location not found', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      locationsRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.updateLocation('biz-1', 'loc-1', 'u1', {} as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeLocation', () => {
    it('deletes a location successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      locationsRepo.findOne!.mockResolvedValue(makeLocation())
      locationsRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.removeLocation('biz-1', 'loc-1', 'u1')

      expect(result.success).toBe(true)
      expect(locationsRepo.delete).toHaveBeenCalledWith({ id: 'loc-1' })
    })

    it('throws NotFoundException when location not found', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      locationsRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.removeLocation('biz-1', 'loc-1', 'u1'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateLocationByLocation', () => {
    it('resolves business from location and updates', async () => {
      locationsRepo.findOne!.mockResolvedValue(makeLocation({ businessId: 'biz-1' }))
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      locationsRepo.findOne!.mockResolvedValueOnce(makeLocation({ businessId: 'biz-1' }))
      locationsRepo.update!.mockResolvedValue(undefined as any)
      locationsRepo.findOneBy!.mockResolvedValue(makeLocation({ city: 'LA' }))

      const result = await service.updateLocationByLocation('loc-1', 'u1', { city: 'LA' } as any)

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when location not found', async () => {
      locationsRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.updateLocationByLocation('loc-1', 'u1', {} as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeLocationByLocation', () => {
    it('resolves business from location and deletes', async () => {
      locationsRepo.findOne!.mockResolvedValue(makeLocation({ businessId: 'biz-1' }))
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      locationsRepo.findOne!.mockResolvedValueOnce(makeLocation({ businessId: 'biz-1' }))
      locationsRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.removeLocationByLocation('loc-1', 'u1')

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when location not found', async () => {
      locationsRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.removeLocationByLocation('loc-1', 'u1'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('createHour', () => {
    it('creates a business hour successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      hoursRepo.findOne!.mockResolvedValue(null) // unique day check
      hoursRepo.create!.mockReturnValue(makeHour())
      hoursRepo.save!.mockResolvedValue(makeHour())

      const result = await service.createHour('biz-1', 'u1', {
        day_of_week: 1,
        opens_at: '09:00',
        closes_at: '17:00',
      } as CreateBusinessHourDto)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('throws BadRequestException for duplicate day', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      hoursRepo.findOne!.mockResolvedValue(makeHour({ dayOfWeek: 1 }))

      await expect(
        service.createHour('biz-1', 'u1', { day_of_week: 1 } as CreateBusinessHourDto),
      ).rejects.toThrow(BadRequestException)
    })

    it('throws ForbiddenException when not business owner', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'other' }))

      await expect(
        service.createHour('biz-1', 'u1', { day_of_week: 1 } as CreateBusinessHourDto),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('listHours', () => {
    it('returns hours for a business', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      hoursRepo.find!.mockResolvedValue([makeHour()])

      const result = await service.listHours('biz-1', 'u1')

      expect(result.success).toBe(true)
    })

    it('returns empty array when no hours', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      hoursRepo.find!.mockResolvedValue([])

      const result = await service.listHours('biz-1', 'u1')

      expect(result.data).toEqual([])
    })
  })

  describe('updateHour', () => {
    it('updates an hour successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      hoursRepo.findOne!.mockResolvedValue(makeHour())
      hoursRepo.update!.mockResolvedValue(undefined as any)
      hoursRepo.findOneBy!.mockResolvedValue(makeHour({ opensAt: '10:00' }))

      const result = await service.updateHour('biz-1', 'hr-1', 'u1', {
        opens_at: '10:00',
      } as any)

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when hour not found', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      hoursRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.updateHour('biz-1', 'hr-1', 'u1', {} as any),
      ).rejects.toThrow(NotFoundException)
    })

    it('validates unique day when changing day_of_week', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      // findOne: updateHour finds existing hour (dayOfWeek=1)
      hoursRepo.findOne!.mockResolvedValueOnce(makeHour({ id: 'hr-1', dayOfWeek: 1 }))
      // assertUniqueDay checks new dayOfWeek=2 → duplicate found by different id
      hoursRepo.findOne!.mockResolvedValueOnce(makeHour({ id: 'hr-other', dayOfWeek: 2 }))

      await expect(
        service.updateHour('biz-1', 'hr-1', 'u1', { day_of_week: 2 } as any),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('removeHour', () => {
    it('deletes an hour successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      hoursRepo.findOne!.mockResolvedValue(makeHour())
      hoursRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.removeHour('biz-1', 'hr-1', 'u1')

      expect(result.success).toBe(true)
      expect(hoursRepo.delete).toHaveBeenCalledWith({ id: 'hr-1' })
    })

    it('throws NotFoundException when hour not found', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      hoursRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.removeHour('biz-1', 'hr-1', 'u1'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateHourByHour', () => {
    it('resolves business from hour and updates', async () => {
      hoursRepo.findOne!.mockResolvedValue(makeHour({ businessId: 'biz-1' }))
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      hoursRepo.findOne!.mockResolvedValueOnce(makeHour({ businessId: 'biz-1' }))
      hoursRepo.update!.mockResolvedValue(undefined as any)
      hoursRepo.findOneBy!.mockResolvedValue(makeHour({ opensAt: '10:00' }))

      const result = await service.updateHourByHour('hr-1', 'u1', { opens_at: '10:00' } as any)

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when hour not found', async () => {
      hoursRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.updateHourByHour('hr-1', 'u1', {} as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeHourByHour', () => {
    it('resolves business from hour and deletes', async () => {
      hoursRepo.findOne!.mockResolvedValue(makeHour({ businessId: 'biz-1' }))
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      hoursRepo.findOne!.mockResolvedValueOnce(makeHour({ businessId: 'biz-1' }))
      hoursRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.removeHourByHour('hr-1', 'u1')

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when hour not found', async () => {
      hoursRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.removeHourByHour('hr-1', 'u1'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('createBrand', () => {
    it('creates a brand successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      brandsRepo.create!.mockReturnValue(makeBrand())
      brandsRepo.save!.mockResolvedValue(makeBrand())

      const result = await service.createBrand('biz-1', 'u1', {
        name: 'Acme Signature',
      } as CreateBrandDto)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('throws ForbiddenException when not business owner', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'other' }))

      await expect(
        service.createBrand('biz-1', 'u1', { name: 'Brand' } as CreateBrandDto),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('listBrands', () => {
    it('returns brands for a business', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      brandsRepo.find!.mockResolvedValue([makeBrand()])

      const result = await service.listBrands('biz-1', 'u1')

      expect(result.success).toBe(true)
    })

    it('returns empty array when no brands', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      brandsRepo.find!.mockResolvedValue([])

      const result = await service.listBrands('biz-1', 'u1')

      expect(result.data).toEqual([])
    })
  })

  describe('updateBrand', () => {
    it('updates a brand successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      brandsRepo.findOne!.mockResolvedValue(makeBrand())
      brandsRepo.update!.mockResolvedValue(undefined as any)
      brandsRepo.findOneBy!.mockResolvedValue(makeBrand({ name: 'New Brand' }))

      const result = await service.updateBrand('biz-1', 'br-1', 'u1', {
        name: 'New Brand',
      } as any)

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when brand not found', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      brandsRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.updateBrand('biz-1', 'br-1', 'u1', {} as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeBrand', () => {
    it('deletes a brand successfully', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      brandsRepo.findOne!.mockResolvedValue(makeBrand())
      brandsRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.removeBrand('biz-1', 'br-1', 'u1')

      expect(result.success).toBe(true)
      expect(brandsRepo.delete).toHaveBeenCalledWith({ id: 'br-1' })
    })

    it('throws NotFoundException when brand not found', async () => {
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      brandsRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.removeBrand('biz-1', 'br-1', 'u1'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateBrandByBrand', () => {
    it('resolves business from brand and updates', async () => {
      brandsRepo.findOne!.mockResolvedValue(makeBrand({ businessId: 'biz-1' }))
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      brandsRepo.findOne!.mockResolvedValueOnce(makeBrand({ businessId: 'biz-1' }))
      brandsRepo.update!.mockResolvedValue(undefined as any)
      brandsRepo.findOneBy!.mockResolvedValue(makeBrand({ name: 'Updated' }))

      const result = await service.updateBrandByBrand('br-1', 'u1', { name: 'Updated' } as any)

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when brand not found', async () => {
      brandsRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.updateBrandByBrand('br-1', 'u1', {} as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeBrandByBrand', () => {
    it('resolves business from brand and deletes', async () => {
      brandsRepo.findOne!.mockResolvedValue(makeBrand({ businessId: 'biz-1' }))
      businessesRepo.findOne!.mockResolvedValue(makeBusiness({ ownerId: 'u1' }))
      brandsRepo.findOne!.mockResolvedValueOnce(makeBrand({ businessId: 'biz-1' }))
      brandsRepo.delete!.mockResolvedValue(undefined as any)

      const result = await service.removeBrandByBrand('br-1', 'u1')

      expect(result.success).toBe(true)
    })

    it('throws NotFoundException when brand not found', async () => {
      brandsRepo.findOne!.mockResolvedValue(null)

      await expect(
        service.removeBrandByBrand('br-1', 'u1'),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
