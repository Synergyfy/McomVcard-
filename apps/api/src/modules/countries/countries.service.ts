import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Country } from './entities/country.entity'
import { CreateCountryDto, UpdateCountryDto } from './dto/country.dto'

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
  ) {}

  async findAll(options: {
    page: number
    limit: number
    search?: string
    isActive?: boolean
    sort?: string
    order?: 'ASC' | 'DESC'
  }): Promise<{ data: Country[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const { page, limit, search, isActive, sort = 'created_at', order = 'DESC' } = options
    const qb = this.countryRepo.createQueryBuilder('c')

    if (search) {
      qb.andWhere('(c.name ILIKE :search OR c.code ILIKE :search)', { search: `%${search}%` })
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

  async findOne(id: string): Promise<Country> {
    const country = await this.countryRepo.findOne({ where: { id } })
    if (!country) {
      throw new NotFoundException('Country not found')
    }
    return country
  }

  async create(dto: CreateCountryDto): Promise<Country> {
    const existing = await this.countryRepo.findOne({ where: { code: dto.code } })
    if (existing) {
      throw new ConflictException('Country with this code already exists')
    }

    const country = this.countryRepo.create({
      code: dto.code,
      name: dto.name,
      phoneCode: dto.phoneCode,
      flagEmoji: dto.flagEmoji ?? null,
      isActive: dto.isActive ?? true,
    })
    return this.countryRepo.save(country)
  }

  async update(id: string, dto: UpdateCountryDto): Promise<Country> {
    const country = await this.findOne(id)

    if (dto.code !== undefined) {
      if (dto.code !== country.code) {
        const existing = await this.countryRepo.findOne({ where: { code: dto.code } })
        if (existing) {
          throw new ConflictException('Country with this code already exists')
        }
      }
      country.code = dto.code
    }

    if (dto.name !== undefined) country.name = dto.name
    if (dto.phoneCode !== undefined) country.phoneCode = dto.phoneCode
    if (dto.flagEmoji !== undefined) country.flagEmoji = dto.flagEmoji
    if (dto.isActive !== undefined) country.isActive = dto.isActive

    return this.countryRepo.save(country)
  }

  async remove(id: string): Promise<void> {
    const country = await this.findOne(id)
    await this.countryRepo.remove(country)
  }
}
