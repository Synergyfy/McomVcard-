import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChildCard } from './entities/child-card.entity'
import { CardsService } from '../cards/cards.service'
import { UsersService } from '../users/users.service'
import { CreateChildCardDto, UpdateChildCardDto } from './dto/child-card.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { ChildCardResponseDto } from './dto/child-card-response.dto'

@Injectable()
export class ChildCardsService {
  constructor(
    @InjectRepository(ChildCard) private childCardsRepo: Repository<ChildCard>,
    private readonly cardsService: CardsService,
    private readonly usersService: UsersService,
  ) {}

  async create(parentId: string, dto: CreateChildCardDto) {
    if (dto.child_id === parentId) {
      throw new BadRequestException('Cannot share a card with yourself')
    }

    // The parent must own the card being shared.
    await this.cardsService.findOwned(dto.card_id, parentId)

    // The child must be a real user.
    const child = await this.usersService.findById(dto.child_id)

    if (!child) throw new NotFoundException('Child user not found')

    // A card may be shared with a child at most once.
    const existing = await this.childCardsRepo.findOne({
      where: { cardId: dto.card_id, childId: dto.child_id },
    })

    if (existing) throw new BadRequestException('This card is already shared with this child')

    if (dto.can_use_wallet && dto.wallet_allocation == null) {
      throw new BadRequestException('wallet_allocation is required when can_use_wallet is true')
    }

    const saved = await this.childCardsRepo.save(
      this.childCardsRepo.create({
        cardId: dto.card_id,
        childId: dto.child_id,
        canView: dto.can_view ?? true,
        canUseWallet: dto.can_use_wallet ?? false,
        canManage: dto.can_manage ?? false,
        walletAllocation: dto.wallet_allocation ?? null,
      }),
    )

    return ApiResponse.success(ChildCardResponseDto.fromEntity(await this.findOne(parentId, saved.id)), 'Card shared with child', 201)
  }

  async listForUser(userId: string) {
    // Parent sees cards they shared; child sees cards shared with them.
    const records = await this.childCardsRepo.find({
      where: [{ childId: userId }, { card: { ownerId: userId } }],
      relations: { card: true, child: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(records.map((record) => ChildCardResponseDto.fromEntity(record)), 'Child cards retrieved', 200)
  }

  async findOne(userId: string, id: string) {
    const record = await this.childCardsRepo.findOne({
      where: { id },
      relations: { card: true, child: true },
    })

    if (!record) throw new NotFoundException('Child card not found')

    this.assertPartOf(record, userId)

    return record
  }

  async update(userId: string, id: string, dto: UpdateChildCardDto) {
    const record = await this.findOne(userId, id)

    // Only the card owner (the parent) may change permissions.
    if (record.card.ownerId !== userId) {
      throw new ForbiddenException('Only the card owner can update permissions')
    }

    if (dto.can_use_wallet === true && dto.wallet_allocation == null && record.walletAllocation == null) {
      throw new BadRequestException('wallet_allocation is required when enabling can_use_wallet')
    }

    await this.childCardsRepo.update(
      { id },
      {
        canView: dto.can_view,
        canUseWallet: dto.can_use_wallet,
        canManage: dto.can_manage,
        walletAllocation: dto.wallet_allocation,
      },
    )

    return ApiResponse.success(ChildCardResponseDto.fromEntity(await this.findOne(userId, id)), 'Child card updated', 200)
  }

  async remove(userId: string, id: string) {
    const record = await this.findOne(userId, id)

    // Either the parent (card owner) or the child may remove the share.
    if (record.card.ownerId !== userId && record.childId !== userId) {
      throw new ForbiddenException('You are not part of this share')
    }

    await this.childCardsRepo.delete({ id })

    return ApiResponse.message('Child card removed', 200)
  }

  private assertPartOf(record: ChildCard, userId: string) {
    if (record.childId !== userId && record.card.ownerId !== userId) {
      throw new ForbiddenException('You are not part of this share')
    }
  }
}