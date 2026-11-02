import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { BusinessFamilyMember } from './entities/business-family-member.entity'
import { BusinessesService } from './businesses.service'
import { CreateBusinessFamilyMemberDto, UpdateBusinessFamilyMemberStatusDto } from './dto/business-family-member.dto'
import { ApiResponse } from '../../lib/utils/api-response'

const OCCUPYING_STATUSES = ['allocated', 'active', 'suspended'] as const

@Injectable()
export class BusinessFamilyService {
  constructor(
    @InjectRepository(BusinessFamilyMember) private members: Repository<BusinessFamilyMember>,
    private readonly businessesService: BusinessesService,
  ) {}

  async list(userId: string, businessId: string) {
    await this.businessesService.findOwned(businessId, userId)
    const items = await this.members.find({ where: { businessId }, order: { createdAt: 'DESC' } })
    return ApiResponse.success(items, 'Family members retrieved', 200)
  }

  async create(userId: string, businessId: string, dto: CreateBusinessFamilyMemberDto) {
    await this.businessesService.findOwned(businessId, userId)
    await this.assertWithinLimit(userId, businessId)

    const saved = await this.members.save(this.members.create({
      businessId,
      name: dto.name.trim(),
      email: dto.email?.trim() || null,
      phone: dto.phone?.trim() || null,
      relationship: dto.relationship?.trim() || 'Family',
      avatar: dto.avatar ?? null,
      status: 'allocated',
    }))
    return ApiResponse.success(saved, 'Family member added', 201)
  }

  async updateStatus(userId: string, memberId: string, dto: UpdateBusinessFamilyMemberStatusDto) {
    const member = await this.members.findOne({ where: { id: memberId } })
    if (!member) throw new NotFoundException('Family member not found')
    await this.businessesService.findOwned(member.businessId, userId)

    const movingIntoSlot = OCCUPYING_STATUSES.includes(dto.status as (typeof OCCUPYING_STATUSES)[number]) &&
      !OCCUPYING_STATUSES.includes(member.status as (typeof OCCUPYING_STATUSES)[number])
    if (movingIntoSlot) await this.assertWithinLimit(userId, member.businessId)

    member.status = dto.status
    return ApiResponse.success(await this.members.save(member), 'Family member updated', 200)
  }

  async remove(userId: string, memberId: string) {
    const member = await this.members.findOne({ where: { id: memberId } })
    if (!member) throw new NotFoundException('Family member not found')
    await this.businessesService.findOwned(member.businessId, userId)
    await this.members.delete({ id: memberId })
    return ApiResponse.message('Family member removed', 200)
  }

  private async assertWithinLimit(userId: string, businessId: string) {
    const response = await this.businessesService.getPermissionsForUser(userId)
    const permissions = response as { limits: { friends_family: number | null } }
    const limit = permissions.limits.friends_family
    if (limit === null) return
    const used = await this.members.count({ where: { businessId, status: In([...OCCUPYING_STATUSES]) } })
    if (used >= limit) {
      throw new BadRequestException(`Your membership allows ${limit} Friends & Family cards. Remove or replace a card, or upgrade to add more.`)
    }
  }
}
