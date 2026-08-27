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

@ApiTags('admin-subscribed-plans')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/subscribed-plans')
export class AdminSubscribedPlansController {
  @Get()
  @ApiOperation({ summary: 'List all subscribed plans (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiOkResponse({ description: 'List of subscribed plans' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query() query: any) {
    return ApiResponse.success({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }, 'Subscribed plans retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscribed plan by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Subscribed plan found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Subscribed plan not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success({ id, userId: 'user-id', planId: 'plan-id', status: 'active', startedAt: new Date(), expiresAt: null }, 'Subscribed plan retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscribed plan (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: ['active', 'cancelled', 'expired'] }, expiresAt: { type: 'string', format: 'date-time' } } } })
  @ApiOkResponse({ description: 'Subscribed plan updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Subscribed plan not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any) {
    return ApiResponse.success({ id, ...body }, 'Subscribed plan updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscribed plan (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Subscribed plan deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Subscribed plan not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.message('Subscribed plan deleted', 200)
  }
}