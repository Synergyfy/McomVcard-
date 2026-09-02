import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GiftCard } from './entities/gift-card.entity'
import { CreateGiftCardDto } from './dto/create-gift-card.dto'
import { UpdateGiftCardDto } from './dto/update-gift-card.dto'
import { BusinessesService } from '../businesses/businesses.service'

@Injectable()
export class GiftCardsService {
  constructor(
    @InjectRepository(GiftCard) private readonly giftCardsRepo: Repository<GiftCard>,
    private readonly businessesService: BusinessesService,
  ) {}

  async create(userId: string, dto: CreateGiftCardDto): Promise<GiftCard> {
    await this.businessesService.findOwned(dto.business_id, userId)

    const giftCard = this.giftCardsRepo.create({
      businessId: dto.business_id,
      title: dto.title,
      value: dto.value,
      price: dto.price,
      status: dto.status,
    })

    return this.giftCardsRepo.save(giftCard)
  }

  async listForBusiness(businessId: string, userId: string): Promise<GiftCard[]> {
    await this.businessesService.findOwned(businessId, userId)
    return this.giftCardsRepo.find({ where: { businessId }, order: { createdAt: 'DESC' } })
  }

  async listForOwner(userId: string): Promise<GiftCard[]> {
    const businessesResponse = await this.businessesService.listForOwner(userId)
    const businesses = businessesResponse.data as any[]
    const businessIds = businesses.map((b) => b.id)
    if (businessIds.length === 0) return []

    // Single query with IN clause instead of N+1 loops
    const giftCards = await this.giftCardsRepo
      .createQueryBuilder('gc')
      .where('gc.business_id IN (:...businessIds)', { businessIds })
      .orderBy('gc.created_at', 'DESC')
      .getMany()

    return giftCards
  }

  async findOne(id: string): Promise<GiftCard> {
    const giftCard = await this.giftCardsRepo.findOne({ where: { id }, relations: ['business'] })
    if (!giftCard) throw new NotFoundException('Gift card not found')
    return giftCard
  }

  async update(userId: string, id: string, dto: UpdateGiftCardDto): Promise<GiftCard> {
    const giftCard = await this.findOne(id)
    await this.businessesService.findOwned(giftCard.businessId, userId)

    if (dto.title !== undefined) giftCard.title = dto.title
    if (dto.value !== undefined) giftCard.value = dto.value
    if (dto.price !== undefined) giftCard.price = dto.price
    if (dto.status !== undefined) giftCard.status = dto.status

    return this.giftCardsRepo.save(giftCard)
  }

  async remove(userId: string, id: string): Promise<void> {
    const giftCard = await this.findOne(id)
    await this.businessesService.findOwned(giftCard.businessId, userId)
    await this.giftCardsRepo.remove(giftCard)
  }
}