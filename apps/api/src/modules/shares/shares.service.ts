import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Share } from './entities/share.entity'
import { CardsService } from '../cards/cards.service'
import { Affiliate } from '../affiliates/entities/affiliate.entity'
import { CreateShareDto } from './dto/share.dto'
import { ShareResponseDto, ShareStatsResponseDto } from './dto/share-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(Share) private sharesRepo: Repository<Share>,
    @InjectRepository(Affiliate) private affiliatesRepo: Repository<Affiliate>,
    private readonly cardsService: CardsService,
  ) {}

  // The card owner records a share of their own card. If the sharer is an active
  // affiliate, their affiliate_id + referral_code are auto-attached so the code
  // travels with the share (spec §40: Share → Visitor → Signup → Referral).
  async create(user: UserResponseDto, dto: CreateShareDto) {
    await this.cardsService.findOwned(dto.card_id, user.id)

    const affiliate = await this.affiliatesRepo.findOne({
      where: { userId: user.id, status: 'active' },
    })

    const saved = await this.sharesRepo.save(
      this.sharesRepo.create({
        userId: user.id,
        cardId: dto.card_id,
        platform: dto.platform,
        affiliateId: affiliate?.id ?? null,
        referralCode: affiliate?.affiliateCode ?? null,
      }),
    )

    return ApiResponse.success(ShareResponseDto.fromEntity(saved), 'Share recorded', 201)
  }

  // List every share of the user's cards (card owner scoped).
  async listForUser(user: UserResponseDto) {
    const shares = await this.sharesRepo.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(
      shares.map((share) => ShareResponseDto.fromEntity(share)),
      'Shares retrieved',
      200,
    )
  }

  // Simple analytics per card (spec §40: "Do not implement complex analytics unless required").
  async statsForCard(user: UserResponseDto, cardId: string) {
    await this.cardsService.findOwned(cardId, user.id)

    const shares = await this.sharesRepo.find({ where: { cardId } })

    const byPlatform = shares.reduce<Record<string, number>>((acc, share) => {
      acc[share.platform] = (acc[share.platform] ?? 0) + 1

      return acc
    }, {})

    const attributed = shares.filter((share) => share.affiliateId).length

    return ApiResponse.success(
      ShareStatsResponseDto.fromData(cardId, shares.length, byPlatform, attributed),
      'Share stats retrieved',
      200,
    )
  }

  // Resolves a referral code attached to a share to its affiliate. Used at
  // registration to attribute a signup that came through a shared card.
  async resolveReferralCode(referralCode: string) {
    const affiliate = await this.affiliatesRepo.findOne({ where: { affiliateCode: referralCode, status: 'active' } })

    if (!affiliate) throw new NotFoundException('Referral code not found')

    return affiliate
  }
}