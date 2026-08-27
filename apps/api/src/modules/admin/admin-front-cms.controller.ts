import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'

@ApiTags('admin-front-cms')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/front-cms')
export class AdminFrontCMSController {
  @Get()
  @ApiOperation({ summary: 'Get front CMS content (Admin only)' })
  @ApiOkResponse({ description: 'Front CMS content' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll() {
    return ApiResponse.success({ hero: {}, features: [], testimonials: [], footer: {} }, 'Front CMS retrieved', 200)
  }

  @Patch()
  @ApiOperation({ summary: 'Update front CMS content (Admin only)' })
  @ApiBody({ schema: { properties: { hero: { type: 'object' }, features: { type: 'array' }, testimonials: { type: 'array' }, footer: { type: 'object' } } } })
  @ApiOkResponse({ description: 'Front CMS updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Body() body: any) {
    return ApiResponse.success(body, 'Front CMS updated', 200)
  }
}