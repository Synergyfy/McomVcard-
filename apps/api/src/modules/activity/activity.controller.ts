import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiUnauthorizedResponse, ApiQuery } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { ActivityService } from './activity.service'
import { ActivityLog } from './entities/activity-log.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Business } from '../businesses/entities/business.entity'

@ApiTags('activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    @InjectRepository(Business) private businesses: Repository<Business>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get activity feed for the current user\'s business' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getFeed(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const business = await this.businesses.findOne({ where: { ownerId: user.id } })
    if (!business) return { items: [], total: 0, limit: 20, offset: 0 }

    return this.activityService.getFeed(
      business.id,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    )
  }
}
