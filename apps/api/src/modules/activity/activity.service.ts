import { Injectable } from '@nestjs/common'
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
}
