import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { QrCode } from './entities/qr-code.entity'
import { CardsService } from '../cards/cards.service'
import { CreateQrCodeDto, UpdateQrCodeDto } from './dto/qr-code.dto'
import { QrCodeResponseDto, QrResolveResponseDto } from './dto/qr-code-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

@Injectable()
export class QrCodesService {
  constructor(
    @InjectRepository(QrCode) private qrCodesRepo: Repository<QrCode>,
    private readonly cardsService: CardsService,
  ) {}

  async create(user: UserResponseDto, dto: CreateQrCodeDto) {
    await this.cardsService.findOwned(dto.card_id, user.id)

    const saved = await this.qrCodesRepo.save(
      this.qrCodesRepo.create({
        cardId: dto.card_id,
        destinationType: dto.destination_type,
        destination: dto.destination,
        isActive: true,
      }),
    )

    return ApiResponse.success(QrCodeResponseDto.fromEntity(saved), 'QR code created', 201)
  }

  // All QR codes across the authenticated user's cards.
  async listForUser(user: UserResponseDto) {
    const qrs = await this.qrCodesRepo.find({
      where: { card: { ownerId: user.id } },
      relations: { card: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(qrs.map((qr) => QrCodeResponseDto.fromEntity(qr)), 'QR codes retrieved', 200)
  }

  // All QR codes for one of the authenticated user's cards.
  async listForCard(user: UserResponseDto, cardId: string) {
    await this.cardsService.findOwned(cardId, user.id)

    const qrs = await this.qrCodesRepo.find({
      where: { cardId },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(qrs.map((qr) => QrCodeResponseDto.fromEntity(qr)), 'QR codes retrieved', 200)
  }

  async update(user: UserResponseDto, id: string, dto: UpdateQrCodeDto) {
    const qr = await this.findOwned(user.id, id)

    qr.destinationType = dto.destination_type ?? qr.destinationType
    qr.destination = dto.destination ?? qr.destination
    qr.isActive = dto.is_active ?? qr.isActive

    const saved = await this.qrCodesRepo.save(qr)

    return ApiResponse.success(QrCodeResponseDto.fromEntity(saved), 'QR code updated', 200)
  }

  async remove(user: UserResponseDto, id: string) {
    await this.findOwned(user.id, id)

    await this.qrCodesRepo.delete(id)

    return ApiResponse.success(null, 'QR code deleted', 200)
  }

  // Public resolution: a device scans https://mcomvcard.link/qr/<id> and the API
  // tells it where to route (spec §41). Only active QR codes resolve.
  async resolve(id: string) {
    const qr = await this.qrCodesRepo.findOne({ where: { id } })

    if (!qr || !qr.isActive) {
      throw new NotFoundException('QR code not found or inactive')
    }

    return ApiResponse.success(QrResolveResponseDto.fromEntity(qr), 'QR code resolved', 200)
  }

  private async findOwned(ownerId: string, id: string): Promise<QrCode> {
    const qr = await this.qrCodesRepo.findOne({
      where: { id },
      relations: { card: true },
    })

    if (!qr) throw new NotFoundException('QR code not found')
    if (qr.card.ownerId !== ownerId) {
      throw new NotFoundException('QR code not found')
    }

    return qr
  }
}