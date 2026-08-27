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

@ApiTags('admin-newsletter')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/newsletter')
export class AdminNewsletterController {
  @Get()
  @ApiOperation({ summary: 'List all newsletter campaigns (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiOkResponse({ description: 'List of newsletter campaigns' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query() query: any) {
    return ApiResponse.success({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }, 'Newsletter campaigns retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a newsletter campaign (Admin only)' })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' }, recipients: { type: 'array', items: { type: 'string' } }, status: { type: 'string', enum: ['draft', 'scheduled', 'sent'] } } } })
  @ApiCreatedResponse({ description: 'Newsletter campaign created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() body: any) {
    return ApiResponse.success({ id: 'placeholder', ...body }, 'Newsletter campaign created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a newsletter campaign by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Newsletter campaign found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Newsletter campaign not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success({ id, name: 'Summer Newsletter', subject: 'Summer Updates', body: 'Content...', status: 'draft' }, 'Newsletter campaign retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a newsletter campaign (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' }, status: { type: 'string', enum: ['draft', 'scheduled', 'sent'] } } } })
  @ApiOkResponse({ description: 'Newsletter campaign updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Newsletter campaign not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any) {
    return ApiResponse.success({ id, ...body }, 'Newsletter campaign updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a newsletter campaign (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Newsletter campaign deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Newsletter campaign not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.message('Newsletter campaign deleted', 200)
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send a newsletter campaign (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Newsletter campaign sent' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Newsletter campaign not found' })
  async send(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.message('Newsletter campaign sent', 200)
  }
}