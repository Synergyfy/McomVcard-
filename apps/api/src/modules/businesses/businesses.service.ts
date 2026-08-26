import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Business } from './entities/business.entity'
import { BusinessCategory } from './entities/business-category.entity'
import { BusinessLocation } from './entities/business-location.entity'
import { BusinessHour } from './entities/business-hour.entity'
import { Brand } from './entities/brand.entity'
import { CreateBusinessDto } from './dto/create-business.dto'
import { UpdateBusinessDto } from './dto/update-business.dto'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { CreateBusinessHourDto } from './dto/create-business-hour.dto'
import { UpdateBusinessHourDto } from './dto/update-business-hour.dto'
import { CreateBrandDto } from './dto/create-brand.dto'
import { UpdateBrandDto } from './dto/update-brand.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { slugify } from '../../lib/utils/slug.util'
import { BusinessResponseDto, BusinessLocationResponseDto, BusinessHourResponseDto, BrandResponseDto, BusinessCategoryResponseDto } from './dto/business-response.dto'
import { Membership } from '../memberships/entities/membership.entity'
import { MembershipTier } from '../memberships/entities/membership-tier.entity'
import { Card } from '../cards/entities/card.entity'

/* Plan levels + per-tier limits, mirroring the default pricing catalogue
   (membershipPricingStore defaults on the frontend). null = Unlimited. */
const PLAN_LEVELS = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const
type PlanLevel = (typeof PLAN_LEVELS)[number]

const PLAN_LIMIT_MATRIX: Record<PlanLevel, {
  vcards: (number | null)[]
  businessCards: (number | null)[]
  friendsFamily: (number | null)[]
  qrRoutingRules: (number | null)[]
}> = {
  Bronze:   { vcards: [10, 25, 50],       businessCards: [25, 50, 100],    friendsFamily: [10, 25, 50],    qrRoutingRules: [5, 10, 20] },
  Silver:   { vcards: [20, 50, 100],      businessCards: [50, 100, 200],   friendsFamily: [25, 50, 100],   qrRoutingRules: [10, 25, 50] },
  Gold:     { vcards: [50, 100, 200],     businessCards: [100, 250, 500],  friendsFamily: [50, 100, 200],  qrRoutingRules: [null, null, null] },
  Platinum: { vcards: [null, null, null], businessCards: [null, null, null], friendsFamily: [100, 200, 400], qrRoutingRules: [null, null, null] },
}

function resolvePlanLevel(name: string): PlanLevel {
  const lower = name.toLowerCase()
  return PLAN_LEVELS.find(l => lower.includes(l.toLowerCase())) ?? 'Bronze'
}

function resolvePlanTier(name: string): 'Normal' | 'Pro' | 'Pro+' {
  const lower = name.toLowerCase()
  if (lower.includes('pro+')) return 'Pro+'
  if (lower.includes('pro')) return 'Pro'
  return 'Normal'
}

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business) private businessesRepo: Repository<Business>,
    @InjectRepository(BusinessCategory) private categoriesRepo: Repository<BusinessCategory>,
    @InjectRepository(BusinessLocation) private locationsRepo: Repository<BusinessLocation>,
    @InjectRepository(BusinessHour) private hoursRepo: Repository<BusinessHour>,
    @InjectRepository(Brand) private brandsRepo: Repository<Brand>,
    @InjectRepository(Membership) private membershipsRepo: Repository<Membership>,
    @InjectRepository(MembershipTier) private membershipTiersRepo: Repository<MembershipTier>,
    @InjectRepository(Card) private cardsRepo: Repository<Card>,
  ) {}

  // --- Businesses ---

  async create(ownerId: string, dto: CreateBusinessDto) {
    if (dto.category_id) {
      await this.assertCategoryExists(dto.category_id)
    }

    const slug = await this.generateUniqueSlug(dto.name)

    const saved = await this.businessesRepo.save(
      this.businessesRepo.create({
        ownerId,
        name: dto.name,
        slug,
        description: dto.description ?? null,
        categoryId: dto.category_id ?? null,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        website: dto.website ?? null,
      }),
    )

    return ApiResponse.success(BusinessResponseDto.fromEntity(await this.findOne(saved.id)), 'Business created', 201)
  }

  async findOne(id: string) {
    const business = await this.businessesRepo.findOne({
      where: { id },
      relations: { category: true, locations: true, hours: true, brands: true },
    })

    if (!business) throw new NotFoundException('Business not found')

    return business
  }

  // Returns the business if it belongs to the given user, else 403/404.
  async findOwned(id: string, ownerId: string) {
    const business = await this.findOne(id)

    if (business.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have access to this business')
    }

    return business
  }

  // --- Permissions ---

  /**
   * Resolves the authenticated user's plan limits and current allocation.
   * Plan level is derived from the latest membership's tier name; the
   * limit matrix mirrors the default pricing catalogue. null = Unlimited.
   */
  async getPermissionsForUser(userId: string) {
    const business = await this.businessesRepo.findOne({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' },
    })

    const membership = await this.membershipsRepo.findOne({
      where: { userId },
      order: { startedAt: 'DESC' },
      relations: { tier: true },
    })
    const tierName = membership?.tier?.name ?? ''
    const planLevel = resolvePlanLevel(tierName)
    const planTier = resolvePlanTier(tierName)
    const tierIndex = planTier === 'Pro+' ? 2 : planTier === 'Pro' ? 1 : 0

    const matrix = PLAN_LIMIT_MATRIX[planLevel]
    const limits = {
      vcards: matrix.vcards[tierIndex],
      business_cards: matrix.businessCards[tierIndex],
      friends_family: matrix.friendsFamily[tierIndex],
      qr_routing_rules: matrix.qrRoutingRules[tierIndex],
    }

    const allocatedVcards = await this.cardsRepo.count({ where: { ownerId: userId } })
    const allocatedBusinessCards = business
      ? await this.cardsRepo.count({ where: { businessId: business.id, type: 'BUSINESS' } })
      : 0

    const remaining = (limit: number | null, used: number) => (limit === null ? null : Math.max(0, limit - used))

    return ApiResponse.success({
      business: business ? { id: business.id, name: business.name } : null,
      has_membership: !!membership,
      tier_name: tierName || null,
      plan_level: planLevel,
      plan_tier: planTier,
      limits,
      allocated: {
        vcards: allocatedVcards,
        business_cards: allocatedBusinessCards,
      },
      remaining: {
        vcards: remaining(limits.vcards, allocatedVcards),
        business_cards: remaining(limits.business_cards, allocatedBusinessCards),
      },
    }, 'Business permissions retrieved', 200)
  }

  async findBySlug(slug: string) {
    const business = await this.businessesRepo.findOne({
      where: { slug },
      relations: { category: true, locations: true, hours: true, brands: true },
    })

    if (!business) throw new NotFoundException('Business not found')

    return business
  }

  async listCategories() {
    const categories = await this.categoriesRepo.find({ order: { name: 'ASC' } })

    return ApiResponse.success(categories.map(BusinessCategoryResponseDto.fromEntity), 'Business categories retrieved', 200)
  }

  async listForOwner(ownerId: string) {
    const businesses = await this.businessesRepo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(businesses.map(BusinessResponseDto.fromEntity), 'Businesses retrieved', 200)
  }

  async update(id: string, ownerId: string, dto: UpdateBusinessDto) {
    await this.findOwned(id, ownerId)

    if (dto.category_id) {
      await this.assertCategoryExists(dto.category_id)
    }

    const patch: Partial<Business> = {}

    if (dto.name !== undefined) patch.name = dto.name
    if (dto.description !== undefined) patch.description = dto.description
    if (dto.category_id !== undefined) patch.categoryId = dto.category_id
    if (dto.email !== undefined) patch.email = dto.email
    if (dto.phone !== undefined) patch.phone = dto.phone
    if (dto.website !== undefined) patch.website = dto.website

    await this.businessesRepo.update({ id }, patch)

    return ApiResponse.success(BusinessResponseDto.fromEntity(await this.findOne(id)), 'Business updated', 200)
  }

  async remove(id: string, ownerId: string) {
    await this.findOwned(id, ownerId)

    await this.businessesRepo.delete({ id })

    return ApiResponse.message('Business deleted', 200)
  }

  // --- Locations ---

  async createLocation(businessId: string, ownerId: string, dto: CreateLocationDto) {
    await this.findOwned(businessId, ownerId)

    const saved = await this.locationsRepo.save(
      this.locationsRepo.create({
        businessId,
        address: dto.address ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        country: dto.country ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
      }),
    )

    return ApiResponse.success(BusinessLocationResponseDto.fromEntity(saved), 'Location created', 201)
  }

  async listLocations(businessId: string, ownerId: string) {
    await this.findOwned(businessId, ownerId)

    const locations = await this.locationsRepo.find({ where: { businessId } })

    return ApiResponse.success(locations.map(BusinessLocationResponseDto.fromEntity), 'Locations retrieved', 200)
  }

  async updateLocation(businessId: string, locationId: string, ownerId: string, dto: UpdateLocationDto) {
    await this.findOwned(businessId, ownerId)

    const location = await this.locationsRepo.findOne({ where: { id: locationId, businessId } })
    if (!location) throw new NotFoundException('Location not found')

    const patch: Partial<BusinessLocation> = {}

    if (dto.address !== undefined) patch.address = dto.address
    if (dto.city !== undefined) patch.city = dto.city
    if (dto.state !== undefined) patch.state = dto.state
    if (dto.country !== undefined) patch.country = dto.country
    if (dto.latitude !== undefined) patch.latitude = dto.latitude
    if (dto.longitude !== undefined) patch.longitude = dto.longitude

    await this.locationsRepo.update({ id: locationId }, patch)

    const updated = await this.locationsRepo.findOneBy({ id: locationId })
    if (!updated) throw new NotFoundException('Location not found')

    return ApiResponse.success(BusinessLocationResponseDto.fromEntity(updated), 'Location updated', 200)
  }

  async removeLocation(businessId: string, locationId: string, ownerId: string) {
    await this.findOwned(businessId, ownerId)

    const location = await this.locationsRepo.findOne({ where: { id: locationId, businessId } })
    if (!location) throw new NotFoundException('Location not found')

    await this.locationsRepo.delete({ id: locationId })

    return ApiResponse.message('Location deleted', 200)
  }

  // Resolves the parent business from the location ID, verifies ownership, then updates.
  async updateLocationByLocation(locationId: string, ownerId: string, dto: UpdateLocationDto) {
    const location = await this.locationsRepo.findOne({ where: { id: locationId } })
    if (!location) throw new NotFoundException('Location not found')

    return this.updateLocation(location.businessId, locationId, ownerId, dto)
  }

  async removeLocationByLocation(locationId: string, ownerId: string) {
    const location = await this.locationsRepo.findOne({ where: { id: locationId } })
    if (!location) throw new NotFoundException('Location not found')

    return this.removeLocation(location.businessId, locationId, ownerId)
  }

  // --- Hours ---

  async createHour(businessId: string, ownerId: string, dto: CreateBusinessHourDto) {
    await this.findOwned(businessId, ownerId)

    await this.assertUniqueDay(businessId, dto.day_of_week)

    const saved = await this.hoursRepo.save(
      this.hoursRepo.create({
        businessId,
        dayOfWeek: dto.day_of_week,
        opensAt: dto.opens_at ?? null,
        closesAt: dto.closes_at ?? null,
        isClosed: dto.is_closed ?? false,
      }),
    )

    return ApiResponse.success(BusinessHourResponseDto.fromEntity(saved), 'Business hours created', 201)
  }

  async listHours(businessId: string, ownerId: string) {
    await this.findOwned(businessId, ownerId)

    const hours = await this.hoursRepo.find({ where: { businessId }, order: { dayOfWeek: 'ASC' } })

    return ApiResponse.success(hours.map(BusinessHourResponseDto.fromEntity), 'Business hours retrieved', 200)
  }

  async updateHour(businessId: string, hourId: string, ownerId: string, dto: UpdateBusinessHourDto) {
    await this.findOwned(businessId, ownerId)

    const hour = await this.hoursRepo.findOne({ where: { id: hourId, businessId } })
    if (!hour) throw new NotFoundException('Business hours not found')

    const patch: Partial<BusinessHour> = {}

    if (dto.day_of_week !== undefined && dto.day_of_week !== hour.dayOfWeek) {
      await this.assertUniqueDay(businessId, dto.day_of_week, hourId)
      patch.dayOfWeek = dto.day_of_week
    }

    if (dto.opens_at !== undefined) patch.opensAt = dto.opens_at
    if (dto.closes_at !== undefined) patch.closesAt = dto.closes_at
    if (dto.is_closed !== undefined) patch.isClosed = dto.is_closed

    await this.hoursRepo.update({ id: hourId }, patch)

    const updated = await this.hoursRepo.findOneBy({ id: hourId })
    if (!updated) throw new NotFoundException('Business hours not found')

    return ApiResponse.success(BusinessHourResponseDto.fromEntity(updated), 'Business hours updated', 200)
  }

  async removeHour(businessId: string, hourId: string, ownerId: string) {
    await this.findOwned(businessId, ownerId)

    const hour = await this.hoursRepo.findOne({ where: { id: hourId, businessId } })
    if (!hour) throw new NotFoundException('Business hours not found')

    await this.hoursRepo.delete({ id: hourId })

    return ApiResponse.message('Business hours deleted', 200)
  }

  // Resolves the parent business from the hours row ID, verifies ownership, then updates.
  async updateHourByHour(hourId: string, ownerId: string, dto: UpdateBusinessHourDto) {
    const hour = await this.hoursRepo.findOne({ where: { id: hourId } })
    if (!hour) throw new NotFoundException('Business hours not found')

    return this.updateHour(hour.businessId, hourId, ownerId, dto)
  }

  async removeHourByHour(hourId: string, ownerId: string) {
    const hour = await this.hoursRepo.findOne({ where: { id: hourId } })
    if (!hour) throw new NotFoundException('Business hours not found')

    return this.removeHour(hour.businessId, hourId, ownerId)
  }

  // --- Brands ---

  async createBrand(businessId: string, ownerId: string, dto: CreateBrandDto) {
    await this.findOwned(businessId, ownerId)

    const saved = await this.brandsRepo.save(
      this.brandsRepo.create({
        businessId,
        name: dto.name,
        description: dto.description ?? null,
        logoUrl: dto.logo_url ?? null,
      }),
    )

    return ApiResponse.success(BrandResponseDto.fromEntity(saved), 'Brand created', 201)
  }

  async listBrands(businessId: string, ownerId: string) {
    await this.findOwned(businessId, ownerId)

    const brands = await this.brandsRepo.find({ where: { businessId } })

    return ApiResponse.success(brands.map(BrandResponseDto.fromEntity), 'Brands retrieved', 200)
  }

  async updateBrand(businessId: string, brandId: string, ownerId: string, dto: UpdateBrandDto) {
    await this.findOwned(businessId, ownerId)

    const brand = await this.brandsRepo.findOne({ where: { id: brandId, businessId } })
    if (!brand) throw new NotFoundException('Brand not found')

    const patch: Partial<Brand> = {}

    if (dto.name !== undefined) patch.name = dto.name
    if (dto.description !== undefined) patch.description = dto.description
    if (dto.logo_url !== undefined) patch.logoUrl = dto.logo_url

    await this.brandsRepo.update({ id: brandId }, patch)

    const updated = await this.brandsRepo.findOneBy({ id: brandId })
    if (!updated) throw new NotFoundException('Brand not found')

    return ApiResponse.success(BrandResponseDto.fromEntity(updated), 'Brand updated', 200)
  }

  async removeBrand(businessId: string, brandId: string, ownerId: string) {
    await this.findOwned(businessId, ownerId)

    const brand = await this.brandsRepo.findOne({ where: { id: brandId, businessId } })
    if (!brand) throw new NotFoundException('Brand not found')

    await this.brandsRepo.delete({ id: brandId })

    return ApiResponse.message('Brand deleted', 200)
  }

  // Resolves the parent business from the brand ID, verifies ownership, then updates.
  async updateBrandByBrand(brandId: string, ownerId: string, dto: UpdateBrandDto) {
    const brand = await this.brandsRepo.findOne({ where: { id: brandId } })
    if (!brand) throw new NotFoundException('Brand not found')

    return this.updateBrand(brand.businessId, brandId, ownerId, dto)
  }

  async removeBrandByBrand(brandId: string, ownerId: string) {
    const brand = await this.brandsRepo.findOne({ where: { id: brandId } })
    if (!brand) throw new NotFoundException('Brand not found')

    return this.removeBrand(brand.businessId, brandId, ownerId)
  }

  // --- Helpers ---

  // Produces a slug from the business name, appending a numeric suffix if taken.
  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name)
    let slug = base
    let suffix = 2

    while (await this.businessesRepo.findOneBy({ slug })) {
      slug = `${base}-${suffix}`
      suffix += 1
    }

    return slug
  }

  // Rejects a category UUID that does not exist before a FK insert/update fails.
  private async assertCategoryExists(categoryId: string) {
    const category = await this.categoriesRepo.findOneBy({ id: categoryId })

    if (!category) {
      throw new BadRequestException('Business category not found')
    }
  }

  // Enforces one opening-hours row per day of the week.
  private async assertUniqueDay(businessId: string, dayOfWeek: number, excludeId?: string) {
    const existing = await this.hoursRepo.findOne({ where: { businessId, dayOfWeek } })

    if (existing && existing.id !== excludeId) {
      throw new BadRequestException('Business hours already defined for that day of the week')
    }
  }
}