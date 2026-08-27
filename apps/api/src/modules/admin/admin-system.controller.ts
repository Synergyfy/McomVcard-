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

@ApiTags('admin-system')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/system')
export class AdminSystemController {
  @Get('info')
  @ApiOperation({ summary: 'Get system info (Admin only)' })
  @ApiOkResponse({ description: 'System info' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getSystemInfo() {
    return ApiResponse.success({ version: '1.0.0', environment: process.env.NODE_ENV || 'development', uptime: process.uptime() }, 'System info retrieved', 200)
  }

  @Post('clear-cache')
  @ApiOperation({ summary: 'Clear system cache (Admin only)' })
  @ApiOkResponse({ description: 'Cache cleared' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async clearCache() {
    return ApiResponse.message('Cache cleared', 200)
  }
}