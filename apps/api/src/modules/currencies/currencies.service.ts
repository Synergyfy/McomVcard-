import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Currency } from './entities/currency.entity'

@Injectable()
export class CurrenciesService implements OnModuleInit {
  constructor(
    @InjectRepository(Currency) private currenciesRepo: Repository<Currency>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults()
  }

  async findAll(): Promise<Currency[]> {
    return this.currenciesRepo.find({ order: { name: 'ASC' } })
  }

  async findOne(id: string): Promise<Currency> {
    const currency = await this.currenciesRepo.findOne({ where: { id } })
    if (!currency) throw new NotFoundException('Currency not found')
    return currency
  }

  async findByCode(code: string): Promise<Currency> {
    const currency = await this.currenciesRepo.findOne({ where: { code: code.toUpperCase() } })
    if (!currency) throw new NotFoundException(`Currency with code ${code} not found`)
    return currency
  }

  async create(data: { code: string; name: string; symbol: string; isActive?: boolean; exchangeRate?: number }): Promise<Currency> {
    const existing = await this.currenciesRepo.findOne({ where: { code: data.code.toUpperCase() } })
    if (existing) throw new ConflictException(`Currency with code ${data.code} already exists`)

    const currency = this.currenciesRepo.create({
      code: data.code.toUpperCase(),
      name: data.name,
      symbol: data.symbol,
      isActive: data.isActive ?? true,
      exchangeRate: data.exchangeRate ?? 1.0,
    })

    return this.currenciesRepo.save(currency)
  }

  async update(id: string, data: { name?: string; symbol?: string; isActive?: boolean; exchangeRate?: number }): Promise<Currency> {
    const currency = await this.findOne(id)

    if (data.name !== undefined) currency.name = data.name
    if (data.symbol !== undefined) currency.symbol = data.symbol
    if (data.isActive !== undefined) currency.isActive = data.isActive
    if (data.exchangeRate !== undefined) currency.exchangeRate = data.exchangeRate

    return this.currenciesRepo.save(currency)
  }

  async remove(id: string): Promise<void> {
    const currency = await this.findOne(id)
    await this.currenciesRepo.remove(currency)
  }

  async seedDefaults(): Promise<void> {
    const count = await this.currenciesRepo.count()
    if (count > 0) return

    const defaults = [
      { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0 },
      { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79 },
      { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92 },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 1.53 },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: 1.36 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 149.5 },
    ]

    for (const d of defaults) {
      const entity = this.currenciesRepo.create({ ...d, isActive: true })
      await this.currenciesRepo.save(entity)
    }
  }
}
