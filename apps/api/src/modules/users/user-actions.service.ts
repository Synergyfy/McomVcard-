import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { ChildCard } from '../child-cards/entities/child-card.entity'
import { Share } from '../shares/entities/share.entity'
import { UserBasicResponseDto } from './dto/user-basic-response.dto'
import { FamilyCardResponseDto } from './dto/family-card-response.dto'
import { ShareContentResponseDto } from './dto/share-content-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'

@Injectable()
export class UserActionsService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(ChildCard) private childCardsRepo: Repository<ChildCard>,
    @InjectRepository(Share) private sharesRepo: Repository<Share>,
  ) {}

  async findByEmail(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } })

    if (!user) throw new NotFoundException('User not found')

    return ApiResponse.success(UserBasicResponseDto.fromEntity(user), 'User found', 200)
  }

  async getFamilyCards(userId: string) {
    const records = await this.childCardsRepo.find({
      where: { childId: userId },
      relations: { card: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(
      records.map((record) => FamilyCardResponseDto.fromEntity(record)),
      'Family cards retrieved',
      200,
    )
  }

  async getShareContent(userId: string) {
    const shares = await this.sharesRepo.find({
      where: { userId },
      relations: { card: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(
      shares.map((share) => ShareContentResponseDto.fromEntity(share)),
      'Share content retrieved',
      200,
    )
  }
}
