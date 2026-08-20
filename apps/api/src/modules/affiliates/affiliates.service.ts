import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import * as crypto from 'crypto'
import { Affiliate } from './entities/affiliate.entity'
import { Referral } from './entities/referral.entity'
import { AffiliateTransaction } from './entities/affiliate-transaction.entity'
import { CreateAffiliateTransactionDto, UpdateAffiliateTransactionStatusDto } from './dto/affiliate.dto'
import {
  AffiliateResponseDto,
  AffiliateTransactionResponseDto,
  ReferralLookupResponseDto,
  ReferralResponseDto,
} from './dto/affiliate-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

@Injectable()
export class AffiliatesService {
  constructor(
    @InjectRepository(Affiliate) private affiliatesRepo: Repository<Affiliate>,
    @InjectRepository(Referral) private referralsRepo: Repository<Referral>,
    @InjectRepository(AffiliateTransaction) private transactionsRepo: Repository<AffiliateTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Join / profile ───────────────────────────────────────────────────────

  async join(user: UserResponseDto, acceptTerms: boolean) {
    if (!acceptTerms) throw new BadRequestException('Affiliate terms must be accepted')

    const existing = await this.affiliatesRepo.findOne({ where: { userId: user.id } })

    if (existing) {
      return ApiResponse.success(await this.buildProfile(existing), 'Affiliate profile already exists', 200)
    }

    const affiliate = this.affiliatesRepo.create({
      userId: user.id,
      affiliateCode: await this.generateUniqueCode(),
      joinedAt: new Date(),
      status: 'active',
    })

    const saved = await this.affiliatesRepo.save(affiliate)

    return ApiResponse.success(await this.buildProfile(saved), 'Affiliate profile created', 201)
  }

  async getMyProfile(user: UserResponseDto) {
    const affiliate = await this.findForUser(user.id)

    return ApiResponse.success(await this.buildProfile(affiliate), 'Affiliate profile retrieved', 200)
  }

  async listMyReferrals(user: UserResponseDto) {
    const affiliate = await this.findForUser(user.id)

    const referrals = await this.referralsRepo.find({
      where: { affiliateId: affiliate.id },
      relations: { referredUser: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(
      referrals.map((referral) => ReferralResponseDto.fromEntity(referral)),
      'Affiliate referrals retrieved',
      200,
    )
  }

  async listMyTransactions(user: UserResponseDto) {
    const affiliate = await this.findForUser(user.id)

    const transactions = await this.transactionsRepo.find({
      where: { affiliateId: affiliate.id },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(
      transactions.map((transaction) => AffiliateTransactionResponseDto.fromEntity(transaction)),
      'Affiliate transactions retrieved',
      200,
    )
  }

  // ── Attribution ──────────────────────────────────────────────────────────

  // Resolves a referral code to its affiliate. Used at registration to record
  // attribution deterministically (spec §39: "Affiliate attribution must be
  // deterministic and traceable").
  async lookupReferralCode(code: string) {
    const affiliate = await this.affiliatesRepo.findOne({ where: { affiliateCode: code } })

    if (!affiliate) throw new NotFoundException('Affiliate code not found')

    return ApiResponse.success(ReferralLookupResponseDto.fromEntity(affiliate), 'Affiliate code resolved', 200)
  }

  // Records a referral for a newly registered user. One referral per referred
  // user (unique constraint). Creates a welcome COMMISSION transaction in
  // pending state for the affiliate.
  async recordReferral(affiliateCode: string, referredUserId: string) {
    const affiliate = await this.affiliatesRepo.findOne({ where: { affiliateCode } })

    if (!affiliate) throw new NotFoundException('Affiliate code not found')

    if (affiliate.userId === referredUserId) throw new BadRequestException('You cannot refer yourself')

    const existing = await this.referralsRepo.findOne({ where: { referredUserId } })

    if (existing) return null

    const saved = await this.dataSource.transaction(async (manager) => {
      const referral = await manager.save(
        this.referralsRepo.create({
          affiliateId: affiliate.id,
          referredUserId,
          source: 'register',
          status: 'CONVERTED',
        }),
      )

      await manager.save(
        this.transactionsRepo.create({
          affiliateId: affiliate.id,
          referralId: referral.id,
          type: 'COMMISSION',
          amount: 5,
          status: 'pending',
          description: 'Welcome commission for referred signup',
        }),
      )

      return referral
    })

    return saved
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  async listAll() {
    const affiliates = await this.affiliatesRepo.find({ relations: { user: true }, order: { createdAt: 'DESC' } })

    const enriched = await Promise.all(
      affiliates.map(async (affiliate) => ({
        ...(await this.buildProfile(affiliate)),
        user_name: affiliate.user
          ? [affiliate.user.firstName, affiliate.user.lastName].filter(Boolean).join(' ') || null
          : null,
        user_email: affiliate.user?.email ?? null,
      })),
    )

    return ApiResponse.success(enriched, 'Affiliates retrieved', 200)
  }

  async listAllTransactions(status?: string) {
    const where: Record<string, unknown> = {}

    if (status) {
      const valid = ['pending', 'approved', 'rejected']

      if (!valid.includes(status)) throw new BadRequestException('Invalid transaction status filter')

      where.status = status
    }

    const transactions = await this.transactionsRepo.find({
      where,
      relations: { affiliate: { user: true }, referral: { referredUser: true } },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(
      transactions.map((transaction) => ({
        ...AffiliateTransactionResponseDto.fromEntity(transaction),
        affiliate_name: transaction.affiliate?.user
          ? [transaction.affiliate.user.firstName, transaction.affiliate.user.lastName].filter(Boolean).join(' ') || null
          : null,
        affiliate_code: transaction.affiliate?.affiliateCode ?? null,
        referred_user_name: transaction.referral?.referredUser
          ? [transaction.referral.referredUser.firstName, transaction.referral.referredUser.lastName].filter(Boolean).join(' ') || null
          : null,
      })),
      'Affiliate transactions retrieved',
      200,
    )
  }

  async updateTransactionStatus(id: string, dto: UpdateAffiliateTransactionStatusDto) {
    const transaction = await this.transactionsRepo.findOne({ where: { id } })

    if (!transaction) throw new NotFoundException('Affiliate transaction not found')

    await this.transactionsRepo.update({ id }, {
      status: dto.status,
      description: dto.note ? `${transaction.description ?? ''}${transaction.description ? ' — ' : ''}${dto.note}` : transaction.description,
    })

    const updated = await this.transactionsRepo.findOne({ where: { id } })

    if (!updated) throw new NotFoundException('Affiliate transaction not found')

    return ApiResponse.success(AffiliateTransactionResponseDto.fromEntity(updated), 'Affiliate transaction updated', 200)
  }

  async createTransaction(dto: CreateAffiliateTransactionDto) {
    const affiliate = await this.affiliatesRepo.findOne({ where: { id: dto.affiliate_id } })

    if (!affiliate) throw new NotFoundException('Affiliate not found')

    if (dto.referral_id) {
      const referral = await this.referralsRepo.findOne({ where: { id: dto.referral_id } })

      if (!referral) throw new NotFoundException('Referral not found')
    }

    const saved = await this.transactionsRepo.save(
      this.transactionsRepo.create({
        affiliateId: dto.affiliate_id,
        referralId: dto.referral_id ?? null,
        type: dto.type ?? 'COMMISSION',
        amount: dto.amount,
        status: 'pending',
        description: dto.description ?? null,
      }),
    )

    return ApiResponse.success(AffiliateTransactionResponseDto.fromEntity(saved), 'Affiliate transaction created', 201)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async findForUser(userId: string) {
    const affiliate = await this.affiliatesRepo.findOne({ where: { userId } })

    if (!affiliate) throw new NotFoundException('Affiliate profile not found. Join the affiliate program first.')

    return affiliate
  }

  private async buildProfile(affiliate: Affiliate) {
    const referredCount = await this.referralsRepo.count({ where: { affiliateId: affiliate.id } })

    const transactions = await this.transactionsRepo.find({ where: { affiliateId: affiliate.id } })

    const totalEarned = transactions
      .filter((t) => t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0)

    const pendingEarned = transactions
      .filter((t) => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0)

    return AffiliateResponseDto.fromEntity(affiliate, referredCount, Number(totalEarned.toFixed(2)), Number(pendingEarned.toFixed(2)))
  }

  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = `AFF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

      const existing = await this.affiliatesRepo.findOne({ where: { affiliateCode: code } })

      if (!existing) return code
    }

    throw new BadRequestException('Could not generate a unique affiliate code. Please try again.')
  }
}