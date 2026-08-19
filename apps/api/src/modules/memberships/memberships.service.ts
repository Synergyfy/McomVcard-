import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MembershipTier } from './entities/membership-tier.entity'
import { Benefit } from './entities/benefit.entity'
import { MembershipBenefit } from './entities/membership-benefit.entity'
import { CreateMembershipTierDto } from './dto/create-membership-tier.dto'
import { UpdateMembershipTierDto } from './dto/update-membership-tier.dto'
import { CreateBenefitDto } from './dto/create-benefit.dto'
import { UpdateBenefitDto } from './dto/update-benefit.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { MembershipTierResponseDto } from './dto/membership-tier-response.dto'
import { BenefitResponseDto } from './dto/benefit-response.dto'

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(MembershipTier) private tiersRepo: Repository<MembershipTier>,
    @InjectRepository(Benefit) private benefitsRepo: Repository<Benefit>,
    @InjectRepository(MembershipBenefit) private membershipBenefitsRepo: Repository<MembershipBenefit>,
  ) {}

  // --- Tiers ---

  async createTier(dto: CreateMembershipTierDto) {
    const saved = await this.tiersRepo.save(
      this.tiersRepo.create({
        name: dto.name,
        description: dto.description ?? null,
        discountType: dto.discount_type ?? 'percentage',
        discountValue: dto.discount_value ?? 0,
        sortOrder: dto.sort_order ?? 0,
        status: 'active',
      }),
    )

    return ApiResponse.success(MembershipTierResponseDto.fromEntity(await this.findOneTier(saved.id)), 'Membership tier created', 201)
  }

  async listTiers() {
    const tiers = await this.tiersRepo.find({
      relations: { benefits: { benefit: true } },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    })

    return ApiResponse.success(tiers.map(MembershipTierResponseDto.fromEntity), 'Membership tiers retrieved', 200)
  }

  async findOneTier(id: string) {
    const tier = await this.tiersRepo.findOne({
      where: { id },
      relations: { benefits: { benefit: true } },
    })

    if (!tier) throw new NotFoundException('Membership tier not found')

    return tier
  }

  async getTier(id: string) {
    return ApiResponse.success(MembershipTierResponseDto.fromEntity(await this.findOneTier(id)), 'Membership tier retrieved', 200)
  }

  async updateTier(id: string, dto: UpdateMembershipTierDto) {
    await this.findOneTier(id)

    const patch: Partial<MembershipTier> = {}

    if (dto.name !== undefined) patch.name = dto.name
    if (dto.description !== undefined) patch.description = dto.description
    if (dto.discount_type !== undefined) patch.discountType = dto.discount_type
    if (dto.discount_value !== undefined) patch.discountValue = dto.discount_value
    if (dto.sort_order !== undefined) patch.sortOrder = dto.sort_order

    await this.tiersRepo.update({ id }, patch)

    return ApiResponse.success(MembershipTierResponseDto.fromEntity(await this.findOneTier(id)), 'Membership tier updated', 200)
  }

  async removeTier(id: string) {
    await this.findOneTier(id)

    await this.tiersRepo.delete({ id })

    return ApiResponse.message('Membership tier deleted', 200)
  }

  // --- Benefits ---

  async createBenefit(dto: CreateBenefitDto) {
    const saved = await this.benefitsRepo.save(
      this.benefitsRepo.create({
        name: dto.name,
        description: dto.description ?? null,
        benefitType: dto.benefit_type ?? 'perk',
        status: 'active',
      }),
    )

    return ApiResponse.success(BenefitResponseDto.fromEntity(saved), 'Benefit created', 201)
  }

  async listBenefits() {
    const benefits = await this.benefitsRepo.find({
      order: { createdAt: 'ASC' },
    })

    return ApiResponse.success(benefits.map(BenefitResponseDto.fromEntity), 'Benefits retrieved', 200)
  }

  async findOneBenefit(id: string) {
    const benefit = await this.benefitsRepo.findOne({ where: { id } })

    if (!benefit) throw new NotFoundException('Benefit not found')

    return benefit
  }

  async getBenefit(id: string) {
    return ApiResponse.success(BenefitResponseDto.fromEntity(await this.findOneBenefit(id)), 'Benefit retrieved', 200)
  }

  async updateBenefit(id: string, dto: UpdateBenefitDto) {
    await this.findOneBenefit(id)

    const patch: Partial<Benefit> = {}

    if (dto.name !== undefined) patch.name = dto.name
    if (dto.description !== undefined) patch.description = dto.description
    if (dto.benefit_type !== undefined) patch.benefitType = dto.benefit_type

    await this.benefitsRepo.update({ id }, patch)

    return ApiResponse.success(BenefitResponseDto.fromEntity(await this.findOneBenefit(id)), 'Benefit updated', 200)
  }

  async removeBenefit(id: string) {
    await this.findOneBenefit(id)

    await this.benefitsRepo.delete({ id })

    return ApiResponse.message('Benefit deleted', 200)
  }

  // --- Tier ↔ Benefit linking (DB-driven) ---

  async linkBenefit(tierId: string, benefitId: string) {
    const tier = await this.findOneTier(tierId)
    const benefit = await this.findOneBenefit(benefitId)

    const existing = await this.membershipBenefitsRepo.findOne({ where: { membershipTierId: tier.id, benefitId: benefit.id } })

    if (existing) throw new BadRequestException('Benefit is already linked to this tier')

    const saved = await this.membershipBenefitsRepo.save(
      this.membershipBenefitsRepo.create({
        membershipTierId: tier.id,
        benefitId: benefit.id,
      }),
    )

    return ApiResponse.success(saved.id, 'Benefit linked to tier', 201)
  }

  async listTierBenefits(tierId: string) {
    await this.findOneTier(tierId)

    const links = await this.membershipBenefitsRepo.find({
      where: { membershipTierId: tierId },
      relations: { benefit: true },
      order: { createdAt: 'ASC' },
    })

    const benefits = links.map((link) => link.benefit)

    return ApiResponse.success(benefits.map(BenefitResponseDto.fromEntity), 'Tier benefits retrieved', 200)
  }

  async unlinkBenefit(tierId: string, benefitId: string) {
    await this.findOneTier(tierId)
    await this.findOneBenefit(benefitId)

    const link = await this.membershipBenefitsRepo.findOne({ where: { membershipTierId: tierId, benefitId } })

    if (!link) throw new NotFoundException('Benefit is not linked to this tier')

    await this.membershipBenefitsRepo.delete({ id: link.id })

    return ApiResponse.message('Benefit unlinked from tier', 200)
  }
}