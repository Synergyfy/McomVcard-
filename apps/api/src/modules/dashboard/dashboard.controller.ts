import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiQuery } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { BusinessAccessGuard } from '../businesses/guards/business-access.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { DashboardService } from './dashboard.service'

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, BusinessAccessGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated dashboard KPIs' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Business role required' })
  async getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStatsForUser(user.id)
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get aggregated business reports for a date range' })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '30d', '90d'] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Business role required' })
  async getReports(@CurrentUser() user: any, @Query('range') range?: string) {
    return this.dashboardService.getReportsForUser(user.id, range || '7d')
  }

  @Get('qr-stats')
  @ApiOperation({ summary: 'Get QR scan statistics for the business' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Business role required' })
  async getQrStats(@CurrentUser() user: any, @Query('days') days?: string) {
    return this.dashboardService.getQrStatsForUser(user.id, days ? Number(days) : 7)
  }
}
