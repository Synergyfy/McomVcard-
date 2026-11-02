import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { CacheService } from '../../lib/cache/cache.service'

@ApiTags('admin-system')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/system')
export class AdminSystemController {
  constructor(private readonly cache: CacheService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get system info (Admin only)' })
  @ApiOkResponse({ description: 'System info' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getSystemInfo() {
    return ApiResponse.success(
      {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        cache_driver: this.cache.isRedisConnected() ? 'redis' : 'memory',
        email_provider: process.env.RESEND_API_KEY ? 'resend' : process.env.MAIL_HOST ? 'smtp' : 'log',
        database: 'postgres',
      },
      'System info retrieved',
      200,
    )
  }

  @Post('clear-cache')
  @ApiOperation({ summary: 'Clear system cache (Admin only)' })
  @ApiOkResponse({ description: 'Cache cleared' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async clearCache() {
    await this.cache.clear()
    return ApiResponse.message('Cache cleared', 200)
  }
}
