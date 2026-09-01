import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ActivityLog } from './entities/activity-log.entity'

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog) private activityRepo: Repository<ActivityLog>,
  ) {}

  async log(businessId: string, type: string, title: string, description?: string, userId?: string, metadata?: Record<string, unknown>) {
    const entry = this.activityRepo.create({
      businessId,
      userId: userId ?? null,
      type,
      title,
      description: description ?? null,
      metadata: metadata ?? null,
    })
    return this.activityRepo.save(entry)
  }

  async getFeed(businessId: string, limit = 20, offset = 0) {
    const [items, total] = await this.activityRepo.findAndCount({
      where: { businessId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })

    return { items, total, limit, offset }
  }

  async findAll(options: {
    page: number
    limit: number
    search?: string
    userId?: string
    businessId?: string
    sort?: string
    order?: 'ASC' | 'DESC'
  }): Promise<{ data: ActivityLog[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const { page, limit, search, userId, businessId, sort = 'created_at', order = 'DESC' } = options
    const qb = this.activityRepo.createQueryBuilder('log')

    if (search) {
      qb.andWhere('(log.title ILIKE :search OR log.description ILIKE :search)', { search: `%${search}%` })
    }

    if (userId) {
      qb.andWhere('log.user_id = :userId', { userId })
    }

    if (businessId) {
      qb.andWhere('log.business_id = :businessId', { businessId })
    }

    const total = await qb.getCount()
    const data = await qb
      .orderBy(`log.${sort}`, order)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

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

  async findOne(id: string): Promise<ActivityLog> {
    const log = await this.activityRepo.findOne({ where: { id } })
    if (!log) {
      throw new NotFoundException('Activity log not found')
    }
    return log
  }

  async findByBusiness(businessId: string, page = 1, limit = 20): Promise<{ data: ActivityLog[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const [data, total] = await this.activityRepo.findAndCount({
      where: { businessId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async findByUser(userId: string, page = 1, limit = 20): Promise<{ data: ActivityLog[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const [data, total] = await this.activityRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async remove(id: string): Promise<void> {
    const log = await this.findOne(id)
    await this.activityRepo.remove(log)
  }
}
