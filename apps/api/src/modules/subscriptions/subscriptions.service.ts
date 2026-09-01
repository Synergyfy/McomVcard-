import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SubscribedPlan } from './entities/subscribed-plan.entity'
import { CreateSubscribedPlanDto, UpdateSubscribedPlanDto } from './dto/subscribed-plan.dto'
import { AdminPaginatedQueryDto, PaginatedResult } from '../admin/dto/admin-paginated-query.dto'

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscribedPlan)
    private readonly subscribedPlanRepository: Repository<SubscribedPlan>,
  ) {}

  async findAll(query: AdminPaginatedQueryDto): Promise<PaginatedResult<SubscribedPlan>> {
    const { page = 1, limit = 20, search, status } = query

    const qb = this.subscribedPlanRepository
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.user', 'user')
      .leftJoinAndSelect('sp.plan', 'plan')

    if (status) {
      qb.andWhere('sp.status = :status', { status })
    }

    if (search) {
      qb.andWhere('(user.email ILIKE :search OR plan.name ILIKE :search)', { search: `%${search}%` })
    }

    const [data, total] = await qb
      .orderBy('sp.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<SubscribedPlan> {
    const subscribedPlan = await this.subscribedPlanRepository.findOne({
      where: { id },
      relations: ['user', 'plan'],
    })
    if (!subscribedPlan) {
      throw new NotFoundException('Subscribed plan not found')
    }
    return subscribedPlan
  }

  async create(dto: CreateSubscribedPlanDto): Promise<SubscribedPlan> {
    const subscribedPlan = this.subscribedPlanRepository.create({
      userId: dto.userId,
      planId: dto.planId,
      status: (dto.status as any) ?? 'active',
      startedAt: new Date(dto.startedAt),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    })
    return this.subscribedPlanRepository.save(subscribedPlan)
  }

  async update(id: string, dto: UpdateSubscribedPlanDto): Promise<SubscribedPlan> {
    const subscribedPlan = await this.findOne(id)

    if (dto.status !== undefined) subscribedPlan.status = dto.status as any
    if (dto.expiresAt !== undefined) subscribedPlan.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null

    return this.subscribedPlanRepository.save(subscribedPlan)
  }

  async cancel(id: string): Promise<SubscribedPlan> {
    const subscribedPlan = await this.findOne(id)

    if (subscribedPlan.status === 'cancelled') {
      throw new BadRequestException('Subscription is already cancelled')
    }

    subscribedPlan.status = 'cancelled'
    subscribedPlan.expiresAt = new Date()
    return this.subscribedPlanRepository.save(subscribedPlan)
  }

  async remove(id: string): Promise<void> {
    const subscribedPlan = await this.findOne(id)
    await this.subscribedPlanRepository.remove(subscribedPlan)
  }
}
