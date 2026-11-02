import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AnalyticsEvent } from './entities/analytics-event.entity'
import { CacheService } from '../../lib/cache/cache.service'

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent) private events: Repository<AnalyticsEvent>,
    private readonly cache: CacheService,
  ) {}

  async track(businessId: string, eventType: string, cardId?: string, metadata?: Record<string, unknown>) {
    const saved = await this.events.save(this.events.create({
      businessId, eventType, cardId: cardId ?? null, metadata: metadata ?? null,
    }))
    await this.cache.del(`analytics:overview:${businessId}`)
    return saved
  }

  async getOverview(businessId: string) {
    return this.cache.getOrSet(`analytics:overview:${businessId}`, 30, async () => {
      const result = await this.events.createQueryBuilder('e')
        .select('e.event_type', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .where('e.business_id = :businessId', { businessId })
        .groupBy('e.event_type')
        .getRawMany()
      const overview: Record<string, number> = {}
      for (const row of result) overview[row.eventType] = Number(row.count)
      return overview
    })
  }

  async getTimeSeries(businessId: string, days = 30) {
    const safeDays = Math.min(Math.max(Number(days) || 30, 1), 365)
    return this.cache.getOrSet(`analytics:timeseries:${businessId}:${safeDays}`, 30, async () => {
      const result = await this.events.createQueryBuilder('e')
        .select("DATE_TRUNC('day', e.created_at)", 'date')
        .addSelect('e.event_type', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .where('e.business_id = :businessId', { businessId })
        .andWhere("e.created_at >= NOW() - make_interval(days => :days)", { days: safeDays })
        .groupBy("DATE_TRUNC('day', e.created_at)")
        .addGroupBy('e.event_type')
        .orderBy("DATE_TRUNC('day', e.created_at)", 'ASC')
        .getRawMany()
      return result.map((r) => ({ date: r.date, eventType: r.eventType, count: Number(r.count) }))
    })
  }
}
