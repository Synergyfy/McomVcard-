import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { Business } from '../businesses/entities/business.entity'
import { GiftCard } from './entities/gift-card.entity'
import { CashbackProgram } from './entities/cashback-program.entity'
import { GiftCardResponseDto, CashbackProgramResponseDto } from './dto/catalog-response.dto'
import { CreateGiftCardDto, UpdateGiftCardDto, CreateCashbackProgramDto, UpdateCashbackProgramDto } from './dto/catalog.dto'

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Business) private businesses: Repository<Business>,
    @InjectRepository(GiftCard) private giftCards: Repository<GiftCard>,
    @InjectRepository(CashbackProgram) private cashbackPrograms: Repository<CashbackProgram>,
  ) {}

  private async assertBusinessOwnership(user: UserResponseDto, businessId: string): Promise<void> {
    const b = await this.businesses.findOne({ where: { id: businessId } })
    if (!b) throw new NotFoundException('Business not found')
    if (b.ownerId !== user.id) throw new NotFoundException('Business not found')
  }

  // ── Gift Cards ──

  async listGiftCards(user: UserResponseDto) {
    const cards = await this.giftCards.find({
      where: { business: { ownerId: user.id } },
      order: { createdAt: 'DESC' },
    })
    return ApiResponse.success(cards.map(GiftCardResponseDto.fromEntity), 'Gift cards retrieved', 200)
  }

  async createGiftCard(user: UserResponseDto, dto: CreateGiftCardDto) {
    await this.assertBusinessOwnership(user, dto as any)
    const card = this.giftCards.create({
      businessId: (dto as any).business_id,
      title: dto.title,
      value: dto.value,
      price: dto.price,
    })
    const saved = await this.giftCards.save(card)
    return ApiResponse.success(GiftCardResponseDto.fromEntity(saved), 'Gift card created', 201)
  }

  async getGiftCard(user: UserResponseDto, id: string) {
    const card = await this.giftCards.findOne({ where: { id }, relations: ['business'] })
    if (!card || card.business.ownerId !== user.id) throw new NotFoundException('Gift card not found')
    return ApiResponse.success(GiftCardResponseDto.fromEntity(card), 'Gift card retrieved', 200)
  }

  async updateGiftCard(user: UserResponseDto, id: string, dto: UpdateGiftCardDto) {
    const card = await this.giftCards.findOne({ where: { id }, relations: ['business'] })
    if (!card || card.business.ownerId !== user.id) throw new NotFoundException('Gift card not found')
    if (dto.title !== undefined) card.title = dto.title
    if (dto.value !== undefined) card.value = dto.value
    if (dto.price !== undefined) card.price = dto.price
    if (dto.status !== undefined) card.status = dto.status
    const saved = await this.giftCards.save(card)
    return ApiResponse.success(GiftCardResponseDto.fromEntity(saved), 'Gift card updated', 200)
  }

  async deleteGiftCard(user: UserResponseDto, id: string) {
    const card = await this.giftCards.findOne({ where: { id }, relations: ['business'] })
    if (!card || card.business.ownerId !== user.id) throw new NotFoundException('Gift card not found')
    await this.giftCards.remove(card)
    return ApiResponse.success(null, 'Gift card deleted', 200)
  }

  // ── Cashback Programs ──

  async listCashbackPrograms(user: UserResponseDto) {
    const programs = await this.cashbackPrograms.find({
      where: { business: { ownerId: user.id } },
      order: { createdAt: 'DESC' },
    })
    return ApiResponse.success(programs.map(CashbackProgramResponseDto.fromEntity), 'Cashback programs retrieved', 200)
  }

  async createCashbackProgram(user: UserResponseDto, dto: CreateCashbackProgramDto) {
    const program = this.cashbackPrograms.create({
      businessId: (dto as any).business_id,
      title: dto.title,
      rate: dto.rate,
    })
    const saved = await this.cashbackPrograms.save(program)
    return ApiResponse.success(CashbackProgramResponseDto.fromEntity(saved), 'Cashback program created', 201)
  }

  async getCashbackProgram(user: UserResponseDto, id: string) {
    const program = await this.cashbackPrograms.findOne({ where: { id }, relations: ['business'] })
    if (!program || program.business.ownerId !== user.id) throw new NotFoundException('Cashback program not found')
    return ApiResponse.success(CashbackProgramResponseDto.fromEntity(program), 'Cashback program retrieved', 200)
  }

  async updateCashbackProgram(user: UserResponseDto, id: string, dto: UpdateCashbackProgramDto) {
    const program = await this.cashbackPrograms.findOne({ where: { id }, relations: ['business'] })
    if (!program || program.business.ownerId !== user.id) throw new NotFoundException('Cashback program not found')
    if (dto.title !== undefined) program.title = dto.title
    if (dto.rate !== undefined) program.rate = dto.rate
    if (dto.status !== undefined) program.status = dto.status
    const saved = await this.cashbackPrograms.save(program)
    return ApiResponse.success(CashbackProgramResponseDto.fromEntity(saved), 'Cashback program updated', 200)
  }

  async deleteCashbackProgram(user: UserResponseDto, id: string) {
    const program = await this.cashbackPrograms.findOne({ where: { id }, relations: ['business'] })
    if (!program || program.business.ownerId !== user.id) throw new NotFoundException('Cashback program not found')
    await this.cashbackPrograms.remove(program)
    return ApiResponse.success(null, 'Cashback program deleted', 200)
  }
}
