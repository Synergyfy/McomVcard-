import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AnalyticsEvent } from './entities/analytics-event.entity'

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent) private events: Repository<AnalyticsEvent>,
  ) {}

  async track(businessId: string, eventType: string, cardId?: string, metadata?: Record<string, unknown>) {
    const event = this.events.create({
      businessId,
      eventType,
      cardId: cardId ?? null,
      metadata: metadata ?? null,
    })
    return this.events.save(event)
  }

  async getOverview(businessId: string) {
    const result = await this.events
      .createQueryBuilder('e')
      .select('e.event_type', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('e.business_id = :businessId', { businessId })
      .groupBy('e.event_type')
      .getRawMany()

    const overview: Record<string, number> = {}
    for (const row of result) {
      overview[row.eventType] = Number(row.count)
    }

    return overview
  }

  async getTimeSeries(businessId: string, days = 30) {
    const result = await this.events
      .createQueryBuilder('e')
      .select("DATE_TRUNC('day', e.created_at)", 'date')
      .addSelect('e.event_type', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('e.business_id = :businessId', { businessId })
      .andWhere("e.created_at >= NOW() - INTERVAL ':days days'", { days })
      .groupBy("DATE_TRUNC('day', e.created_at)")
      .addGroupBy('e.event_type')
      .orderBy("DATE_TRUNC('day', e.created_at)", 'ASC')
      .getRawMany()

    return result.map((r) => ({
      date: r.date,
      eventType: r.eventType,
      count: Number(r.count),
    }))
  }
}
