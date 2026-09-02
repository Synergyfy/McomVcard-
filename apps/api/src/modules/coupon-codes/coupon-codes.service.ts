import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CouponCode } from './entities/coupon-code.entity'
import { CreateCouponCodeDto, UpdateCouponCodeDto } from './dto/coupon-code.dto'

@Injectable()
export class CouponCodesService {
  constructor(
    @InjectRepository(CouponCode)
    private readonly couponRepo: Repository<CouponCode>,
  ) {}

  async findAll(options: {
    page: number
    limit: number
    search?: string
    isActive?: boolean
    sort?: string
    order?: 'ASC' | 'DESC'
  }): Promise<{ data: CouponCode[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const { page, limit, search, isActive, sort = 'created_at', order = 'DESC' } = options
    const qb = this.couponRepo.createQueryBuilder('c')

    if (search) {
      qb.andWhere('c.code ILIKE :search', { search: `%${search}%` })
    }

    if (isActive !== undefined) {
      qb.andWhere('c.is_active = :isActive', { isActive })
    }

    const total = await qb.getCount()
    const data = await qb
      .orderBy(`c.${sort}`, order)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async findOne(id: string): Promise<CouponCode> {
    const coupon = await this.couponRepo.findOne({ where: { id } })
    if (!coupon) {
      throw new NotFoundException('Coupon code not found')
    }
    return coupon
  }

  async create(dto: CreateCouponCodeDto): Promise<CouponCode> {
    const existing = await this.couponRepo.findOne({ where: { code: dto.code } })
    if (existing) {
      throw new ConflictException('Coupon code already exists')
    }

    const coupon = this.couponRepo.create({
      code: dto.code,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxUses: dto.maxUses ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      isActive: dto.isActive ?? true,
    })
    return this.couponRepo.save(coupon)
  }

  async update(id: string, dto: UpdateCouponCodeDto): Promise<CouponCode> {
    const coupon = await this.findOne(id)

    if (dto.code !== undefined) {
      if (dto.code !== coupon.code) {
        const existing = await this.couponRepo.findOne({ where: { code: dto.code } })
        if (existing) {
          throw new ConflictException('Coupon code already exists')
        }
      }
      coupon.code = dto.code
    }

    if (dto.discountType !== undefined) coupon.discountType = dto.discountType
    if (dto.discountValue !== undefined) coupon.discountValue = dto.discountValue
    if (dto.maxUses !== undefined) coupon.maxUses = dto.maxUses
    if (dto.expiresAt !== undefined) {
      coupon.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null
    }
    if (dto.isActive !== undefined) coupon.isActive = dto.isActive

    return this.couponRepo.save(coupon)
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id)
    await this.couponRepo.remove(coupon)
  }

  async validate(id: string): Promise<{ valid: boolean; reason?: string; coupon: CouponCode }> {
    const coupon = await this.findOne(id)

    if (!coupon.isActive) {
      return { valid: false, reason: 'Coupon is inactive', coupon }
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, reason: 'Coupon has expired', coupon }
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, reason: 'Coupon has reached maximum uses', coupon }
    }

    return { valid: true, coupon }
  }
}
