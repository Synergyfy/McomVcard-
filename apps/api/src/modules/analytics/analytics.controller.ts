import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiUnauthorizedResponse, ApiQuery, ApiBody } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { AnalyticsService } from './analytics.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Business } from '../businesses/entities/business.entity'

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    @InjectRepository(Business) private businesses: Repository<Business>,
  ) {}

  @Post('events')
  @ApiOperation({ summary: 'Track an analytics event (view, scan, etc.)' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ schema: { properties: { event_type: { type: 'string' }, card_id: { type: 'string' } } } })
  async trackEvent(
    @CurrentUser() user: any,
    @Body() body: { event_type: string; card_id?: string; metadata?: Record<string, unknown> },
  ) {
    const business = await this.businesses.findOne({ where: { ownerId: user.id } })
    if (!business) return { message: 'No business found' }

    return this.analyticsService.track(business.id, body.event_type, body.card_id, body.metadata)
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get analytics event counts by type' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getOverview(@CurrentUser() user: any) {
    const business = await this.businesses.findOne({ where: { ownerId: user.id } })
    if (!business) return {}

    return this.analyticsService.getOverview(business.id)
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Get analytics time-series data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getTimeSeries(@CurrentUser() user: any, @Query('days') days?: string) {
    const business = await this.businesses.findOne({ where: { ownerId: user.id } })
    if (!business) return []

    return this.analyticsService.getTimeSeries(business.id, days ? Number(days) : 30)
  }
}
